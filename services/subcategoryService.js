const Subcategory = require("../models/subcategoryModel");
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require("./handlersFactory");

// @desc Middleware to create a filter object for the query (nested routes case)
// @route Get /api/v1/categories/:categoryId/subcategories
exports.createFilterObjectSubCategory = (req, res, next) => {
  const filterObj = {};
  if (req.params.categoryId) filterObj.category = req.params.categoryId;
  req.filterObj = filterObj;
  next();
};

// @desc Middleware to set the category id to the body in nested routes case
// @route POST /api/v1/categories/:categoryId/subcategories
exports.setCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

// @desc Get all subcategories
// @route GET /api/v1/subcategories
// @access Public
exports.getSubcategories = getAll(Subcategory);

// @desc Get specific subcategory by id
// @route GET /api/v1/subcategories/:id
// @access Public
exports.getSubcategory = getOne(Subcategory);

// @desc Create a subcategory
// @route POST /api/v1/subcategories
// @access Private/Admin-Manager
exports.createSubcategory = createOne(Subcategory);

// @desc Update a subcategory
// @route PUT /api/v1/subcategories/:id
// @access Private/Admin-Manager
exports.updateSubcategory = updateOne(Subcategory);

// @desc Delete a subcategory
// @route DELETE /api/v1/subcategories/:id
// @access Private/Admin
exports.deleteSubcategory = deleteOne(Subcategory);
