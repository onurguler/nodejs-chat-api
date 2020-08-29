const express = require('express');
const authController = require('../../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);

router.use(authController.protect);

router.patch('/change-password', authController.changePassword);

module.exports = router;
