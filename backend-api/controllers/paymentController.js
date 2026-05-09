/**
 * CERBERUS GADGET STORE - Payment Controller
 * File: backend-api/controllers/paymentController.js
 */
const oracledb = require('oracledb');
const { execute } = require('../config/database');
const { PaymentAttempt, ActivityLog } = require('../config/mongodb');

// POST /api/payments
exports.processPayment = async (req, res, next) => {
  try {
    const { order_id, amount, method, card_number, card_holder } = req.body;
    if (!order_id || !amount || !method) {
      return res.status(400).json({ success: false, message: 'order_id, amount, method required' });
    }

    // Simulate payment gateway (in production, integrate Stripe/PayPal)
    const txn_ref = `CGS-${Date.now()}-${Math.random().toString(36).substr(2,6).toUpperCase()}`;
    const isSuccess = Math.random() > 0.1; // 90% success rate simulation

    if (!isSuccess) {
      // Log failed attempt to MongoDB
      await PaymentAttempt.create({
        order_id: parseInt(order_id), user_id: req.user.user_id,
        amount: parseFloat(amount), method, status: 'failed',
        transaction_ref: txn_ref, error_message: 'Card declined by bank',
        ip: req.ip
      });
      return res.status(402).json({ success: false, message: 'Payment declined. Please try again or use another method.' });
    }

    // Call PL/SQL Process_Payment
    const binds = {
      p_order_id:   parseInt(order_id),
      p_amount:     parseFloat(amount),
      p_method:     method,
      p_txn_ref:    txn_ref,
      p_payment_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_status:     { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 30 }
    };

    const result = await execute(
      `BEGIN Process_Payment(:p_order_id,:p_amount,:p_method,:p_txn_ref,:p_payment_id,:p_status); END;`,
      binds, { autoCommit: true }
    );

    const payment_id = result.outBinds.p_payment_id;
    const status     = result.outBinds.p_status;

    // Log to MongoDB
    await PaymentAttempt.create({
      order_id: parseInt(order_id), user_id: req.user.user_id,
      amount: parseFloat(amount), method, status: 'success',
      transaction_ref: txn_ref, ip: req.ip
    });

    ActivityLog.create({ user_id: req.user.user_id, user_email: req.user.email,
      role: req.user.role, action: 'payment_success',
      details: { order_id, payment_id, amount, method }, ip: req.ip }).catch(() => {});

    res.json({ success: true, message: 'Payment processed successfully',
      data: { payment_id, transaction_ref: txn_ref, status } });
  } catch (err) { next(err); }
};

// GET /api/payments/:orderId
exports.getPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const result = await execute(
      `SELECT * FROM payments WHERE order_id=:id`, { id: parseInt(orderId) }
    );
    if (result.rows.length === 0) return res.status(404).json({ success:false, message:'Payment not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};
