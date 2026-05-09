/**
 * CERBERUS GADGET STORE - Wishlist Controller
 * File: backend-api/controllers/wishlistController.js
 */
const { execute } = require('../config/database');

// GET /api/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const result = await execute(
      `SELECT w.wishlist_id,w.product_id,w.added_at,
              p.name,p.image_url,p.brand,
              ROUND(p.price*(1-p.discount_pct/100),2) AS price,
              p.rating_avg, i.quantity AS stock
       FROM wishlist w
       JOIN products p ON p.product_id=w.product_id
       LEFT JOIN inventory i ON i.product_id=w.product_id
       WHERE w.customer_id=:cid ORDER BY w.added_at DESC`,
      { cid: req.user.customer_id }
    );
    res.json({ success:true, data:result.rows });
  } catch(err){ next(err); }
};

// POST /api/wishlist
exports.addToWishlist = async (req, res, next) => {
  try {
    const { product_id } = req.body;
    await execute(
      `INSERT INTO wishlist(wishlist_id,customer_id,product_id) VALUES(seq_wishlist_id.NEXTVAL,:cid,:pid)`,
      { cid:req.user.customer_id, pid:parseInt(product_id) }
    );
    res.status(201).json({ success:true, message:'Added to wishlist' });
  } catch(err){
    if(err.errorNum===1) return res.json({ success:true, message:'Already in wishlist' });
    next(err);
  }
};

// DELETE /api/wishlist/:productId
exports.removeFromWishlist = async (req, res, next) => {
  try {
    await execute(
      `DELETE FROM wishlist WHERE customer_id=:cid AND product_id=:pid`,
      { cid:req.user.customer_id, pid:parseInt(req.params.productId) }
    );
    res.json({ success:true, message:'Removed from wishlist' });
  } catch(err){ next(err); }
};
