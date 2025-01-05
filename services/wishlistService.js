const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// @desc Add product to wishlist
// @route POST /api/v1/wishlist
// @access Protected/User
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      // note: $addToSet add item to array if it doesn't exist (no duplicates)
      $addToSet: { wishlist: req.body.productId },
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    success: true,
    message: "Product added to wishlist",
    data: user.wishlist,
  });
});

// @desc Remove product from wishlist
// @route DELETE /api/v1/wishlist/:productId
// @access Protected/User
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      // note: $pull remove item from array if it exists
      $pull: { wishlist: req.params.productId },
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    success: true,
    message: "Product removed from wishlist",
    data: user.wishlist,
  });
});

// @desc Get wishlist
// @route GET /api/v1/wishlist
// @access Protected/User
exports.getLoggedInUserWishlist = asyncHandler(async (req, res, next) => {
  // todo: can't we just use req.user directly?
  // todo: add pagination and sorting?
  // todo: also search is using stuff like select only wishlist from "findById" would make the response quicker?
  const user = await User.findById(req.user._id).populate("wishlist");

  res.status(200).json({
    success: true,
    results: user.wishlist.length,
    data: user.wishlist,
  });
});
