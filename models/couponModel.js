const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "coupon name is required"],
      unique: true,
      trim: true,
    },
    expireAt: {
      type: Date,
      required: [true, "coupon expire date is required"],
    },
    discount: {
      type: Number,
      required: [true, "coupon discount is required"],
    },
  },
  { timestamps: true }
);

const coupon = mongoose.model("coupon", couponSchema);

module.exports = coupon;
