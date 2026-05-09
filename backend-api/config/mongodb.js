/**
 * CERBERUS GADGET STORE - MongoDB Config
 * File: backend-api/config/mongodb.js
 */

const mongoose = require('mongoose');

async function connectMongoDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI not set in .env');
  }
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
}

// ── Mongoose Models (defined here, used across controllers) ───

// Activity Log
const activityLogSchema = new mongoose.Schema({
  user_id:    { type: Number, index: true },
  user_email: String,
  role:       String,
  action:     { type: String, index: true },
  details:    mongoose.Schema.Types.Mixed,
  ip:         String,
  user_agent: String,
  timestamp:  { type: Date, default: Date.now, index: true }
}, { collection: 'activity_logs' });

// Product View
const productViewSchema = new mongoose.Schema({
  product_id:   { type: Number, index: true },
  product_name: String,
  user_id:      Number,
  session_id:   String,
  timestamp:    { type: Date, default: Date.now, index: true },
  source:       String
}, { collection: 'product_views' });

// Search
const searchSchema = new mongoose.Schema({
  user_id:       Number,
  session_id:    String,
  query:         { type: String, index: true },
  filters:       mongoose.Schema.Types.Mixed,
  results_count: Number,
  clicked_product_id: Number,
  timestamp:     { type: Date, default: Date.now, index: true }
}, { collection: 'searches' });

// Payment Attempt
const paymentAttemptSchema = new mongoose.Schema({
  order_id:        { type: Number, index: true },
  user_id:         Number,
  amount:          Number,
  method:          String,
  status:          { type: String, index: true },
  transaction_ref: String,
  error_message:   String,
  ip:              String,
  timestamp:       { type: Date, default: Date.now, index: true }
}, { collection: 'payment_attempts' });

// Delivery Event
const deliveryEventSchema = new mongoose.Schema({
  order_id:    { type: Number, index: true },
  delivery_id: Number,
  tracking_no: String,
  event_type:  String,
  status:      String,
  location:    String,
  notes:       String,
  timestamp:   { type: Date, default: Date.now, index: true }
}, { collection: 'delivery_events' });

const ActivityLog    = mongoose.model('ActivityLog',    activityLogSchema);
const ProductView    = mongoose.model('ProductView',    productViewSchema);
const Search         = mongoose.model('Search',         searchSchema);
const PaymentAttempt = mongoose.model('PaymentAttempt', paymentAttemptSchema);
const DeliveryEvent  = mongoose.model('DeliveryEvent',  deliveryEventSchema);

module.exports = {
  connectMongoDB,
  ActivityLog,
  ProductView,
  Search,
  PaymentAttempt,
  DeliveryEvent
};
