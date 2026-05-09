/**
 * CERBERUS GADGET STORE - Auth Routes
 * File: backend-api/routes/auth.js
 */
const router = require('express').Router();
const auth   = require('../middleware/auth');
const ctrl   = require('../controllers/authController');

router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);
router.post('/refresh',  ctrl.refresh);
router.post('/logout',   auth, ctrl.logout);
router.get( '/me',       auth, ctrl.getMe);
router.put( '/profile',  auth, ctrl.updateProfile);

module.exports = router;
