const express = require('express');
const userController = require('../../controllers/userController');
const authController = require('../../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.route('/me')
  .get(userController.getMe, userController.getUser)
  .patch(userController.updateMe);

router.route('/me/avatar')
  .patch(userController.upload.single('avatar'), userController.updateAvatar);

router.route('/')
  .get(userController.getAllUsers);

router.route('/:id')
  .get(userController.getUser);

router.route('/:id/avatar/:filename')
  .get(userController.getUserAvatar);

router.route('/user/:username')
  .get(userController.getUserByUsername);

module.exports = router;
