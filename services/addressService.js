const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// @desc Add address to user address list
// @route POST /api/v1/addressess
// @access Protected/User
exports.addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    success: true,
    message: "Address added successfully",
    data: user.addresses,
  });
});

// @desc Remove address from user address list
// @route DELETE /api/v1/addressess/:addressId
// @access Protected/User
exports.removeAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    success: true,
    message: "Address removed successfully",
    data: user.addresses,
  });
});

// @desc Get addresses
// @route GET /api/v1/addressess
// @access Protected/User
exports.getLoggedInUserAddresses = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    results: req.user.addresses.length,
    data: req.user.addresses,
  });
});
