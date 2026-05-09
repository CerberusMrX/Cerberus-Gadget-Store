/**
 * CERBERUS GADGET STORE - Express Server
 * File: backend-api/server.js
 */

const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const path     = require('path');
require('dotenv').config();

const { connectMongoDB } = require('./config/mongodb');
const errorHandler       = require('./middleware/errorHandler');

const app = express();

// ── Security middleware ───────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// ── General middleware ────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ── Static files (uploaded images) ───────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/products',  require('./routes/products'));
app.use('/api/categories',require('./routes/categories'));
app.use('/api/cart',      require('./routes/cart'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/payments',  require('./routes/payments'));
app.use('/api/reviews',   require('./routes/reviews'));
app.use('/api/wishlist',  require('./routes/wishlist'));
app.use('/api/seller',    require('./routes/seller'));
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/delivery',  require('./routes/delivery'));

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'Cerberus Gadget Store API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect MongoDB
    await connectMongoDB();
    console.log('✅ MongoDB connected');

    // Note: Oracle connection is established per-request (connection pool)
    // Oracle pool is initialized in config/database.js on first use
    const { initOraclePool } = require('./config/database');
    await initOraclePool();
    console.log('✅ Oracle DB pool initialized');

    app.listen(PORT, () => {
      console.log(`\n🐺 Cerberus Gadget Store API running on port ${PORT}`);
      console.log(`   URL: http://localhost:${PORT}/api`);
      console.log(`   Health: http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    console.error('   Check your Oracle and MongoDB connection settings in .env');
    process.exit(1);
  }
}

startServer();
