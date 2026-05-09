const router = require('express').Router();
const auth   = require('../middleware/auth');
const role   = require('../middleware/role');
const ctrl   = require('../controllers/wishlistController');
router.get('/',               auth, role('customer'), ctrl.getWishlist);
router.post('/',              auth, role('customer'), ctrl.addToWishlist);
router.delete('/:productId',  auth, role('customer'), ctrl.removeFromWishlist);
module.exports = router;
