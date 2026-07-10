import { useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function ListCart() {
  const [form, setForm] = useState({
    title: '', make: '', model: '', year: '', condition: 'good', price: '',
    description: '', location: 'Key Biscayne, FL', features: '',
    sellerName: '', sellerEmail: '', sellerPhone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.make || !form.model || !form.year || !form.price || !form.sellerName || !form.sellerEmail || !form.sellerPhone) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/marketplace', {
        ...form,
        year: parseInt(form.year),
        price: parseFloat(form.price),
        features: form.features ? form.features.split(',').map(f => f.trim()).filter(Boolean) : [],
        images: [],
      });
      setSubmitted(true);
      toast.success('Listing submitted! We\'ll review and publish within 24 hours.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit listing');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-deep mb-2">List Your Golf Cart</h1>
          <p className="text-gray-500">Free listing. Reach buyers across Miami-Dade. We review within 24 hours.</p>
        </div>

        <div className="card p-8">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck size={28} className="text-brand-green" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Submitted!</h2>
              <p className="text-gray-500">We'll review your listing and publish it within 24 hours. You'll receive a confirmation email.</p>
              <button onClick={() => { setSubmitted(false); setForm({ title: '', make: '', model: '', year: '', condition: 'good', price: '', description: '', location: 'Key Biscayne, FL', features: '', sellerName: '', sellerEmail: '', sellerPhone: '' }); }} className="mt-6 btn-secondary">List Another Cart</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">Cart Details</h3>
              </div>
              <div>
                <label className="label">Listing Title *</label>
                <input className="input" placeholder="e.g. 2021 Club Car Precedent — Excellent Condition" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Make *</label>
                  <input className="input" placeholder="Club Car" value={form.make} onChange={e => setForm({ ...form, make: e.target.value })} />
                </div>
                <div>
                  <label className="label">Model *</label>
                  <input className="input" placeholder="Precedent" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
                </div>
                <div>
                  <label className="label">Year *</label>
                  <input className="input" type="number" placeholder="2021" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Condition *</label>
                  <select className="input" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor / Project</option>
                  </select>
                </div>
                <div>
                  <label className="label">Asking Price ($) *</label>
                  <input className="input" type="number" placeholder="5000" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input resize-none h-28" placeholder="Describe your cart — features, condition, any upgrades or issues..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="label">Features (comma-separated)</label>
                <input className="input" placeholder="Lithium Battery, Custom Rims, Sound System, Street Legal" value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} />
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input" placeholder="Key Biscayne, FL" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b mt-4">Seller Information</h3>
              </div>
              <div>
                <label className="label">Your Name *</label>
                <input className="input" placeholder="John Smith" value={form.sellerName} onChange={e => setForm({ ...form, sellerName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Email *</label>
                  <input className="input" type="email" placeholder="john@example.com" value={form.sellerEmail} onChange={e => setForm({ ...form, sellerEmail: e.target.value })} />
                </div>
                <div>
                  <label className="label">Phone *</label>
                  <input className="input" type="tel" placeholder="(305) 555-0000" value={form.sellerPhone} onChange={e => setForm({ ...form, sellerPhone: e.target.value })} />
                </div>
              </div>
              <p className="text-xs text-gray-400">Your contact info will be shown to interested buyers. Listings are reviewed before publishing.</p>
              <button type="submit" disabled={submitting} className="btn-primary w-full !py-4 disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Listing — Free'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
