const { check } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

// checkName function and category
const checkName = (isOptional = false) => {
  const validator = check("name");
  if (isOptional) {
    validator.optional();
  }
  return validator
    .notEmpty()
    .withMessage("Subcategory name is required")
    .bail()
    .isLength({ min: 2 })
    .withMessage("Subcategory name is too short")
    .bail()
    .isLength({ max: 32 })
    .withMessage("Subcategory name is too long")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    });
};

const checkCategory = (isOptional = false) => {
  const validator = check("category");
  if (isOptional) {
    validator.optional();
  }
  return validator
    .notEmpty()
    .withMessage("Category is required")
    .bail()
    .isMongoId()
    .withMessage("Invalid category id format");
};
// ----------------------------
// !i added this by myself and it's only needed for getSubcategories
exports.nestedGetSubcategoryValidator = [
  check("categoryId")
    .optional()
    .isMongoId()
    .withMessage("Invalid category id format"),
  validatorMiddleware,
];

exports.getSubcategoryValidator = [
  check("id").isMongoId().withMessage("Invalid subcategory id format"),
  validatorMiddleware,
];

exports.createSubcategoryValidator = [
  checkName(),
  checkCategory(),
  validatorMiddleware,
];

exports.updateSubcategoryValidator = [
  check("id").isMongoId().withMessage("Invalid subcategory id format"),
  checkName(true),
  checkCategory(true),
  validatorMiddleware,
];

exports.deleteSubcategoryValidator = [
  check("id").isMongoId().withMessage("Invalid subcategory id format"),
  validatorMiddleware,
];
