// todo: using jwt as async or sync pros and cons?
// todo: about the expiresIn, let's say the user is logged in and after the token expires, the user is still using the app, what should we do? what is the best practice? is like deleting it and replacing it with a new one like before it ends in three hour or so is a good idea? or is there a way to extend the token expiration time?
const jwt = require("jsonwebtoken");

// todo: add a verify token function

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });

module.exports = generateToken;
