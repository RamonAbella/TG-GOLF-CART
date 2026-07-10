import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiPhone, FiMail, FiMapPin, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import useAuthStore from '../store/authStore';

const navLinks = [
  { to: '/rentals', label: 'Rentals' },
  { to: '/services', label: 'Services' },
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/sell', label: 'Sell a Cart' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <div className="sticky top-0 z-50">
      {/* Top Bar */}
      <div style={{ background: '#2d4229' }} className="py-2">
        <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center flex-wrap gap-1.5 text-[13px] text-white/85">
          <div className="flex gap-5 flex-wrap">
            <a href="tel:7863952805" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <FiPhone size={13} className="opacity-75" /> (786) 395-2805
            </a>
            <span className="flex items-center gap-1.5 text-white/70">
              <FiMapPin size={13} className="opacity-75" /> Miami, Key Biscayne, FL
            </span>
            <a href="mailto:tgolfcarts@gmail.com" className="hidden sm:flex items-center gap-1.5 hover:text-white transition-colors">
              <FiMail size={13} className="opacity-75" /> tgolfcarts@gmail.com
            </a>
          </div>
          <span className="font-semibold hidden md:inline" style={{ color: '#e8f0e4' }}>
            Now serving Miami &amp; Key Biscayne, FL!
          </span>
        </div>
      </div>

      {/* Main Nav */}
      <header className="bg-white" style={{ boxShadow: '0 2px 12px rgba(42,66,35,0.10)' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between" style={{ height: '80px' }}>
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="/tg-logo-cropped.png"
                alt="TG Golf Carts"
                style={{ height: '68px', width: 'auto', mixBlendMode: 'multiply' }}
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `text-[16px] font-bold tracking-wide transition-colors uppercase ${
                      isActive ? 'text-brand-green' : 'hover:text-brand-green'
                    }`
                  }
                  style={({ isActive }) => ({ color: isActive ? '#4a6741' : '#2d4229' })}
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 bg-brand-sage hover:bg-brand-sage/80 px-3 py-2 rounded-lg transition-colors"
                  >
                    <FiUser size={15} className="text-brand-green" />
                    <span className="text-sm font-medium text-brand-deep">{user.name.split(' ')[0]}</span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-card-hover border border-gray-100 overflow-hidden">
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-brand-sage text-brand-deep"
                        >
                          <FiSettings size={14} /> Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-red-50 text-red-600"
                      >
                        <FiLogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-[13px] font-medium transition-colors" style={{ color: '#8a9e85' }}>
                    Sign In
                  </Link>
                  <a
                    href="tel:7863952805"
                    className="flex items-center gap-2 text-white text-[14px] font-semibold rounded-md transition-all hover:opacity-90"
                    style={{
                      background: '#4a6741',
                      padding: '11px 26px',
                      letterSpacing: '0.03em',
                      boxShadow: '0 4px 14px rgba(74,103,65,0.28)',
                    }}
                  >
                    <FiPhone size={14} /> (786) 395-2805
                  </a>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-lg hover:bg-brand-sage transition-colors text-brand-deep"
            >
              {open ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-brand-sage text-brand-green' : 'text-brand-deep'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-gray-100">
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm font-medium text-brand-green">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)} className="block text-center text-white font-semibold py-3 rounded-lg text-sm" style={{ background: '#4a6741' }}>
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
