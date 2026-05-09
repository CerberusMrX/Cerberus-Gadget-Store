/**
 * CERBERUS GADGET STORE - Auth Controller
 * File: backend-api/controllers/authController.js
 */

const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { execute } = require('../config/database');
const { ActivityLog } = require('../config/mongodb');

// ── Generate Tokens ───────────────────────────────────────────
function generateTokens(payload) {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
  return { accessToken, refreshToken };
}

// ── POST /api/auth/register ───────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { email, password, role, first_name, last_name, phone, store_name } = req.body;

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Email, password and role are required' });
    }
    if (!['customer', 'seller'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be customer or seller' });
    }

    // Check email uniqueness
    const existing = await execute(
      'SELECT user_id FROM users WHERE LOWER(email) = LOWER(:email)',
      { email }
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Insert user
    const userResult = await execute(
      `INSERT INTO users(user_id, email, password_hash, role)
       VALUES(seq_user_id.NEXTVAL, :email, :password_hash, :role)
       RETURNING user_id INTO :user_id`,
      { email, password_hash, role, user_id: { dir: require('oracledb').BIND_OUT, type: require('oracledb').NUMBER } }
    );
    const user_id = userResult.outBinds.user_id[0];

    // Insert profile
    if (role === 'customer') {
      await execute(
        `INSERT INTO customers(customer_id, user_id, first_name, last_name, phone)
         VALUES(seq_customer_id.NEXTVAL, :user_id, :first_name, :last_name, :phone)`,
        { user_id, first_name: first_name || '', last_name: last_name || '', phone: phone || null }
      );
    } else if (role === 'seller') {
      await execute(
        `INSERT INTO sellers(seller_id, user_id, store_name)
         VALUES(seq_seller_id.NEXTVAL, :user_id, :store_name)`,
        { user_id, store_name: store_name || `${first_name}'s Store` }
      );
    }

    // Generate tokens
    const tokens = generateTokens({ user_id, email, role });

    // Log activity
    ActivityLog.create({ user_id, user_email: email, role, action: 'register',
      details: { method: 'email' }, ip: req.ip }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user_id, email, role, ...tokens }
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    // Find user
    const result = await execute(
      `SELECT u.user_id, u.email, u.password_hash, u.role, u.is_active,
              NVL(c.first_name, NVL(s.store_name, a.first_name)) AS display_name,
              c.customer_id, s.seller_id, a.admin_id
       FROM users u
       LEFT JOIN customers c ON c.user_id = u.user_id
       LEFT JOIN sellers   s ON s.user_id = u.user_id
       LEFT JOIN admins    a ON a.user_id = u.user_id
       WHERE LOWER(u.email) = LOWER(:email)`,
      { email }
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    if (!user.IS_ACTIVE) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const valid = await bcrypt.compare(password, user.PASSWORD_HASH);
    if (!valid) {
      // Log failed attempt
      ActivityLog.create({ user_email: email, role: 'unknown', action: 'login_failed',
        details: { reason: 'wrong_password' }, ip: req.ip }).catch(() => {});
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const payload = {
      user_id:     user.USER_ID,
      email:       user.EMAIL,
      role:        user.ROLE,
      display_name: user.DISPLAY_NAME,
      customer_id: user.CUSTOMER_ID,
      seller_id:   user.SELLER_ID,
      admin_id:    user.ADMIN_ID
    };

    const tokens = generateTokens(payload);

    ActivityLog.create({ user_id: user.USER_ID, user_email: email, role: user.ROLE,
      action: 'login', details: { method: 'jwt' }, ip: req.ip }).catch(() => {});

    res.json({
      success: true,
      message: 'Login successful',
      data: { ...payload, ...tokens }
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/refresh ────────────────────────────────────
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const { iat, exp, ...payload } = decoded;
    const tokens = generateTokens(payload);
    res.json({ success: true, data: tokens });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

// ── POST /api/auth/logout ─────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    if (req.user) {
      ActivityLog.create({ user_id: req.user.user_id, user_email: req.user.email,
        role: req.user.role, action: 'logout', details: {}, ip: req.ip }).catch(() => {});
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const result = await execute(
      `SELECT u.user_id, u.email, u.role, u.created_at,
              c.first_name, c.last_name, c.phone, c.address, c.city, c.customer_id,
              s.store_name, s.description AS store_desc, s.seller_id, s.is_verified,
              a.admin_id
       FROM users u
       LEFT JOIN customers c ON c.user_id = u.user_id
       LEFT JOIN sellers   s ON s.user_id = u.user_id
       LEFT JOIN admins    a ON a.user_id = u.user_id
       WHERE u.user_id = :user_id`,
      { user_id: req.user.user_id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/auth/profile ──────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { first_name, last_name, phone, address, city, store_name, description } = req.body;
    const { user_id, role } = req.user;

    if (role === 'customer') {
      await execute(
        `UPDATE customers SET first_name=:fn, last_name=:ln, phone=:ph, address=:addr, city=:city
         WHERE user_id=:uid`,
        { fn: first_name, ln: last_name, ph: phone, addr: address, city, uid: user_id }
      );
    } else if (role === 'seller') {
      await execute(
        `UPDATE sellers SET store_name=:sn, description=:desc WHERE user_id=:uid`,
        { sn: store_name, desc: description, uid: user_id }
      );
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
};
