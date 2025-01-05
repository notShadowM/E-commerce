const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const bycrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const generateToken = require("../utils/gnerateToken");

// @desc Signup
// @route POST /api/v1/auth/signup
// @access Public
exports.signup = asyncHandler(async (req, res, next) => {
  const { email, name, password, slug } = req.body;

  const user = await User.create({
    email,
    name,
    password, // ! Password will be hashed in the schema pre middleware
    slug,
  });

  const token = generateToken(user._id);

  // todo: is saving the token in user model a good idea? should we make it max to 5 tokens or so?
  res.status(201).json({
    token,
    data: {
      user,
    },
  });
});

// @desc Login
// @route POST /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await bycrpt.compare(password, user.password))) {
    return next(new ApiError("Invalid credentials", 401));
  }

  const token = generateToken(user._id);

  res.status(200).json({
    token,
    data: {
      user,
    },
  });
});

// !i didn't use asyncHandler here because there are different types of errors that need to be handled, so i used try catch block
// todo: make this a middleware "authMiddleware.js"?
// @desc make sure the user is logged in (authenticated)
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ApiError("You are not logged in", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.userId);

    if (!user) {
      // todo: status code 404 or 401?
      return next(new ApiError("No user found with this token", 404));
    }

    // todo: i think the idea about using time for password change time is fine, but if we use the tokens array in the user model and by that we can just ignore this step and change the password change function and remove anything related to password change time in "./userService.js"
    // todo: so i may remove it
    if (user.passwordChangedAt) {
      const passChangeTimestamp = parseInt(
        user.passwordChangedAt.getTime() / 1000,
        10
      );
      if (passChangeTimestamp > decoded.iat) {
        return next(new ApiError("Password changed, please login again", 401));
      }
    }

    req.user = user;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError("Invalid token", 401));
    }
    if (error.name === "TokenExpiredError") {
      return next(new ApiError("Token expired", 401));
    }

    return next(error);
  }
};

// todo: i think we should make this a middleware "authMiddleware.js"
// @desc Authorization (user permissions)
exports.allowTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }

    next();
  };

// todo: use redis for saving the random 6 digit code and give it an expiration time of 5 minutes or so
// todo: if someone asks to send another code, how should we handle it? how many times should we let him ask? should we make a limit for the number of times he can ask for a code?
// todo: try using a link method? but in only backend it is kinda hard to apply :)
// @desc Forgot password
// @route POST /api/v1/auth/forgotpassword
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
  });

  // todo: what if the user is not found? should we send a message to the user that the email is not found? or should we just send a message that the email has been sent to the user email but in reality, we didn't send anything?
  // ! i checked linkedin with a fake big email and it said that the email has been sent to the email, but in reality, it didn't send anything imo
  if (!user) {
    return next(new ApiError("No user found with this email", 404));
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // !10 minutes
  user.passwordResetVerified = false;

  await user.save();

  const message = `Hi ${user.name}, \n\nWe received a request to reset your password on your ${process.env.APP_NAME} account. Your reset code is ${resetCode}. It will be valid for 10 minutes. If you didn't request this, you can ignore this email.\n\nThanks, \n${process.env.APP_NAME} team`;

  // todo: can't we just remove the upove user.save() inside the try and we empty the user.passwordResetCode and user.passwordResetExpires in the catch block? is that best? like 1 database request is better that 2 right?
  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset code",
      message,
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();

    return next(
      new ApiError(
        "There was an error sending the email. Please try again later",
        500
      )
    );
  }

  res.status(200).json({
    status: "success",
    message: "Reset code sent to your email",
  });
});

// todo: search for the best way to handle the reset code verification, isn't maybe using email from req.body and code more efficient? like the search for the user based on the code may be a little bit slower than the email
// @desc Verify reset code
// @route POST /api/v1/auth/verifyresetcode
// @access Public
exports.verifyResetCode = asyncHandler(async (req, res, next) => {
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError("Invalid or expired code", 400));
  }

  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Code verified",
  });
});

// todo: is this whole process the best way to reset the password? is there a better way? search for different ways to reset the password. because i think this way is not always secure, maybe there is a need for a token to be sent in the request body to reset the password with the email? and maybe there is a need a time limit, because if someone verified the reset code and waited for a long time, the code will still be valid and he can reset the password
// @desc Reset password
// @route POST /api/v1/auth/resetpassword
// @access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError("No user found with this email", 404));
  }

  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code not verified", 400));
  }

  user.password = req.body.password;

  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  // !this one updated to cancel any previous tokens
  user.passwordChangedAt = Date.now();

  await user.save();

  // todo: is generating token the right todo? or should we just send a message that the password has been changed? and the user should login again?
  const token = generateToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});
