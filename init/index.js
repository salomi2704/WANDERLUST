const mongoose = require("mongoose");
const initData = require("./data.js"); 
const Listing = require("../models/listing.js"); 
const User = require("../models/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
  await initDB();
  await mongoose.connection.close();
}

const initDB = async () => {
  await Listing.deleteMany({});
  
  let demoUser = await User.findOne({ username: "demouser" });
  if (!demoUser) {
    demoUser = new User({ email: "demo@gmail.com", username: "demouser" });
    demoUser = await User.register(demoUser, "password123");
  }

  const updatedData = initData.data.map((obj) => ({
    ...obj,
    owner: demoUser._id,
  }));
  await Listing.insertMany(updatedData); 
  console.log("data was initialized");
};