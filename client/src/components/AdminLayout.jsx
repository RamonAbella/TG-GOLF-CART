import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FiGrid, FiList, FiCalendar, FiTool, FiShoppingCart, FiLogOut, FiArrowLeft, FiSettings, FiEdit, FiUsers, FiFileText, FiTrendingUp, FiDollarSign, FiUserCheck, FiMail, FiSliders } from 'react-icons/fi';
import useAuthStore from '../store/authStore';

const navItems = [
  { to: '/admin', icon: <FiGrid size={18} />, label: 'Dashboard', end: true },
  { to: '/admin/inventory', icon: <FiList size={18} />, label: 'Golf Carts' },
  { to: '/admin/bookings', icon: <FiCalendar size={18} />, label: 'Bookings' },
  { to: '/admin/services-manage', icon: <FiTool size={18} />, label: 'Services' },
  { to: '/admin/marketplace', icon: <FiShoppingCart size={18} />, label: 'Marketplace' },
  { to: '/admin/services', icon: <FiSettings size={18} />, label: 'Service Requests' },
];

const crmItems = [
  { to: '/admin/leads', icon: <FiUsers size={18} />, label: 'Leads' },
  { to: '/admin/customers', icon: <FiUserCheck size={18} />, label: 'Customers' },
  { to: '/admin/emails', icon: <FiMail size={18} />, label: 'Emails' },
];

const financeItems = [
  { to: '/admin/invoices', icon: <FiFileText size={18} />, label: 'Invoices' },
  { to: '/admin/expenses', icon: <FiDollarSign size={18} />, label: 'Expenses' },
  { to: '/admin/analytics', icon: <FiTrendingUp size={18} />, label: 'Analytics' },
  { to: '/admin/tools', icon: <FiSliders size={18} />, label: 'Admin Tools' },
];

const cmsItems = [
  { to: '/admin/site-content', icon: <FiEdit size={18} />, label: 'Site Content' },
];

export default function AdminLayout({ children, title }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-60 bg-brand-deep min-h-screen flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">TG</span>
            </div>
            <span className="text-white font-bold">Admin Panel</span>
          </div>
          <p className="text-xs text-gray-400">{user?.name}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <div className="text-xs text-gray-500 uppercase tracking-widest px-3 mb-2">Manage</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-green text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {item.icon} {item.label}
            </NavLink>
          ))}

          <div className="text-xs text-gray-500 uppercase tracking-widest px-3 mb-2 mt-6">CRM</div>
          {crmItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-green text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {item.icon} {item.label}
            </NavLink>
          ))}

          <div className="text-xs text-gray-500 uppercase tracking-widest px-3 mb-2 mt-6">Finance</div>
          {financeItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-green text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {item.icon} {item.label}
            </NavLink>
          ))}

          <div className="text-xs text-gray-500 uppercase tracking-widest px-3 mb-2 mt-6">Content & CMS</div>
          {cmsItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-green text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <FiArrowLeft size={18} /> Back to Site
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {title && <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>}
          {children}
        </div>
      </main>
    </div>
  );
}
