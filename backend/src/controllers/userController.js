const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");

const buildAvatarUrl = (filename) => `/uploads/avatars/${filename}`;

exports.getProfile = async (req, res, next) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (name !== undefined && !name.trim()) {
      throw new ErrorResponse("Name is required", 400);
    }

    if (email !== undefined && !email.trim()) {
      throw new ErrorResponse("Email is required", 400);
    }

    if (email) {
      const existing = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: req.user._id },
      });
      if (existing) {
        throw new ErrorResponse("Email already in use", 409);
      }
    }

    const updates = {};
    if (name !== undefined) {
      updates.name = name.trim();
    }
    if (email !== undefined) {
      updates.email = email.toLowerCase().trim();
    }

    if (req.file) {
      updates.avatarUrl = buildAvatarUrl(req.file.filename);
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      throw new ErrorResponse("User not found", 404);
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
