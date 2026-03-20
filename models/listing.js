const mongoose=require("mongoose");
const Schema=mongoose.Schema;

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
});

const Listing =mongoose.model("Listing",listingSchema);
module.exports=Listing;