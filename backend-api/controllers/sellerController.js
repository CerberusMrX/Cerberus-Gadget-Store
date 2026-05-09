/**
 * CERBERUS GADGET STORE - Seller Controller
 * File: backend-api/controllers/sellerController.js
 */
const { execute } = require('../config/database');

// GET /api/seller/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const seller_id = req.user.seller_id;

    const [products, revenue, orders, lowStock] = await Promise.all([
      execute(`SELECT COUNT(*) AS total FROM products WHERE seller_id=:sid AND is_active=1`, {sid:seller_id}),
      execute(
        `SELECT NVL(SUM(pay.amount),0) AS total_revenue, COUNT(DISTINCT o.order_id) AS total_orders
         FROM order_items oi
         JOIN orders   o   ON o.order_id=oi.order_id
         JOIN payments pay ON pay.order_id=o.order_id
         JOIN products p   ON p.product_id=oi.product_id
         WHERE p.seller_id=:sid AND pay.status='completed'`, {sid:seller_id}
      ),
      execute(
        `SELECT o.order_id, o.status, o.total_amount, o.created_at,
                c.first_name||' '||c.last_name AS customer_name
         FROM orders o
         JOIN customers c ON c.customer_id=o.customer_id
         JOIN order_items oi ON oi.order_id=o.order_id
         JOIN products p ON p.product_id=oi.product_id
         WHERE p.seller_id=:sid
         GROUP BY o.order_id,o.status,o.total_amount,o.created_at,c.first_name,c.last_name
         ORDER BY o.created_at DESC FETCH FIRST 10 ROWS ONLY`, {sid:seller_id}
      ),
      execute(
        `SELECT p.product_id,p.name,i.quantity,i.low_stock_threshold
         FROM inventory i JOIN products p ON p.product_id=i.product_id
         WHERE p.seller_id=:sid AND i.quantity<=i.low_stock_threshold`, {sid:seller_id}
      )
    ]);

    res.json({
      success:true,
      data:{
        total_products: products.rows[0].TOTAL,
        total_revenue:  revenue.rows[0].TOTAL_REVENUE,
        total_orders:   revenue.rows[0].TOTAL_ORDERS,
        recent_orders:  orders.rows,
        low_stock:      lowStock.rows
      }
    });
  } catch(err){ next(err); }
};

// GET /api/seller/products
exports.getSellerProducts = async (req, res, next) => {
  try {
    const seller_id = req.user.seller_id;
    const { page=1, limit=20 } = req.query;
    const offset = (parseInt(page)-1)*parseInt(limit);
    const result = await execute(
      `SELECT p.*,c.name AS category,i.quantity AS stock
       FROM products p
       JOIN categories c ON c.category_id=p.category_id
       LEFT JOIN inventory i ON i.product_id=p.product_id
       WHERE p.seller_id=:sid
       ORDER BY p.created_at DESC
       OFFSET :off ROWS FETCH NEXT :lim ROWS ONLY`,
      { sid:seller_id, off:offset, lim:parseInt(limit) }
    );
    res.json({ success:true, data:result.rows });
  } catch(err){ next(err); }
};

// GET /api/seller/orders
exports.getSellerOrders = async (req, res, next) => {
  try {
    const seller_id = req.user.seller_id;
    const result = await execute(
      `SELECT DISTINCT o.order_id,o.status,o.total_amount,o.created_at,
              c.first_name||' '||c.last_name AS customer_name,
              d.tracking_no, d.status AS delivery_status
       FROM orders o
       JOIN customers   c  ON c.customer_id=o.customer_id
       JOIN order_items oi ON oi.order_id=o.order_id
       JOIN products    p  ON p.product_id=oi.product_id
       LEFT JOIN deliveries d ON d.order_id=o.order_id
       WHERE p.seller_id=:sid
       ORDER BY o.created_at DESC FETCH FIRST 50 ROWS ONLY`,
      { sid:seller_id }
    );
    res.json({ success:true, data:result.rows });
  } catch(err){ next(err); }
};
