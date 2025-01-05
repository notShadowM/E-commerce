const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");
const Cart = require("../models/cartModel");

const calcTotalPrice = (cartItems) => {
  let totalPrice = 0;
  cartItems.forEach((item) => {
    totalPrice += item.price * item.quantity;
  });

  return totalPrice;
};

// @desc Add product to cart
// @route POST /api/v1/cart/
// @access Private/User
exports.addToCart = asyncHandler(async (req, res, next) => {
  // todo: apply better method to return 200 status code if the product is already in the cart and 201 if it is added for the first time. dont forget to give appropriate message based on the status code. Or should we just return 200?
  const { productId, color } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });
  // note: we are getting the product to provide the price to the cartItem, instead of getting it from the req.body and risking the user to change the price
  // todo: when adding validation for product id, pass the product to req.product maybe?
  const product = await Product.findById(productId);

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [{ product: productId, color, price: product.price }],
    });
  } else {
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );

    if (productIndex !== -1) {
      cart.cartItems[productIndex].quantity += 1;
    } else {
      cart.cartItems.push({ product: productId, color, price: product.price });
    }
  }

  // todo: can we just add the price to the total price instead of calculating it every time? ig it is more efficient. but note it is not a general function, it is specific to this case, other cases might need to recalculate the total price or specific operations
  cart.totalPrice = calcTotalPrice(cart.cartItems);
  cart.totalPriceAfterDiscount = undefined;
  await cart.save();

  res.status(201).json({
    status: "success",
    message: "Product added to cart successfully",
    numberOfItems: cart.cartItems.length,
    data: {
      cart,
    },
  });
});

// todo: what should we do when item quantity change and user can't buy the product anymore? should we remove the item from the cart or just show a message to the user?
// @desc Get logged in user's cart
// @route GET /api/v1/cart/
// @access Private/User
exports.getCart = asyncHandler(async (req, res, next) => {
  // todo: shouldn't we add an option to populate the product in the cartItem? and get the availabe quantity of the product?
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new ApiError("There is no cart for this user", 404));
  }

  res.status(200).json({
    status: "success",
    numberOfItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Delete product from cart
// @route DELETE /api/v1/cart/:itemId // note: itemId is the cartItem id not the product id
// @access Private/User
exports.deleteCartItem = asyncHandler(async (req, res, next) => {
  // todo: is it better to use findOne and after that we remove the item and calc the total price then save or use findOneAndUpdate and use $pull to remove the item and then calc the total price? which one is more efficient?
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );

  if (!cart) {
    return next(new ApiError("There is no cart for this user", 404));
  }

  cart.totalPrice = calcTotalPrice(cart.cartItems);
  cart.totalPriceAfterDiscount = undefined;
  await cart.save();

  // todo: should this status be 204?
  res.status(200).json({
    status: "success",
    message: "Product removed from cart successfully",
    numberOfItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Clear logged user cart
// @route DELETE /api/v1/cart
// @access Private/User
exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.status(204).send();
});

// @desc Update specific cart item quantity
// @route PUT /api/v1/cart/:itemId
// @access Private/User
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  // todo: shouldn't we add a validation for the quantity? and maybe the color? and maybe the product id?
  // todo: also ig we should populate the product when getting cartItems to know the avilable quantity and let the client side handle the logic :)
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new ApiError("There is no cart for this user", 404));
  }

  // todo: apply this following approach if possible since it is more efficient and concise
  const cartItem = cart.cartItems.id(req.params.itemId); // note: this is mongoose method to get the subdocument by id

  if (!cartItem) {
    return next(new ApiError("Cart item not found", 404));
  }

  cartItem.quantity = quantity;
  cart.totalPrice = calcTotalPrice(cart.cartItems);
  cart.totalPriceAfterDiscount = undefined;
  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Cart item updated successfully",
    numberOfItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Apply coupon on logged in user's cart
// @route PUT /api/v1/cart/coupon
// @access Private/User
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  // todo: is this the best way to apply a coupon? isn't adding it to the cart better?
  // todo: also shoulnd't we save applied coupon to the cart?
  // todo: also in other handlers he make the totalPriceAfterDiscount to undefined when calculating the total price, which i think doesn't make sense, ig we should do save cupon and it's discount value and then using calcTotalPrice to calculate the total price and price after discount and should validate the coupon before applying it
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expireAt: { $gt: Date.now() },
  });

  if (!coupon) {
    return next(new ApiError("Coupon is invalid or expired", 400));
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new ApiError("There is no cart for this user", 404));
  }

  const { totalPrice } = cart;
  cart.totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2); // note: toFixed is used to round the number to 2 decimal places (100.1234 => 100.12)

  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Coupon applied successfully",
    numberOfItems: cart.cartItems.length,
    data: cart,
  });
});
