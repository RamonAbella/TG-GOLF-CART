import { useState, useEffect } from 'react';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const TIME_FILTERS = [
  { label: 'This Month', value: 'month' },
  { label: 'Last 3 Mo', value: '3mo' },
  { label: 'This Year', value: 'year' },
  { label: 'All Time', value: 'all' },
];

function getRange(filter) {
  const now = new Date();
  if (filter === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
  if (filter === '3mo') { const d = new Date(now); d.setMonth(d.getMonth() - 3); return d; }
  if (filter === 'year') return new Date(now.getFullYear(), 0, 1);
  return null;
}

function getLast6Months() {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { label: d.toLocaleString('default', { month: 'short' }), key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` };
  });
}

function polarToXY(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function DonutChart({ segments }) {
  const COLORS = ['#4a6741', '#2d4229', '#6b9461', '#e8b84b', '#94a38f', '#c5d6c1'];
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) return <p className="text-gray-400 text-sm py-4">No data</p>;
  let offset = 0;
  const slices = segments.map((seg, i) => {
    const pct = seg.value / total;
    const startAngle = offset * 360;
    offset += pct;
    const endAngle = offset * 360;
    const large = endAngle - startAngle > 180 ? 1 : 0;
    const start = polarToXY(50, 50, 40, startAngle);
    const end = polarToXY(50, 50, 40, endAngle);
    return { ...seg, path: `M50,50 L${start.x},${start.y} A40,40 0 ${large} 1 ${end.x},${end.y} Z`, color: COLORS[i % COLORS.length] };
  });
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-28 h-28 flex-shrink-0">
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} />)}
        <circle cx="50" cy="50" r="22" fill="white" />
      </svg>
      <div className="space-y-1.5">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-gray-600 capitalize">{s.label}</span>
            <span className="text-gray-400 ml-1">${s.value.toFixed(0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-36">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          {d.value > 0 && <span className="text-xs text-gray-400">${d.value >= 1000 ? (d.value / 1000).toFixed(1) + 'k' : d.value}</span>}
          <div className="w-full rounded-t transition-all" style={{ height: `${(d.value / max) * 100}px`, minHeight: d.value > 0 ? 3 : 0, backgroundColor: '#4a6741' }} />
          <span className="text-xs text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [filter, setFilter] = useState('all');
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([api.get('/invoices'), api.get('/expenses'), api.get('/leads')])
      .then(([inv, exp, lds]) => { setInvoices(inv.data); setExpenses(exp.data); setLeads(lds.data); })
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // Re-fetch whenever the tab becomes visible again
    const onFocus = () => fetchData();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const cutoff = getRange(filter);
  const inRange = (dateStr) => !cutoff || new Date(dateStr) >= cutoff;

  const filteredInvoices = invoices.filter(i => inRange(i.date));
  const filteredExpenses = expenses.filter(e => inRange(e.date));
  const filteredLeads = leads.filter(l => inRange(l.createdAt));

  const totalRevenue = filteredInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const completedInvoices = filteredInvoices.filter(i => i.status === 'paid');
  const avgJobValue = completedInvoices.length ? totalRevenue / completedInvoices.length : 0;
  const bookedLeads = filteredLeads.filter(l => l.status === 'booked').length;
  const leadConversion = filteredLeads.length ? (bookedLeads / filteredLeads.length * 100).toFixed(1) : '0.0';

  const revenueByMonth = getLast6Months().map(({ label, key }) => ({
    label, value: Math.round(invoices.filter(i => i.status === 'paid' && i.date?.startsWith(key)).reduce((s, i) => s + i.total, 0))
  }));

  const pipelineData = [
    { label: 'New Leads', key: 'new', color: 'bg-blue-500' },
    { label: 'Contacted', key: 'contacted', color: 'bg-purple-500' },
    { label: 'Booked', key: 'booked', color: 'bg-yellow-500' },
    { label: 'Completed', key: 'lost', color: 'bg-brand-green' },
  ].map(p => ({ ...p, count: filteredLeads.filter(l => l.status === p.key).length }));
  const maxPipeline = Math.max(...pipelineData.map(p => p.count), 1);

  const expensesByCategory = {};
  filteredExpenses.forEach(e => { expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount; });
  const expenseSegments = Object.entries(expensesByCategory).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

  const topCustomers = Object.values(
    filteredInvoices.filter(i => i.status === 'paid').reduce((acc, i) => {
      const key = i.customerName;
      if (!acc[key]) acc[key] = { name: key, total: 0 };
      acc[key].total += i.total;
      return acc;
    }, {})
  ).sort((a, b) => b.total - a.total).slice(0, 5);

  if (loading) return <AdminLayout title="Analytics"><div className="p-8 text-center text-gray-400">Loading…</div></AdminLayout>;

  return (
    <AdminLayout title="Analytics">
      {/* Time filter */}
      <div className="flex justify-end gap-1 mb-6">
        {TIME_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === f.value ? 'bg-brand-green text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-green'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* KPI row 1 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: 'TOTAL REVENUE', value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: 'text-brand-green' },
          { label: 'TOTAL EXPENSES', value: `$${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: 'text-red-500' },
          { label: 'NET PROFIT', value: `${netProfit < 0 ? '-' : ''}$${Math.abs(netProfit).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: netProfit >= 0 ? 'text-brand-green' : 'text-red-500' },
        ].map(k => (
          <div key={k.label} className="card p-5">
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">{k.label}</div>
            <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* KPI row 2 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'AVG JOB VALUE', value: `$${avgJobValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
          { label: 'LEAD CONVERSION', value: `${leadConversion}%`, sub: `${bookedLeads} of ${filteredLeads.length} in period` },
          { label: 'COMPLETED JOBS', value: completedInvoices.length, sub: `${invoices.filter(i => i.status === 'paid').length} completed all-time` },
        ].map(k => (
          <div key={k.label} className="card p-5">
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">{k.label}</div>
            <div className="text-2xl font-bold text-gray-900">{k.value}</div>
            {k.sub && <div className="text-xs text-gray-400 mt-1">{k.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
          <BarChart data={revenueByMonth} />
        </div>

        {/* Lead pipeline */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Lead Pipeline</h3>
          <div className="space-y-3">
            {pipelineData.map(p => (
              <div key={p.key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{p.label}</span>
                  <span className="text-gray-500 text-xs">{p.count} &nbsp; {filteredLeads.length ? Math.round(p.count / filteredLeads.length * 100) : 0}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${p.color}`} style={{ width: `${(p.count / maxPipeline) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense breakdown */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
          {expenseSegments.length > 0 ? <DonutChart segments={expenseSegments} /> : <p className="text-gray-400 text-sm">No expenses in this period.</p>}
        </div>

        {/* Top customers */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Customers by Revenue</h3>
          {topCustomers.length === 0 ? (
            <p className="text-gray-400 text-sm">No paid invoices in this period.</p>
          ) : (
            <div className="space-y-3">
              {topCustomers.map((c, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-brand-sage rounded-full flex items-center justify-center text-brand-deep text-xs font-bold">{c.name.charAt(0)}</div>
                    <span className="font-medium text-gray-800 text-sm">{c.name}</span>
                  </div>
                  <span className="font-semibold text-brand-green text-sm">${c.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
