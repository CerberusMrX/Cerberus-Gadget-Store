const router = require('express').Router();
const auth   = require('../middleware/auth');
const role   = require('../middleware/role');
const ctrl   = require('../controllers/sellerController');
router.get('/dashboard', auth, role('seller'), ctrl.getDashboard);
router.get('/products',  auth, role('seller'), ctrl.getSellerProducts);
router.get('/orders',    auth, role('seller'), ctrl.getSellerOrders);
module.exports = router;
