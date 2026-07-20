import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Rentals from './pages/Rentals';
import Services from './pages/Services';
import Marketplace from './pages/Marketplace';
import ListCart from './pages/ListCart';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminInventory from './pages/admin/Inventory';
import AdminBookings from './pages/admin/Bookings';
import AdminServices from './pages/admin/Services';
import AdminMarketplace from './pages/admin/Marketplace';
import AdminServicesManage from './pages/admin/ServicesManage';
import AdminSiteContent from './pages/admin/SiteContent';
import AdminLeads from './pages/admin/Leads';
import AdminCRMCustomers from './pages/admin/CRMCustomers';
import AdminInvoices from './pages/admin/Invoices';
import InvoiceBuilder from './pages/admin/InvoiceBuilder';
import AdminExpenses from './pages/admin/Expenses';
import AdminAnalytics from './pages/admin/Analytics';
import AdminEmails from './pages/admin/Emails';
import AdminTools from './pages/admin/AdminTools';
import useAuthStore from './store/authStore';
import SEO from './components/SEO';

function AdminRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  if (!hasHydrated) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/tg-admin-login?redirect=/admin" replace />;
  return (
    <>
      <SEO title="Admin" path="/admin" noindex />
      {children}
    </>
  );
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: '10px', fontFamily: 'Inter' } }} />
      <Routes>
        <Route path="/" element={<AppLayout><Home /></AppLayout>} />
        <Route path="/rentals" element={<AppLayout><Rentals /></AppLayout>} />
        <Route path="/services" element={<AppLayout><Services /></AppLayout>} />
        <Route path="/marketplace" element={<AppLayout><Marketplace /></AppLayout>} />
        <Route path="/sell" element={<AppLayout><ListCart /></AppLayout>} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/tg-admin-login" element={<AppLayout><Login /></AppLayout>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/inventory" element={<AdminRoute><AdminInventory /></AdminRoute>} />
        <Route path="/admin/bookings" element={<AdminRoute><AdminBookings /></AdminRoute>} />
        <Route path="/admin/services" element={<AdminRoute><AdminServices /></AdminRoute>} />
        <Route path="/admin/marketplace" element={<AdminRoute><AdminMarketplace /></AdminRoute>} />
        <Route path="/admin/services-manage" element={<AdminRoute><AdminServicesManage /></AdminRoute>} />
        <Route path="/admin/site-content" element={<AdminRoute><AdminSiteContent /></AdminRoute>} />
        <Route path="/admin/leads" element={<AdminRoute><AdminLeads /></AdminRoute>} />
        <Route path="/admin/customers" element={<AdminRoute><AdminCRMCustomers /></AdminRoute>} />
        <Route path="/admin/invoices" element={<AdminRoute><AdminInvoices /></AdminRoute>} />
        <Route path="/admin/invoices/new" element={<AdminRoute><InvoiceBuilder /></AdminRoute>} />
        <Route path="/admin/invoices/:id" element={<AdminRoute><InvoiceBuilder /></AdminRoute>} />
        <Route path="/admin/expenses" element={<AdminRoute><AdminExpenses /></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
        <Route path="/admin/emails" element={<AdminRoute><AdminEmails /></AdminRoute>} />
        <Route path="/admin/tools" element={<AdminRoute><AdminTools /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
