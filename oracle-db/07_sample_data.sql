-- ============================================================
-- CERBERUS GADGET STORE - Sample Data
-- File: 07_sample_data.sql
-- Passwords are bcrypt hashes of: Admin@123
-- ============================================================

-- Categories
INSERT INTO categories(category_id, name, description, image_url) VALUES
  (seq_category_id.NEXTVAL, 'Smartphones', 'Latest mobile phones & accessories',
   'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400');
INSERT INTO categories(category_id, name, description, image_url) VALUES
  (seq_category_id.NEXTVAL, 'Laptops', 'Ultrabooks, gaming laptops & more',
   'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400');
INSERT INTO categories(category_id, name, description, image_url) VALUES
  (seq_category_id.NEXTVAL, 'Smartwatches', 'Fitness trackers & smart wearables',
   'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400');
INSERT INTO categories(category_id, name, description, image_url) VALUES
  (seq_category_id.NEXTVAL, 'Audio', 'Earbuds, headphones & speakers',
   'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400');
INSERT INTO categories(category_id, name, description, image_url) VALUES
  (seq_category_id.NEXTVAL, 'Gaming', 'Gaming peripherals, consoles & gear',
   'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400');
INSERT INTO categories(category_id, name, description, image_url) VALUES
  (seq_category_id.NEXTVAL, 'Cameras', 'DSLR, mirrorless & action cameras',
   'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400');

