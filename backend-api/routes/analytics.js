const router = require('express').Router();
const auth   = require('../middleware/auth');
const role   = require('../middleware/role');
const ctrl   = require('../controllers/analyticsController');
router.get('/overview',             auth, role('admin','seller'), ctrl.getOverview);
router.get('/revenue',              auth, role('admin','seller'), ctrl.getRevenue);
router.get('/user-activity/:userId',auth, role('admin'),          ctrl.getUserActivity);
module.exports = router;
