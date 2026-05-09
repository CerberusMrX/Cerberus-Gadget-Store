/**
 * CERBERUS GADGET STORE - Review, Wishlist, Delivery, Seller, Admin, Analytics Controllers
 */

// ── reviewController.js ───────────────────────────────────────
const { execute } = require('../config/database');

// POST /api/reviews
exports.addReview = async (req, res, next) => {
  try {
    const { product_id, rating, title, body } = req.body;
    const customer_id = req.user.customer_id;
    if (!product_id || !rating) return res.status(400).json({ success:false, message:'product_id and rating required' });

    await execute(
      `INSERT INTO reviews(review_id,product_id,customer_id,rating,title,body)
       VALUES(seq_review_id.NEXTVAL,:pid,:cid,:rating,:title,:body)`,
      { pid:parseInt(product_id), cid:customer_id, rating:parseInt(rating), title:title||'', body:body||'' }
    );
    res.status(201).json({ success:true, message:'Review submitted' });
  } catch(err) { next(err); }
};

// GET /api/reviews/product/:id
exports.getProductReviews = async (req, res, next) => {
  try {
    const result = await execute(
      `SELECT r.*,c.first_name||' '||c.last_name AS reviewer
       FROM reviews r JOIN customers c ON c.customer_id=r.customer_id
       WHERE r.product_id=:id ORDER BY r.created_at DESC`,
      { id:parseInt(req.params.id) }
    );
    res.json({ success:true, data:result.rows });
  } catch(err) { next(err); }
};

module.exports = exports;
