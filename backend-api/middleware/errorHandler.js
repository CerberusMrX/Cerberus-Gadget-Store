/**
 * CERBERUS GADGET STORE - Global Error Handler
 * File: backend-api/middleware/errorHandler.js
 */

const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Max 5MB.' });
  }

  // Oracle DB errors
  if (err.errorNum) {
    if (err.errorNum === 1) {
      return res.status(409).json({ success: false, message: 'Duplicate entry — record already exists.' });
    }
    if (err.errorNum === 2291) {
      return res.status(400).json({ success: false, message: 'Referenced record does not exist.' });
    }
    return res.status(500).json({ success: false, message: `Database error: ${err.message}` });
  }

  // Validation errors
  if (err.type === 'validation') {
    return res.status(422).json({ success: false, message: err.message, errors: err.errors });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};

module.exports = errorHandler;
