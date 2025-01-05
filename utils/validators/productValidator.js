const { check } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Category = require("../../models/categoryModel");
const Subcategory = require("../../models/subcategoryModel");

// todo: maybe use joi for validation?
// note we can make the category and subcategory validation in two db queries like if the category doesn't exist then stop the validation for subcategory, and if it exists then check if the subcategories exist with the category id, and idk if there is a way to cancel the query if the first one fails "just keep that in mind"
// note the point is i believe just checking for valid mongoId then doing these simple 2 queries is enough rather than using 3 separate queries and one of them contain a loop which is not ideal imo
// note another curious point is checking with one query if the subcategories belong to the category would be better?
// ! note: don't forget about passing same subcategory id twice in the array, to address the issue do check for duplicates in the array, or do a length check after the query, but ig the check in the array is better, or u can use a set to remove duplicates

const checkProductCreate = [
  check("title")
    .isLength({ min: 3, max: 100 })
    .withMessage("Product name must be between 3 to 100 characters")
    .notEmpty()
    .withMessage("Product name is required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Product description must be between 10 to 2000 characters"),
  check("quantity")
    .notEmpty()
    .withMessage("Product quantity is required")
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Product sold must be a number"),
  check("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number")
    .custom((value) => {
      if (value > 1000000) {
        throw new Error(
          "Product price must be less than or equal to 1,000,000"
        );
      }
      return true;
    }),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product price after discount must be a number")
    .toFloat()
    .custom((value, { req }) => {
      if (value >= req.body.price) {
        throw new Error(
          "Product price after discount must be less than product price"
        );
      }
      return true;
    }),
  check("colors")
    .optional()
    .isArray()
    .withMessage("Product colors must be an array"),
  check("imageCover").notEmpty().withMessage("Product cover image is required"),
  check("images")
    .optional()
    .isArray()
    .withMessage("Product images must be an array"),
  check("category")
    .notEmpty()
    .withMessage("Product must belong to a category")
    .isMongoId()
    .withMessage("Category must be a valid MongoDB ID")
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          throw new Error(`Category not found with id of ${categoryId}`);
        }
      })
    ),
  check("subcategories")
    .optional()
    .isArray()
    .withMessage("Product subcategories must be an array")
    .bail()
    // ! didn't have time to find a way to work with the library
    .custom((array) => array.every((id) => /^[0-9a-fA-F]{24}$/.test(id)))
    .withMessage("Each subcategory must be a valid MongoId")
    .custom((subcategoriesIds) =>
      // !todo: i can't find a reason for $exists: true
      Subcategory.find({ _id: { $in: subcategoriesIds, $exists: true } }).then(
        (results) => {
          if (
            results.length < 1 ||
            results.length !== subcategoriesIds.length
          ) {
            throw new Error("Invalid subcategories ID");
          }
        }
      )
    )
    .custom((val, { req }) =>
      Subcategory.find({ category: req.body.category }).then(
        (subcategories) => {
          const subcategoriesIds = subcategories.map((sub) =>
            sub._id.toString()
          );
          if (!val.every((id) => subcategoriesIds.includes(id))) {
            throw new Error("Subcategories must belong to the category");
          }
        }
      )
    ),
  check("brand")
    .optional()
    .isMongoId()
    .withMessage("Brand must be a valid MongoDB ID"),
  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("Product ratings average must be a number")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Product ratings average must be between 1 to 5"),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("Product ratings quantity must be a number"),
  validatorMiddleware,
];

exports.createProductValidator = checkProductCreate;
exports.updateProductValidator = [
  check("id")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Product ID must be a valid MongoDB ID"),
  check("title")
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage("Product name must be between 3 to 100 characters")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  // todo: add a checkProductUpdate later
  // ...checkProductUpdate,
];

exports.getProductValidator = [
  check("id")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Product ID must be a valid MongoDB ID"),
  validatorMiddleware,
];

exports.deleteProductValidator = [
  check("id")
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Product ID must be a valid MongoDB ID"),
  validatorMiddleware,
];
