const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const Category = require("../models/categoryModel");
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

// !upload single image
exports.uploadCategoryImage = uploadSingleImage("image");

// todo: refactor this block of code in all routes
// !image processing
exports.resizeCategoryImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/categories/${filename}`);

    req.body.image = filename;
  }
  next();
});

// @desc Get all categories
// @route GET /api/v1/categories
// @access Public
exports.getCategories = getAll(Category);

// @desc Get specific category by id
// @route GET /api/v1/categories/:id
// @access Public
exports.getCategory = getOne(Category);

// @desc Create a category
// @route POST /api/v1/categories
// @access Private/Admin-Manager
exports.createCategory = createOne(Category);

// @desc Update a category
// @route PUT /api/v1/categories/:id
// @access Private/Admin-Manager
exports.updateCategory = updateOne(Category);

// @desc Delete a category
// @route DELETE /api/v1/categories/:id
// @access Private/Admin
exports.deleteCategory = deleteOne(Category);
