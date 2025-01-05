const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require("./handlersFactory");
const {
  uploadMultipleImages,
} = require("../middlewares/uploadImageMiddleware");

exports.uploadProductImages = uploadMultipleImages([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  // !image processing for Image Cover
  // todo: remove this eslint annoying error
  if (req.files?.imageCover) {
    const imageCoverFilename = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${imageCoverFilename}`);

    req.body.imageCover = imageCoverFilename;
  }

  // !image processing for Images
  if (req.files?.images) {
    req.body.images = [];

    await Promise.all(
      req.files.images.map(async (image, i) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(image.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${imageName}`);

        req.body.images.push(imageName);
      })
    );
  }

  next();
});

// @desc Get all products
// @route GET /api/v1/products
// @access Public
exports.getProducts = getAll(Product, "product");

// @desc Get specific product by id
// @route GET /api/v1/products/:id
// @access Public
exports.getProduct = getOne(Product);

// @desc Create a product
// @route POST /api/v1/products
// @access Private/Admin-Manager
exports.createProduct = createOne(Product);

// todo: on update a field that is an array of anything (like images, subcategories, etc) we need to add a feature to check if append or full replace, for now it's full replace, and we need to delete the old images from the server
// todo: well in all images handlers we don't delete the old images from the server which will cause a lot of storage usage, we need to add a feature to delete the old images from the server
// @desc Update a product
// @route PUT /api/v1/products/:id
// @access Private/Admin-Manager
exports.updateProduct = updateOne(Product);

// @desc Delete a product
// @route DELETE /api/v1/products/:id
// @access Private/Admin
exports.deleteProduct = deleteOne(Product);
