/**
 * CERBERUS GADGET STORE - Admin Controller
 * File: backend-api/controllers/adminController.js
 */
const { execute } = require('../config/database');
const { ActivityLog } = require('../config/mongodb');

// GET /api/admin/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const [users, revenue, orders, products, failed] = await Promise.all([
      execute(`SELECT
        COUNT(*) AS total_users,
        SUM(CASE WHEN role='customer' THEN 1 ELSE 0 END) AS customers,
        SUM(CASE WHEN role='seller'   THEN 1 ELSE 0 END) AS sellers
        FROM users WHERE is_active=1`, {}),
      execute(`SELECT NVL(SUM(amount),0) AS total FROM payments WHERE status='completed'`, {}),
      execute(`SELECT COUNT(*) AS total,
        SUM(CASE WHEN status='pending'   THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END) AS delivered,
        SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) AS cancelled
        FROM orders`, {}),
      execute(`SELECT COUNT(*) AS total FROM products WHERE is_active=1`, {}),
      execute(`SELECT COUNT(*) AS total FROM payments WHERE status='failed'`, {})
    ]);

    // Revenue last 7 days (Oracle)
    const revenueChart = await execute(
      `SELECT TRUNC(paid_at) AS date_val, SUM(amount) AS revenue
       FROM payments WHERE status='completed'
       AND paid_at >= SYSDATE-7
       GROUP BY TRUNC(paid_at) ORDER BY date_val`, {}
    );

    // Top 5 products
    const topProducts = await execute(
      `SELECT * FROM vw_top_selling_products WHERE ROWNUM<=5`, {}
    );

    res.json({
      success:true,
      data:{
        stats:{
          total_users:   users.rows[0].TOTAL_USERS,
          customers:     users.rows[0].CUSTOMERS,
          sellers:       users.rows[0].SELLERS,
          total_revenue: revenue.rows[0].TOTAL,
          total_orders:  orders.rows[0].TOTAL,
          pending_orders:orders.rows[0].PENDING,
          total_products:products.rows[0].TOTAL,
          failed_payments:failed.rows[0].TOTAL
        },
        revenue_chart: revenueChart.rows,
        top_products:  topProducts.rows
      }
    });
  } catch(err){ next(err); }
};

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { page=1, limit=20, role } = req.query;
    const offset = (parseInt(page)-1)*parseInt(limit);
    let where = role ? `WHERE u.role=:role` : '';
    const binds = role ? {role,off:offset,lim:parseInt(limit)} : {off:offset,lim:parseInt(limit)};
    const result = await execute(
      `SELECT u.user_id,u.email,u.role,u.is_active,u.created_at,
              NVL(c.first_name||' '||c.last_name, s.store_name) AS display_name
       FROM users u
       LEFT JOIN customers c ON c.user_id=u.user_id
       LEFT JOIN sellers   s ON s.user_id=u.user_id
       ${where}
       ORDER BY u.created_at DESC OFFSET :off ROWS FETCH NEXT :lim ROWS ONLY`, binds
    );
    res.json({ success:true, data:result.rows });
  } catch(err){ next(err); }
};

// PUT /api/admin/users/:id/toggle
exports.toggleUser = async (req, res, next) => {
  try {
    await execute(
      `UPDATE users SET is_active=CASE WHEN is_active=1 THEN 0 ELSE 1 END WHERE user_id=:id`,
      { id:parseInt(req.params.id) }
    );
    res.json({ success:true, message:'User status toggled' });
  } catch(err){ next(err); }
};

// GET /api/admin/failed-payments
exports.getFailedPayments = async (req, res, next) => {
  try {
    const result = await execute(`SELECT * FROM vw_failed_payments FETCH FIRST 50 ROWS ONLY`, {});
    res.json({ success:true, data:result.rows });
  } catch(err){ next(err); }
};

// GET /api/admin/low-stock
exports.getLowStock = async (req, res, next) => {
  try {
    const result = await execute(`SELECT * FROM vw_low_stock_alerts`, {});
    res.json({ success:true, data:result.rows });
  } catch(err){ next(err); }
};

// GET /api/admin/activity-logs
exports.getActivityLogs = async (req, res, next) => {
  try {
    const { page=1, limit=50, action, role } = req.query;
    const skip = (parseInt(page)-1)*parseInt(limit);
    const filter = {};
    if(action) filter.action = action;
    if(role)   filter.role   = role;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter).sort({timestamp:-1}).skip(skip).limit(parseInt(limit)).lean(),
      ActivityLog.countDocuments(filter)
    ]);
    res.json({ success:true, data:logs, pagination:{total, page:parseInt(page), limit:parseInt(limit)} });
  } catch(err){ next(err); }
};
