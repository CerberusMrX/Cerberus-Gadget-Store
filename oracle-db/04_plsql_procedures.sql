-- ============================================================
-- CERBERUS GADGET STORE - PL/SQL Stored Procedures
-- File: 04_plsql_procedures.sql
-- ============================================================

-- ============================================================
-- PROCEDURE: Place_Order
-- Places an order from a customer's cart
-- ============================================================
CREATE OR REPLACE PROCEDURE Place_Order (
  p_customer_id    IN  NUMBER,
  p_shipping_addr  IN  VARCHAR2,
  p_shipping_city  IN  VARCHAR2,
  p_notes          IN  VARCHAR2 DEFAULT NULL,
  p_order_id       OUT NUMBER,
  p_total          OUT NUMBER
)
AS
  v_cart_id     NUMBER;
  v_item_count  NUMBER;
  v_total       NUMBER := 0;
  v_price       NUMBER;
  v_qty         NUMBER;
  v_stock       NUMBER;
  v_prod_id     NUMBER;
  v_order_id    NUMBER;

  -- Custom exceptions
  e_empty_cart     EXCEPTION;
  e_out_of_stock   EXCEPTION;
  PRAGMA EXCEPTION_INIT(e_empty_cart,   -20001);
  PRAGMA EXCEPTION_INIT(e_out_of_stock, -20002);
BEGIN
  -- Get the customer's cart
  BEGIN
    SELECT cart_id INTO v_cart_id
    FROM cart
    WHERE customer_id = p_customer_id
    AND ROWNUM = 1;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20001, 'Cart is empty or does not exist.');
  END;

  -- Count items in cart
  SELECT COUNT(*) INTO v_item_count
  FROM cart_items WHERE cart_id = v_cart_id;

  IF v_item_count = 0 THEN
    RAISE_APPLICATION_ERROR(-20001, 'Cart has no items.');
  END IF;

  -- Validate stock and calculate total
  FOR ci IN (
    SELECT ci.product_id, ci.quantity, p.price,
           DECODE(p.discount_pct, 0, p.price, p.price * (1 - p.discount_pct/100)) AS final_price,
           i.quantity AS stock
    FROM cart_items ci
    JOIN products  p ON p.product_id = ci.product_id
    JOIN inventory i ON i.product_id = ci.product_id
    WHERE ci.cart_id = v_cart_id
  ) LOOP
    IF ci.stock < ci.quantity THEN
      RAISE_APPLICATION_ERROR(-20002,
        'Insufficient stock for product ID: ' || ci.product_id);
    END IF;
    v_total := v_total + (ci.final_price * ci.quantity);
  END LOOP;

  -- Create the order
  v_order_id := seq_order_id.NEXTVAL;
  INSERT INTO orders(order_id, customer_id, status, total_amount, shipping_address, shipping_city, notes)
  VALUES(v_order_id, p_customer_id, 'confirmed', v_total, p_shipping_addr, p_shipping_city, p_notes);

  -- Copy cart items to order_items and reduce stock
  FOR ci IN (
    SELECT ci.product_id, ci.quantity,
           DECODE(p.discount_pct, 0, p.price, p.price * (1 - p.discount_pct/100)) AS final_price
    FROM cart_items ci
    JOIN products  p ON p.product_id = ci.product_id
    WHERE ci.cart_id = v_cart_id
  ) LOOP
    INSERT INTO order_items(order_item_id, order_id, product_id, quantity, unit_price)
    VALUES(seq_order_item_id.NEXTVAL, v_order_id, ci.product_id, ci.quantity, ci.final_price);

    -- Reduce stock (trigger will also enforce non-negative)
    UPDATE inventory
    SET quantity   = quantity - ci.quantity,
        updated_at = SYSTIMESTAMP
    WHERE product_id = ci.product_id;
  END LOOP;

  -- Create delivery record
  INSERT INTO deliveries(delivery_id, order_id, tracking_no, status, estimated_date)
  VALUES(seq_delivery_id.NEXTVAL, v_order_id,
         'CGS-' || TO_CHAR(v_order_id) || '-' || TO_CHAR(SYSDATE,'YYYYMMDD'),
         'pending', SYSDATE + 5);

  -- Clear the cart
  DELETE FROM cart_items WHERE cart_id = v_cart_id;

  -- Return values
  p_order_id := v_order_id;
  p_total    := v_total;

  COMMIT;
  DBMS_OUTPUT.PUT_LINE('Order ' || v_order_id || ' placed successfully. Total: $' || v_total);

EXCEPTION
  WHEN e_empty_cart THEN
    ROLLBACK;
    RAISE;
  WHEN e_out_of_stock THEN
    ROLLBACK;
    RAISE;
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE_APPLICATION_ERROR(-20099, 'Place_Order failed: ' || SQLERRM);
END Place_Order;
/

-- ============================================================
-- PROCEDURE: Process_Payment
-- Records payment for an order
-- ============================================================
CREATE OR REPLACE PROCEDURE Process_Payment (
  p_order_id      IN  NUMBER,
  p_amount        IN  NUMBER,
  p_method        IN  VARCHAR2,
  p_txn_ref       IN  VARCHAR2,
  p_payment_id    OUT NUMBER,
  p_status        OUT VARCHAR2
)
AS
  v_order_total   NUMBER;
  v_order_exists  NUMBER;
  v_payment_id    NUMBER;
  e_order_not_found EXCEPTION;
  e_amount_mismatch EXCEPTION;
