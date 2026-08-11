const { listingSchema, reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

function validateListing(req, res, next) {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
}

function validateReview(req, res, next) {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
}

function isloggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to do that!");
    return res.redirect("/login");
  }
  next();
}

async function isOwner(req, res, next) {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for doesn't exist!");
    return res.redirect("/listings");
  }
  const currUser = res.locals.currentUser || req.user;
  if (!currUser || !listing.owner || !listing.owner.equals(currUser._id)) {
    req.flash("error", "You are not the owner of this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
}

async function isReviewAuthor(req, res, next) {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review you requested for doesn't exist!");
    return res.redirect(`/listings/${id}`);
  }
  const currUser = res.locals.currentUser || req.user;
  if (!currUser || !review.author || !review.author.equals(currUser._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
}

function saveRedirectUrl(req, res, next) {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
}

module.exports = {
  validateListing,
  validateReview,
  isloggedIn,
  saveRedirectUrl,
  isOwner,
  isReviewAuthor,
};
