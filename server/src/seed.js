require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const carts = [
  {
    name: 'Island Cruiser 4-Seater',
    model: 'Club Car Precedent',
    year: 2023,
    capacity: 4,
    type: 'electric',
    color: 'Pearl White',
    description: 'Perfect for exploring Key Biscayne! This fully electric 4-seater is quiet, smooth, and eco-friendly. Features upgraded lithium batteries for extended range.',
    features: JSON.stringify(['Lithium Battery Pack', 'USB Charging Ports', 'Bluetooth Speaker', 'Windshield', 'Street Legal', 'Cup Holders', 'LED Headlights']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      'https://images.unsplash.com/photo-1597770612047-04c59c20e94b?w=800',
    ]),
    dailyRate: 89,
    weeklyRate: 499,
    monthlyRate: 1499,
    status: 'available',
  },
  {
    name: 'Beach Patrol 6-Seater',
    model: 'Club Car Onward 6',
    year: 2023,
    capacity: 6,
    type: 'electric',
    color: 'Ocean Blue',
    description: 'Our most popular family cart! Seats 6 comfortably with rear-facing back seat. Ideal for groups, beach trips, and exploring the island.',
    features: JSON.stringify(['6-Passenger Capacity', 'Rear Flip Seat', 'Lithium Battery', 'Custom Wheels', 'Side Mirrors', 'Turn Signals', 'Horn', 'Storage Basket']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1541348263662-e068662d82af?w=800',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
    ]),
    dailyRate: 119,
    weeklyRate: 649,
    monthlyRate: 1899,
    status: 'available',
  },
  {
    name: 'Key Biscayne Classic',
    model: 'EZ-GO RXV',
    year: 2022,
    capacity: 2,
    type: 'electric',
    color: 'Tropical Green',
    description: 'The perfect getaway cart for couples or solo adventurers. Lightweight, nimble, and great for quick rides around the island.',
    features: JSON.stringify(['2-Passenger', 'Compact Design', 'USB Port', 'Rear Storage', 'Safety Belt', 'Cup Holders']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    ]),
    dailyRate: 65,
    weeklyRate: 369,
    monthlyRate: 999,
    status: 'available',
  },
  {
    name: 'Miami Sunrise Lifted',
    model: 'Club Car DS Lifted',
    year: 2023,
    capacity: 4,
    type: 'electric',
    color: 'Matte Black',
    description: 'Turn heads with this custom lifted cart! 4-inch lift kit, all-terrain tires, and premium finishes. The ultimate island statement.',
    features: JSON.stringify(['4-Inch Lift Kit', 'All-Terrain Tires', 'Custom LED Light Bar', 'Premium Sound System', 'Custom Rims', 'Tinted Windshield', 'Cooler Holder']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
    ]),
    dailyRate: 129,
    weeklyRate: 749,
    monthlyRate: 2199,
    status: 'available',
  },
  {
    name: 'Sunset Cruiser Deluxe',
    model: 'Yamaha Drive2',
    year: 2024,
    capacity: 4,
    type: 'lithium',
    color: 'Sunset Orange',
    description: 'Our newest addition! Yamaha Drive2 with freshly converted lithium battery pack. Longest range in our fleet — never worry about running out of charge.',
    features: JSON.stringify(['New Lithium Conversion', '100-Mile Range', 'Fast Charging', 'Premium Seats', 'Digital Display', 'USB-C Ports', 'Rear Camera']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800',
    ]),
    dailyRate: 109,
    weeklyRate: 599,
    monthlyRate: 1749,
    status: 'available',
  },
  {
    name: 'Golf Pro Special',
    model: 'Club Car Tempo',
    year: 2023,
    capacity: 2,
    type: 'electric',
    color: 'Classic White',
    description: 'Built for the course but perfect for the streets. Standard golf cart configuration with street-legal upgrades. Great for golfers visiting Key Biscayne.',
    features: JSON.stringify(['Golf Bag Holder', 'Scorecard Holder', 'Ball Washer', 'Street-Legal Kit', 'Canopy Top', 'Sand Bottle']),
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800',
    ]),
    dailyRate: 75,
    weeklyRate: 425,
    monthlyRate: 1199,
    status: 'available',
  },
];

