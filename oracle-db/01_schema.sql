-- ============================================================
-- CERBERUS GADGET STORE - Oracle Database Schema
-- File: 01_schema.sql
-- Run this file first in SQL*Plus or SQL Developer
-- ============================================================

-- Drop tables if they exist (for re-runs)
BEGIN
  FOR t IN (
    SELECT table_name FROM user_tables
    WHERE table_name IN (
      'WISHLIST','REVIEWS','DELIVERIES','PAYMENTS','ORDER_ITEMS',
      'ORDERS','CART_ITEMS','CART','INVENTORY','PRODUCTS',
      'CATEGORIES','ADMINS','SELLERS','CUSTOMERS','USERS','PAYMENT_AUDIT_LOG'
    )
  ) LOOP
    EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS';
  END LOOP;
END;
/

-- ============================================================
-- TABLE: USERS (shared auth)
-- ============================================================
CREATE TABLE users (
  user_id       NUMBER PRIMARY KEY,
  email         VARCHAR2(255) NOT NULL UNIQUE,
  password_hash VARCHAR2(255) NOT NULL,
  role          VARCHAR2(20)  NOT NULL CHECK (role IN ('customer','seller','admin')),
  is_active     NUMBER(1)     DEFAULT 1 NOT NULL,
  created_at    TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at    TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL
);

