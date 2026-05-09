/**
 * CERBERUS GADGET STORE - Product Controller
 * File: backend-api/controllers/productController.js
 */

const { execute } = require('../config/database');
const { ProductView, Search } = require('../config/mongodb');

// ── GET /api/products ─────────────────────────────────────────
exports.getProducts = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12,
      category, search, min_price, max_price,
      sort = 'created_at', order = 'DESC',
      brand
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let conditions = ['p.is_active = 1'];
    let binds = {};

    if (category)  { conditions.push('c.name = :category');  binds.category  = category; }
    if (brand)     { conditions.push('UPPER(p.brand) = UPPER(:brand)');  binds.brand  = brand; }
    if (min_price) { conditions.push('p.price >= :min_price'); binds.min_price = parseFloat(min_price); }
    if (max_price) { conditions.push('p.price <= :max_price'); binds.max_price = parseFloat(max_price); }
    if (search) {
      conditions.push(`(UPPER(p.name) LIKE UPPER(:search) OR UPPER(p.brand) LIKE UPPER(:search2))`);
      binds.search  = `%${search}%`;
      binds.search2 = `%${search}%`;

      // Log search to MongoDB
      Search.create({
        user_id: req.user?.user_id || null,
        query: search,
        filters: { category, min_price, max_price }
      }).catch(() => {});
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const allowedSort = { price: 'p.price', name: 'p.name', created_at: 'p.created_at', rating: 'p.rating_avg' };
    const sortCol = allowedSort[sort] || 'p.created_at';
    const sortDir = order === 'ASC' ? 'ASC' : 'DESC';

    // Count
    const countResult = await execute(
      `SELECT COUNT(*) AS total FROM products p
       JOIN categories c ON c.category_id = p.category_id
       ${whereClause}`, binds
    );
    const total = countResult.rows[0].TOTAL;

    // Data
    const result = await execute(
      `SELECT p.product_id, p.name, p.price, p.discount_pct,
              ROUND(p.price * (1 - p.discount_pct/100), 2) AS final_price,
              p.image_url, p.brand, p.model, p.rating_avg, p.rating_count,
              p.created_at, c.name AS category, c.category_id,
              s.store_name AS seller_name, i.quantity AS stock
       FROM products p
       JOIN categories c ON c.category_id = p.category_id
       JOIN sellers    s ON s.seller_id   = p.seller_id
       LEFT JOIN inventory i ON i.product_id = p.product_id
       ${whereClause}
       ORDER BY ${sortCol} ${sortDir}
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      { ...binds, offset, limit: parseInt(limit) }
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/products/:id ─────────────────────────────────────
exports.getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await execute(
      `SELECT p.*, c.name AS category, s.store_name, s.seller_id,
              i.quantity AS stock,
              ROUND(p.price * (1 - p.discount_pct/100), 2) AS final_price
       FROM products p
       JOIN categories c ON c.category_id = p.category_id
       JOIN sellers    s ON s.seller_id   = p.seller_id
       LEFT JOIN inventory i ON i.product_id = p.product_id
       WHERE p.product_id = :id AND p.is_active = 1`,
      { id: parseInt(id) }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = result.rows[0];

    // Fetch reviews
    const reviews = await execute(
      `SELECT r.*, c.first_name || ' ' || c.last_name AS reviewer_name
       FROM reviews r
       JOIN customers c ON c.customer_id = r.customer_id
       WHERE r.product_id = :id
       ORDER BY r.created_at DESC
       FETCH FIRST 20 ROWS ONLY`,
      { id: parseInt(id) }
    );
    product.REVIEWS = reviews.rows;

    // Log product view to MongoDB
    ProductView.create({
      product_id:   parseInt(id),
      product_name: product.NAME,
      user_id:      req.user?.user_id || null,
      session_id:   req.headers['x-session-id'] || null,
      source:       req.query.source || 'browse'
    }).catch(() => {});

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/products ─────────────────────────────────────────
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, discount_pct, category_id, brand, model, stock } = req.body;
    const seller_id = req.user.seller_id;
    const image_url = req.file
      ? `/uploads/${req.file.filename}`
      : (req.body.image_url || '');

    if (!name || !price || !category_id) {
      return res.status(400).json({ success: false, message: 'Name, price, and category are required' });
    }

    const result = await execute(
      `INSERT INTO products(product_id, seller_id, category_id, name, description, price, discount_pct, image_url, brand, model)
       VALUES(seq_product_id.NEXTVAL, :seller_id, :category_id, :name, :description, :price, :discount_pct, :image_url, :brand, :model)
       RETURNING product_id INTO :product_id`,
      {
        seller_id, category_id: parseInt(category_id), name, description: description || '',
        price: parseFloat(price), discount_pct: parseFloat(discount_pct) || 0,
        image_url, brand: brand || '', model: model || '',
        product_id: { dir: require('oracledb').BIND_OUT, type: require('oracledb').NUMBER }
      }
    );

    const product_id = result.outBinds.product_id[0];

    // Create inventory
    await execute(
      `INSERT INTO inventory(inventory_id, product_id, quantity) VALUES(seq_inventory_id.NEXTVAL, :pid, :qty)`,
      { pid: product_id, qty: parseInt(stock) || 0 }
    );

    res.status(201).json({ success: true, message: 'Product created', data: { product_id } });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/products/:id ─────────────────────────────────────
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, discount_pct, category_id, brand, model, stock, is_active } = req.body;
    const seller_id = req.user.seller_id;

    // Verify ownership (unless admin)
    if (req.user.role !== 'admin') {
      const own = await execute(
        `SELECT product_id FROM products WHERE product_id=:id AND seller_id=:seller_id`,
        { id: parseInt(id), seller_id }
      );
      if (own.rows.length === 0) {
        return res.status(403).json({ success: false, message: 'Not your product' });
      }
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;

    await execute(
      `UPDATE products SET
         name=:name, description=:desc, price=:price, discount_pct=:disc,
         category_id=:cat, brand=:brand, model=:model,
         image_url=CASE WHEN :img IS NOT NULL THEN :img ELSE image_url END,
         is_active=:active
       WHERE product_id=:id`,
      {
        name, desc: description, price: parseFloat(price), disc: parseFloat(discount_pct) || 0,
        cat: parseInt(category_id), brand, model, img: image_url || null,
        active: is_active !== undefined ? parseInt(is_active) : 1, id: parseInt(id)
      }
    );

    if (stock !== undefined) {
      await execute(
        `UPDATE inventory SET quantity=:qty WHERE product_id=:id`,
        { qty: parseInt(stock), id: parseInt(id) }
      );
    }

    res.json({ success: true, message: 'Product updated' });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/products/:id ──────────────────────────────────
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Soft delete
    await execute(
      `UPDATE products SET is_active=0 WHERE product_id=:id`,
      { id: parseInt(id) }
    );
    res.json({ success: true, message: 'Product removed from listing' });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/products/featured ────────────────────────────────
exports.getFeatured = async (req, res, next) => {
  try {
    const result = await execute(
      `SELECT p.product_id, p.name, p.price, p.discount_pct,
              ROUND(p.price * (1 - p.discount_pct/100), 2) AS final_price,
              p.image_url, p.brand, p.rating_avg, p.rating_count,
              c.name AS category, i.quantity AS stock
       FROM products p
       JOIN categories c ON c.category_id = p.category_id
       LEFT JOIN inventory i ON i.product_id = p.product_id
       WHERE p.is_active = 1
       ORDER BY p.rating_avg DESC, p.rating_count DESC
       FETCH FIRST 8 ROWS ONLY`, {}
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};
