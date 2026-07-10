import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const typeLabels = {
  battery_conversion: 'Battery Conversion',
  battery_sale: 'Battery Sale',
  installation: 'Installation',
  maintenance: 'Maintenance',
};

export default function AdminServices() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const { data } = await api.get(`/services${params}`);
      setRequests(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/services/${id}`, { status });
      toast.success('Status updated');
      fetch();
    } catch { toast.error('Failed'); }
  };

  const statusColors = {
    pending: 'badge-pending', in_progress: 'badge-confirmed',
    completed: 'badge bg-gray-100 text-gray-600', cancelled: 'badge bg-red-100 text-red-700',
  };

  return (
    <AdminLayout title="Service Requests">
      <div className="flex gap-3 mb-6 flex-wrap">
        {['', 'pending', 'in_progress', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-card ${statusFilter === s ? 'bg-brand-green text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            {s === '' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Customer</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Service</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Cart</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Submitted</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Est. Price</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">Loading...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">No requests found</td></tr>
            ) : requests.map(r => (
              <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{r.customerName}</div>
                  <div className="text-xs text-gray-400">{r.customerEmail}</div>
                  <div className="text-xs text-gray-400">{r.customerPhone}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{typeLabels[r.type] || r.type}</div>
                  <div className="text-xs text-gray-400 max-w-32 truncate">{r.description}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {r.cartMake && `${r.cartYear || ''} ${r.cartMake} ${r.cartModel || ''}`}
                </td>
                <td className="px-4 py-3 text-gray-500">{format(new Date(r.createdAt), 'MMM d, yyyy')}</td>
                <td className="px-4 py-3 font-medium text-brand-green">{r.estimatedPrice ? `$${r.estimatedPrice}` : '—'}</td>
                <td className="px-4 py-3"><span className={statusColors[r.status] || 'badge bg-gray-100'}>{r.status}</span></td>
                <td className="px-4 py-3">
                  <select
                    value={r.status}
                    onChange={e => updateStatus(r.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-green"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
