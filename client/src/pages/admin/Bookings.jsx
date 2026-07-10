import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const statusColors = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  cancelled: 'badge bg-red-100 text-red-700',
  completed: 'badge bg-gray-100 text-gray-600',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/bookings?${params}`);
      setBookings(data.bookings);
      setTotal(data.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, [statusFilter, page]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <AdminLayout title="Bookings">
      <div className="flex flex-wrap gap-3 mb-6">
        {['', 'pending', 'confirmed', 'cancelled', 'completed'].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-brand-green text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} shadow-card`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-400 self-center">{total} total</span>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Guest</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Cart</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Dates</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Duration</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Total</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="px-4 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400">Loading...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400">No bookings found</td></tr>
              ) : bookings.map(b => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{b.guestName}</div>
                    <div className="text-xs text-gray-400">{b.guestEmail}</div>
                    <div className="text-xs text-gray-400">{b.guestPhone}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.cart?.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <div>{format(new Date(b.startDate), 'MMM d, yyyy')}</div>
                    <div className="text-xs text-gray-400">to {format(new Date(b.endDate), 'MMM d, yyyy')}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div>{b.duration}d</div>
                    <div className="text-xs text-gray-400">{b.durationType}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-brand-green">${b.totalPrice}</div>
                    <div className="text-xs text-gray-400">dep ${b.deposit}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={statusColors[b.status] || 'badge bg-gray-100'}>{b.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {b.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(b.id, 'confirmed')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors">Confirm</button>
                          <button onClick={() => updateStatus(b.id, 'cancelled')} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors">Cancel</button>
                        </>
                      )}
                      {b.status === 'confirmed' && (
                        <button onClick={() => updateStatus(b.id, 'completed')} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors">Complete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
