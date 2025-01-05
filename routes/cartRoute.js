const express = require("express");
const {
  addToCart,
  getCart,
  deleteCartItem,
  clearCart,
  updateCartItemQuantity,
  applyCoupon,
} = require("../services/cartService");

const { protect, allowTo } = require("../services/authService");
// todo: add validation

const router = express.Router();

router.use(protect, allowTo("user"));

router.route("/").post(addToCart).get(getCart).delete(clearCart);

router.put("/coupon", applyCoupon);

router.route("/:itemId").delete(deleteCartItem).put(updateCartItemQuantity);

module.exports = router;
