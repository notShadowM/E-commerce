/* eslint-disable no-restricted-syntax */
const xss = require("xss");

// Helper function to sanitize an object
const sanitizeObject = (obj) => {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = xss(obj[key]); // Sanitize string
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      obj[key] = sanitizeObject(obj[key]); // Recursively sanitize objects
    }
  }
  return obj;
};

// !Middleware to sanitize request body, query, and params
const sanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

module.exports = sanitizeMiddleware;
