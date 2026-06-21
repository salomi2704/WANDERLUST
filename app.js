const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema}=require("./schema.js");
const Review = require("./models/review.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => console.log("connected to DB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));


// Root
app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg); 
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg); 
  } else {
    next();
  }
};


// Index
app.get("/listings", wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
}));

// New form
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Show
app.get("/listings/:id", async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("reviews");
  res.render("listings/show", { listing });
});


// Create
app.post("/listings",validateListing, wrapAsync(async (req, res,next) => {
const newListing=new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
}));

// Edit form
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw new ExpressError(404, "Listing not found");
  res.render("listings/edit.ejs", { listing });
}));

// Update
app.put("/listings/:id",validateListing, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
  if (!updatedListing) throw new ExpressError(404, "Listing not found");
  res.redirect(`/listings/${id}`);
}));

// Delete
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  if (!deletedListing) throw new ExpressError(404, "Listing not found");
  res.redirect("/listings");
}));


app.post(
  "/listings/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    listing.reviews.push(newReview._id);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
  })
);

app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
  let {id,reviewId}=req.params;
// Delete a single review
await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);  
})
)
// Catch-all route for 404s (no "*" or "/*")
// Catch-all route for 404s
app.use((req, res, next) => {
  // Pass a message string directly
  next(new ExpressError(404, errMsg ));
});



// Error handler middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});



app.listen(8080, () => {
  console.log("server is listening on 8080");
});
