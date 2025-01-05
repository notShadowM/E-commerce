// todo: why use check while we can use body and param directly? ig it will save time for the validator middleware to check the type of the data
const { check } = require("express-validator");
const bcrypt = require("bcryptjs");
const slugify = require("slugify");
const User = require("../../models/userModel");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  validatorMiddleware,
];

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("username is required")
    .isLength({ min: 3 })
    .withMessage("Too short user name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (user) {
        throw new Error("Email already in use");
      }
      return true;
    }),
  check("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("Too short password"),
  // todo: i think there should be a custom function at the end to change the phone number to the international format, since the user can enter the phone with the +20 or 0020 or 20
  // todo: also about email and phone number instead of making two separate custom functions with requests to check if the email or phone number is already in use, we can make a single custom function that checks if the email or phone number is already in use
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-PS"])
    .withMessage("Phone number should be Egyptian or Palestinian"),
  check("profileImg").optional(),
  check("role").optional().isIn(["user", "admin"]),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  // todo: still we need to move everything from the body to a different object "search it, is it the best practice?"
  // !removing the password from the update process
  (req, res, next) => {
    if (req.body.password) {
      req.body.password = undefined;
    }
    next();
  },
  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  check("currentPassword")
    .notEmpty()
    .withMessage("current password is required")
    .bail()
    .custom(async (val, { req }) => {
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error("User not found");
      }
      const isMatch = await bcrypt.compare(val, user.password);
      if (!isMatch) {
        throw new Error("Invalid password");
      }

      return true;
    }),
  check("newPassword")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("Too short password"),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id format"),
  validatorMiddleware,
];

exports.updateLoggerUserDataValidator = [
  check("name")
    .optional()
    .notEmpty()
    .withMessage("username is required")
    .isLength({ min: 3 })
    .withMessage("Too short user name")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .optional()
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (val) => {
      const user = await User.findOne({ email: val });
      if (user) {
        throw new Error("Email already in use");
      }
      return true;
    }),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-PS"])
    .withMessage("Phone number should be Egyptian or Palestinian"),
  validatorMiddleware,
];
