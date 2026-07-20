import { useState, useEffect } from 'react';
import { FiZap, FiShoppingBag, FiTool, FiSettings, FiCheck, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';
import SEO from '../components/SEO';

const ALLOWED_TYPES = ['battery_conversion', 'battery_sale'];

const iconMap = {
  battery_conversion: <FiZap size={32} />,
  battery_sale: <FiShoppingBag size={32} />,
  installation: <FiSettings size={32} />,
  maintenance: <FiTool size={32} />,
};
const colorMap = {
  battery_conversion: { card: 'bg-blue-50 border-blue-200', icon: 'bg-blue-100 text-blue-600' },
  battery_sale: { card: 'bg-yellow-50 border-yellow-200', icon: 'bg-yellow-100 text-yellow-600' },
  installation: { card: 'bg-green-50 border-green-200', icon: 'bg-green-100 text-green-600' },
  maintenance: { card: 'bg-purple-50 border-purple-200', icon: 'bg-purple-100 text-purple-600' },
};

const emptyForm = {
  type: 'battery_conversion', customerName: '', customerEmail: '',
  customerPhone: '', cartMake: '', cartModel: '', cartYear: '', description: '',
};

export default function Services() {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get('/offerings').then(r => {
      const filtered = r.data.filter(s => ALLOWED_TYPES.includes(s.type));
      setServiceTypes(filtered);
      if (filtered.length > 0) setForm(f => ({ ...f, type: filtered[0].type }));
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.customerEmail || !form.customerPhone || !form.description) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/services', form);
      setSubmitted(true);
      toast.success("Service request submitted! We'll contact you within 24 hours.");
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit request');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Lithium Battery Conversions & Golf Cart Services"
        description="Professional lithium battery conversions, battery sales, installation, and maintenance for golf carts in Key Biscayne and Miami."
        path="/services"
      />
      <div className="bg-brand-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-green-300 text-sm font-medium mb-2">Expert Service</div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Golf Cart Services</h1>
          <p className="text-green-100 max-w-xl">
            Lithium battery conversions and premium battery sales — our certified technicians upgrade your cart with cutting-edge technology at the best prices in Florida.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {serviceTypes.map(service => {
            const colors = colorMap[service.type] || { card: 'bg-gray-50 border-gray-200', icon: 'bg-gray-100 text-gray-600' };
            return (
              <div key={service.type} id={service.type} className={`card overflow-hidden border-2 ${colors.card} scroll-mt-24`}>
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full block"
                    style={{ display: 'block' }}
                  />
                ) : (
                  <div className="flex items-start gap-4 px-6 pt-6 mb-0">
                    <div className={`${colors.icon} w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      {iconMap[service.type] || <FiTool size={32} />}
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">{service.title}</h2>
                      {service.isPopular && <span className="badge bg-brand-sage text-brand-green text-xs">Most Popular</span>}
                    </div>
                    <div className="text-brand-green font-bold">{service.price}</div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  <ul className="grid grid-cols-1 gap-2">
                    {(service.benefits || []).map(b => (
                      <li key={b} className="flex items-center gap-2 text-sm text-gray-600">
                        <FiCheck size={14} className="text-brand-green flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      setForm(f => ({ ...f, type: service.type }));
                      document.getElementById('request-form').scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="mt-5 btn-primary w-full flex items-center justify-center gap-2"
                  >
                    Request {service.title.split(' ').slice(0, 2).join(' ')} <FiArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div id="request-form" className="max-w-2xl mx-auto scroll-mt-24">
          <div className="card p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiCheck size={28} className="text-brand-green" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
                <p className="text-gray-500 mb-6">We'll contact you within 24 hours to schedule your service and provide a detailed quote.</p>
                <button onClick={() => { setSubmitted(false); setForm(emptyForm); }} className="btn-secondary">Submit Another Request</button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Request a Service</h2>
                <p className="text-gray-500 text-sm mb-6">Fill out the form and we'll provide a free quote within 24 hours.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label">Service Type *</label>
                    <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      {serviceTypes.map(s => <option key={s.type} value={s.type}>{s.title}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Your Name *</label>
                      <input className="input" placeholder="John Smith" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Phone *</label>
                      <input className="input" type="tel" placeholder="(305) 555-0000" value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input className="input" type="email" placeholder="john@example.com" value={form.customerEmail} onChange={e => setForm({ ...form, customerEmail: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="label">Cart Make</label><input className="input" placeholder="Club Car" value={form.cartMake} onChange={e => setForm({ ...form, cartMake: e.target.value })} /></div>
                    <div><label className="label">Model</label><input className="input" placeholder="Precedent" value={form.cartModel} onChange={e => setForm({ ...form, cartModel: e.target.value })} /></div>
                    <div><label className="label">Year</label><input className="input" type="number" placeholder="2020" value={form.cartYear} onChange={e => setForm({ ...form, cartYear: e.target.value })} /></div>
                  </div>
                  <div>
                    <label className="label">Description *</label>
                    <textarea className="input resize-none h-28" placeholder="Describe what service you need or any issues with your cart..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-50">
                    {submitting ? 'Submitting...' : 'Submit Service Request — Free Quote'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
