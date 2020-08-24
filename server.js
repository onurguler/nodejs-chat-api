/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('./models/userModel');
const { Conversation } = require('./models/conversationModel');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './.env' });
const app = require('./app');

const server = http.createServer(app);
const io = socketio(server);

const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
}).then(() => console.log('DB connection successful!'));

// Socket token authentication middleware
io.use(async (socket, next) => {
  try {
    const decoded = await promisify(jwt.verify)(socket.handshake.query.auth_token,
      process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error('Authentication Error'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication Error'));
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');
  console.log(socket.user.id);

  socket.on('conversation', async (data) => {
    console.log(`On conversation: ${data.id}`);
    try {
      const conversation = await Conversation.findById(data.id);

      if (conversation) {
        const userInConversation = conversation.participants
          .filter((id) => id.toString() === socket.user.id.toString()).length > 0;

        if (userInConversation) {
          console.log(`user joined: conversation_${conversation.id}`);
          socket.join(`conversation_${conversation.id}`);
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
});

app.io = io;

const PORT = process.env.PORT || 3000;

const listening = server.listen(PORT, () => console.log(`Server started on port: ${PORT}`));

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  listening.close(() => {
    process.exit(1);
  });
});
