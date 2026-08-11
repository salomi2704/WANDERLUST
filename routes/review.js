const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { validateReview, isloggedIn, isReviewAuthor } = require("./middleware");
const reviewController = require("../controllers/reviews.js");

// Create a new review for a listing
router
  .route("/")
  .post(isloggedIn, validateReview, wrapAsync(reviewController.createReview));

// Delete a review
router
  .route("/:reviewId")
  .delete(isloggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;