BEGIN
  -- Verify order exists
  SELECT COUNT(*), total_amount
  INTO v_order_exists, v_order_total
  FROM orders
  WHERE order_id = p_order_id
  GROUP BY total_amount;

  IF v_order_exists = 0 THEN
    RAISE_APPLICATION_ERROR(-20010, 'Order ID ' || p_order_id || ' not found.');
  END IF;

  -- Validate amount (allow 1% tolerance for rounding)
  IF ABS(p_amount - v_order_total) > (v_order_total * 0.01) THEN
    RAISE_APPLICATION_ERROR(-20011, 'Payment amount mismatch. Expected: ' || v_order_total);
  END IF;

  v_payment_id := seq_payment_id.NEXTVAL;

  -- Insert payment record
  INSERT INTO payments(payment_id, order_id, amount, method, status, transaction_ref, paid_at)
  VALUES(v_payment_id, p_order_id, p_amount, p_method, 'completed', p_txn_ref, SYSTIMESTAMP);

  -- Update order status
  UPDATE orders
  SET status = 'processing', updated_at = SYSTIMESTAMP
  WHERE order_id = p_order_id;

  p_payment_id := v_payment_id;
  p_status     := 'completed';

  COMMIT;
  DBMS_OUTPUT.PUT_LINE('Payment ' || v_payment_id || ' processed successfully.');

EXCEPTION
  WHEN OTHERS THEN
    -- Insert failed payment record
    BEGIN
      INSERT INTO payments(payment_id, order_id, amount, method, status, transaction_ref)
      VALUES(seq_payment_id.NEXTVAL, p_order_id, p_amount, p_method, 'failed', p_txn_ref);
      COMMIT;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    p_status := 'failed';
    RAISE_APPLICATION_ERROR(-20099, 'Process_Payment failed: ' || SQLERRM);
END Process_Payment;
/

-- ============================================================
-- PROCEDURE: Update_Stock
-- Manually adjusts inventory for a product
-- ============================================================
CREATE OR REPLACE PROCEDURE Update_Stock (
  p_product_id  IN NUMBER,
  p_quantity    IN NUMBER,
  p_action      IN VARCHAR2  -- 'ADD' or 'SET'
)
AS
  v_exists NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_exists FROM inventory WHERE product_id = p_product_id;

  IF v_exists = 0 THEN
    RAISE_APPLICATION_ERROR(-20020, 'Product ID ' || p_product_id || ' not found in inventory.');
  END IF;

  IF p_action = 'ADD' THEN
    UPDATE inventory
    SET quantity   = quantity + p_quantity,
        updated_at = SYSTIMESTAMP
    WHERE product_id = p_product_id;
  ELSIF p_action = 'SET' THEN
    IF p_quantity < 0 THEN
      RAISE_APPLICATION_ERROR(-20021, 'Cannot set negative stock.');
    END IF;
    UPDATE inventory
    SET quantity   = p_quantity,
        updated_at = SYSTIMESTAMP
    WHERE product_id = p_product_id;
  ELSE
    RAISE_APPLICATION_ERROR(-20022, 'Invalid action. Use ADD or SET.');
  END IF;

  COMMIT;
  DBMS_OUTPUT.PUT_LINE('Stock updated for product ' || p_product_id);
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE_APPLICATION_ERROR(-20099, 'Update_Stock failed: ' || SQLERRM);
END Update_Stock;
/

-- ============================================================
-- PROCEDURE: Cancel_Order
-- Cancels an order and restores stock
-- ============================================================
CREATE OR REPLACE PROCEDURE Cancel_Order (
  p_order_id    IN NUMBER,
  p_reason      IN VARCHAR2 DEFAULT 'Customer requested cancellation'
)
AS
  v_status      VARCHAR2(30);
  v_pay_status  VARCHAR2(30);
  e_cannot_cancel EXCEPTION;
BEGIN
  -- Get current order status
  BEGIN
    SELECT status INTO v_status FROM orders WHERE order_id = p_order_id;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RAISE_APPLICATION_ERROR(-20030, 'Order ' || p_order_id || ' not found.');
  END;

  -- Only pending/confirmed/processing orders can be cancelled
  IF v_status NOT IN ('pending','confirmed','processing') THEN
    RAISE_APPLICATION_ERROR(-20031,
      'Cannot cancel order in status: ' || v_status);
  END IF;

  -- Restore stock for each item
  FOR oi IN (
    SELECT product_id, quantity FROM order_items WHERE order_id = p_order_id
  ) LOOP
    UPDATE inventory
    SET quantity   = quantity + oi.quantity,
        updated_at = SYSTIMESTAMP
    WHERE product_id = oi.product_id;
  END LOOP;

  -- Update order status
  UPDATE orders
  SET status     = 'cancelled',
      notes      = notes || ' | Cancelled: ' || p_reason,
      updated_at = SYSTIMESTAMP
  WHERE order_id = p_order_id;

  -- Refund payment if completed
  UPDATE payments
  SET status = 'refunded'
  WHERE order_id = p_order_id AND status = 'completed';

  COMMIT;
  DBMS_OUTPUT.PUT_LINE('Order ' || p_order_id || ' cancelled. Stock restored.');
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    RAISE_APPLICATION_ERROR(-20099, 'Cancel_Order failed: ' || SQLERRM);
END Cancel_Order;
/

PROMPT PL/SQL Procedures created successfully!