-- ============================================================
-- TABLE: CUSTOMERS
-- ============================================================
CREATE TABLE customers (
  customer_id   NUMBER PRIMARY KEY,
  user_id       NUMBER NOT NULL UNIQUE,
  first_name    VARCHAR2(100) NOT NULL,
  last_name     VARCHAR2(100) NOT NULL,
  phone         VARCHAR2(20),
  address       VARCHAR2(500),
  city          VARCHAR2(100),
  country       VARCHAR2(100) DEFAULT 'Sri Lanka',
  created_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_cust_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: SELLERS
-- ============================================================
CREATE TABLE sellers (
  seller_id     NUMBER PRIMARY KEY,
  user_id       NUMBER NOT NULL UNIQUE,
  store_name    VARCHAR2(200) NOT NULL,
  description   VARCHAR2(1000),
  phone         VARCHAR2(20),
  address       VARCHAR2(500),
  is_verified   NUMBER(1) DEFAULT 0,
  commission_pct NUMBER(5,2) DEFAULT 10.00,
  created_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_seller_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: ADMINS
-- ============================================================
CREATE TABLE admins (
  admin_id      NUMBER PRIMARY KEY,
  user_id       NUMBER NOT NULL UNIQUE,
  first_name    VARCHAR2(100) NOT NULL,
  last_name     VARCHAR2(100) NOT NULL,
  created_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: CATEGORIES
-- ============================================================
CREATE TABLE categories (
  category_id   NUMBER PRIMARY KEY,
  name          VARCHAR2(100) NOT NULL UNIQUE,
  description   VARCHAR2(500),
  image_url     VARCHAR2(500),
  is_active     NUMBER(1) DEFAULT 1
);

-- ============================================================
-- TABLE: PRODUCTS
-- ============================================================
CREATE TABLE products (
  product_id    NUMBER PRIMARY KEY,
  seller_id     NUMBER NOT NULL,
  category_id   NUMBER NOT NULL,
  name          VARCHAR2(200) NOT NULL,
  description   CLOB,
  price         NUMBER(10,2) NOT NULL CHECK (price >= 0),
  discount_pct  NUMBER(5,2) DEFAULT 0 CHECK (discount_pct BETWEEN 0 AND 100),
  image_url     VARCHAR2(500),
  brand         VARCHAR2(100),
  model         VARCHAR2(100),
  is_active     NUMBER(1) DEFAULT 1,
  rating_avg    NUMBER(3,2) DEFAULT 0,
  rating_count  NUMBER DEFAULT 0,
  created_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_prod_seller   FOREIGN KEY (seller_id)   REFERENCES sellers(seller_id),
  CONSTRAINT fk_prod_category FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- ============================================================
-- TABLE: INVENTORY
-- ============================================================
CREATE TABLE inventory (
  inventory_id  NUMBER PRIMARY KEY,
  product_id    NUMBER NOT NULL UNIQUE,
  quantity      NUMBER DEFAULT 0 NOT NULL CHECK (quantity >= 0),
  low_stock_threshold NUMBER DEFAULT 5,
  updated_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_inv_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: CART
-- ============================================================
CREATE TABLE cart (
  cart_id       NUMBER PRIMARY KEY,
  customer_id   NUMBER NOT NULL,
  created_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_cart_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: CART_ITEMS
-- ============================================================
CREATE TABLE cart_items (
  cart_item_id  NUMBER PRIMARY KEY,
  cart_id       NUMBER NOT NULL,
  product_id    NUMBER NOT NULL,
  quantity      NUMBER NOT NULL CHECK (quantity > 0),
  added_at      TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_ci_cart    FOREIGN KEY (cart_id)    REFERENCES cart(cart_id) ON DELETE CASCADE,
  CONSTRAINT fk_ci_product FOREIGN KEY (product_id) REFERENCES products(product_id),
  CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id)
);

-- ============================================================
-- TABLE: ORDERS
-- ============================================================
CREATE TABLE orders (
  order_id      NUMBER PRIMARY KEY,
  customer_id   NUMBER NOT NULL,
  status        VARCHAR2(30) DEFAULT 'pending' NOT NULL
                  CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  total_amount  NUMBER(10,2) NOT NULL,
  shipping_address VARCHAR2(500) NOT NULL,
  shipping_city VARCHAR2(100),
  notes         VARCHAR2(500),
  created_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- ============================================================
-- TABLE: ORDER_ITEMS
-- ============================================================
CREATE TABLE order_items (
  order_item_id NUMBER PRIMARY KEY,
  order_id      NUMBER NOT NULL,
  product_id    NUMBER NOT NULL,
  quantity      NUMBER NOT NULL CHECK (quantity > 0),
  unit_price    NUMBER(10,2) NOT NULL,
  subtotal      NUMBER(10,2) GENERATED ALWAYS AS (quantity * unit_price) VIRTUAL,
  CONSTRAINT fk_oi_order   FOREIGN KEY (order_id)   REFERENCES orders(order_id) ON DELETE CASCADE,
  CONSTRAINT fk_oi_product FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- ============================================================
-- TABLE: PAYMENTS
-- ============================================================
CREATE TABLE payments (
  payment_id    NUMBER PRIMARY KEY,
  order_id      NUMBER NOT NULL UNIQUE,
  amount        NUMBER(10,2) NOT NULL,
  method        VARCHAR2(50) NOT NULL CHECK (method IN ('card','paypal','bank_transfer','cod')),
  status        VARCHAR2(30) DEFAULT 'pending' NOT NULL
                  CHECK (status IN ('pending','completed','failed','refunded')),
  transaction_ref VARCHAR2(200),
  paid_at       TIMESTAMP,
  created_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_pay_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: PAYMENT_AUDIT_LOG (for trigger)
-- ============================================================
CREATE TABLE payment_audit_log (
  log_id        NUMBER PRIMARY KEY,
  payment_id    NUMBER,
  old_status    VARCHAR2(30),
  new_status    VARCHAR2(30),
  changed_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  changed_by    VARCHAR2(100)
);

-- ============================================================
-- TABLE: DELIVERIES
-- ============================================================
CREATE TABLE deliveries (
  delivery_id   NUMBER PRIMARY KEY,
  order_id      NUMBER NOT NULL UNIQUE,
  tracking_no   VARCHAR2(100),
  carrier       VARCHAR2(100) DEFAULT 'Cerberus Logistics',
  status        VARCHAR2(30) DEFAULT 'pending'
                  CHECK (status IN ('pending','picked_up','in_transit','out_for_delivery','delivered','failed')),
  estimated_date DATE,
  delivered_at  TIMESTAMP,
  created_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_del_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE: REVIEWS
-- ============================================================
CREATE TABLE reviews (
  review_id     NUMBER PRIMARY KEY,
  product_id    NUMBER NOT NULL,
  customer_id   NUMBER NOT NULL,
  rating        NUMBER(1) NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title         VARCHAR2(200),
  body          VARCHAR2(2000),
  created_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_rev_product  FOREIGN KEY (product_id)  REFERENCES products(product_id) ON DELETE CASCADE,
  CONSTRAINT fk_rev_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  CONSTRAINT uq_customer_product_review UNIQUE (product_id, customer_id)
);

-- ============================================================
-- TABLE: WISHLIST
-- ============================================================
CREATE TABLE wishlist (
  wishlist_id   NUMBER PRIMARY KEY,
  customer_id   NUMBER NOT NULL,
  product_id    NUMBER NOT NULL,
  added_at      TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_wish_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
  CONSTRAINT fk_wish_product  FOREIGN KEY (product_id)  REFERENCES products(product_id) ON DELETE CASCADE,
  CONSTRAINT uq_wish UNIQUE (customer_id, product_id)
);

COMMIT;

PROMPT Schema created successfully!
