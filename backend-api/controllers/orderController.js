/**
 * CERBERUS GADGET STORE - Order Controller
 * File: backend-api/controllers/orderController.js
 */
const oracledb = require('oracledb');
const { execute, withTransaction } = require('../config/database');
const { ActivityLog, DeliveryEvent } = require('../config/mongodb');

// POST /api/orders - Place order
exports.placeOrder = async (req, res, next) => {
  try {
    const { shipping_address, shipping_city, notes } = req.body;
    const customer_id = req.user.customer_id;
    if (!shipping_address) return res.status(400).json({ success: false, message: 'Shipping address required' });

    // Call PL/SQL procedure Place_Order
    const binds = {
      p_customer_id:   customer_id,
      p_shipping_addr: shipping_address,
      p_shipping_city: shipping_city || '',
      p_notes:         notes || '',
      p_order_id:      { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      p_total:         { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    };

    const result = await execute(
      `BEGIN Place_Order(:p_customer_id,:p_shipping_addr,:p_shipping_city,:p_notes,:p_order_id,:p_total); END;`,
      binds, { autoCommit: true }
    );

    const order_id = result.outBinds.p_order_id;
    const total    = result.outBinds.p_total;

    ActivityLog.create({ user_id: req.user.user_id, user_email: req.user.email,
      role: 'customer', action: 'order_placed', details: { order_id, total }, ip: req.ip }).catch(() => {});

    res.status(201).json({ success: true, message: 'Order placed successfully', data: { order_id, total } });
  } catch (err) { next(err); }
};

// GET /api/orders - Customer order history
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page)-1) * parseInt(limit);
    const customer_id = req.user.customer_id;

    const result = await execute(
      `SELECT o.order_id, o.status, o.total_amount, o.shipping_address,
              o.shipping_city, o.created_at, o.updated_at,
              p.status AS payment_status, p.method AS payment_method,
              d.tracking_no, d.status AS delivery_status, d.estimated_date
       FROM orders   o
       LEFT JOIN payments   p ON p.order_id=o.order_id
       LEFT JOIN deliveries d ON d.order_id=o.order_id
       WHERE o.customer_id=:cid
       ORDER BY o.created_at DESC
       OFFSET :off ROWS FETCH NEXT :lim ROWS ONLY`,
      { cid: customer_id, off: offset, lim: parseInt(limit) }
    );

    const countRes = await execute(
      `SELECT COUNT(*) AS total FROM orders WHERE customer_id=:cid`, { cid: customer_id }
    );

    res.json({ success: true, data: result.rows,
      pagination: { total: countRes.rows[0].TOTAL, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) { next(err); }
};

// GET /api/orders/:id - Order detail
exports.getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const orderRes = await execute(
      `SELECT o.*, p.status AS payment_status, p.method, p.transaction_ref,
              d.tracking_no, d.carrier, d.status AS delivery_status,
              d.estimated_date, d.delivered_at
       FROM orders   o
       LEFT JOIN payments   p ON p.order_id=o.order_id
       LEFT JOIN deliveries d ON d.order_id=o.order_id
       WHERE o.order_id=:id`, { id: parseInt(id) }
    );
    if (orderRes.rows.length===0) return res.status(404).json({ success:false, message:'Order not found' });

    const order = orderRes.rows[0];
    // Verify access
    if (req.user.role==='customer' && order.CUSTOMER_ID !== req.user.customer_id) {
      return res.status(403).json({ success:false, message:'Access denied' });
    }

    const itemsRes = await execute(
      `SELECT oi.*, p.name, p.image_url, p.brand FROM order_items oi
       JOIN products p ON p.product_id=oi.product_id
       WHERE oi.order_id=:id`, { id: parseInt(id) }
    );
    order.ITEMS = itemsRes.rows;

    // Delivery events from MongoDB
    const events = await DeliveryEvent.find({ order_id: parseInt(id) }).sort({ timestamp: 1 }).lean();
    order.DELIVERY_EVENTS = events;

    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};

// PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    await execute(
      `BEGIN Cancel_Order(:oid, :reason); END;`,
      { oid: parseInt(id), reason: reason || 'Customer requested' },
      { autoCommit: true }
    );
    res.json({ success: true, message: 'Order cancelled and stock restored' });
  } catch (err) { next(err); }
};

// GET /api/orders (admin) - all orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page=1, limit=20, status } = req.query;
    const offset = (parseInt(page)-1)*parseInt(limit);
    let where = ''; let binds = { off: offset, lim: parseInt(limit) };
    if (status) { where = `WHERE o.status=:status`; binds.status = status; }

    const result = await execute(
      `SELECT o.order_id, o.status, o.total_amount, o.created_at,
              c.first_name||' '||c.last_name AS customer_name,
              p.status AS payment_status, d.status AS delivery_status
       FROM orders   o
       JOIN customers c ON c.customer_id=o.customer_id
       LEFT JOIN payments   p ON p.order_id=o.order_id
       LEFT JOIN deliveries d ON d.order_id=o.order_id
       ${where}
       ORDER BY o.created_at DESC
       OFFSET :off ROWS FETCH NEXT :lim ROWS ONLY`, binds
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};
