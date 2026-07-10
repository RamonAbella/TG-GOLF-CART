import { useState, useRef, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiX, FiUser, FiMail, FiPhone, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { format, isValid } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../lib/api';

const steps = ['Dates', 'Your Info', 'Confirm'];

function safeFormat(date, fmt) {
  if (!date || !isValid(new Date(date))) return '';
  return format(new Date(date), fmt);
}

export default function BookingModal({ cart, onClose }) {
  const [step, setStep] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [form, setForm] = useState({ guestName: '', guestEmail: '', guestPhone: '', notes: '' });
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  // Track the latest request so stale responses from rapid clicking are discarded
  const reqId = useRef(0);

  const handleDateChange = useCallback(async (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    // Clear stale pricing whenever the selection changes
    setPricing(null);

    if (!start || !end) return;

    const thisReq = ++reqId.current;
    setPricingLoading(true);
    try {
      const { data } = await api.post('/bookings/calculate', {
        cartId: cart.id,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      // Only apply if this is still the latest request
      if (thisReq === reqId.current) {
        setPricing(data);
      }
    } catch {
      if (thisReq === reqId.current) {
        toast.error('Could not calculate price. Please try again.');
      }
    } finally {
      if (thisReq === reqId.current) {
        setPricingLoading(false);
      }
    }
  }, [cart.id]);

  const handleSubmit = async () => {
    if (!form.guestName || !form.guestEmail || !form.guestPhone) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Please select dates');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/bookings', {
        cartId: cart.id,
        guestName: form.guestName,
        guestEmail: form.guestEmail,
        guestPhone: form.guestPhone,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        notes: form.notes,
      });
      setBooking(data);
      setStep(3);
      toast.success("Booking confirmed! We'll contact you shortly.");
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canContinueFromDates = startDate && endDate && pricing && !pricingLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-brand-green text-white p-6">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <FiX size={20} />
          </button>
          <div className="text-sm opacity-80 mb-1">Booking</div>
          <h2 className="text-xl font-bold">{cart.name}</h2>
          {step < 3 && (
            <div className="flex gap-2 mt-4">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i <= step ? 'bg-white text-brand-green' : 'bg-white/30 text-white'}`}>
                    {i + 1}
                  </div>
                  <span className={`text-xs ${i <= step ? 'text-white' : 'text-white/60'}`}>{s}</span>
                  {i < steps.length - 1 && <div className={`w-8 h-px ${i < step ? 'bg-white' : 'bg-white/30'}`} />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Step 0: Dates */}
          {step === 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Select Your Dates</h3>
              <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                inline
                minDate={new Date()}
                monthsShown={1}
              />

              {/* Pricing summary — only shown when both dates are set */}
              {startDate && endDate && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl min-h-[72px] flex items-center">
                  {pricingLoading ? (
                    <div className="flex items-center gap-2 text-brand-green text-sm w-full justify-center">
                      <FiLoader size={16} className="animate-spin" /> Calculating price…
                    </div>
                  ) : pricing ? (
                    <div className="w-full">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{pricing.days} day{pricing.days !== 1 ? 's' : ''} · {pricing.durationType} rate</span>
                        <span className="font-semibold">${pricing.total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">30% Deposit Due Now</span>
                        <span className="font-bold text-brand-green">${pricing.deposit}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {safeFormat(startDate, 'MMM d')} – {safeFormat(endDate, 'MMM d, yyyy')}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              <button
                onClick={() => setStep(1)}
                disabled={!canContinueFromDates}
                className="w-full btn-primary mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pricingLoading ? 'Calculating…' : 'Continue'}
              </button>
            </div>
          )}

          {/* Step 1: Info */}
          {step === 1 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Your Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Full Name *</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3.5 text-gray-400" size={16} />
                    <input className="input pl-10" placeholder="John Smith" value={form.guestName}
                      onChange={e => setForm({...form, guestName: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="label">Email *</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-3.5 text-gray-400" size={16} />
                    <input className="input pl-10" type="email" placeholder="john@example.com" value={form.guestEmail}
                      onChange={e => setForm({...form, guestEmail: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="label">Phone *</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-3.5 text-gray-400" size={16} />
                    <input className="input pl-10" type="tel" placeholder="(305) 555-0000" value={form.guestPhone}
                      onChange={e => setForm({...form, guestPhone: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="label">Special Requests (optional)</label>
                  <textarea className="input resize-none h-20" placeholder="Any special requirements..." value={form.notes}
                    onChange={e => setForm({...form, notes: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1">Back</button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!form.guestName || !form.guestEmail || !form.guestPhone}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Review Booking
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Confirm */}
          {step === 2 && startDate && endDate && pricing && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Confirm Your Booking</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Cart</span>
                  <span className="font-medium">{cart.name}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Dates</span>
                  <span className="font-medium">{safeFormat(startDate, 'MMM d')} – {safeFormat(endDate, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">{pricing.days} day{pricing.days !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Guest</span>
                  <span className="font-medium">{form.guestName}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-500">Total Price</span>
                  <span className="font-bold text-brand-green">${pricing.total}</span>
                </div>
                <div className="flex justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-gray-600 font-medium">Deposit Due Now (30%)</span>
                  <span className="font-bold text-brand-green text-lg">${pricing.deposit}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                We'll confirm your booking within 1 hour. Balance is due upon pickup. Free cancellation up to 24 hours before start date.
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
                  {loading ? 'Processing…' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && booking && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle size={32} className="text-brand-green" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Received!</h3>
              <p className="text-gray-600 mb-4">
                We've received your booking for <strong>{cart.name}</strong>.<br />
                We'll confirm within 1 hour at <strong>{form.guestEmail}</strong>.
              </p>
              <div className="p-4 bg-gray-50 rounded-xl text-left text-sm space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500">Booking ID</span>
                  <span className="font-mono text-xs font-medium">{booking.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Deposit</span>
                  <span className="font-bold text-brand-green">${booking.deposit}</span>
                </div>
              </div>
              <button onClick={onClose} className="btn-primary w-full">Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
