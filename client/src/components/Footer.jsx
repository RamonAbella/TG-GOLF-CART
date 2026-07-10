import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#1a2118', color: 'rgba(255,255,255,0.7)' }} className="pt-[60px] pb-8">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <a href="/" className="inline-flex items-center bg-white rounded-[10px] px-[18px] py-2 mb-4">
              <img
                src="/tg-logo-cropped.png"
                alt="TG Golf Carts"
                style={{ height: '44px', width: 'auto', mixBlendMode: 'multiply' }}
              />
            </a>
            <p className="text-[14px] leading-[1.75] mt-4 max-w-[280px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Florida's premier golf cart rental, lithium conversion, and marketplace. Serving Miami, Key Biscayne, and beyond.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[13px] font-semibold text-white uppercase tracking-[0.08em] mb-4">Services</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/rentals', label: 'Cart Rentals' },
                { to: '/services', label: 'Lithium Conversions' },
                { to: '/marketplace', label: 'Buy a Cart' },
                { to: '/sell', label: 'Sell a Cart' },
                { to: '/services', label: 'Maintenance' },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-[14px] transition-colors hover:text-brand-sage" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[13px] font-semibold text-white uppercase tracking-[0.08em] mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'About Us' },
                { to: '/#faq', label: 'FAQ' },
                { to: '/#contact', label: 'Contact' },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-[14px] transition-colors hover:text-brand-sage" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[13px] font-semibold text-white uppercase tracking-[0.08em] mb-4">Contact</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="tel:7863952805" className="text-[14px] transition-colors hover:text-brand-sage" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  (786) 395-2805
                </a>
              </li>
              <li>
                <a href="mailto:tgolfcarts@gmail.com" className="text-[14px] transition-colors hover:text-brand-sage" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  tgolfcarts@gmail.com
                </a>
              </li>
              <li className="text-[14px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Miami, Key Biscayne, FL</li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-[13px]" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>© {new Date().getFullYear()} TG Golf Carts. All rights reserved.</span>
          <span style={{ color: '#8a9e85' }}>Key Biscayne, Miami, FL</span>
        </div>
      </div>
    </footer>
  );
}
