/**
 * CERBERUS GADGET STORE - Product Routes
 * File: backend-api/routes/products.js
 */
const router = require('express').Router();
const auth   = require('../middleware/auth');
const role   = require('../middleware/role');
const upload = require('../middleware/upload');
const ctrl   = require('../controllers/productController');

router.get('/',          ctrl.getProducts);
router.get('/featured',  ctrl.getFeatured);
router.get('/:id',       ctrl.getProduct);
router.post('/',   auth, role('seller','admin'), upload.single('image'), ctrl.createProduct);
router.put('/:id', auth, role('seller','admin'), upload.single('image'), ctrl.updateProduct);
router.delete('/:id', auth, role('seller','admin'), ctrl.deleteProduct);

module.exports = router;
