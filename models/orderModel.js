const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },
    cartItems: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        price: Number,
        color: String,
      },
    ],
    // todo: there should be app settings model for tax and shipping price and other settings like currency, and it can be updated by admin
    taxPrice: {
      type: Number,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    shippingAddress: {
      details: String,
      phone: String,
      city: String,
      postalCode: String,
    },
    totalOrderPrice: Number,
    paymentMethodType: {
      type: String,
      enum: ["card", "cash"],
      default: "cash",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

// note: we know populating inside the array is a lot of work for the database, but it is fine because we are not going to have a lot of orders requests
orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email profileImg phone",
  }).populate({
    path: "cartItems.product",
    select: "title imageCover",
  });
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
