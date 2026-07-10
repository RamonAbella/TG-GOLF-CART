import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import CartCard from '../components/CartCard';

const WHY_CARDS = [
  {
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c8d8c2" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
    title: 'Premium Fleet',
    desc: 'Our golf carts are clean, maintained, and ready to go. From 2-seaters to 6-person models — all equipped with lights, mirrors, and safety features.',
  },
  {
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c8d8c2" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
    title: 'Lithium Battery Experts',
    desc: 'Go twice the distance on a single charge. Our certified technicians handle lithium conversions for any golf cart brand — fast turnaround, lifetime support.',
  },
  {
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c8d8c2" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    title: 'Transparent Pricing',
    desc: 'No surprise fees. We price-match any local competitor. Daily, weekly, and monthly rates posted upfront — what you see is what you pay.',
  },
  {
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c8d8c2" strokeWidth="2"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
    title: 'Island Delivery',
    desc: 'We deliver to your door, hotel, or marina across Miami and Key Biscayne. Easy drop-off and pickup at no extra charge.',
  },
  {
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c8d8c2" strokeWidth="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/><path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>,
    title: '5-Star Service',
    desc: 'Hundreds of happy customers across Miami and Key Biscayne. Real reviews, real people — we stand behind every rental.',
  },
  {
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c8d8c2" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    title: 'Buy, Sell & Upgrade',
    desc: 'Browse our marketplace to find used carts at fair prices, or list your own. Our brokerage makes buying and selling simple, local, and safe.',
  },
];

const FAQS = [
  { q: 'How much does it cost to rent a golf cart?', a: 'Our daily rates start at $75 for a 2-seat cart and go up to $120 for a 6-seat model. Weekly and monthly rates offer significant savings. We price-match any local competitor — just show us their quote.' },
  { q: 'Do you deliver to my hotel or condo?', a: 'Yes! We deliver anywhere in Key Biscayne and surrounding Miami areas. Delivery is included in your rental — no extra charge. Just give us your address when you book.' },
  { q: 'What is a lithium battery conversion?', a: 'We replace your old heavy lead-acid batteries with lightweight LiFePO4 lithium batteries. You get 2x the range, 5x faster charging, no maintenance, and a lifespan of 10+ years. Works with all major cart brands.' },
  { q: 'Do I need a driver\'s license to rent a golf cart?', a: 'A valid driver\'s license is required for the primary renter. In Florida, golf carts may be operated on roads with speed limits of 35 mph or less. We\'ll walk you through all local rules when you pick up.' },
  { q: 'How does the buy/sell marketplace work?', a: 'Contact us to list your cart or browse current inventory. We verify all listings, help with pricing, and facilitate the transaction. There are no hidden brokerage fees — our commission is transparent and agreed upon upfront.' },
  { q: 'What areas do you serve?', a: 'Our home base is Key Biscayne and we serve the greater Miami area. Cart rentals are focused in Key Biscayne and Miami — more rental locations coming soon. Lithium conversions, battery sales, and marketplace services are available statewide across Florida.' },
];

