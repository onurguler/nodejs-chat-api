const mongoose = require('mongoose');

const PRIVATE_CHAT = 'private';
const GROUP_CHAT = 'group';

const conversationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [PRIVATE_CHAT, GROUP_CHAT],
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = { Conversation, PRIVATE_CHAT, GROUP_CHAT };
