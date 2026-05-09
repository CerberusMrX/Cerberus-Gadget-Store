const router = require('express').Router();
const auth   = require('../middleware/auth');
const role   = require('../middleware/role');
const ctrl   = require('../controllers/reviewController');
router.get('/product/:id', ctrl.getProductReviews);
router.post('/', auth, role('customer'), ctrl.addReview);
module.exports = router;
