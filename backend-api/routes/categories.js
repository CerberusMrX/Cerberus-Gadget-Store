const router = require('express').Router();
const ctrl   = require('../controllers/categoryController');
router.get('/', ctrl.getCategories);
module.exports = router;
