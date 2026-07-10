import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const { login, register, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'login') {
      const result = await login(form.email, form.password);
      if (result.success) {
        toast.success('Welcome back!');
        navigate(params.get('redirect') || '/');
      } else {
        toast.error(result.error);
      }
    } else {
      if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields');
      const result = await register(form.name, form.email, form.password, form.phone);
      if (result.success) {
        toast.success('Account created!');
        navigate('/');
      } else {
        toast.error(result.error);
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-green rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold">TG</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {mode === 'login' ? "Sign in to manage your bookings" : "Join to track your rentals and bookings"}
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="label">Full Name *</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-3.5 text-gray-400" size={16} />
                  <input className="input pl-10" placeholder="John Smith" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
              </div>
            )}
            <div>
              <label className="label">Email *</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3.5 text-gray-400" size={16} />
                <input className="input pl-10" type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3.5 text-gray-400" size={16} />
                <input className="input pl-10" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
            </div>
            {mode === 'register' && (
              <div>
                <label className="label">Phone (optional)</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-3.5 text-gray-400" size={16} />
                  <input className="input pl-10" type="tel" placeholder="(305) 555-0000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
            )}
            <button type="submit" disabled={isLoading} className="btn-primary w-full !py-3.5 disabled:opacity-50">
              {isLoading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-sm text-brand-green hover:underline"
            >
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
