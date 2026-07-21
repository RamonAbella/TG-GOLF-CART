import { useState, useEffect } from 'react';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const RANGE_OPTIONS = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
];

function TrafficBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-40 overflow-x-auto">
      {data.map((d, i) => (
        <div key={i} className="flex-1 min-w-[6px] flex flex-col items-center gap-1 group relative">
          <div
            className="w-full rounded-t transition-all bg-brand-green group-hover:opacity-80"
            style={{ height: `${(d.count / max) * 120}px`, minHeight: d.count > 0 ? 3 : 0 }}
            title={`${d.date}: ${d.count} views`}
          />
        </div>
      ))}
    </div>
  );
}

export default function Traffic() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    setLoading(true);
    api.get(`/analytics/stats?days=${days}`)
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStats(); }, [days]);

  if (loading || !stats) {
    return <AdminLayout title="Traffic"><div className="p-8 text-center text-gray-400">Loading…</div></AdminLayout>;
  }

  return (
    <AdminLayout title="Traffic">
      <div className="flex justify-end gap-1 mb-6">
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setDays(opt.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${days === opt.value ? 'bg-brand-green text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-green'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Page Views</div>
          <div className="text-2xl font-bold text-brand-green">{stats.totalViews.toLocaleString()}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Unique Visitors</div>
          <div className="text-2xl font-bold text-gray-900">{stats.uniqueVisitors.toLocaleString()}</div>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Page Views Over Time</h3>
        {stats.totalViews === 0 ? (
          <p className="text-gray-400 text-sm">No traffic recorded yet in this period.</p>
        ) : (
          <TrafficBarChart data={stats.viewsByDay} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Pages</h3>
          {stats.topPages.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.topPages.map((p, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                  <span className="font-medium text-gray-800 text-sm truncate">{p.path}</span>
                  <span className="text-gray-500 text-sm">{p.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Referrers</h3>
          {stats.topReferrers.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.topReferrers.map((r, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                  <span className="font-medium text-gray-800 text-sm truncate">{r.referrer}</span>
                  <span className="text-gray-500 text-sm">{r.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
