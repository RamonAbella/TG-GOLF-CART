import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiDownload, FiSearch, FiX, FiPhone, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const STATUSES = ['lead', 'scheduled', 'completed', 'warranty', 'cancelled'];
const VOLTAGES = ['36V', '48V', '72V', 'other'];

const statusColor = {
  lead: 'bg-blue-100 text-blue-700',
  scheduled: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  warranty: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-700',
};

const empty = { name: '', phone: '', email: '', city: '', cartModel: '', voltage: '', status: 'lead', notes: '', installDate: '', warrantyEnd: '', source: '' };

function CustomerModal({ customer, onClose, onSave }) {
  const [form, setForm] = useState(customer || empty);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name required');
    setSaving(true);
    try {
      if (customer?.id) {
        const r = await api.put(`/crm/${customer.id}`, form);
        onSave(r.data, 'update');
      } else {
        const r = await api.post('/crm', form);
        onSave(r.data, 'create');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="font-bold text-lg text-gray-900">{customer?.id ? 'Edit Customer' : 'Add Customer'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input className="input" value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cart Model</label>
              <input className="input" placeholder="e.g. Club Car DS, EZGO" value={form.cartModel} onChange={e => set('cartModel', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voltage</label>
              <select className="input" value={form.voltage} onChange={e => set('voltage', e.target.value)}>
                <option value="">Select…</option>
                {VOLTAGES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Install Date</label>
              <input className="input" type="date" value={form.installDate} onChange={e => set('installDate', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warranty End</label>
              <input className="input" type="date" value={form.warrantyEnd} onChange={e => set('warrantyEnd', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <input className="input" placeholder="Referral, Google, Walk-in…" value={form.source} onChange={e => set('source', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea className="input" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ customer, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="font-bold text-lg text-gray-900 mb-2">Delete Customer?</h2>
        <p className="text-gray-600 mb-6">Remove <strong>{customer.name}</strong>? All linked invoices will also be deleted.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

function exportCSV(customers) {
  const headers = ['Name', 'Phone', 'Email', 'City', 'Cart Model', 'Voltage', 'Status', 'Install Date', 'Warranty End', 'Source', 'Added'];
  const rows = customers.map(c => [c.name, c.phone || '', c.email || '', c.city || '', c.cartModel || '', c.voltage || '', c.status, c.installDate || '', c.warrantyEnd || '', c.source || '', new Date(c.createdAt).toLocaleDateString()]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'customers.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default function CRMCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [voltageFilter, setVoltageFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (voltageFilter) params.voltage = voltageFilter;
      if (search) params.q = search;
      const r = await api.get('/crm', { params });
      setCustomers(r.data);
    } catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, statusFilter, voltageFilter]);

  const handleSave = (c, type) => {
    if (type === 'create') setCustomers(prev => [c, ...prev]);
    else setCustomers(prev => prev.map(x => x.id === c.id ? c : x));
    setModal(null);
    toast.success(type === 'create' ? 'Customer added' : 'Customer updated');
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/crm/${deleteTarget.id}`);
      setCustomers(prev => prev.filter(x => x.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Customer deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <AdminLayout title="Customers">
      {modal && <CustomerModal customer={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}
      {deleteTarget && <DeleteModal customer={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}

      <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative">
            <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9 py-2 w-56 text-sm"
              placeholder="Search name, phone, city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="input py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select className="input py-2 text-sm" value={voltageFilter} onChange={e => setVoltageFilter(e.target.value)}>
            <option value="">All Voltages</option>
            {VOLTAGES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <span className="text-sm text-gray-400">{customers.length} customer{customers.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportCSV(customers)} className="btn-secondary flex items-center gap-2 text-sm">
            <FiDownload size={14} /> Export Excel
          </button>
          <button onClick={() => setModal('new')} className="btn-primary flex items-center gap-2 text-sm">
            <FiPlus size={15} /> Add Customer
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No customers found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase text-xs tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase text-xs tracking-wide">Phone</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase text-xs tracking-wide">City</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase text-xs tracking-wide">Cart</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase text-xs tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase text-xs tracking-wide">Added</th>
                <th className="text-right px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{c.name}</div>
                    {c.email && <div className="text-xs text-gray-400 flex items-center gap-1"><FiMail size={11} /> {c.email}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.phone ? <span className="flex items-center gap-1"><FiPhone size={12} /> {c.phone}</span> : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.city || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.voltage && c.cartModel ? `${c.voltage} ${c.cartModel}` : c.cartModel || c.voltage || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor[c.status] || 'bg-gray-100 text-gray-600'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right flex items-center gap-1 justify-end">
                    <button
                      onClick={() => setModal(c)}
                      className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:border-brand-green hover:text-brand-green transition-colors"
                    >
                      Open
                    </button>
                    <button onClick={() => setDeleteTarget(c)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"><FiTrash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