-- ============================================================
-- Users (Admin, Seller, Customer)
-- Password hash = bcrypt('Admin@123', 12)
-- ============================================================
INSERT INTO users(user_id, email, password_hash, role) VALUES
  (seq_user_id.NEXTVAL, 'admin@cerberusgadgets.com',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TsG5A1q1PQbK7MzBNvX9RUbJEwVK', 'admin');

INSERT INTO users(user_id, email, password_hash, role) VALUES
  (seq_user_id.NEXTVAL, 'techseller@cerberusgadgets.com',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TsG5A1q1PQbK7MzBNvX9RUbJEwVK', 'seller');

INSERT INTO users(user_id, email, password_hash, role) VALUES
  (seq_user_id.NEXTVAL, 'customer@cerberusgadgets.com',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TsG5A1q1PQbK7MzBNvX9RUbJEwVK', 'customer');

-- Profiles
INSERT INTO admins(admin_id, user_id, first_name, last_name)
  SELECT seq_admin_id.NEXTVAL, user_id, 'Cerberus', 'Admin'
  FROM users WHERE email = 'admin@cerberusgadgets.com';

INSERT INTO sellers(seller_id, user_id, store_name, description, is_verified)
  SELECT seq_seller_id.NEXTVAL, user_id,
         'TechVault Store', 'Premium tech gadgets curated for enthusiasts.', 1
  FROM users WHERE email = 'techseller@cerberusgadgets.com';

INSERT INTO customers(customer_id, user_id, first_name, last_name, phone, address, city)
  SELECT seq_customer_id.NEXTVAL, user_id,
         'Alex', 'Kumar', '+94711234567', '42 Lotus Road, Colombo 03', 'Colombo'
  FROM users WHERE email = 'customer@cerberusgadgets.com';

-- ============================================================
-- Products (15 tech gadgets) — seller_id=1 (TechVault)
-- ============================================================
-- 1. iPhone 16 Pro (category 1 = Smartphones)
INSERT INTO products(product_id,seller_id,category_id,name,description,price,discount_pct,image_url,brand,model)
VALUES(seq_product_id.NEXTVAL,1,1,'iPhone 16 Pro 256GB',
  'Apple''s latest flagship with A18 Pro chip, titanium design, ProMotion 120Hz display, and advanced camera system with 5x optical zoom.',
  1299.00,5,'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600','Apple','iPhone 16 Pro');

-- 2. Samsung Galaxy S25 Ultra (category 1)
INSERT INTO products(product_id,seller_id,category_id,name,description,price,discount_pct,image_url,brand,model)
VALUES(seq_product_id.NEXTVAL,1,1,'Samsung Galaxy S25 Ultra 512GB',
  'Ultimate Android flagship featuring Snapdragon 8 Elite, 200MP quad camera, embedded S Pen, 6.9" Dynamic AMOLED 2X display.',
  1199.00,8,'https://images.unsplash.com/photo-1610945264803-c22b62831e67?w=600','Samsung','Galaxy S25 Ultra');

-- 3. MacBook Pro M4 (category 2 = Laptops)
INSERT INTO products(product_id,seller_id,category_id,name,description,price,discount_pct,image_url,brand,model)
VALUES(seq_product_id.NEXTVAL,1,2,'MacBook Pro 14" M4 Pro 512GB',
  'Supercharged with M4 Pro chip, 18GB unified memory, 14-inch Liquid Retina XDR display, and up to 22 hours battery life.',
  1999.00,3,'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600','Apple','MacBook Pro M4');

-- 4. Dell XPS 15 (category 2)
INSERT INTO products(product_id,seller_id,category_id,name,description,price,discount_pct,image_url,brand,model)
VALUES(seq_product_id.NEXTVAL,1,2,'Dell XPS 15 9530 RTX 4070',
  'Intel Core i9-13900H, NVIDIA GeForce RTX 4070, 32GB DDR5 RAM, 1TB SSD, 15.6" OLED 3.5K display.',
  1749.00,10,'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600','Dell','XPS 15 9530');

-- 5. Apple Watch Ultra 2 (category 3 = Smartwatches)
INSERT INTO products(product_id,seller_id,category_id,name,description,price,discount_pct,image_url,brand,model)
VALUES(seq_product_id.NEXTVAL,1,3,'Apple Watch Ultra 2 GPS+Cellular',
  'The most rugged Apple Watch. 49mm titanium case, dual-frequency GPS, depth gauge, 60 hours battery life.',
  799.00,0,'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600','Apple','Watch Ultra 2');

-- 6. Samsung Galaxy Watch 7 (category 3)
INSERT INTO products(product_id,seller_id,category_id,name,description,price,discount_pct,image_url,brand,model)
VALUES(seq_product_id.NEXTVAL,1,3,'Samsung Galaxy Watch 7 44mm',
  'Advanced health monitoring with BioActive sensor, BIA body composition, sleep coaching, and 40 hours battery.',
  299.00,15,'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600','Samsung','Galaxy Watch 7');

-- 7. AirPods Pro 2 (category 4 = Audio)
INSERT INTO products(product_id,seller_id,category_id,name,description,price,discount_pct,image_url,brand,model)
VALUES(seq_product_id.NEXTVAL,1,4,'Apple AirPods Pro 2nd Generation',
  'H2 chip, up to 2x more Active Noise Cancellation, Adaptive Audio, Personalized Spatial Audio, MagSafe case.',
  249.00,5,'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600','Apple','AirPods Pro 2');

-- 8. Sony WH-1000XM5 (category 4)
INSERT INTO products(product_id,seller_id,category_id,name,description,price,discount_pct,image_url,brand,model)
VALUES(seq_product_id.NEXTVAL,1,4,'Sony WH-1000XM5 Wireless Headphones',
  'Industry-leading noise cancellation with 8 microphones, 30-hour battery, LDAC Hi-Res audio, multipoint connection.',
  349.00,12,'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600','Sony','WH-1000XM5');

-- 9. PlayStation 5 Slim (category 5 = Gaming)
INSERT INTO products(product_id,seller_id,category_id,name,description,price,discount_pct,image_url,brand,model)
VALUES(seq_product_id.NEXTVAL,1,5,'Sony PlayStation 5 Slim Console',
  'Next-gen gaming with custom SSD, ray tracing, 4K 120fps output, DualSense haptic controller, and 3D audio.',
  499.00,0,'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600','Sony','PlayStation 5 Slim');

-- 10. Razer DeathAdder V3 (category 5)
INSERT INTO products(product_id,seller_id,category_id,name,description,price,discount_pct,image_url,brand,model)
VALUES(seq_product_id.NEXTVAL,1,5,'Razer DeathAdder V3 Gaming Mouse',
  '30,000 DPI optical sensor, 90-hour battery, ultra-lightweight 63g ergonomic design, 6 programmable buttons.',
  99.00,20,'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600','Razer','DeathAdder V3');

-- 11. Canon EOS R6 Mark II (category 6 = Cameras)
INSERT INTO products(product_id,seller_id,category_id,name,description,price,discount_pct,image_url,brand,model)
VALUES(seq_product_id.NEXTVAL,1,6,'Canon EOS R6 Mark II Mirrorless Camera',
  '24.2MP full-frame CMOS, 40fps continuous shooting, IBIS, 6K RAW video, dual card slots, advanced AF system.',
  2499.00,5,'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600','Canon','EOS R6 Mark II');

-- 12. Google Pixel 9 Pro (category 1)
INSERT INTO products(product_id,seller_id,category_id,name,description,price,discount_pct,image_url,brand,model)
VALUES(seq_product_id.NEXTVAL,1,1,'Google Pixel 9 Pro 256GB',
  'Google Tensor G4, 50MP triple camera with Magic Eraser, 7 years OS updates, 4700mAh battery.',
  999.00,7,'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600','Google','Pixel 9 Pro');

-- 13. ASUS ROG Zephyrus G16 (category 2)
INSERT INTO products(product_id,seller_id,category_id,name,description,price,discount_pct,image_url,brand,model)
VALUES(seq_product_id.NEXTVAL,1,2,'ASUS ROG Zephyrus G16 RTX 4080',
  'AMD Ryzen 9 8945HS, NVIDIA RTX 4080, 32GB DDR5, 1TB SSD, 16" QHD+ 240Hz Mini-LED display, MUX Switch.',
  2299.00,8,'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600','ASUS','ROG Zephyrus G16');

-- 14. Bose QuietComfort Ultra (category 4)
INSERT INTO products(product_id,seller_id,category_id,name,description,price,discount_pct,image_url,brand,model)
VALUES(seq_product_id.NEXTVAL,1,4,'Bose QuietComfort Ultra Earbuds',
  'CustomTune technology, Immersive Audio, world-class noise cancellation, 6-hour battery + 18 hours case.',
  299.00,10,'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600','Bose','QuietComfort Ultra');

-- 15. GoPro HERO13 Black (category 6)
INSERT INTO products(product_id,seller_id,category_id,name,description,price,discount_pct,image_url,brand,model)
VALUES(seq_product_id.NEXTVAL,1,6,'GoPro HERO13 Black Action Camera',
  '5.3K60 video, 24.7MP photos, HyperSmooth 6.0 stabilization, 10-bit color, waterproof to 33ft, Enduro battery.',
  399.00,5,'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600','GoPro','HERO13 Black');

-- ============================================================
-- Inventory for all 15 products (fixed IDs 1-15)
-- ============================================================
INSERT INTO inventory(inventory_id,product_id,quantity,low_stock_threshold) VALUES(seq_inventory_id.NEXTVAL,1,45,5);
INSERT INTO inventory(inventory_id,product_id,quantity,low_stock_threshold) VALUES(seq_inventory_id.NEXTVAL,2,32,5);
INSERT INTO inventory(inventory_id,product_id,quantity,low_stock_threshold) VALUES(seq_inventory_id.NEXTVAL,3,28,5);
INSERT INTO inventory(inventory_id,product_id,quantity,low_stock_threshold) VALUES(seq_inventory_id.NEXTVAL,4,15,5);
INSERT INTO inventory(inventory_id,product_id,quantity,low_stock_threshold) VALUES(seq_inventory_id.NEXTVAL,5,20,5);
INSERT INTO inventory(inventory_id,product_id,quantity,low_stock_threshold) VALUES(seq_inventory_id.NEXTVAL,6,3,5);
INSERT INTO inventory(inventory_id,product_id,quantity,low_stock_threshold) VALUES(seq_inventory_id.NEXTVAL,7,60,5);
INSERT INTO inventory(inventory_id,product_id,quantity,low_stock_threshold) VALUES(seq_inventory_id.NEXTVAL,8,25,5);
INSERT INTO inventory(inventory_id,product_id,quantity,low_stock_threshold) VALUES(seq_inventory_id.NEXTVAL,9,2,5);
INSERT INTO inventory(inventory_id,product_id,quantity,low_stock_threshold) VALUES(seq_inventory_id.NEXTVAL,10,80,5);
INSERT INTO inventory(inventory_id,product_id,quantity,low_stock_threshold) VALUES(seq_inventory_id.NEXTVAL,11,10,5);
INSERT INTO inventory(inventory_id,product_id,quantity,low_stock_threshold) VALUES(seq_inventory_id.NEXTVAL,12,38,5);
INSERT INTO inventory(inventory_id,product_id,quantity,low_stock_threshold) VALUES(seq_inventory_id.NEXTVAL,13,12,5);
INSERT INTO inventory(inventory_id,product_id,quantity,low_stock_threshold) VALUES(seq_inventory_id.NEXTVAL,14,4,5);
INSERT INTO inventory(inventory_id,product_id,quantity,low_stock_threshold) VALUES(seq_inventory_id.NEXTVAL,15,22,5);

-- ============================================================
-- Sample Cart for customer 1
-- ============================================================
INSERT INTO cart(cart_id, customer_id) VALUES(seq_cart_id.NEXTVAL, 1);
INSERT INTO cart_items(cart_item_id, cart_id, product_id, quantity) VALUES(seq_cart_item_id.NEXTVAL, 1, 1, 1);
INSERT INTO cart_items(cart_item_id, cart_id, product_id, quantity) VALUES(seq_cart_item_id.NEXTVAL, 1, 7, 2);

-- ============================================================
-- Sample Wishlist
-- ============================================================
INSERT INTO wishlist(wishlist_id, customer_id, product_id) VALUES(seq_wishlist_id.NEXTVAL, 1, 3);
INSERT INTO wishlist(wishlist_id, customer_id, product_id) VALUES(seq_wishlist_id.NEXTVAL, 1, 5);
INSERT INTO wishlist(wishlist_id, customer_id, product_id) VALUES(seq_wishlist_id.NEXTVAL, 1, 9);

-- ============================================================
-- Sample Reviews
-- ============================================================
INSERT INTO reviews(review_id,product_id,customer_id,rating,title,body)
VALUES(seq_review_id.NEXTVAL,1,1,5,'Absolutely amazing phone!',
  'The A18 Pro chip is lightning fast. Camera quality is unmatched. Best iPhone ever!');

INSERT INTO reviews(review_id,product_id,customer_id,rating,title,body)
VALUES(seq_review_id.NEXTVAL,7,1,5,'Best earbuds on the market',
  'ANC is incredible, sound quality is crisp and detailed. Worth every penny!');

-- ============================================================
-- Sample Order (for demo purposes)
-- ============================================================
INSERT INTO orders(order_id,customer_id,status,total_amount,shipping_address,shipping_city)
VALUES(1000,1,'delivered',460365.00,'42 Lotus Road, Colombo 03','Colombo');

INSERT INTO order_items(order_item_id,order_id,product_id,quantity,unit_price)
VALUES(seq_order_item_id.NEXTVAL,1000,1,1,370215.00);
INSERT INTO order_items(order_item_id,order_id,product_id,quantity,unit_price)
VALUES(seq_order_item_id.NEXTVAL,1000,7,1,70965.00);

INSERT INTO payments(payment_id,order_id,amount,method,status,transaction_ref,paid_at)
VALUES(seq_payment_id.NEXTVAL,1000,460365.00,'card','completed','TXN-DEMO-001',SYSTIMESTAMP-2);

INSERT INTO deliveries(delivery_id,order_id,tracking_no,status,estimated_date,delivered_at)
VALUES(seq_delivery_id.NEXTVAL,1000,'CGS-1000-20260501','delivered',SYSDATE-1,SYSTIMESTAMP-1);

COMMIT;

PROMPT ============================================
PROMPT Sample data inserted successfully!
PROMPT ============================================
PROMPT Accounts created (password: Admin@123):
PROMPT   admin@cerberusgadgets.com    (Admin)
PROMPT   techseller@cerberusgadgets.com (Seller)
PROMPT   customer@cerberusgadgets.com  (Customer)
PROMPT ============================================
PROMPT Products: 15 gadgets across 6 categories
PROMPT ============================================
