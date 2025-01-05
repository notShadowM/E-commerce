const express = require("express");
const {
  getcoupons,
  createcoupon,
  getcoupon,
  updatecoupon,
  deletecoupon,
} = require("../services/couponService");
const { protect, allowTo } = require("../services/authService");
const { applyCoupon } = require("../services/cartService");

// todo: add validation
// todo: should we delete expired coupons? add a count mechanism for a number of users? add multiple types?

const router = express.Router();

router.use(protect, allowTo("admin", "manager"));

router.route("/").get(getcoupons).post(createcoupon);

router.route("/:id").get(getcoupon).put(updatecoupon).delete(deletecoupon);

router.put("/apply-coupon", applyCoupon);

module.exports = router;
