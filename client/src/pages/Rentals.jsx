import { useState, useEffect } from 'react';
import { FiFilter, FiSearch } from 'react-icons/fi';
import api from '../lib/api';
import CartCard from '../components/CartCard';

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'electric', label: 'Electric' },
  { value: 'lithium', label: 'Lithium' },
  { value: 'gas', label: 'Gas' },
];

const capacityOptions = [
  { value: '', label: 'Any Size' },
  { value: '2', label: '2 Passengers' },
  { value: '4', label: '4+ Passengers' },
  { value: '6', label: '6 Passengers' },
];

export default function Rentals() {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', capacity: '', status: '' });
  const [search, setSearch] = useState('');

  const fetchCarts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.set('type', filters.type);
      if (filters.capacity) params.set('capacity', filters.capacity);
      if (filters.status) params.set('status', filters.status);
      const { data } = await api.get(`/carts?${params}`);
      setCarts(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchCarts(); }, [filters]);

  const filtered = carts.filter(c =>
    search === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-white/50 text-xs font-medium uppercase tracking-widest mb-2">Key Biscayne, FL</div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Rent a Golf Cart</h1>
          <p className="text-green-100 max-w-xl">
            Browse our fleet of 2022–2024 carts. All rates include street-legal equipment, insurance, and free local delivery on monthly rentals.
          </p>
          <div className="flex flex-wrap gap-4 mt-6 text-sm">
            <span className="bg-white/20 px-3 py-1.5 rounded-full">Daily from $65</span>
            <span className="bg-white/20 px-3 py-1.5 rounded-full">Weekly from $369</span>
            <span className="bg-white/20 px-3 py-1.5 rounded-full">Monthly from $999</span>
            <span className="bg-white/20 px-3 py-1.5 rounded-full">30% deposit to confirm</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-card p-4 mb-8 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
            <FiFilter size={16} /> Filters:
          </div>
          <div className="relative flex-1 min-w-48">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              placeholder="Search carts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
            value={filters.type}
            onChange={e => setFilters({ ...filters, type: e.target.value })}
          >
            {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
            value={filters.capacity}
            onChange={e => setFilters({ ...filters, capacity: e.target.value })}
          >
            {capacityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="available">Available Now</option>
          </select>
          <span className="text-sm text-gray-400">{filtered.length} cart{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card h-80 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(cart => <CartCard key={cart.id} cart={cart} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛺</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No carts found</h3>
            <p className="text-gray-500">Try adjusting your filters or contact us for custom availability.</p>
          </div>
        )}

        {/* Pricing Info */}
        <div className="mt-12 bg-white rounded-2xl shadow-card p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Rental Rates & Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { title: 'Daily Rental', range: '$65 – $129/day', desc: 'Perfect for day trips and short visits. Minimum 1 day.' },
              { title: 'Weekly Rental', range: '$369 – $749/week', desc: 'Best value for 1-week stays. Save up to 20% vs daily rate.' },
              { title: 'Monthly Rental', range: '$999 – $2,199/month', desc: 'Ideal for residents and snowbirds. Includes free delivery & pickup.' },
            ].map(r => (
              <div key={r.title} className="p-4 bg-green-50 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-1">{r.title}</h3>
                <div className="text-brand-green font-bold text-lg mb-2">{r.range}</div>
                <p className="text-sm text-gray-500">{r.desc}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            {[
              '30% deposit required to confirm booking',
              'Balance due at pickup',
              'Free cancellation 24+ hours before start',
              'All carts include street-legal equipment',
              'Driver must be 21+ with valid license',
              'ID verification required at pickup',
              'Damage deposit: $300 (fully refundable)',
              '24/7 roadside support during rental',
            ].map(p => (
              <div key={p} className="flex items-start gap-2">
                <span className="text-brand-green mt-0.5">✓</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
