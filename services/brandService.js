const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const Brand = require("../models/brandModel");
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require("./handlersFactory");

// !upload single image
exports.uploadBrandImage = uploadSingleImage("image");

// !image processing
exports.resizeBrandImage = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/brands/${filename}`);

    req.body.image = filename;
  }
  next();
});

// @desc Get all brands
// @route GET /api/v1/brands
// @access Public
exports.getBrands = getAll(Brand);

// @desc Get specific brand by id
// @route GET /api/v1/brands/:id
// @access Public
exports.getBrand = getOne(Brand);

// @desc Create a brand
// @route POST /api/v1/brands
// @access Private/Admin-Manager
exports.createBrand = createOne(Brand);

// @desc Update a brand
// @route PUT /api/v1/brands/:id
// @access Private/Admin-Manager
exports.updateBrand = updateOne(Brand);

// @desc Delete a brand
// @route DELETE /api/v1/brands/:id
// @access Private/Admin
exports.deleteBrand = deleteOne(Brand);
