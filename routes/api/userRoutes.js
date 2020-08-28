const express = require('express');
const userController = require('../../controllers/userController');
const authController = require('../../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.route('/me')
  .get(userController.getMe, userController.getUser)
  .patch(userController.updateMe);

router.route('/')
  .get(userController.getAllUsers);

router.route('/:id')
  .get(userController.getUser);

router.route('/user/:username')
  .get(userController.getUserByUsername);

module.exports = router;
