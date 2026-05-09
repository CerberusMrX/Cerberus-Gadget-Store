-- ============================================================
-- CERBERUS GADGET STORE - Indexes
-- File: 03_indexes.sql
-- ============================================================

-- Users
CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_role     ON users(role);

-- Products
CREATE INDEX idx_prod_seller    ON products(seller_id);
CREATE INDEX idx_prod_category  ON products(category_id);
CREATE INDEX idx_prod_active    ON products(is_active);
CREATE INDEX idx_prod_name      ON products(UPPER(name));
CREATE INDEX idx_prod_price     ON products(price);

-- Orders
CREATE INDEX idx_ord_customer   ON orders(customer_id);
CREATE INDEX idx_ord_status     ON orders(status);
CREATE INDEX idx_ord_created    ON orders(created_at);

-- Order Items
CREATE INDEX idx_oi_order       ON order_items(order_id);
CREATE INDEX idx_oi_product     ON order_items(product_id);

-- Payments
CREATE INDEX idx_pay_status     ON payments(status);
CREATE INDEX idx_pay_created    ON payments(created_at);

-- Reviews
CREATE INDEX idx_rev_product    ON reviews(product_id);
CREATE INDEX idx_rev_customer   ON reviews(customer_id);

-- Inventory
CREATE INDEX idx_inv_qty        ON inventory(quantity);

-- Cart
CREATE INDEX idx_cart_customer  ON cart(customer_id);

-- Wishlist
CREATE INDEX idx_wish_customer  ON wishlist(customer_id);

-- Deliveries
CREATE INDEX idx_del_tracking   ON deliveries(tracking_no);
CREATE INDEX idx_del_status     ON deliveries(status);

COMMIT;
PROMPT Indexes created successfully!