const marketplaceListings = [
  {
    title: '2021 Club Car Precedent — Excellent Condition',
    make: 'Club Car',
    model: 'Precedent',
    year: 2021,
    condition: 'excellent',
    price: 8500,
    description: 'Well-maintained 2021 Club Car Precedent with new lithium battery installed 6 months ago. Has all street-legal equipment, custom rims, and premium sound system. Ready to go!',
    features: JSON.stringify(['New Lithium Battery', 'Custom Rims', 'Sound System', 'Street Legal', 'LED Lights', 'Windshield']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800']),
    location: 'Key Biscayne, FL',
    status: 'active',
    sellerName: 'Carlos M.',
    sellerEmail: 'carlos@example.com',
    sellerPhone: '305-555-0101',
  },
  {
    title: '2019 EZ-GO TXT — Needs Battery',
    make: 'EZ-GO',
    model: 'TXT',
    year: 2019,
    condition: 'good',
    price: 3200,
    description: 'Solid 2019 EZ-GO TXT with good body and frame. Battery pack needs replacement (we can quote you on a lithium conversion!). Great project cart or let us do the conversion for you.',
    features: JSON.stringify(['Good Body', 'New Tires', 'Canopy Top', 'Rear Seat']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1541348263662-e068662d82af?w=800']),
    location: 'Miami Beach, FL',
    status: 'active',
    sellerName: 'Sandra R.',
    sellerEmail: 'sandra@example.com',
    sellerPhone: '305-555-0202',
  },
  {
    title: '2022 Yamaha Drive2 — Lifted & Custom',
    make: 'Yamaha',
    model: 'Drive2',
    year: 2022,
    condition: 'excellent',
    price: 12500,
    description: 'Stunning custom Yamaha Drive2 with 4-inch lift, 10-inch wheels, custom wrapped body, and premium audio system. One of a kind. Moving sale.',
    features: JSON.stringify(['4" Lift Kit', '10" Custom Wheels', 'Premium Audio', 'Custom Wrap', 'Lithium Battery', 'LED Light Bar', 'Camera']),
    images: JSON.stringify(['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800']),
    location: 'Coral Gables, FL',
    status: 'active',
    sellerName: 'TG Golf Carts',
    sellerEmail: 'sales@tggolfcarts.com',
    sellerPhone: '305-555-0001',
  },
];

const testimonials = [
  { name: 'Maria G.', rating: 5, text: 'Absolutely loved renting from TG Golf Carts! The cart was spotless, ran perfectly, and the booking process was super easy. Will definitely rent again on our next visit to Key Biscayne.', service: 'rental' },
  { name: 'David K.', rating: 5, text: 'Had my 2019 Club Car converted to lithium by TG and the difference is night and day. No more waiting hours to charge — it\'s full in under 2 hours. Their team was professional and the price beat everyone else in Miami.', service: 'conversion' },
  { name: 'Jennifer & Tom W.', rating: 5, text: 'Rented the 6-seater for our family vacation and it was the highlight of the trip! The kids loved it. Much better than KB Green\'s prices and the carts are newer.', service: 'rental' },
  { name: 'Roberto A.', rating: 5, text: 'Bought a golf cart through their marketplace and the whole experience was great. They even helped arrange the lithium conversion after purchase. Highly recommend!', service: 'marketplace' },
  { name: 'Lisa P.', rating: 4, text: 'Great service and fair pricing. The monthly rental rate is very competitive. I\'ve been using their carts for my beach house trips all season.', service: 'rental' },
  { name: 'Marcus T.', rating: 5, text: 'TG Golf Carts is hands down the best in Miami. Their lithium conversion package saved me money vs. constantly replacing lead-acid batteries. The team really knows their stuff.', service: 'conversion' },
];

const serviceOfferings = [
  {
    type: 'battery_conversion',
    title: 'Lithium Battery Conversion',
    shortDesc: 'Upgrade your cart to a high-performance lithium battery pack.',
    description: 'Convert your golf cart from lead-acid to lithium iron phosphate (LiFePO4) batteries. Experience longer range, faster charging, and a battery that lasts 5–10x longer.',
    price: 'From $1,200',
    benefits: JSON.stringify([
      '3x longer range on a full charge',
      'Charges fully in 3–5 hours',
      'Battery life: 10+ years / 3,000+ cycles',
      'No maintenance required',
      '40% lighter than lead-acid',
      '5-year warranty on battery pack',
    ]),
    isPopular: true,
    orderIndex: 0,
  },
  {
    type: 'battery_sale',
    title: 'Battery Sales',
    shortDesc: 'Premium lithium and lead-acid batteries at competitive prices.',
    description: 'We carry a full inventory of golf cart batteries — lithium, AGM, and flooded lead-acid. Competitive pricing with professional advice to help you choose the right battery.',
    price: 'From $800',
    benefits: JSON.stringify([
      'Lithium (LiFePO4) packs: $800–$1,400',
      'AGM sealed batteries: $200–$400',
      'Flooded lead-acid: $100–$250',
      'All major brands in stock',
      'Bulk pricing available',
      'Free battery testing with purchase',
    ]),
    isPopular: false,
    orderIndex: 1,
  },
  {
    type: 'installation',
    title: 'Professional Installation',
    shortDesc: 'Certified technicians handle all installations.',
    description: 'Already have parts? Our certified technicians handle all installations — batteries, chargers, accessories, lift kits, sound systems, and more.',
    price: 'From $200',
    benefits: JSON.stringify([
      'Certified technicians',
      'Same-day installation available',
      'All parts installed correctly',
      'Post-install inspection included',
      'Work guarantee: 12 months',
      'Mobile service available (+$75)',
    ]),
    isPopular: false,
    orderIndex: 2,
  },
  {
    type: 'maintenance',
    title: 'Maintenance & Repair',
    shortDesc: 'Full-service maintenance to keep your cart running perfectly.',
    description: 'Full-service maintenance to keep your cart running perfectly. Annual tune-ups, brake service, tire rotation, controller diagnostics, and more.',
    price: 'From $150',
    benefits: JSON.stringify([
      'Annual maintenance packages',
      'Brake inspection & service',
      'Tire rotation & replacement',
      'Motor & controller diagnostics',
      'Wiring & electrical repairs',
      'Cosmetic body work',
    ]),
    isPopular: false,
    orderIndex: 3,
  },
];

const siteContentItems = [
  { key: 'hero_headline', value: 'Explore the Island Your Way', label: 'Hero Headline', section: 'homepage' },
  { key: 'hero_subtitle', value: "Key Biscayne's #1 golf cart rental company. Best rates in Miami, brand-new carts, and easy online booking.", label: 'Hero Subtitle', section: 'homepage' },
  { key: 'hero_image', value: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80', label: 'Hero Background Image URL', section: 'homepage' },
  { key: 'hero_cta', value: 'Rent a Cart', label: 'Hero Button Text', section: 'homepage' },
  { key: 'stat_customers', value: '500+', label: 'Stat: Customers', section: 'homepage' },
  { key: 'stat_carts', value: '6', label: 'Stat: Carts Available', section: 'homepage' },
  { key: 'stat_rating', value: '4.9★', label: 'Stat: Rating', section: 'homepage' },
  { key: 'pricing_daily_tg', value: '$65', label: 'Our Daily Rate (shown in comparison)', section: 'pricing' },
  { key: 'pricing_daily_competitor', value: '$89', label: 'Competitor Daily Rate', section: 'pricing' },
  { key: 'pricing_weekly_tg', value: '$369', label: 'Our Weekly Rate', section: 'pricing' },
  { key: 'pricing_weekly_competitor', value: '$499', label: 'Competitor Weekly Rate', section: 'pricing' },
  { key: 'pricing_monthly_tg', value: '$999', label: 'Our Monthly Rate', section: 'pricing' },
  { key: 'pricing_monthly_competitor', value: '$1,400', label: 'Competitor Monthly Rate', section: 'pricing' },
  { key: 'contact_phone', value: '786-395-2805', label: 'Phone Number', section: 'contact' },
  { key: 'contact_email', value: 'abellaramon1@gmail.com', label: 'Email Address', section: 'contact' },
  { key: 'contact_address', value: 'Key Biscayne, FL 33149', label: 'Address', section: 'contact' },
  { key: 'contact_hours', value: '7 days a week, 8am–8pm', label: 'Business Hours', section: 'contact' },
];

async function main() {
  console.log('🌴 Seeding TG Golf Carts database...');

  await prisma.booking.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.marketplaceListing.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.serviceOffering.deleteMany();
  await prisma.siteContent.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL || 'admin@tggolfcarts.com',
      password: adminPassword,
      name: 'TG Admin',
      role: 'admin',
    }
  });
  console.log(`✅ Admin created: ${admin.email}`);

  const testUserPw = await bcrypt.hash('customer123', 10);
  await prisma.user.create({
    data: { email: 'customer@example.com', password: testUserPw, name: 'Test Customer', phone: '305-555-1234' }
  });

  for (const cart of carts) {
    await prisma.cart.create({ data: cart });
  }
  console.log(`✅ ${carts.length} carts created`);

  for (const listing of marketplaceListings) {
    await prisma.marketplaceListing.create({ data: listing });
  }
  console.log(`✅ ${marketplaceListings.length} marketplace listings created`);

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }
  console.log(`✅ ${testimonials.length} testimonials created`);

  const allCarts = await prisma.cart.findMany({ take: 3 });
  const sampleBookings = [
    {
      cartId: allCarts[0].id,
      guestName: 'Sample Guest',
      guestEmail: 'guest@example.com',
      guestPhone: '305-555-9999',
      startDate: new Date('2025-07-10'),
      endDate: new Date('2025-07-17'),
      duration: 7,
      durationType: 'weekly',
      totalPrice: allCarts[0].weeklyRate,
      deposit: Math.round(allCarts[0].weeklyRate * 0.3 * 100) / 100,
      status: 'confirmed',
    },
    {
      cartId: allCarts[1].id,
      guestName: 'Another Guest',
      guestEmail: 'another@example.com',
      guestPhone: '305-555-8888',
      startDate: new Date('2025-07-20'),
      endDate: new Date('2025-07-23'),
      duration: 3,
      durationType: 'daily',
      totalPrice: allCarts[1].dailyRate * 3,
      deposit: Math.round(allCarts[1].dailyRate * 3 * 0.3 * 100) / 100,
      status: 'pending',
    },
  ];

  for (const booking of sampleBookings) {
    await prisma.booking.create({ data: booking });
  }
  console.log(`✅ ${sampleBookings.length} sample bookings created`);

  for (const offering of serviceOfferings) {
    await prisma.serviceOffering.create({ data: offering });
  }
  console.log(`✅ ${serviceOfferings.length} service offerings created`);

  for (const item of siteContentItems) {
    await prisma.siteContent.create({ data: item });
  }
  console.log(`✅ ${siteContentItems.length} site content items created`);

  console.log('\n🎉 Database seeded successfully!');
  console.log(`📧 Admin login: ${admin.email} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
