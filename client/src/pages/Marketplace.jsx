import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiMapPin, FiPhone, FiMail, FiArrowRight, FiTag } from 'react-icons/fi';
import api from '../lib/api';
import SEO from '../components/SEO';

const conditionColors = {
  excellent: 'bg-green-100 text-green-700',
  good: 'bg-blue-100 text-blue-700',
  fair: 'bg-yellow-100 text-yellow-700',
  poor: 'bg-red-100 text-red-700',
};

function ListingCard({ listing }) {
  const [showContact, setShowContact] = useState(false);
  const image = listing.images?.[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800';

  return (
    <div className="card overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img src={image} alt={listing.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'; }} />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`badge ${conditionColors[listing.condition]}`}>{listing.condition}</span>
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="font-bold text-brand-green">${listing.price.toLocaleString()}</span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">{listing.title}</h3>
        <p className="text-sm text-gray-500 mb-3">{listing.year} {listing.make} {listing.model}</p>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{listing.description}</p>

        {listing.features?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {listing.features.slice(0, 3).map(f => (
              <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{f}</span>
            ))}
            {listing.features.length > 3 && <span className="text-xs text-gray-400">+{listing.features.length - 3}</span>}
          </div>
        )}

        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <FiMapPin size={14} /> {listing.location}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowContact(!showContact)}
            className="flex-1 btn-primary !py-2.5 text-sm"
          >
            Contact Seller
          </button>
          <a href={`tel:${listing.sellerPhone?.replace(/\D/g,'')}`} className="btn-secondary !py-2.5 !px-3">
            <FiPhone size={16} />
          </a>
        </div>

        {showContact && (
          <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm space-y-2">
            <div className="font-semibold text-gray-800">{listing.sellerName}</div>
            <div className="flex items-center gap-2 text-gray-600">
              <FiPhone size={13} />
              <a href={`tel:${listing.sellerPhone}`} className="hover:text-brand-green">{listing.sellerPhone}</a>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FiMail size={13} />
              <a href={`mailto:${listing.sellerEmail}`} className="hover:text-brand-green">{listing.sellerEmail}</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ condition: '', minPrice: '', maxPrice: '' });

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: 'active' });
      if (filters.condition) params.set('condition', filters.condition);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      const { data } = await api.get(`/marketplace?${params}`);
      setListings(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, [filters]);

  const filtered = listings.filter(l =>
    search === '' ||
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.make.toLowerCase().includes(search.toLowerCase()) ||
    l.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Golf Cart Marketplace"
        description="Buy and sell golf carts in Key Biscayne and Miami. Verified listings, fair prices, and lithium conversions available on any purchase."
        path="/marketplace"
      />
      {/* Hero */}
      <div className="bg-brand-deep text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-brand-muted text-xs font-medium uppercase tracking-widest mb-2">Buy & Sell</div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Golf Cart Marketplace</h1>
          <p className="text-white/60 max-w-xl mb-6 text-sm leading-relaxed">
            Browse pre-owned golf carts in the Miami area. Every listing is verified. Lithium conversions available on any purchase.
          </p>
          <Link to="/sell" className="btn-primary flex items-center gap-2 w-fit">
            <FiTag size={18} /> List Your Cart for Sale <FiArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-card p-4 mb-8 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
            <FiFilter size={16} /> Filter:
          </div>
          <div className="relative flex-1 min-w-48">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              placeholder="Search by name, make, or model..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            value={filters.condition}
            onChange={e => setFilters({ ...filters, condition: e.target.value })}
          >
            <option value="">Any Condition</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
          <div className="flex items-center gap-2">
            <input
              className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder="Min $"
              type="number"
              value={filters.minPrice}
              onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
            />
            <span className="text-gray-400">–</span>
            <input
              className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder="Max $"
              type="number"
              value={filters.maxPrice}
              onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
            />
          </div>
          <span className="text-sm text-gray-400">{filtered.length} listing{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="card h-80 animate-pulse bg-gray-100" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(listing => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏌️</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No listings found</h3>
            <p className="text-gray-500 mb-6">Try broader filters or list your own cart for sale.</p>
            <Link to="/sell" className="btn-primary">List Your Cart</Link>
          </div>
        )}

        {/* CTA to sell */}
        <div className="mt-12 bg-brand-green rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-semibold tracking-tight mb-2">Have a Golf Cart to Sell?</h2>
          <p className="text-green-100 mb-6 max-w-md mx-auto">List it on our marketplace for free. We'll help you reach buyers across Miami-Dade County.</p>
          <Link to="/sell" className="bg-white text-brand-green font-bold px-8 py-3 rounded-lg hover:bg-green-50 transition-colors inline-flex items-center gap-2">
            List Your Cart — Free <FiArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
