const jwt = require('jsonwebtoken');

const User = require('../models/userModel');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN,
});

const createSendToken = (user, statusCode, req, res) => {
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
  const { name, email, password } = req.body;

  try {
    const user = await User.create({ name, email, password });
    return createSendToken(user, 201, req, res);
  } catch (err) {
    // check mongodb duplicate key for email
    console.log(err);
    const error = { ...err };
    if (error.code === 11000) {
      return res.status(400).json({ error: 'This email already exists!' });
    }
    return res.status(500).json({ error });
  }
};
