-- ============================================================
-- CERBERUS GADGET STORE - PL/SQL Functions & Reports
-- File: 05_plsql_functions.sql
-- ============================================================

-- ============================================================
-- FUNCTION: Get_Total_Revenue
-- Returns total revenue for a date range
-- ============================================================
CREATE OR REPLACE FUNCTION Get_Total_Revenue (
  p_start_date IN DATE DEFAULT TRUNC(SYSDATE,'MM'),
  p_end_date   IN DATE DEFAULT SYSDATE
) RETURN NUMBER
AS
  v_revenue NUMBER := 0;
BEGIN
  SELECT NVL(SUM(p.amount), 0)
  INTO v_revenue
  FROM payments p
  JOIN orders   o ON o.order_id = p.order_id
  WHERE p.status    = 'completed'
    AND p.paid_at  >= p_start_date
    AND p.paid_at  <= p_end_date + 1;  -- include full end day

  RETURN v_revenue;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 0;
END Get_Total_Revenue;
/

-- ============================================================
-- FUNCTION: Get_Top_Selling_Product
-- Returns the product_id of the best selling product
-- ============================================================
CREATE OR REPLACE FUNCTION Get_Top_Selling_Product (
  p_start_date IN DATE DEFAULT ADD_MONTHS(SYSDATE, -1),
  p_end_date   IN DATE DEFAULT SYSDATE
) RETURN NUMBER
AS
  v_product_id NUMBER;
BEGIN
  SELECT product_id INTO v_product_id
  FROM (
    SELECT oi.product_id, SUM(oi.quantity) AS total_sold
    FROM order_items oi
    JOIN orders      o  ON o.order_id = oi.order_id
    WHERE o.status   NOT IN ('cancelled','refunded')
      AND o.created_at >= p_start_date
      AND o.created_at <= p_end_date + 1
    GROUP BY oi.product_id
    ORDER BY total_sold DESC
  )
  WHERE ROWNUM = 1;

  RETURN v_product_id;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RETURN NULL;
  WHEN OTHERS THEN
    RETURN NULL;
END Get_Top_Selling_Product;
/

-- ============================================================
-- REPORT VIEW: Top Selling Products
-- ============================================================
CREATE OR REPLACE VIEW vw_top_selling_products AS
SELECT
  p.product_id,
  p.name         AS product_name,
  p.brand,
  c.name         AS category,
  SUM(oi.quantity)          AS total_units_sold,
  SUM(oi.quantity * oi.unit_price) AS total_revenue,
  COUNT(DISTINCT o.order_id) AS total_orders
FROM order_items oi
JOIN products p ON p.product_id = oi.product_id
JOIN categories c ON c.category_id = p.category_id
JOIN orders   o ON o.order_id   = oi.order_id
WHERE o.status NOT IN ('cancelled','refunded')
GROUP BY p.product_id, p.name, p.brand, c.name
ORDER BY total_units_sold DESC;

-- ============================================================
-- REPORT VIEW: Revenue by Date
-- ============================================================
CREATE OR REPLACE VIEW vw_revenue_by_date AS
SELECT
  TRUNC(p.paid_at) AS sale_date,
  COUNT(p.payment_id)  AS total_transactions,
  SUM(p.amount)        AS daily_revenue,
  AVG(p.amount)        AS avg_order_value
FROM payments p
WHERE p.status = 'completed'
GROUP BY TRUNC(p.paid_at)
ORDER BY sale_date DESC;

-- ============================================================
-- REPORT VIEW: Failed Payments
-- ============================================================
CREATE OR REPLACE VIEW vw_failed_payments AS
SELECT
  p.payment_id,
  p.order_id,
  o.customer_id,
  cu.first_name || ' ' || cu.last_name AS customer_name,
  p.amount,
  p.method,
  p.transaction_ref,
  p.created_at AS attempted_at
FROM payments  p
JOIN orders    o  ON o.order_id    = p.order_id
JOIN customers cu ON cu.customer_id = o.customer_id
WHERE p.status = 'failed'
ORDER BY p.created_at DESC;

-- ============================================================
-- REPORT VIEW: Low Stock Alerts
-- ============================================================
CREATE OR REPLACE VIEW vw_low_stock_alerts AS
SELECT
  i.product_id,
  p.name         AS product_name,
  p.brand,
  s.store_name   AS seller,
  i.quantity     AS current_stock,
  i.low_stock_threshold,
  u.email        AS seller_email
FROM inventory i
JOIN products  p ON p.product_id = i.product_id
JOIN sellers   s ON s.seller_id  = p.seller_id
JOIN users     u ON u.user_id    = s.user_id
WHERE i.quantity <= i.low_stock_threshold
ORDER BY i.quantity ASC;

PROMPT Functions and Report Views created successfully!
