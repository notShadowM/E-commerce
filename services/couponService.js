const coupon = require("../models/couponModel");
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require("./handlersFactory");

// @desc Get all coupons
// @route GET /api/v1/coupons
// @access Private/Admin-Manager
exports.getcoupons = getAll(coupon);

// @desc Get specific coupon by id
// @route GET /api/v1/coupons/:id
// @access Private/Admin-Manager
exports.getcoupon = getOne(coupon);

// @desc Create a coupon
// @route POST /api/v1/coupons
// @access Private/Admin-Manager
exports.createcoupon = createOne(coupon);

// @desc Update a coupon
// @route PUT /api/v1/coupons/:id
// @access Private/Admin-Manager
exports.updatecoupon = updateOne(coupon);

// @desc Delete a coupon
// @route DELETE /api/v1/coupons/:id
// @access Private/Admin-Manager
exports.deletecoupon = deleteOne(coupon);
