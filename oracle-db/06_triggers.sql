-- ============================================================
-- CERBERUS GADGET STORE - Triggers
-- File: 06_triggers.sql
-- ============================================================

-- ============================================================
-- TRIGGER 1: Reduce stock after order item insert
-- (Backup enforcement — procedures also do this)
-- ============================================================
CREATE OR REPLACE TRIGGER trg_reduce_stock_after_order
  AFTER INSERT ON order_items
  FOR EACH ROW
BEGIN
  UPDATE inventory
  SET quantity   = quantity - :NEW.quantity,
      updated_at = SYSTIMESTAMP
  WHERE product_id = :NEW.product_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE_APPLICATION_ERROR(-20050,
      'Stock update failed for product ' || :NEW.product_id || ': ' || SQLERRM);
END trg_reduce_stock_after_order;
/

-- ============================================================
-- TRIGGER 2: Prevent negative stock
-- ============================================================
CREATE OR REPLACE TRIGGER trg_prevent_negative_stock
  BEFORE UPDATE OF quantity ON inventory
  FOR EACH ROW
BEGIN
  IF :NEW.quantity < 0 THEN
    RAISE_APPLICATION_ERROR(-20051,
      'Negative stock not allowed for product_id: ' || :NEW.product_id ||
      '. Current: ' || :OLD.quantity || ', Requested change would result in: ' || :NEW.quantity);
  END IF;

  -- Auto-update timestamp
  :NEW.updated_at := SYSTIMESTAMP;
END trg_prevent_negative_stock;
/

-- ============================================================
-- TRIGGER 3: Payment audit log
-- Logs every payment status change
-- ============================================================
CREATE OR REPLACE TRIGGER trg_payment_audit_log
  AFTER INSERT OR UPDATE OF status ON payments
  FOR EACH ROW
BEGIN
  IF INSERTING THEN
    INSERT INTO payment_audit_log(log_id, payment_id, old_status, new_status, changed_by)
    VALUES(seq_audit_log_id.NEXTVAL, :NEW.payment_id, NULL, :NEW.status, USER);
  ELSIF UPDATING THEN
    IF :OLD.status != :NEW.status THEN
      INSERT INTO payment_audit_log(log_id, payment_id, old_status, new_status, changed_by)
      VALUES(seq_audit_log_id.NEXTVAL, :NEW.payment_id, :OLD.status, :NEW.status, USER);
    END IF;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Non-blocking: log the error but don't fail the main transaction
    NULL;
END trg_payment_audit_log;
/

-- ============================================================
-- TRIGGER 4: Auto-update product rating on review insert/update
-- ============================================================
CREATE OR REPLACE TRIGGER trg_update_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
DECLARE
  v_product_id NUMBER;
  v_avg_rating NUMBER;
  v_count      NUMBER;
BEGIN
  v_product_id := CASE WHEN DELETING THEN :OLD.product_id ELSE :NEW.product_id END;

  SELECT AVG(rating), COUNT(*)
  INTO v_avg_rating, v_count
  FROM reviews
  WHERE product_id = v_product_id;

  UPDATE products
  SET rating_avg   = NVL(v_avg_rating, 0),
      rating_count = NVL(v_count, 0),
      updated_at   = SYSTIMESTAMP
  WHERE product_id = v_product_id;
EXCEPTION
  WHEN OTHERS THEN NULL;
END trg_update_product_rating;
/

-- ============================================================
-- TRIGGER 5: Auto-update order/product timestamps
-- ============================================================
CREATE OR REPLACE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
BEGIN
  :NEW.updated_at := SYSTIMESTAMP;
END trg_orders_updated_at;
/

CREATE OR REPLACE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
BEGIN
  :NEW.updated_at := SYSTIMESTAMP;
END trg_products_updated_at;
/

PROMPT Triggers created successfully!
