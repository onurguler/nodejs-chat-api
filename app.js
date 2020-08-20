const express = require('express');
const morgan = require('morgan');

const authRouter = require('./routes/api/authRoutes');
const userRouter = require('./routes/api/userRoutes');
const chatRouter = require('./routes/api/chatRoutes');

const app = express();

// Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/chats', chatRouter);

module.exports = app;
