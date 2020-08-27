const express = require('express');
const chatController = require('../../controllers/chatController');
const authController = require('../../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.route('/')
  .get(chatController.getAllConversations);

router.route('/users/:username')
  .post(chatController.sendMessageToUser);

router.route('/conversations/:id')
  .get(chatController.getConversation)
  .post(chatController.sendMessageToConversation);

router.route('/conversations/:id/messages')
  .get(chatController.getConversationMessages);

module.exports = router;
