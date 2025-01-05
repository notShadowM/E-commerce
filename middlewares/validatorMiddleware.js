const { validationResult } = require("express-validator");
// todo: use the custom error class and get the first error message from the array
// @desc find errors in the request and return them
const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = validatorMiddleware;