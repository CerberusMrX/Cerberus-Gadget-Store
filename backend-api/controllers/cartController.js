/**
 * CERBERUS GADGET STORE - Cart Controller
 * File: backend-api/controllers/cartController.js
 */
const { execute } = require('../config/database');
const { ActivityLog } = require('../config/mongodb');

// Ensure cart exists for customer
async function ensureCart(customer_id) {
  const existing = await execute(
    `SELECT cart_id FROM cart WHERE customer_id=:cid AND ROWNUM=1`,
    { cid: customer_id }
  );
  if (existing.rows.length > 0) return existing.rows[0].CART_ID;
  const res = await execute(
    `INSERT INTO cart(cart_id, customer_id) VALUES(seq_cart_id.NEXTVAL,:cid) RETURNING cart_id INTO :cart_id`,
    { cid: customer_id, cart_id: { dir: require('oracledb').BIND_OUT, type: require('oracledb').NUMBER } }
  );
  return res.outBinds.cart_id[0];
}

// GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    const customer_id = req.user.customer_id;
    const cart_id = await ensureCart(customer_id);
    const result = await execute(
      `SELECT ci.cart_item_id, ci.product_id, ci.quantity,
              p.name, p.image_url, p.brand,
              ROUND(p.price*(1-p.discount_pct/100),2) AS unit_price,
              ROUND(p.price*(1-p.discount_pct/100)*ci.quantity,2) AS subtotal,
              i.quantity AS stock
       FROM cart_items ci
       JOIN products  p ON p.product_id=ci.product_id
       LEFT JOIN inventory i ON i.product_id=ci.product_id
       WHERE ci.cart_id=:cart_id`,
      { cart_id }
    );
    const items = result.rows;
    const total = items.reduce((sum, i) => sum + (i.SUBTOTAL || 0), 0);
    res.json({ success: true, data: { cart_id, items, total: Math.round(total*100)/100 } });
  } catch (err) { next(err); }
};

// POST /api/cart/add
exports.addToCart = async (req, res, next) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const customer_id = req.user.customer_id;
    const cart_id = await ensureCart(customer_id);

    // Check stock
    const stock = await execute(
      `SELECT quantity FROM inventory WHERE product_id=:pid`, { pid: parseInt(product_id) }
    );
    if (stock.rows.length === 0 || stock.rows[0].QUANTITY < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    // Upsert cart item
    const existing = await execute(
      `SELECT cart_item_id, quantity FROM cart_items WHERE cart_id=:cid AND product_id=:pid`,
      { cid: cart_id, pid: parseInt(product_id) }
    );

    if (existing.rows.length > 0) {
      await execute(
        `UPDATE cart_items SET quantity=quantity+:qty WHERE cart_item_id=:id`,
        { qty: parseInt(quantity), id: existing.rows[0].CART_ITEM_ID }
      );
    } else {
      await execute(
        `INSERT INTO cart_items(cart_item_id,cart_id,product_id,quantity) VALUES(seq_cart_item_id.NEXTVAL,:cid,:pid,:qty)`,
        { cid: cart_id, pid: parseInt(product_id), qty: parseInt(quantity) }
      );
    }

    ActivityLog.create({ user_id: req.user.user_id, user_email: req.user.email,
      role: 'customer', action: 'cart_add', details: { product_id, quantity }, ip: req.ip }).catch(() => {});

    res.json({ success: true, message: 'Added to cart' });
  } catch (err) { next(err); }
};

// PUT /api/cart/:itemId
exports.updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    if (parseInt(quantity) <= 0) {
      await execute(`DELETE FROM cart_items WHERE cart_item_id=:id`, { id: parseInt(itemId) });
      return res.json({ success: true, message: 'Item removed' });
    }
    await execute(
      `UPDATE cart_items SET quantity=:qty WHERE cart_item_id=:id`,
      { qty: parseInt(quantity), id: parseInt(itemId) }
    );
    res.json({ success: true, message: 'Cart updated' });
  } catch (err) { next(err); }
};

// DELETE /api/cart/:itemId
exports.removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    await execute(`DELETE FROM cart_items WHERE cart_item_id=:id`, { id: parseInt(itemId) });
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) { next(err); }
};

// DELETE /api/cart/clear
exports.clearCart = async (req, res, next) => {
  try {
    const customer_id = req.user.customer_id;
    await execute(
      `DELETE FROM cart_items WHERE cart_id=(SELECT cart_id FROM cart WHERE customer_id=:cid AND ROWNUM=1)`,
      { cid: customer_id }
    );
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) { next(err); }
};
