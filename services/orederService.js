const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const { getAll, getOne } = require("./handlersFactory");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

// @desc Create cash order
// @route POST /api/v1/orders/:cartId
// @access Protected/User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // todo: these are just for demonstration of how we should call them from the app settings model
  // !app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // !Get cart by id
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`Cart not found with id of ${req.params.cartId}`, 404)
    );
  }

  // !Get order price and check if a coupon is applied
  const cartPrice = cart.totalPriceAfterDiscount || cart.totalPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // !create order with default paymentMethodType cash
  // note: the frontend can choose an address from the user addresses or add a new one
  // todo: make sure the shipping address is same structure as the user address
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    totalOrderPrice,
    taxPrice,
    shippingPrice,
    shippingAddress: req.body.shippingAddress,
  });

  // !after creating order, decrease the quantity and increase the sold of products
  // note: bulkWrite is a mongoose method to update multiple documents at once (it can be used for create, update, delete). it is faster than updateMany and findOneAndUpdate
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: { quantity: -item.quantity, sold: +item.quantity },
        },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // !clear the cart
    await Cart.findByIdAndDelete(req.params.cartId);
  }

  // todo: we can populate the user and product fields?
  res.status(201).json({
    status: "success",
    data: order,
  });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObj = { user: req.user._id };
  next();
});

// @desc Get all orders
// @route GET /api/v1/orders
// @access Protected/User-Admin-Manager
exports.getAllOrders = getAll(Order);

// todo: ig this route is not needed, unless we want to get the order by the user id and the order id, because it is going to let the user see the order of other users
// @desc Get order by id
// @route GET /api/v1/orders/:id
// @access Protected/User-Admin-Manager
exports.getOrder = getOne(Order);

// @desc update order status to paid
// @route PUT /api/v1/orders/:id/pay
// @access Protected/Admin-Manager
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(`Order not found with id of ${req.params.id}`, 404)
    );
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  // todo: shouldn't we add info about who did this operation? to have the history of the order and who received the cash
  const updatedOrder = await order.save();

  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});

// @desc update order status to delivered
// @route PUT /api/v1/orders/:id/deliver
// @access Protected/Admin-Manager
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(`Order not found with id of ${req.params.id}`, 404)
    );
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  const updatedOrder = await order.save();

  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});

// @desc Get checkout session from stripe and send it to the client
// @route GET /api/v1/orders/checkout-session/:cartId
// @access Protected/User
exports.getCheckoutSession = asyncHandler(async (req, res, next) => {
  // !app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // !Get cart by id
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`Cart not found with id of ${req.params.cartId}`, 404)
    );
  }

  // !Get order price and check if a coupon is applied
  const cartPrice = cart.totalPriceAfterDiscount || cart.totalPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // todo: apply this one later down below
  // line_items: cart.cartItems.map((item) => ({
  //   price_data: {
  //     currency: "usd",
  //     product_data: {
  //       name: item.name,
  //     },
  //     unit_amount: item.price * 100,
  //   },
  //   quantity: item.quantity,
  // })),
  // !create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: req.user.name,
          },
          unit_amount: totalOrderPrice * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/orders`, // todo: search this later
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  // !send the session to the client
  res.status(200).json({
    status: "success",
    session,
  });
});

// todo: refactor this function ig? to be used in both places
const createCartOrder = async (session) => {
  const {
    client_reference_id: cartId,
    metadata: shippingAddress,
    amount_total,
  } = session;

  const cart = await Cart.findById(cartId);
  const user = await User.findById(cart.user);

  // !create order
  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    totalOrderPrice: amount_total / 100,
    shippingAddress,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: "card",
  });

  // todo: make this a function and use it in both places
  // !decrease the quantity and increase the sold of products
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: {
          $inc: { quantity: -item.quantity, sold: +item.quantity },
        },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // !clear the cart
    await Cart.findByIdAndDelete(cartId);
  }
};

// @desc Webhook from stripe
// @route POST /webhook-checkout
// @access Public
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  let event;
  // !Get the signature sent by Stripe
  const signature = req.headers["stripe-signature"];

  try {
    // !Verify the event
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // !Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    // !create order
    await createCartOrder(event.data.object);
  }

  res.status(200).json({ received: true });
});
