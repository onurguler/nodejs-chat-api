const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('../models/userModel');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN,
});

const createSendToken = (user, statusCode, res) => {
  const currentUser = user;
  const token = signToken(user.id);

  currentUser.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user: currentUser },
  });
};

exports.signup = async (req, res) => {
  const {
    name,
    username,
    email,
    password,
  } = req.body;

  try {
    const user = await User.create({
      name,
      username,
      email,
      password,
    });

    return createSendToken(user, 201, res);
  } catch (err) {
    // check mongodb duplicate key for username or email
    const error = { ...err };
    if (error.code === 11000) {
      if (error.keyPattern.username && error.keyPattern.username === 1) {
        return res.status(400).json({ status: 'error', message: 'This username already exists.' });
      }

      if (error.keyPattern.email && error.keyPattern.email === 1) {
        return res.status(400).json({ status: 'error', message: 'This email already exists.' });
      }
    }
    return res.status(500).json({
      status: 'error',
      message: 'Server error!',
    });
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Please provide email and password!',
    });
  }

  try {
    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password +email');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password',
      });
    }

    // If everything ok, send token to client
    return createSendToken(user, 200, res);
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error!',
    });
  }
};

exports.protect = async (req, res, next) => {
  // Get token from headers
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // eslint-disable-next-line prefer-destructuring
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'You are not logged in! Please log in to get access.',
    });
  }

  try {
    // Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token does no longer exists.',
      });
    }

    // grant access to protected route
    req.user = user;
    return next();
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error.',
    });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id).select('+password +email');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found with that id!',
      });
    }

    if (!(await user.correctPassword(currentPassword, user.password))) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password does not match!',
      });
    }

    user.password = newPassword;

    await user.save();

    return res.json({
      status: 'success',
      message: 'Your password was succesfully changed.',
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Server Error!',
    });
  }
};