function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#f5a623">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function Home() {
  const [carts, setCarts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [content, setContent] = useState({});
  const [openFaq, setOpenFaq] = useState(0);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', service: 'Cart Rental', message: '' });
  const [contactSent, setContactSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/carts?status=available').then(r => setCarts(r.data.slice(0, 3))).catch(() => {});
    api.get('/testimonials').then(r => setTestimonials(r.data.slice(0, 3))).catch(() => {});
    api.get('/offerings').then(r => setOfferings(r.data.slice(0, 3))).catch(() => {});
    api.get('/content').then(r => setContent(r.data)).catch(() => {});
  }, []);

  const c = (key, fallback = '') => content[key] || fallback;

  const serviceCards = offerings.length > 0 ? offerings.map((s, i) => ({
    img: i === 0 ? '/golf-cart-beach.png' : i === 1 ? '/lithium-conversion.png' : null,
    tag: s.type === 'battery_conversion' ? 'Conversions' : s.type === 'battery_sale' ? 'Battery Sales' : s.type === 'maintenance' ? 'Maintenance' : 'Marketplace',
    title: s.title,
    desc: s.shortDesc,
    price: s.price,
    link: `/services#${s.type}`,
  })) : [
    { img: '/golf-cart-beach.png', imgFit: 'cover', tag: 'Rentals', title: 'Short & Long-Term Rentals', desc: 'Book by the day, week, or month. All carts include delivery and 24/7 support. Perfect for tourists, locals, and seasonal residents.', price: 'From $75/day', link: '/rentals' },
    { img: '/lithium-conversion.png', imgFit: 'contain', imgBg: '#f0f2f0', tag: 'Conversions', title: 'Lithium Battery Conversions', desc: 'Upgrade your old lead-acid battery to a premium LiFePO4 lithium pack. Double your range, cut your charge time, and enjoy a 10-year lifespan.', price: 'From $1,200', link: '/services' },
    { img: null, tag: 'Marketplace', title: 'Buy & Sell Golf Carts', desc: 'Browse verified listings or list your cart for sale. Our local brokerage connects buyers and sellers across Florida — no middleman markup.', price: null, link: '/marketplace' },
  ];

  const reviewCards = testimonials.length > 0 ? testimonials : [
    { name: 'Maria G.', location: 'Coral Gables, FL', rating: 5, text: 'Rented a 4-seater for our family trip to Key Biscayne. Super easy booking, cart was spotless, and Ramon delivered it right to our condo. Will 100% use again!' },
    { name: 'James R.', location: 'Key Biscayne, FL', rating: 5, text: 'Had them convert my old Club Car to lithium. The difference is night and day — charges in 3 hours and lasts all day on the course. Best investment I\'ve made for my cart.' },
    { name: 'Laura M.', location: 'Miami Beach, FL', rating: 5, text: 'Bought a used cart through their marketplace. Fair price, no pressure, and they had it serviced before I picked it up. Great local business — highly recommend!' },
  ];

  return (
    <div style={{ fontFamily: 'Roboto, sans-serif', color: '#3d4a3a' }}>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: '#2d4229', padding: '72px 0 80px' }}>
        {/* Background image */}
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: "url('/hero-bg.png')", opacity: 0.18 }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(74,103,65,0.55) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 10% 80%, rgba(138,158,133,0.18) 0%, transparent 60%)' }}
        />
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 items-center">
          {/* Left: headline */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-[14px] py-[6px] text-[12px] font-medium uppercase tracking-[0.04em] mb-5" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)' }}>
              <span className="w-[7px] h-[7px] rounded-full inline-block" style={{ background: '#8a9e85' }} />
              Florida's Premier Golf Cart Provider
            </div>
            <h1 style={{ fontFamily: 'Roboto, sans-serif', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '20px' }}>
              {c('hero_headline', <>Golf Cart <span style={{ color: '#e8f0e4' }}>Rentals</span><br />in Key Biscayne</>)}
            </h1>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, maxWidth: '520px', marginBottom: '36px' }}>
              {c('hero_subtitle', 'Cruise the island your way. Daily, weekly, and monthly rentals available — plus lithium battery conversions, professional maintenance, and a buy/sell marketplace.')}
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Link
                to="/rentals"
                className="inline-block font-bold transition-all hover:-translate-y-0.5"
                style={{ background: '#fff', color: '#2d4229', borderRadius: '6px', padding: '14px 32px', fontSize: '15px', letterSpacing: '0.02em', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
              >
                Book a Cart Today
              </Link>
              <a
                href="tel:7863952805"
                className="flex items-center gap-2 transition-colors"
                style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', textDecoration: 'none' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                (786) 395-2805
              </a>
            </div>
          </div>

          {/* Right: Booking card */}
          <div className="bg-white rounded-2xl" style={{ boxShadow: '0 24px 60px rgba(0,0,0,0.25)', padding: '32px 28px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#2d4229', marginBottom: '6px', letterSpacing: '-0.01em' }}>Check Availability</h3>
            <p style={{ fontSize: '13px', color: '#8a9e85', marginBottom: '22px' }}>Free quote — no commitment</p>

            <div className="mb-4">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.07em] mb-1.5" style={{ color: '#2d4229' }}>Cart Type</label>
              <select className="w-full px-[14px] py-3 rounded-lg text-[14px] outline-none transition-all focus:ring-2 focus:ring-brand-green/20" style={{ border: '1.5px solid #dde8d8', color: '#3d4a3a' }}>
                <option>2-Seat Golf Cart</option>
                <option>4-Seat Golf Cart</option>
                <option>6-Seat Golf Cart</option>
                <option>Lifted / Custom Cart</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.07em] mb-1.5" style={{ color: '#2d4229' }}>Start Date</label>
                <input type="date" className="w-full px-[14px] py-3 rounded-lg text-[14px] outline-none focus:ring-2 focus:ring-brand-green/20" style={{ border: '1.5px solid #dde8d8', color: '#3d4a3a' }} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.07em] mb-1.5" style={{ color: '#2d4229' }}>End Date</label>
                <input type="date" className="w-full px-[14px] py-3 rounded-lg text-[14px] outline-none focus:ring-2 focus:ring-brand-green/20" style={{ border: '1.5px solid #dde8d8', color: '#3d4a3a' }} />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.07em] mb-1.5" style={{ color: '#2d4229' }}>Rental Duration</label>
              <select className="w-full px-[14px] py-3 rounded-lg text-[14px] outline-none focus:ring-2 focus:ring-brand-green/20" style={{ border: '1.5px solid #dde8d8', color: '#3d4a3a' }}>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.07em] mb-1.5" style={{ color: '#2d4229' }}>Your Name</label>
              <input type="text" placeholder="John Smith" className="w-full px-[14px] py-3 rounded-lg text-[14px] outline-none focus:ring-2 focus:ring-brand-green/20" style={{ border: '1.5px solid #dde8d8', color: '#3d4a3a' }} />
            </div>

            <div className="mb-4">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.07em] mb-1.5" style={{ color: '#2d4229' }}>Phone Number</label>
              <input type="tel" placeholder="(786) 000-0000" className="w-full px-[14px] py-3 rounded-lg text-[14px] outline-none focus:ring-2 focus:ring-brand-green/20" style={{ border: '1.5px solid #dde8d8', color: '#3d4a3a' }} />
            </div>

            <button
              onClick={() => navigate('/rentals')}
              className="w-full text-white font-bold text-[15px] rounded-lg py-[15px] mt-1.5 transition-all hover:-translate-y-0.5"
              style={{ background: '#4a6741', letterSpacing: '0.03em', boxShadow: '0 4px 16px rgba(74,103,65,0.3)' }}
            >
              Get My Free Quote
            </button>
            <p className="text-center text-[12px] mt-3" style={{ color: '#8a9e85' }}>
              We'll call you back within 30 minutes during business hours
            </p>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ──────────────────────────────────────────── */}
      <div style={{ background: '#4a6741', padding: '18px 0' }}>
        <div className="max-w-[1200px] mx-auto px-6 flex flex-wrap justify-around items-center gap-5">
          {[
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>, label: 'No hidden fees' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: 'Fully insured fleet' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: 'Delivery available' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, label: 'Beat any local quote' },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-2.5 text-white text-[14px] font-medium">
              <span className="opacity-90">{t.icon}</span>
              {t.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── WHY TG ─────────────────────────────────────────────── */}
      <section style={{ background: '#1a2118', padding: '80px 0' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: '#e8f0e4' }}>Why TG Golf Carts?</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '16px' }}>
            Florida's Most Trusted<br />Golf Cart Experts
          </h2>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: '600px' }}>
            We know Florida's roads, paths, and beaches. Our fleet is premium, our prices are fair, and our service is personal — whether you're in Key Biscayne or anywhere in Miami.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mt-14">
            {WHY_CARDS.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl p-8 transition-all hover:-translate-y-1"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center mb-5" style={{ background: 'rgba(138,158,133,0.2)' }}>
                  {card.icon}
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#fff', marginBottom: '10px', letterSpacing: '-0.01em' }}>{card.title}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────── */}
      <div style={{ background: '#e8f0e4', padding: '56px 0' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { number: c('stat_customers', '200+'), label: 'Happy Customers' },
              { number: c('stat_rating', '5★'), label: 'Average Rating' },
              { number: '3', label: 'Services Offered' },
              { number: '100%', label: 'Satisfaction Guarantee' },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 900, color: '#4a6741', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.number}</div>
                <div style={{ fontSize: '14px', color: '#2d4229', fontWeight: 500, marginTop: '8px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SERVICES ───────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '80px 0' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: '#4a6741' }}>Our Services</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#2d4229', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '16px' }}>
            Everything Golf Cart,<br />All In One Place
          </h2>
          <p style={{ fontSize: '17px', color: '#5a6b56', lineHeight: 1.7, maxWidth: '600px' }}>
            From short-term rentals to full lithium upgrades and brokerage sales — TG Golf Carts covers it all.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mt-14">
            {serviceCards.map((s) => (
              <Link
                key={s.title}
                to={s.link}
                className="block rounded-2xl overflow-hidden transition-all hover:-translate-y-1 group"
                style={{ border: '1.5px solid #dde8d8', textDecoration: 'none' }}
              >
                <div className="relative overflow-hidden" style={{ height: '200px', background: s.imgBg || '#e8f0e4' }}>
                  {s.img ? (
                    <img
                      src={s.img}
                      alt={s.title}
                      className="w-full h-full"
                      style={{ objectFit: s.imgFit || 'cover', objectPosition: 'center', padding: s.imgFit === 'contain' ? '12px' : '0' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#4a6741" strokeWidth="1.2" opacity="0.4"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </div>
                  )}
                  {s.imgFit !== 'contain' && (
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(45,66,41,0.55) 0%, transparent 60%)' }} />
                  )}
                </div>
                <div className="p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-2" style={{ color: '#4a6741' }}>{s.tag}</p>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#2d4229', marginBottom: '10px', letterSpacing: '-0.01em' }}>{s.title}</h3>
                  <p style={{ fontSize: '14px', color: '#5a6b56', lineHeight: 1.7, marginBottom: '20px' }}>{s.desc}</p>
                  {s.price && (
                    <span className="inline-block text-[13px] font-semibold px-[22px] py-[10px] text-white rounded-md" style={{ background: '#4a6741' }}>
                      {s.price}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLEET (live data) ───────────────────────────────────── */}
      {carts.length > 0 && (
        <section style={{ background: '#f7f9f6', padding: '80px 0' }}>
          <div className="max-w-[1200px] mx-auto px-6">
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: '#4a6741' }}>Available Now</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#2d4229', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '16px' }}>Our Fleet</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              {carts.map(cart => <CartCard key={cart.id} cart={cart} />)}
            </div>
            <div className="text-center mt-10">
              <Link to="/rentals" className="inline-block font-semibold text-[14px] px-8 py-3.5 rounded-lg text-white transition-all hover:opacity-90" style={{ background: '#4a6741' }}>
                View All Available Carts
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── REVIEWS ────────────────────────────────────────────── */}
      <section style={{ background: '#f7f9f6', padding: '80px 0' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: '#4a6741' }}>Customer Reviews</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#2d4229', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '16px' }}>What Our Customers Say</h2>
          <p style={{ fontSize: '17px', color: '#5a6b56', lineHeight: 1.7, maxWidth: '600px' }}>Real reviews from real customers across Florida.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
            {reviewCards.map((r, i) => (
              <div key={i} className="bg-white rounded-[14px] p-7" style={{ boxShadow: '0 2px 16px rgba(42,66,35,0.07)' }}>
                <div className="flex gap-1 mb-4">{[1,2,3,4,5].map(s => <StarIcon key={s} />)}</div>
                <p className="mb-5 italic" style={{ fontSize: '15px', color: '#3d4a3a', lineHeight: 1.7 }}>"{r.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center font-bold text-[16px] flex-shrink-0" style={{ background: '#e8f0e4', color: '#2d4229' }}>
                    {(r.name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-[14px]" style={{ color: '#2d4229' }}>{r.name}</div>
                    <div className="text-[12px]" style={{ color: '#8a9e85' }}>{r.location || r.service || 'Key Biscayne, FL'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '80px 0' }}>
        <div className="max-w-[1200px] mx-auto px-6 text-center mb-12">
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: '#4a6741' }}>FAQ</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#2d4229', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '16px' }}>Frequently Asked Questions</h2>
          <p style={{ fontSize: '17px', color: '#5a6b56', lineHeight: 1.7 }}>Everything you need to know before you book.</p>
        </div>
        <div className="max-w-[760px] mx-auto px-6">
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1.5px solid #dde8d8' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                className="w-full flex justify-between items-center gap-4 py-[22px] text-left transition-colors font-semibold text-[16px]"
                style={{ color: openFaq === i ? '#4a6741' : '#2d4229', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {faq.q}
                <span
                  className="flex-shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center transition-all"
                  style={{
                    border: `1.5px solid ${openFaq === i ? '#4a6741' : '#8a9e85'}`,
                    background: openFaq === i ? '#4a6741' : 'transparent',
                    transform: openFaq === i ? 'rotate(180deg)' : 'none',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={openFaq === i ? 'white' : '#4a6741'} strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </button>
              {openFaq === i && (
                <p className="pb-5" style={{ fontSize: '15px', color: '#5a6b56', lineHeight: 1.75 }}>{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden text-center" style={{ background: '#4a6741', padding: '80px 0' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 100% at 50% 120%, rgba(45,66,41,0.45) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-[1200px] mx-auto px-6">
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: '16px' }}>
            Ready to Ride in Florida?
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', marginBottom: '36px', maxWidth: '560px', margin: '0 auto 36px', lineHeight: 1.6 }}>
            Book your golf cart today or call us for a free quote. Same-day bookings available — we're here to help.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/rentals"
              className="font-bold text-[15px] rounded-lg transition-all hover:-translate-y-0.5"
              style={{ background: '#fff', color: '#2d4229', padding: '15px 36px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', textDecoration: 'none', display: 'inline-block' }}
            >
              Book a Cart Now
            </Link>
            <a
              href="tel:7863952805"
              className="font-bold text-[15px] text-white rounded-lg transition-all hover:-translate-y-0.5 hover:bg-white/10"
              style={{ border: '2px solid rgba(255,255,255,0.7)', padding: '14px 34px', textDecoration: 'none', display: 'inline-block' }}
            >
              (786) 395-2805
            </a>
          </div>
        </div>
      </section>

      {/* ── CONTACT ────────────────────────────────────────────── */}
      <section id="contact" style={{ background: '#f7f9f6', padding: '80px 0' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: '#4a6741' }}>Get In Touch</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#2d4229', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '48px' }}>Contact Us</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            {/* Info */}
            <div>
              {[
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a6741" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>, label: 'Phone', value: <a href="tel:7863952805" style={{ color: '#2d4229', textDecoration: 'none' }}>(786) 395-2805</a> },
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a6741" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label: 'Email', value: <a href="mailto:tgolfcarts@gmail.com" style={{ color: '#2d4229', textDecoration: 'none' }}>tgolfcarts@gmail.com</a> },
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a6741" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>, label: 'Location', value: 'Miami, Key Biscayne, FL' },
                { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a6741" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: 'Hours', value: <span>Mon–Sat: 8am – 7pm<br /><span style={{ fontSize: '14px', color: '#8a9e85' }}>Sun: 9am – 5pm</span></span> },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3.5 mb-6">
                  <div className="w-[44px] h-[44px] rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: '#e8f0e4' }}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.07em] mb-1" style={{ color: '#8a9e85' }}>{item.label}</div>
                    <div className="font-semibold text-[16px]" style={{ color: '#2d4229' }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl" style={{ padding: '36px', boxShadow: '0 4px 24px rgba(42,66,35,0.08)' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#2d4229', marginBottom: '24px' }}>Send Us a Message</h3>
              {contactSent ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#e8f0e4' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4a6741" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="font-semibold text-lg" style={{ color: '#2d4229' }}>Message sent!</p>
                  <p className="text-[14px] mt-2" style={{ color: '#5a6b56' }}>We'll call you back within 30 minutes during business hours.</p>
                </div>
              ) : (
                <div>
                  {[
                    { label: 'Full Name', type: 'text', key: 'name', placeholder: 'Your name' },
                    { label: 'Phone Number', type: 'tel', key: 'phone', placeholder: '(786) 000-0000' },
                    { label: 'Email', type: 'email', key: 'email', placeholder: 'your@email.com' },
                  ].map((f) => (
                    <div key={f.key} className="mb-4">
                      <label className="block text-[11px] font-semibold uppercase tracking-[0.07em] mb-1.5" style={{ color: '#2d4229' }}>{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={contactForm[f.key]}
                        onChange={e => setContactForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full px-[14px] py-3 rounded-lg text-[14px] outline-none focus:ring-2 focus:ring-brand-green/20"
                        style={{ border: '1.5px solid #dde8d8', color: '#3d4a3a' }}
                      />
                    </div>
                  ))}
                  <div className="mb-4">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.07em] mb-1.5" style={{ color: '#2d4229' }}>Service Needed</label>
                    <select
                      value={contactForm.service}
                      onChange={e => setContactForm(p => ({ ...p, service: e.target.value }))}
                      className="w-full px-[14px] py-3 rounded-lg text-[14px] outline-none focus:ring-2 focus:ring-brand-green/20"
                      style={{ border: '1.5px solid #dde8d8', color: '#3d4a3a' }}
                    >
                      <option>Cart Rental</option>
                      <option>Lithium Battery Conversion</option>
                      <option>Cart Purchase</option>
                      <option>Cart Sale / Listing</option>
                      <option>General Inquiry</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.07em] mb-1.5" style={{ color: '#2d4229' }}>Message</label>
                    <textarea
                      rows={4}
                      placeholder="Tell us what you need..."
                      value={contactForm.message}
                      onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                      className="w-full px-[14px] py-3 rounded-lg text-[14px] outline-none focus:ring-2 focus:ring-brand-green/20 resize-y"
                      style={{ border: '1.5px solid #dde8d8', color: '#3d4a3a', fontFamily: 'inherit' }}
                    />
                  </div>
                  <button
                    onClick={() => setContactSent(true)}
                    className="w-full text-white font-bold text-[15px] rounded-lg py-[15px] transition-all hover:-translate-y-0.5"
                    style={{ background: '#4a6741', letterSpacing: '0.03em', boxShadow: '0 4px 16px rgba(74,103,65,0.3)' }}
                  >
                    Send Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
