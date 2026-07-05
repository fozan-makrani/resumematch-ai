// Centralized error handler — every route just calls next(err) on failure
// instead of writing its own try/catch response formatting.
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation errors (e.g. missing required field)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Validation failed', details: messages });
  }

  // Mongoose duplicate key error (e.g. email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ error: `${field} already in use` });
  }

  // Fallback — don't leak internal error details in production
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message;

  res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;