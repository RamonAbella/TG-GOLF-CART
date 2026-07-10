import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiPlus, FiX, FiArrowLeft, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const TAX_RATE = 7;
const emptyLine = () => ({ description: '', qty: 1, unitPrice: 0 });

export default function InvoiceBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [form, setForm] = useState({
    invoiceNum: '',
    customerName: '',
    customerEmail: '',
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'draft',
    notes: '',
    taxEnabled: true,
    taxRate: TAX_RATE,
    lineItems: [emptyLine()],
  });
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    api.get('/crm').then(r => setCustomers(r.data)).catch(() => {});
    if (!isNew) {
      api.get(`/invoices/${id}`).then(r => {
        const inv = r.data;
        setForm({
          ...inv,
          taxEnabled: (inv.taxRate || 0) > 0,
          date: inv.date ? inv.date.split('T')[0] : '',
          dueDate: inv.dueDate ? inv.dueDate.split('T')[0] : '',
          lineItems: inv.lineItems?.length ? inv.lineItems : [emptyLine()],
        });
        setLoading(false);
      }).catch(() => { toast.error('Invoice not found'); navigate('/admin/invoices'); });
    } else {
      api.get('/invoices/next-num').then(r => setForm(f => ({ ...f, invoiceNum: r.data.invoiceNum }))).catch(() => {});
    }
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setLine = (i, k, v) => setForm(f => {
    const lines = [...f.lineItems];
    lines[i] = { ...lines[i], [k]: v };
    return { ...f, lineItems: lines };
  });

  const handleCustomerSelect = (e) => {
    const cid = e.target.value;
    if (!cid) { set('customerId', ''); setSelectedCustomer(null); return; }
    const c = customers.find(x => x.id === cid);
    if (c) {
      setSelectedCustomer(c);
      setForm(f => ({ ...f, customerId: cid, customerName: c.name, customerEmail: c.email || '' }));
    }
  };

  const subtotal = form.lineItems.reduce((s, l) => s + (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0), 0);
  const taxAmount = form.taxEnabled ? subtotal * (parseFloat(form.taxRate) || 0) / 100 : 0;
  const total = subtotal + taxAmount;

  const handleSave = async (newStatus) => {
    if (!form.invoiceNum || !form.customerName) return toast.error('Invoice # and customer name required');
    setSaving(true);
    const payload = { ...form, subtotal, taxAmount, total, status: newStatus || form.status, taxRate: form.taxEnabled ? form.taxRate : 0 };
    try {
      if (isNew) {
        await api.post('/invoices', payload);
        toast.success('Invoice created');
      } else {
        await api.put(`/invoices/${id}`, payload);
        toast.success('Invoice updated');
      }
      navigate('/admin/invoices');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving');
    } finally { setSaving(false); }
  };

  if (loading) return <AdminLayout title="Invoice"><div className="p-8 text-center text-gray-400">Loading…</div></AdminLayout>;

  const printStyles = `
    @media print {
      @page { size: letter; margin: 0.6in; }
      body * { visibility: hidden !important; }
      #invoice-printout, #invoice-printout * { visibility: visible !important; }
      #invoice-printout { position: fixed; top: 0; left: 0; width: 100%; }
    }
  `;

  return (
    <AdminLayout title={isNew ? 'New Invoice' : `Invoice ${form.invoiceNum}`}>
      <style>{printStyles}</style>

      {/* ── Hidden print-only invoice document ── */}
      <div id="invoice-printout" style={{ display: 'none', fontFamily: 'Arial, sans-serif', color: '#1a1a1a', fontSize: '13px', lineHeight: '1.5' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px', borderBottom: '3px solid #2d4229', paddingBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#2d4229', letterSpacing: '-0.5px' }}>TG Golf Carts</div>
            <div style={{ color: '#555', marginTop: '4px', fontSize: '12px' }}>Lithium Golf Cart Conversions</div>
            <div style={{ color: '#555', fontSize: '12px', marginTop: '8px' }}>
              Key Biscayne, FL 33149<br/>
              (786) 395-2805<br/>
              tgolfcarts@gmail.com
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '38px', fontWeight: '900', color: '#2d4229', letterSpacing: '-1px', lineHeight: '1' }}>INVOICE</div>
            <table style={{ marginTop: '14px', marginLeft: 'auto', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#e8f0e4' }}>
                  <th style={{ padding: '6px 16px', textAlign: 'center', border: '1px solid #c5d9be', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoice #</th>
                  <th style={{ padding: '6px 16px', textAlign: 'center', border: '1px solid #c5d9be', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                  {form.dueDate && <th style={{ padding: '6px 16px', textAlign: 'center', border: '1px solid #c5d9be', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Due Date</th>}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 16px', textAlign: 'center', border: '1px solid #c5d9be' }}>{form.invoiceNum}</td>
                  <td style={{ padding: '6px 16px', textAlign: 'center', border: '1px solid #c5d9be' }}>{form.date}</td>
                  {form.dueDate && <td style={{ padding: '6px 16px', textAlign: 'center', border: '1px solid #c5d9be' }}>{form.dueDate}</td>}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bill To */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ background: '#2d4229', color: '#fff', padding: '5px 12px', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'inline-block', marginBottom: '10px' }}>Bill To</div>
          <div style={{ fontWeight: '700', fontSize: '15px' }}>{form.customerName}</div>
          {form.customerEmail && <div style={{ color: '#555', marginTop: '3px' }}>{form.customerEmail}</div>}
        </div>

        {/* Line Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#2d4229', color: '#fff' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.06em' }}>Description</th>
              <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '700', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.06em', width: '60px' }}>Qty</th>
              <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.06em', width: '100px' }}>Unit Price</th>
              <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.06em', width: '100px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {form.lineItems.filter(l => l.description).map((line, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e5e7eb', background: i % 2 === 0 ? '#fff' : '#f9fbf8' }}>
                <td style={{ padding: '10px 14px' }}>{line.description}</td>
                <td style={{ padding: '10px 14px', textAlign: 'center' }}>{line.qty}</td>
                <td style={{ padding: '10px 14px', textAlign: 'right' }}>${parseFloat(line.unitPrice || 0).toFixed(2)}</td>
                <td style={{ padding: '10px 14px', textAlign: 'right' }}>${(parseFloat(line.qty || 0) * parseFloat(line.unitPrice || 0)).toFixed(2)}</td>
              </tr>
            ))}
            {/* Empty rows for spacing */}
            {[...Array(Math.max(0, 5 - form.lineItems.filter(l => l.description).length))].map((_, i) => (
              <tr key={`empty-${i}`} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '10px 14px' }}>&nbsp;</td>
                <td /><td /><td />
              </tr>
            ))}
          </tbody>
          <tfoot>
            {form.notes && (
              <tr>
                <td colSpan="4" style={{ padding: '10px 14px', fontStyle: 'italic', color: '#555', borderTop: '2px solid #e5e7eb', fontSize: '12px' }}>
                  {form.notes}
                </td>
              </tr>
            )}
            <tr style={{ borderTop: '1px solid #c5d9be' }}>
              <td colSpan="3" style={{ padding: '8px 14px', textAlign: 'right', color: '#555' }}>Subtotal</td>
              <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: '600' }}>${subtotal.toFixed(2)}</td>
            </tr>
            {form.taxEnabled && (
              <tr>
                <td colSpan="3" style={{ padding: '8px 14px', textAlign: 'right', color: '#555' }}>FL Sales Tax ({form.taxRate}%)</td>
                <td style={{ padding: '8px 14px', textAlign: 'right', fontWeight: '600' }}>${taxAmount.toFixed(2)}</td>
              </tr>
            )}
            <tr style={{ background: '#2d4229', color: '#fff' }}>
              <td colSpan="3" style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '800', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Due</td>
              <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '900', fontSize: '18px' }}>${total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        {/* Footer */}
        <div style={{ borderTop: '2px solid #e8f0e4', paddingTop: '18px', textAlign: 'center', color: '#777', fontSize: '11px' }}>
          Thank you for your business!<br/>
          Questions? Contact us at (786) 395-2805 · tgolfcarts@gmail.com · Key Biscayne, FL
        </div>
      </div>

      {/* Top action bar */}
      <div className="flex gap-2 items-center mb-6 no-print">
        <button onClick={() => navigate('/admin/invoices')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <FiArrowLeft size={14} /> Back
        </button>
        <div className="flex-1" />
        <button onClick={() => handleSave('draft')} disabled={saving} className="btn-secondary text-sm">Save Draft</button>
        {form.status !== 'paid' && (
          <button onClick={() => handleSave('sent')} disabled={saving} className="px-4 py-2 text-sm font-medium border-2 border-brand-green text-brand-green rounded-lg hover:bg-brand-green hover:text-white transition-colors">Mark Sent</button>
        )}
        <button onClick={() => handleSave('paid')} disabled={saving} className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Mark Paid</button>
        <button onClick={() => {
          const el = document.getElementById('invoice-printout');
          el.style.display = 'block';
          window.print();
          el.style.display = 'none';
        }} className="px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1">
          <FiDownload size={14} /> Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">Customer *</label>
                <select className="input" value={form.customerId} onChange={handleCustomerSelect}>
                  <option value="">— Select a customer —</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {!form.customerId && (
                  <input className="input mt-2" placeholder="Or type customer name manually…" value={form.customerName} onChange={e => set('customerName', e.target.value)} />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Invoice #</label>
                <input className="input font-mono" value={form.invoiceNum} onChange={e => set('invoiceNum', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Invoice Date</label>
                <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Due Date</label>
                <input className="input" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Customer Email</label>
                <input className="input" type="email" value={form.customerEmail} onChange={e => set('customerEmail', e.target.value)} placeholder="customer@email.com" />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Line Items</h3>
            <table className="w-full text-sm mb-3">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left pb-2 text-gray-500 font-medium uppercase text-xs tracking-wide">Description</th>
                  <th className="text-center pb-2 text-gray-500 font-medium uppercase text-xs tracking-wide w-16">QTY</th>
                  <th className="text-right pb-2 text-gray-500 font-medium uppercase text-xs tracking-wide w-28">Unit Price</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {form.lineItems.map((line, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 pr-2">
                      <input
                        className="w-full bg-transparent border border-transparent focus:border-gray-200 rounded px-2 py-1 text-sm outline-none"
                        placeholder="Description of service..."
                        value={line.description}
                        onChange={e => setLine(i, 'description', e.target.value)}
                      />
                    </td>
                    <td className="py-2 px-1">
                      <input
                        className="w-full bg-transparent border border-transparent focus:border-gray-200 rounded px-2 py-1 text-sm text-center outline-none"
                        type="number" min="1"
                        value={line.qty}
                        onChange={e => setLine(i, 'qty', e.target.value)}
                      />
                    </td>
                    <td className="py-2 pl-1">
                      <input
                        className="w-full bg-transparent border border-transparent focus:border-gray-200 rounded px-2 py-1 text-sm text-right outline-none"
                        type="number" min="0" step="0.01"
                        value={line.unitPrice}
                        onChange={e => setLine(i, 'unitPrice', e.target.value)}
                      />
                    </td>
                    <td className="py-2 pl-2">
                      {form.lineItems.length > 1 && (
                        <button onClick={() => setForm(f => ({ ...f, lineItems: f.lineItems.filter((_, idx) => idx !== i) }))} className="text-red-300 hover:text-red-500 transition-colors">
                          <FiX size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={() => setForm(f => ({ ...f, lineItems: [...f.lineItems, emptyLine()] }))} className="text-brand-green text-sm flex items-center gap-1 hover:underline mb-6">
              <FiPlus size={13} /> Add Item
            </button>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={form.taxEnabled} onChange={e => set('taxEnabled', e.target.checked)} className="rounded" />
                    FL Sales Tax ({form.taxRate}%)
                  </label>
                  <span className="font-medium">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2 font-bold text-base">
                  <span>Total Due</span>
                  <span className="text-brand-green text-lg">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Notes / Terms</h3>
            <textarea
              className="input w-full"
              rows={3}
              placeholder="Payment terms, thank you message, special instructions..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>
        </div>

        {/* Right sidebar — Customer Info */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-6">
            <h3 className="font-semibold text-gray-800 mb-3">Customer Info</h3>
            {selectedCustomer || (!isNew && form.customerId && customers.find(c => c.id === form.customerId)) ? (
              (() => {
                const c = selectedCustomer || customers.find(x => x.id === form.customerId);
                return c ? (
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="w-10 h-10 bg-brand-sage rounded-full flex items-center justify-center text-brand-deep font-bold text-lg mb-3">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-semibold text-gray-900 text-base">{c.name}</div>
                      {c.city && <div className="text-gray-500">{c.city}</div>}
                    </div>
                    {c.phone && <div className="text-gray-600">{c.phone}</div>}
                    {c.email && <div className="text-gray-600 break-all">{c.email}</div>}
                    {c.cartModel && (
                      <div className="pt-2 border-t">
                        <div className="text-gray-500 text-xs uppercase tracking-wide">Cart</div>
                        <div className="text-gray-800">{c.voltage && `${c.voltage} `}{c.cartModel}</div>
                      </div>
                    )}
                    {c.status && (
                      <div>
                        <div className="text-gray-500 text-xs uppercase tracking-wide">Status</div>
                        <div className="capitalize text-gray-800">{c.status}</div>
                      </div>
                    )}
                  </div>
                ) : null;
              })()
            ) : (
              <p className="text-gray-400 text-sm">Select a customer to see their details.</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
