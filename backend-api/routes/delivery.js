const router = require('express').Router();
const auth   = require('../middleware/auth');
const role   = require('../middleware/role');
const ctrl   = require('../controllers/deliveryController');
router.get('/:orderId',        auth,                          ctrl.getTracking);
router.put('/:orderId/status', auth, role('admin','seller'),  ctrl.updateStatus);
module.exports = router;
