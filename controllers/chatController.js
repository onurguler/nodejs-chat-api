const { Conversation, PRIVATE_CHAT } = require('../models/conversationModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');

exports.sendMessageToUser = async (req, res) => {
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
    }

    // Create message
    const message = await Message.create({
      user: req.user.id,
      conversation: conversation.id,
      text,
    });

    conversation.lastMessage = message.id;

    await conversation.save();

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

exports.getAllConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: {
        $in: [req.user.id],
      },
    }).populate('participants').populate('lastMessage');

    return res.json({
      status: 'success',
      data: { conversations },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error!',
    });
  }
};

exports.sendMessageToConversation = async (req, res) => {
  const { text } = req.body;

  try {
    // check conversation exists
    const conversation = await Conversation.findById(req.params.id);

    // If conversation does not exists, create a new conversation
    if (!conversation) {
      return res.status(404).json({
        status: 'error',
        message: 'Conversation not found with that id!',
      });
    }

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(404).json({
        status: 'error',
        message: 'Conversation not found with that id!',
      });
    }

    // Create message
    const message = await Message.create({
      user: req.user.id,
      conversation: conversation.id,
      text,
    });

    conversation.lastMessage = message.id;

    await conversation.save();

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

exports.getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id).populate('participants').populate('lastMessage');

    if (conversation === null) {
      return res.status(404).json({
        status: 'fail',
        message: 'Conversation not found that id!',
      });
    }

    const userInConversation = conversation.participants
      .filter((user) => user.id.toString() === req.user.id.toString()).length > 0;

    if (!userInConversation) {
      return res.status(404).json({
        status: 'fail',
        message: 'Conversation not found that id!',
      });
    }

    return res.json({ status: 'success', data: { conversation } });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error!',
    });
  }
};

exports.getConversationMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (conversation === null) {
      return res.status(404).json({
        status: 'fail',
        message: 'Conversation not found that id!',
      });
    }

    const userInConversation = conversation.participants
      .filter((id) => id.toString() === req.user.id.toString()).length > 0;

    if (!userInConversation) {
      return res.status(404).json({
        status: 'fail',
        message: 'Conversation not found that id!',
      });
    }

    const messages = await Message.find({ conversation: req.params.id });

    return res.json({ status: 'success', data: { messages } });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error!',
    });
  }
};
