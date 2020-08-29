const fs = require('fs');
const multer = require('multer');
const { promisify } = require('util');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/userModel');

const unlinkAsync = promisify(fs.unlink);

exports.upload = multer({ dest: 'tmp/uploads' });

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found with that id!',
      });
    }

    return res.json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error!',
    });
  }
};

exports.getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found with that username!',
      });
    }

    return res.json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error!',
    });
  }
};

exports.updateMe = async (req, res) => {
  const { name, username, email } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.user.id,
      { name, username, email },
      { new: true, runValidators: true }).select('+email');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found with that id',
      });
    }

    return res.json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Server Error!',
    });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+email');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found with that id!',
      });
    }

    if (!req.file) {
      // Delete avatar from user
      return res.status(400).json({
        status: 'error',
        message: 'File not sended',
      });
    }

    // create media dir if not exists
    if (!(await promisify(fs.exists)('media'))) {
      await promisify(fs.mkdir)('media');
    }

    // create users dir if not exists
    if (!(await promisify(fs.exists)('media/users'))) {
      await promisify(fs.mkdir)('media/users');
    }

    // create user id dir if not exists
    if (!(await promisify(fs.exists)(`media/users/${user.id}`))) {
      await promisify(fs.mkdir)(`media/users/${user.id}`);
    }

    // Save avatar to disk
    const tempPath = req.file.path;
    const newFileName = `${uuidv4()}-${Date.now()}${path.extname(req.file.originalname).toLowerCase()}`;
    const targetPath = path.join(`media/users/${user.id}/${newFileName}`);

    await promisify(fs.copyFile)(tempPath, targetPath);

    // delete image from tmp dir
    await unlinkAsync(req.file.path);

    // Save avatar filename to user model
    user.avatar = newFileName;

    await user.save();

    return res.json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error!',
    });
  }
};

exports.getUserAvatar = async (req, res) => {
  try {
    return res.sendFile(path.join(__dirname, `../media/users/${req.params.id}/${req.params.filename}`));
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Server error!',
    });
  }
};
