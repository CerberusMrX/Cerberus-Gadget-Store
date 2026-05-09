const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/paymentController');
router.post('/',         auth, ctrl.processPayment);
router.get('/:orderId',  auth, ctrl.getPayment);
module.exports = router;
