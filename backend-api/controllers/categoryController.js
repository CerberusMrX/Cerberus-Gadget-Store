/**
 * CERBERUS GADGET STORE - Category, Cart, Review, Wishlist Controllers
 * File: backend-api/controllers/categoryController.js
 */
const { execute } = require('../config/database');

exports.getCategories = async (req, res, next) => {
  try {
    const result = await execute(
      `SELECT c.category_id, c.name, c.description, c.image_url,
              COUNT(p.product_id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id=c.category_id AND p.is_active=1
       WHERE c.is_active=1
       GROUP BY c.category_id, c.name, c.description, c.image_url
       ORDER BY c.name`, {}
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};
