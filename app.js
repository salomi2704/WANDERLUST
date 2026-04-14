const express =require("express");
const app=express(); 
const mongoose=require("mongoose");
const Listing = require("../WANDERLUST/models/listing");
const path=require("path");
const MONGO_URL='mongodb://127.0.0.1:27017/wanderlust';
const methodOverride= require("method-override");
const ejsMate=require("ejs-mate");
main()
.then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}
app.get("/",(req,res)=>{
    res.send("Hi,I am root");
});

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views")); 
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
// app.get("/testListing",async(req,res)=>{
// let sampleListing =new Listing({
//     title:"My New Villa",
//     description:"By the beach",
//     price:1200,
//     location:"Calangute Goa",
//     country:"India",
// });
// await sampleListing.save();
// console.log("sample was saved");
// res.send("successful testing");
// });\

app.get("/listings",async(req,res)=>{
    const allListings= await Listing.find({});
    res.render("listings/index",{allListings}); 
    });
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});
app.get("/listings/:id", async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    return res.status(404).send("Listing not found");
  }
  res.render("listings/show", { listing });
});


app.post("/listings",async(req,res)=>{
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});
app.get("/listings/:id/edit",async(req,res)=>{
    let {id}=req.params;
    const listing =await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});
app.delete("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings")
});
app.put("/listings/:id",async(req,res)=>{
    let{id}=req.params;
   await Listing.findByIdAndUpdate(id,{...req.body.listing.image});
   res.redirect(`/listings/${id}`);
});

app.listen(8080,()=>{
    console.log("server is listening to 8080");
});

