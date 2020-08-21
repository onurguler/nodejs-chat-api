const express = require('express');
const chatController = require('../../controllers/chatController');
const authController = require('../../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.route('/')
  .get(chatController.getAllConversations);

router.route('/:id')
  .post(chatController.sendMessageToUser);

router.route('/conversations/:id')
  .post(chatController.sendMessageToConversation);

module.exports = router;
