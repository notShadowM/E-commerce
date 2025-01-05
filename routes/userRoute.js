const express = require("express");
const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeUserImage,
  changeUserPassword,
  getLoggedUserData,
  changeLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUser,
} = require("../services/userService");
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggerUserDataValidator,
} = require("../utils/validators/userValidator");
const { allowTo, protect } = require("../services/authService");

const router = express.Router();

router.use(protect);

router.get("/me", getLoggedUserData, getUser);
// todo: add a validator
router.put("/change-my-password", changeLoggedUserPassword);
router.put("/update-me", updateLoggerUserDataValidator, updateLoggedUserData);
router.delete("/delete-me", deleteLoggedUser);

// !admin routes
router.use(allowTo("admin"));

router
  .route("/")
  .get(getUsers)
  .post(uploadUserImage, resizeUserImage, createUserValidator, createUser);

router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeUserImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

router.put(
  "/change-password/:id",
  changeUserPasswordValidator,
  changeUserPassword
);

module.exports = router;
