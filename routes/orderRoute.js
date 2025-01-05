const express = require("express");

const { protect, allowTo } = require("../services/authService");
const {
  createCashOrder,
  getAllOrders,
  getOrder,
  filterOrderForLoggedUser,
  updateOrderToPaid,
  updateOrderToDelivered,
  getCheckoutSession,
} = require("../services/orederService");
// todo: add validation

const router = express.Router();

router.use(protect);

// todo: since we are sending address in the Get body, should we use POST instead of GET?
router.get("/checkout-session/:cartId", allowTo("user"), getCheckoutSession);

// todo: there is 2 routes with "id" param in the same path, is it bad practice?
router.post("/:cartId", allowTo("user"), createCashOrder);

// todo: if the allow to is allowing for all roles, we can remove it right?
// todo: make getAllOrders for specific user for admin and manager?
router.get(
  "/",
  allowTo("user", "admin", "manager"),
  filterOrderForLoggedUser,
  getAllOrders
);

router.get("/:id", allowTo("user", "admin", "manager"), getOrder);

// todo: these two can be merged into one route? maybe "cash received" and "order delivered"? since deleving is most likely to be done wiht paying
// note: these 2 can be performed on a dashboard or a barcode scanner or via a mobile app qr code scanner ;)
// note: there are some payment gateways that provide the cash on delivery option, so it can save u time and effort :p
router.put("/:id/pay", allowTo("admin", "manager"), updateOrderToPaid);
router.put("/:id/deliver", allowTo("admin", "manager"), updateOrderToDelivered);

module.exports = router;
