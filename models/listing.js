const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review = require("./review.js")
const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    } ,
    description: String,
    image: {
  filename: String,
  url: {
    type: String,
    set: (v) =>
      v === ""
        ? "https://unsplash.com/photos/a-single-cloud-floats-above-a-grassy-hill-SWmjxFob2SQ"
        : v,
  },
},
    price: Number,
    location: String,
    country: String,
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ]
});

listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
  await Review.deleteMany({reviews:{$in: listing.reviews}}); 
  }

});

const Listing =mongoose.model("Listing",listingSchema);
module.exports=Listing;