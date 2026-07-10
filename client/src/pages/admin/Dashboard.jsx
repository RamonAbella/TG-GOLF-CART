import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiList, FiCalendar, FiDollarSign, FiTool, FiShoppingCart, FiArrowRight, FiUsers, FiFileText, FiTrendingUp } from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

function StatCard({ icon, title, value, sub, color, to }) {
  return (
    <Link to={to} className="card p-5 flex items-center gap-4 hover:scale-105 transition-transform">
      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm font-medium text-gray-700">{title}</div>
        {sub && <div className="text-xs text-gray-400">{sub}</div>}
      </div>
    </Link>
  );
}

const statusColors = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  cancelled: 'badge bg-red-100 text-red-700',
  completed: 'badge bg-gray-100 text-gray-600',
};

const invStatusColor = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  const fetchStats = () => api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {});

  useEffect(() => {
    fetchStats();
    const onFocus = () => fetchStats();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {stats ? (
        <>
          {/* Rentals & Operations */}
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Operations</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <StatCard icon={<FiList size={20} className="text-blue-600" />} title="Total Carts" value={stats.totalCarts} color="bg-blue-100" to="/admin/inventory" />
            <StatCard icon={<FiCalendar size={20} className="text-green-600" />} title="Bookings" value={stats.totalBookings} sub={`${stats.pendingBookings} pending`} color="bg-green-100" to="/admin/bookings" />
            <StatCard icon={<FiDollarSign size={20} className="text-yellow-600" />} title="Rental Revenue" value={`$${(stats.totalRevenue || 0).toLocaleString()}`} sub="Confirmed" color="bg-yellow-100" to="/admin/bookings" />
            <StatCard icon={<FiTool size={20} className="text-purple-600" />} title="Service Requests" value={stats.pendingServices} sub="Pending" color="bg-purple-100" to="/admin/services" />
            <StatCard icon={<FiShoppingCart size={20} className="text-orange-600" />} title="Marketplace" value={stats.totalListings} sub="Active" color="bg-orange-100" to="/admin/marketplace" />
          </div>

          {/* CRM & Finance */}
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">CRM & Finance</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <StatCard icon={<FiUsers size={20} className="text-cyan-600" />} title="Leads" value={stats.totalLeads} sub={`${stats.newLeads} new`} color="bg-cyan-100" to="/admin/leads" />
            <StatCard icon={<FiUsers size={20} className="text-indigo-600" />} title="CRM Customers" value={stats.totalCRMCustomers} color="bg-indigo-100" to="/admin/customers" />
            <StatCard icon={<FiFileText size={20} className="text-emerald-600" />} title="Invoice Revenue" value={`$${(stats.invoiceRevenue || 0).toLocaleString()}`} sub="Paid invoices" color="bg-emerald-100" to="/admin/invoices" />
            <StatCard icon={<FiDollarSign size={20} className="text-red-500" />} title="Expenses" value={`$${(stats.expensesTotal || 0).toLocaleString()}`} sub="All time" color="bg-red-100" to="/admin/expenses" />
            <StatCard icon={<FiTrendingUp size={20} className="text-brand-green" />} title="Net Profit" value={`$${(stats.netProfit || 0).toLocaleString()}`} sub="All time" color="bg-brand-sage" to="/admin/analytics" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-900 text-lg">Recent Bookings</h2>
                <Link to="/admin/bookings" className="text-brand-green text-sm flex items-center gap-1 hover:underline">
                  View All <FiArrowRight size={14} />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-gray-500 font-medium">Guest</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Cart</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Total</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBookings.map(b => (
                      <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2.5">
                          <div className="font-medium text-gray-800 text-sm">{b.guestName}</div>
                          <div className="text-xs text-gray-400">{format(new Date(b.startDate), 'MMM d')} – {format(new Date(b.endDate), 'MMM d')}</div>
                        </td>
                        <td className="py-2.5 text-gray-600 text-sm">{b.cart.name}</td>
                        <td className="py-2.5 font-semibold text-brand-green text-sm">${b.totalPrice}</td>
                        <td className="py-2.5">
                          <span className={statusColors[b.status] || 'badge bg-gray-100 text-gray-600'}>{b.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-900 text-lg">Recent Invoices</h2>
                <Link to="/admin/invoices" className="text-brand-green text-sm flex items-center gap-1 hover:underline">
                  View All <FiArrowRight size={14} />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-gray-500 font-medium">Invoice #</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Customer</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Total</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats.recentInvoices || []).map(inv => (
                      <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2.5 font-mono text-sm text-gray-700">{inv.invoiceNum}</td>
                        <td className="py-2.5 text-gray-600 text-sm">{inv.customerName}</td>
                        <td className="py-2.5 font-semibold text-gray-900 text-sm">${inv.total?.toLocaleString()}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${invStatusColor[inv.status] || 'bg-gray-100 text-gray-600'}`}>{inv.status}</span>
                        </td>
                      </tr>
                    ))}
                    {(!stats.recentInvoices || stats.recentInvoices.length === 0) && (
                      <tr><td colSpan={4} className="py-6 text-center text-gray-400 text-sm">No invoices yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-4">
            {[1,2,3,4,5].map(i => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}
          </div>
          <div className="grid grid-cols-5 gap-4">
            {[1,2,3,4,5].map(i => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
