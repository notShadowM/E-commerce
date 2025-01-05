const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Review = require("../../models/reviewModel");
// todo: i believe we can use the req.body instead of the user passing the id in the body, because the user is already logged in, so we can get the user id from the token

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid review id format"),
  validatorMiddleware,
];

exports.createReviewValidator = [
  check("title")
    .notEmpty()
    .withMessage("Review title is required")
    .isLength({ min: 5, max: 100 })
    .withMessage("Review title must be between 5 to 100 characters"),
  check("ratings")
    .notEmpty()
    .withMessage("Review ratings is required")
    .isNumeric()
    .withMessage("Review ratings must be a number")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Review ratings must be between 1 to 5"),
  check("product")
    .notEmpty()
    .withMessage("Product id is required")
    .isMongoId()
    .withMessage("Invalid product id format")
    .custom((val, { req }) =>
      Review.findOne({ product: val, user: req.body.user }).then((review) => {
        if (review) {
          return Promise.reject(
            new Error("You have already reviewed this product")
          );
        }
      })
    ),
  validatorMiddleware,
];

// todo: is maybe after finding the review, we can pass it inside the req object so that we can use it in the controller? is it better than the factory we are using now?
exports.updateReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid review id format")
    .custom((val, { req }) =>
      Review.findOne({ _id: val }).then((review) => {
        if (!review) {
          return Promise.reject(new Error(`Review with id ${val} not found`));
        }
        // todo: if we use the req.body instead, it would save us the need to watch out for the populate
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error("You are not authorized to update this review")
          );
        }
      })
    ),
  check("title")
    .optional()
    .notEmpty()
    .withMessage("Review title is required")
    .isLength({ min: 5, max: 100 })
    .withMessage("Review title must be between 5 to 100 characters"),
  check("ratings")
    .optional()
    .notEmpty()
    .withMessage("Review ratings is required")
    .isNumeric()
    .withMessage("Review ratings must be a number")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Review ratings must be between 1 to 5"),
  validatorMiddleware,
];

exports.deleteReviewValidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid review id format")
    .custom((val, { req }) => {
      if (req.user.role === "user") {
        return Review.findOne({ _id: val }).then((review) => {
          // todo: is it fine to remove this if condition?
          if (!review) {
            return Promise.reject(new Error(`Review with id ${val} not found`));
          }

          if (review.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(
              new Error("You are not authorized to update this review")
            );
          }
        });
      }

      return true;
    }),
  validatorMiddleware,
];
