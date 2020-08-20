const { Conversation, PRIVATE_CHAT } = require('../models/conversationModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');

exports.sendMessage = async (req, res) => {
  const { text } = req.body;

  try {
    const recipient = await User.findById(req.params.id);

    // check recipient user is exists
    if (!recipient) {
      return res.status(404).json({
        success: 'error',
        message: 'User not found with that id!',
      });
    }

    // check conversation exists
    let conversation = await Conversation.findOne({
      type: PRIVATE_CHAT,
      participants: { $in: [req.user.id, req.params.id] },
    });

    // If conversation does not exists, create a new conversation
    if (!conversation) {
      conversation = new Conversation({
        type: PRIVATE_CHAT,
        participants: [req.user.id, recipient.id],
      });

      await conversation.save();
    }

    // Create message
    const message = await Message.create({
      user: req.user.id,
      conversation: conversation.id,
      text,
    });

    return res.json({
      status: 'success',
      data: { message },
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error!',
    });
  }
};
