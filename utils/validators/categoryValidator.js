const { check } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

// checkName function
const checkName = check("name")
  .notEmpty()
  .withMessage("Category name is required")
  .bail()
  .isLength({ min: 3 })
  .withMessage("Category name is too short")
  .bail()
  .isLength({ max: 32 })
  .withMessage("Category name is too long")
  .custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  });
const checkNameUpdate = check("name")
  .optional()
  .notEmpty()
  .withMessage("Category name is required")
  .bail()
  .isLength({ min: 3 })
  .withMessage("Category name is too short")
  .bail()
  .isLength({ max: 32 })
  .withMessage("Category name is too long")
  .custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  });
// ----------------------------

exports.getCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];

exports.createCategoryValidator = [checkName, validatorMiddleware];

exports.updateCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  checkNameUpdate,
  validatorMiddleware,
];

exports.deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];
