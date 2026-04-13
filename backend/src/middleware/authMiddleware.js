const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ErrorResponse("Not authorized", 401);
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not set");
    }

    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new ErrorResponse("User not found", 404);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
