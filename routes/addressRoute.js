const express = require("express");
const { protect, allowTo } = require("../services/authService");
const {
  addAddress,
  removeAddress,
  getLoggedInUserAddresses,
} = require("../services/addressService");

// todo: add validation middleware "even postal code need validation"
// todo: add edit address route

const router = express.Router();

router.use(protect, allowTo("user"));

router.route("/").post(addAddress).get(getLoggedInUserAddresses);

router.delete("/:addressId", removeAddress);

module.exports = router;
