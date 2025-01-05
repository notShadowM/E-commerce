const express = require("express");
const { protect, allowTo } = require("../services/authService");
const {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggedInUserWishlist,
} = require("../services/wishlistService");
const {
  addWishlistValidator,
} = require("../utils/validators/wishlistValidator");

const router = express.Router();

router.use(protect, allowTo("user"));

router
  .route("/")
  .post(addWishlistValidator, addProductToWishlist)
  .get(getLoggedInUserWishlist);

router.delete("/:productId", removeProductFromWishlist);

module.exports = router;
