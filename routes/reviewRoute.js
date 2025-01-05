const express = require("express");
const {
  getReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview,
  createFilterObjectReview,
  setProductIdAndUserIdToBody,
} = require("../services/reviewService");
const {
  getReviewValidator,
  createReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require("../utils/validators/reviewValidator");
const { protect, allowTo } = require("../services/authService");

const router = express.Router({ mergeParams: true });

// todo: ig the admin and manager should be added here as well? because imagine me logged in as an admin and I want to create a review, I should be able to do that, right?
// todo: i believe the allowTo should be removed, because this is a case where it includes all types of users, so it should be public
router
  .route("/")
  .get(createFilterObjectReview, getReviews)
  .post(
    protect,
    allowTo("user"),
    setProductIdAndUserIdToBody,
    createReviewValidator,
    createReview
  );

// todo: same point here ig :)
// todo: for nested route getting review by id, should we apply the "createFilterObjectReview"? like will it speed up the search? or it doesn't really matter?
router
  .route("/:id")
  .get(getReviewValidator, getReview)
  .put(protect, allowTo("user"), updateReviewValidator, updateReview)
  .delete(
    protect,
    allowTo("user", "manager", "admin"),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
