import { useState } from 'react';
import { FiUsers, FiZap, FiStar } from 'react-icons/fi';
import BookingModal from './BookingModal';

export default function CartCard({ cart }) {
  const [showBooking, setShowBooking] = useState(false);

  const typeLabels = { electric: 'Electric', lithium: 'Lithium', gas: 'Gas' };
  const typeColors = { electric: 'bg-blue-100 text-blue-700', lithium: 'bg-green-100 text-green-700', gas: 'bg-orange-100 text-orange-700' };

  const image = cart.images?.[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800';

  return (
    <>
      <div className="card overflow-hidden group">
        <div className="relative overflow-hidden h-52">
          <img
            src={image}
            alt={cart.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'; }}
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`badge ${typeColors[cart.type] || 'bg-gray-100 text-gray-700'}`}>
              <FiZap size={10} className="mr-1" />{typeLabels[cart.type] || cart.type}
            </span>
            {cart.status === 'available' ? (
              <span className="badge-available">Available</span>
            ) : (
              <span className="badge-booked">Booked</span>
            )}
          </div>
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{cart.name}</h3>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <FiUsers size={14} />
              <span>{cart.capacity}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-3">{cart.year} {cart.model} · {cart.color}</p>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{cart.description}</p>

          {/* Features */}
          <div className="flex flex-wrap gap-1 mb-4">
            {cart.features?.slice(0, 3).map((f) => (
              <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{f}</span>
            ))}
            {cart.features?.length > 3 && (
              <span className="text-xs text-gray-400">+{cart.features.length - 3} more</span>
            )}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
            <div className="text-center">
              <div className="text-xs text-gray-500">Daily</div>
              <div className="font-bold text-brand-green">${cart.dailyRate}</div>
            </div>
            <div className="text-center border-x border-gray-200">
              <div className="text-xs text-gray-500">Weekly</div>
              <div className="font-bold text-brand-green">${cart.weeklyRate}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Monthly</div>
              <div className="font-bold text-brand-green">${cart.monthlyRate}</div>
            </div>
          </div>

          <button
            onClick={() => setShowBooking(true)}
            disabled={cart.status !== 'available'}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cart.status === 'available' ? 'Book Now' : 'Unavailable'}
          </button>
        </div>
      </div>

      {showBooking && <BookingModal cart={cart} onClose={() => setShowBooking(false)} />}
    </>
  );
}
