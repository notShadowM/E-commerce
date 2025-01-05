const bcrypt = require("bcryptjs");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const User = require("../models/userModel");
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require("./handlersFactory");
const ApiError = require("../utils/apiError");
const generateToken = require("../utils/gnerateToken");

// !upload single image
exports.uploadUserImage = uploadSingleImage("profileImg");

// !image processing
exports.resizeUserImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${filename}`);

    req.body.profileImg = filename;
  }
  next();
});

// @desc Get all users
// @route GET /api/v1/users
// @access Private/Admin
exports.getUsers = getAll(User);

// @desc Get specific user by id
// @route GET /api/v1/users/:id
// @access Private/Admin
exports.getUser = getOne(User);

// @desc Create a user
// @route POST /api/v1/users
// @access Private/Admin
exports.createUser = createOne(User);

// @desc Update a user
// @route PUT /api/v1/users/:id
// @access Private/Admin
exports.updateUser = updateOne(User);

// @desc Update user's password
// @route PUT /api/v1/users/change-password/:id
// @access Private/Admin
// todo: i think we can use "updateone" function and handle everything else in the middlewares, and the only difference we will not depend on the req.body, we will make our own property within the req, where we will handle all the data we need to be passed
// todo: shouldn't we return new token after changing the password? and delete all the other tokens?
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  // todo: is this if statement right?
  if (req.body.currentPassword === req.body.newPassword) {
    return next(
      new ApiError(
        "The new password should be different from the current password",
        400
      )
    );
  }
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.newPassword, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(
      new ApiError(`Document not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ data: document });
});

// @desc Delete a user
// @route DELETE /api/v1/users/:id
// @access Private/Admin
exports.deleteUser = deleteOne(User);

// @desc Get logged in user data
// @route GET /api/v1/users
// @access Private/Protected
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc Update logged in user password
// @route PUT /api/v1/users/change-password
// @access Private/Protected
// todo: add to provide previous password to change the password
exports.changeLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // todo: i believe we can use the req.user for updating the password, and we can make user.save() instead of findAndUpdate, and we can even use it to check if it is the same password to prevent a useless database query
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.newPassword, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  const token = generateToken(user._id);

  res.status(200).json({ data: user, token });
});

// @desc Update logged in user data (not including password , role)
// @route PUT /api/v1/users/update-me
// @access Private/Protected
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  // todo: this is the same case why not using req.user
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );

  res.status(200).json({ data: user });
});

// @desc Deactivate logged user
// @route DELETE /api/v1/users/delete-me
// @access Private/Protected
exports.deleteLoggedUser = asyncHandler(async (req, res, next) => {
  // todo: this is the same case why not using req.user
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ status: "success" });
});

// todo: add activeLoggedUser function,also add a middleware or inside the protect middleware to check if the user is active or not
