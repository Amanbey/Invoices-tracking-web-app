const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validatePassword = (password = "") => {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
};

const createToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new ErrorResponse("Name, email, and password are required", 400);
    }

    if (!emailRegex.test(email.trim())) {
      throw new ErrorResponse("Enter a valid email address", 400);
    }

    if (!validatePassword(password)) {
      throw new ErrorResponse(
        "Password must be at least 8 characters and include letters and numbers",
        400
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      throw new ErrorResponse("Email already in use", 409);
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });
    const token = createToken(user._id);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ErrorResponse("Email and password are required", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      throw new ErrorResponse("Enter a valid email address", 400);
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw new ErrorResponse("Invalid credentials", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ErrorResponse("Invalid credentials", 401);
    }

    const token = createToken(user._id);
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res, next) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    next(error);
  }
};
