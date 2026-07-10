import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiTrash2, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const statusColor = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
};

function DeleteModal({ invoice, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="font-bold text-lg text-gray-900 mb-2">Delete Invoice?</h2>
        <p className="text-gray-600 mb-6">Delete <strong>{invoice.invoiceNum}</strong> for <strong>{invoice.customerName}</strong>?</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    api.get('/invoices').then(r => setInvoices(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const displayed = invoices.filter(inv => {
    const matchStatus = !statusFilter || inv.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || inv.invoiceNum.toLowerCase().includes(q) || inv.customerName.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const handleDelete = async () => {
    try {
      await api.delete(`/invoices/${deleteTarget.id}`);
      setInvoices(prev => prev.filter(x => x.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success('Invoice deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalSent = invoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.total, 0);

  return (
    <AdminLayout title="Invoices">
      {deleteTarget && <DeleteModal invoice={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Paid</div>
          <div className="text-2xl font-bold text-yellow-500">${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Outstanding (Sent)</div>
          <div className="text-2xl font-bold text-gray-900">${totalSent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Invoices</div>
          <div className="text-2xl font-bold text-brand-green">{invoices.length}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9 py-2 w-60 text-sm"
              placeholder="Search invoice # or customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="input py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
          <span className="text-sm text-gray-400">{displayed.length} invoice{displayed.length !== 1 ? 's' : ''}</span>
        </div>
        <Link to="/admin/invoices/new" className="btn-primary flex items-center gap-2 text-sm">
          <FiPlus size={15} /> New Invoice
        </Link>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : displayed.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No invoices found. <Link to="/admin/invoices/new" className="text-brand-green hover:underline">Create one</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase text-xs tracking-wide">Invoice #</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase text-xs tracking-wide">Customer</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase text-xs tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase text-xs tracking-wide">Due</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase text-xs tracking-wide">Amount</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium uppercase text-xs tracking-wide">Status</th>
                <th className="text-right px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(inv => (
                <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/admin/invoices/${inv.id}`} className="font-mono font-semibold text-brand-green hover:underline">{inv.invoiceNum}</Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{inv.customerName}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-600">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">${inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor[inv.status]}`}>{inv.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right flex items-center gap-1 justify-end">
                    <Link to={`/admin/invoices/${inv.id}`} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:border-brand-green hover:text-brand-green transition-colors">
                      Open
                    </Link>
                    <button onClick={() => setDeleteTarget(inv)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"><FiTrash2 size={13} /></button>
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
