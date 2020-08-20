const User = require('../models/userModel');

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.create({ name, email, password });
    return res.json({ user });
  } catch (err) {
    // check mongodb duplicate key for email
    const error = { ...err };
    if (error.code === 11000) {
      return res.status(400).json({ error: 'This email already exists!' });
    }
    return res.status(500).json({ error });
  }
};
