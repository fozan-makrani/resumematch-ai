const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @route  POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "An account with this email already exists" });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err); // delegate to centralized error handler (catches Mongoose validation errors too)
  }
};

// @route  POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // password has `select: false` in the schema, so we explicitly request it here
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    // Intentionally vague error message — don't reveal whether the email
    // exists or the password was wrong. Prevents user enumeration.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    // req.user is already attached by the `protect` middleware
    res.status(200).json({
      user: { id: req.user._id, name: req.user.name, email: req.user.email },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, getMe };