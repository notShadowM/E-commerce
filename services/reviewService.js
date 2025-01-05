const Review = require("../models/reviewModel");
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require("./handlersFactory");

// @desc Middleware to create a filter object for the query (nested routes case)
// @route Get /api/v1/products/:productId/reviews
exports.createFilterObjectReview = (req, res, next) => {
  const filterObj = {};
  if (req.params.productId) filterObj.product = req.params.productId;
  req.filterObj = filterObj;
  next();
};

// @desc Middleware to set the product id to the body in nested routes case
// @route POST /api/v1/products/:productId/reviews
exports.setProductIdAndUserIdToBody = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

// @desc Get all reviews
// @route GET /api/v1/reviews
// @access Public
exports.getReviews = getAll(Review);

// @desc Get specific review by id
// @route GET /api/v1/reviews/:id
// @access Public
exports.getReview = getOne(Review);

// @desc Create a review
// @route POST /api/v1/reviews
// @access Private/Protect/User
exports.createReview = createOne(Review);

// @desc Update a review
// @route PUT /api/v1/reviews/:id
// @access Private/Protect/User
exports.updateReview = updateOne(Review);

// @desc Delete a review
// @route DELETE /api/v1/reviews/:id
// @access Private/Protect/User-Admin-Manager
exports.deleteReview = deleteOne(Review);
