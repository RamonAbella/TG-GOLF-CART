import { useState, useEffect } from 'react';
import { FiPlus, FiX, FiSearch, FiExternalLink, FiDownload, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const CATEGORIES = ['parts', 'fuel', 'tools', 'marketing', 'supplies', 'other'];

const catColor = {
  parts: 'bg-blue-100 text-blue-700',
  fuel: 'bg-orange-100 text-orange-700',
  tools: 'bg-purple-100 text-purple-700',
  marketing: 'bg-pink-100 text-pink-700',
  supplies: 'bg-yellow-100 text-yellow-700',
  other: 'bg-gray-100 text-gray-600',
};

const empty = { date: new Date().toISOString().split('T')[0], category: 'parts', description: '', vendor: '', amount: '', notes: '', customerId: '' };

function exportCSV(expenses, getCustomerName) {
  const headers = ['Date', 'Category', 'Description', 'Vendor', 'Customer', 'Amount', 'Notes'];
  const rows = expenses.map(e => [
    new Date(e.date).toLocaleDateString(),
    e.category,
    e.description,
    e.vendor || '',
    getCustomerName(e.customerId),
    e.amount.toFixed(2),
    e.notes || '',
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'expenses.csv'; a.click();
  URL.revokeObjectURL(url);
}

function ExpenseModal({ expense, customers, onClose, onSave }) {
  const [form, setForm] = useState(expense ? { ...expense, date: expense.date ? expense.date.split('T')[0] : '' } : empty);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.amount) return toast.error('Description and amount required');
    setSaving(true);
    try {
      if (expense?.id) {
        const r = await api.put(`/expenses/${expense.id}`, form);
        onSave(r.data, 'update');
      } else {
        const r = await api.post('/expenses', form);
        onSave(r.data, 'create');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="font-bold text-lg text-gray-900">{expense?.id ? 'Edit Expense' : 'Add Expense'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input className="input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <input className="input" value={form.description} onChange={e => set('description', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <input className="input" value={form.vendor} onChange={e => set('vendor', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
              <input className="input" type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link to Customer</label>
              <select className="input" value={form.customerId} onChange={e => set('customerId', e.target.value)}>
                <option value="">— none —</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt URL</label>
              <input className="input" placeholder="https://…" value={form.receiptUrl || ''} onChange={e => set('receiptUrl', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save Expense'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ expense, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="font-bold text-lg text-gray-900 mb-2">Delete Expense?</h2>
        <p className="text-gray-600 mb-6">Delete <strong>{expense.description}</strong>?</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [month, setMonth] = useState('');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [expR, crmR] = await Promise.all([
        api.get('/expenses', { params: { month } }),
        api.get('/crm'),
      ]);
      setExpenses(expR.data);
      setCustomers(crmR.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [month]);

  const displayed = expenses.filter(e => {
    const matchCat = !catFilter || e.category === catFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || e.description.toLowerCase().includes(q) || (e.vendor || '').toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleSave = (_exp, type) => {
    setModal(null);
    toast.success(type === 'create' ? 'Expense added' : 'Expense updated');
    // Switch to All Months so the saved expense is always visible regardless of date
    if (month !== '') {
      setMonth('');
    } else {
      load();
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/expenses/${deleteTarget.id}`);
      setExpenses(prev => prev.filter(x => x.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Expense deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const catTotals = CATEGORIES.reduce((acc, c) => {
    acc[c] = expenses.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0);
    return acc;
  }, {});

  const getCustomerName = (cid) => {
    if (!cid) return '—';
    const c = customers.find(x => x.id === cid);
    return c ? c.name : '—';
  };

  return (
    <AdminLayout title="Expenses">
      {modal && <ExpenseModal expense={modal === 'new' ? null : modal} customers={customers} onClose={() => setModal(null)} onSave={handleSave} />}
      {deleteTarget && <DeleteModal expense={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}

      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">Month:</label>
          <select className="input py-2 text-sm" value={month} onChange={e => setMonth(e.target.value)}>
            <option value="">All Months</option>
            {Array.from({ length: 18 }, (_, i) => {
              const d = new Date();
              d.setMonth(d.getMonth() - i);
              const val = d.toISOString().slice(0, 7);
              const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
              return <option key={val} value={val}>{label}</option>;
            })}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-brand-green">Total: ${total.toFixed(2)}</span>
          <button onClick={() => exportCSV(displayed, getCustomerName)} className="btn-secondary flex items-center gap-2 text-sm">
            <FiDownload size={14} /> Export Excel
          </button>
          <button onClick={() => setModal('new')} className="btn-primary flex items-center gap-2 text-sm">
            <FiPlus size={15} /> Add Expense
          </button>
        </div>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-5">
        {CATEGORIES.map(cat => (
          <div key={cat} className="card p-4">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${catColor[cat]}`}>{cat}</span>
            <div className="text-base font-bold text-gray-900 mt-2">${catTotals[cat].toFixed(0)}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 items-center mb-4 flex-wrap">
        <div className="relative">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9 py-2 w-60 text-sm"
            placeholder="Search description, vendor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input py-2 text-sm" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <span className="text-sm text-gray-400">{displayed.length} expense{displayed.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : displayed.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No expenses for this period.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase text-xs tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase text-xs tracking-wide">Category</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase text-xs tracking-wide">Description</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase text-xs tracking-wide">Vendor</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase text-xs tracking-wide">Customer</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium uppercase text-xs tracking-wide">Amount</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium uppercase text-xs tracking-wide">Receipt</th>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody>
              {displayed.map(exp => (
                <tr key={exp.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600">{new Date(exp.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${catColor[exp.category] || 'bg-gray-100 text-gray-600'}`}>{exp.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{exp.description}</div>
                    {exp.notes && <div className="text-xs text-gray-400">{exp.notes}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{exp.vendor || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{getCustomerName(exp.customerId)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">${exp.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    {exp.receiptUrl ? (
                      <a href={exp.receiptUrl} target="_blank" rel="noreferrer" className="text-brand-green text-xs flex items-center gap-1 justify-center hover:underline">
                        <FiExternalLink size={12} /> View
                      </a>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 flex items-center gap-1">
                    <button onClick={() => setModal(exp)} className="p-1.5 text-gray-300 hover:text-brand-green transition-colors"><FiEdit2 size={14} /></button>
                    <button onClick={() => setDeleteTarget(exp)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"><FiX size={15} /></button>
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
