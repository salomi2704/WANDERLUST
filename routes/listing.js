const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { validateListing, isloggedIn, isOwner } = require("./middleware");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(isloggedIn,upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));

// New form – render create form (must be before /:id)
router.get("/new", isloggedIn, listingController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(isloggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
  .delete(isloggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Edit form – render edit page
router.get("/:id/edit", isloggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;
