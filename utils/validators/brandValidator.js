const { check } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

// checkName function
const checkName = check("name")
  .notEmpty()
  .withMessage("Brand name is required")
  .bail()
  .isLength({ min: 3 })
  .withMessage("Brand name is too short")
  .bail()
  .isLength({ max: 32 })
  .withMessage("Brand name is too long")
  .bail()
  .custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  });
const checkNameUpdate = check("name")
  .optional()
  .notEmpty()
  .withMessage("Brand name is required")
  .bail()
  .isLength({ min: 3 })
  .withMessage("Brand name is too short")
  .bail()
  .isLength({ max: 32 })
  .withMessage("Brand name is too long")
  .bail()
  .custom((val, { req }) => {
    req.body.slug = slugify(val);
    return true;
  });

exports.getBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand id format"),
  validatorMiddleware,
];

exports.createBrandValidator = [checkName, validatorMiddleware];

exports.updateBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand id format"),
  checkNameUpdate,
  validatorMiddleware,
];

exports.deleteBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand id format"),
  validatorMiddleware,
];
