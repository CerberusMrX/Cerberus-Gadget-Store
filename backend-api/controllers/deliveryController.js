/**
 * CERBERUS GADGET STORE - Delivery Controller
 * File: backend-api/controllers/deliveryController.js
 */
const { execute } = require('../config/database');
const { DeliveryEvent } = require('../config/mongodb');

// GET /api/delivery/:orderId
exports.getTracking = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const result = await execute(
      `SELECT d.*,o.status AS order_status FROM deliveries d
       JOIN orders o ON o.order_id=d.order_id
       WHERE d.order_id=:id`, { id:parseInt(orderId) }
    );
    if(result.rows.length===0) return res.status(404).json({success:false,message:'Delivery not found'});

    const events = await DeliveryEvent.find({order_id:parseInt(orderId)}).sort({timestamp:1}).lean();
    res.json({ success:true, data:{...result.rows[0], events} });
  } catch(err){ next(err); }
};

// PUT /api/delivery/:orderId/status (admin/seller)
exports.updateStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status, location, notes } = req.body;

    await execute(
      `UPDATE deliveries SET status=:status,
       delivered_at=CASE WHEN :status2='delivered' THEN SYSTIMESTAMP ELSE delivered_at END
       WHERE order_id=:id`,
      { status, status2:status, id:parseInt(orderId) }
    );

    // Update order status too
    const orderStatus = { pending:'confirmed', picked_up:'processing',
      in_transit:'shipped', delivered:'delivered' }[status] || 'processing';
    await execute(
      `UPDATE orders SET status=:status WHERE order_id=:id`,
      { status:orderStatus, id:parseInt(orderId) }
    );

    // Log to MongoDB
    await DeliveryEvent.create({
      order_id:parseInt(orderId), status, location: location||'',
      notes: notes||'', event_type:'status_change'
    });

    res.json({ success:true, message:'Delivery status updated' });
  } catch(err){ next(err); }
};
