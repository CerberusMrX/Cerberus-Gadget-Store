/**
 * CERBERUS GADGET STORE - MongoDB Seed Script
 * File: mongodb/seed.js
 * Run: node seed.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '../backend-api/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cerberus_gadgets';

// ── Schemas ──────────────────────────────────────────────────
const activityLogSchema = new mongoose.Schema({
  user_id:    { type: Number, index: true },
  user_email: String,
  role:       String,
  action:     { type: String, index: true },  // login, logout, cart_add, etc.
  details:    mongoose.Schema.Types.Mixed,
  ip:         String,
  user_agent: String,
  timestamp:  { type: Date, default: Date.now, index: true }
});

const productViewSchema = new mongoose.Schema({
  product_id:   { type: Number, index: true },
  product_name: String,
  user_id:      Number,
  session_id:   String,
  timestamp:    { type: Date, default: Date.now, index: true },
  source:       String   // search, browse, recommendation
});

const searchSchema = new mongoose.Schema({
  user_id:       Number,
  session_id:    String,
  query:         { type: String, index: true },
  filters:       mongoose.Schema.Types.Mixed,
  results_count: Number,
  clicked_product_id: Number,
  timestamp:     { type: Date, default: Date.now, index: true }
});

const paymentAttemptSchema = new mongoose.Schema({
  order_id:       { type: Number, index: true },
  user_id:        Number,
  amount:         Number,
  method:         String,
  status:         { type: String, index: true },  // success, failed, pending
  transaction_ref: String,
  error_message:  String,
  ip:             String,
  timestamp:      { type: Date, default: Date.now, index: true }
});

const deliveryEventSchema = new mongoose.Schema({
  order_id:       { type: Number, index: true },
  delivery_id:    Number,
  tracking_no:    String,
  event_type:     String,  // status_change, location_update
  status:         String,
  location:       String,
  notes:          String,
  timestamp:      { type: Date, default: Date.now, index: true }
});

// ── Models ───────────────────────────────────────────────────
const ActivityLog      = mongoose.model('ActivityLog',     activityLogSchema);
const ProductView      = mongoose.model('ProductView',     productViewSchema);
const Search           = mongoose.model('Search',          searchSchema);
const PaymentAttempt   = mongoose.model('PaymentAttempt',  paymentAttemptSchema);
const DeliveryEvent    = mongoose.model('DeliveryEvent',   deliveryEventSchema);

// ── Seed Data ────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing
  await Promise.all([
    ActivityLog.deleteMany({}),
    ProductView.deleteMany({}),
    Search.deleteMany({}),
    PaymentAttempt.deleteMany({}),
    DeliveryEvent.deleteMany({})
  ]);
  console.log('🗑  Cleared existing data');

  // Activity Logs
  await ActivityLog.insertMany([
    { user_id: 3, user_email: 'customer@cerberusgadgets.com', role: 'customer',
      action: 'login', details: { method: 'jwt' }, ip: '192.168.1.1',
      timestamp: new Date(Date.now() - 86400000) },
    { user_id: 3, user_email: 'customer@cerberusgadgets.com', role: 'customer',
      action: 'cart_add', details: { product_id: 1, quantity: 1 }, ip: '192.168.1.1',
      timestamp: new Date(Date.now() - 82800000) },
    { user_id: 3, user_email: 'customer@cerberusgadgets.com', role: 'customer',
      action: 'checkout', details: { order_id: 1000, amount: 1234.05 }, ip: '192.168.1.1',
      timestamp: new Date(Date.now() - 79200000) },
    { user_id: 1, user_email: 'admin@cerberusgadgets.com', role: 'admin',
      action: 'login', details: { method: 'jwt' }, ip: '10.0.0.1',
      timestamp: new Date(Date.now() - 3600000) },
    { user_id: 2, user_email: 'techseller@cerberusgadgets.com', role: 'seller',
      action: 'product_add', details: { product_id: 5, name: 'Apple Watch Ultra 2' }, ip: '10.0.0.5',
      timestamp: new Date(Date.now() - 7200000) },
    { user_id: 3, user_email: 'customer@cerberusgadgets.com', role: 'customer',
      action: 'logout', details: {}, ip: '192.168.1.1',
      timestamp: new Date(Date.now() - 3000000) }
  ]);

  // Product Views
  const productNames = {
    1: 'iPhone 16 Pro', 2: 'Samsung Galaxy S25 Ultra', 3: 'MacBook Pro M4',
    4: 'Dell XPS 15', 5: 'Apple Watch Ultra 2', 7: 'Apple AirPods Pro 2',
    9: 'PlayStation 5 Slim', 11: 'Canon EOS R6 Mark II'
  };
  const viewsData = [];
  for (let i = 0; i < 50; i++) {
    const productIds = [1,2,3,4,5,7,9,11];
    const pid = productIds[Math.floor(Math.random() * productIds.length)];
    viewsData.push({
      product_id: pid,
      product_name: productNames[pid],
      user_id: Math.random() > 0.3 ? 3 : null,
      session_id: `sess_${Math.random().toString(36).substr(2,9)}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 86400000),
      source: ['search','browse','recommendation'][Math.floor(Math.random()*3)]
    });
  }
  await ProductView.insertMany(viewsData);

  // Searches
  const queries = ['iphone', 'laptop gaming', 'airpods', 'smartwatch', 'sony headphones',
                   'macbook', 'ps5', 'camera', 'razer mouse', '4k monitor'];
  const searchData = queries.map((q, i) => ({
    user_id: i % 2 === 0 ? 3 : null,
    session_id: `sess_${i}`,
    query: q,
    filters: { min_price: 0, max_price: 2000 },
    results_count: Math.floor(Math.random() * 10) + 1,
    timestamp: new Date(Date.now() - Math.random() * 7 * 86400000)
  }));
  await Search.insertMany(searchData);

  // Payment Attempts
  await PaymentAttempt.insertMany([
    { order_id: 1000, user_id: 3, amount: 1234.05, method: 'card',
      status: 'success', transaction_ref: 'TXN-ABC123', ip: '192.168.1.1',
      timestamp: new Date(Date.now() - 79200000) },
    { order_id: 1001, user_id: 3, amount: 499.00, method: 'card',
      status: 'failed', transaction_ref: 'TXN-XYZ456',
      error_message: 'Card declined - insufficient funds', ip: '192.168.1.1',
      timestamp: new Date(Date.now() - 43200000) },
    { order_id: 1001, user_id: 3, amount: 499.00, method: 'paypal',
      status: 'success', transaction_ref: 'PP-GHI789', ip: '192.168.1.1',
      timestamp: new Date(Date.now() - 43100000) }
  ]);

  // Delivery Events
  await DeliveryEvent.insertMany([
    { order_id: 1000, tracking_no: 'CGS-1000-20260501', event_type: 'status_change',
      status: 'picked_up', location: 'Cerberus Warehouse, Colombo',
      notes: 'Package picked up by carrier', timestamp: new Date(Date.now() - 86400000) },
    { order_id: 1000, tracking_no: 'CGS-1000-20260501', event_type: 'location_update',
      status: 'in_transit', location: 'Sorting Facility, Kandy',
      notes: 'En route to destination', timestamp: new Date(Date.now() - 43200000) },
    { order_id: 1000, tracking_no: 'CGS-1000-20260501', event_type: 'status_change',
      status: 'delivered', location: 'Colombo 03',
      notes: 'Delivered to recipient', timestamp: new Date(Date.now() - 3600000) }
  ]);

  console.log('✅ MongoDB seed data inserted!');
  console.log('   - Activity logs: 6');
  console.log('   - Product views: 50');
  console.log('   - Searches: 10');
  console.log('   - Payment attempts: 3');
  console.log('   - Delivery events: 3');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
