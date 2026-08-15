require("dotenv").config();
const mongoose = require("mongoose");
const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {}

const initData = require("./data.js"); 
const Listing = require("../models/listing.js"); 
const User = require("../models/user.js");

const DB_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

const sampleCoordinates = {
  "Malibu": [-118.6923, 34.0381],
  "New York City": [-74.0060, 40.7128],
  "Aspen": [-106.8235, 39.1911],
  "Florence": [11.2558, 43.7696],
  "Portland": [-122.6784, 45.5152],
  "Cancun": [-86.8475, 21.1619],
  "Lake Tahoe": [-120.0324, 39.0968],
  "Los Angeles": [-118.2437, 34.0522],
  "Verbier": [7.2286, 46.0968],
  "Serengeti National Park": [34.8333, -2.3333],
  "Amsterdam": [4.9041, 52.3676],
  "Fiji": [178.0650, -17.7134],
  "Cotswolds": [-1.8433, 51.9294],
  "Boston": [-71.0589, 42.3601],
  "Bali": [115.1889, -8.4095],
  "Banff": [-115.5708, 51.1784],
  "Miami": [-80.1918, 25.7617],
  "Phuket": [98.3981, 7.9519],
  "Scottish Highlands": [-4.2026, 57.3061],
  "Dubai": [55.2708, 25.2048],
  "Montana": [-110.3626, 46.8797],
  "Mykonos": [25.3289, 37.4467],
  "Costa Rica": [-84.0739, 9.7489],
  "Charleston": [-79.9311, 32.7765],
  "Tokyo": [139.6917, 35.6895],
  "New Hampshire": [-71.5724, 43.1939],
  "Maldives": [73.5361, 3.2028],
};

main()
  .then(() => {
    console.log("Connected and initialized DB successfully!");
  })
  .catch((err) => {
    console.log("Error initializing DB:", err);
  });

async function main() {
  console.log("Connecting to:", DB_URL.includes("mongodb+srv") ? "MongoDB Atlas" : DB_URL);
  await mongoose.connect(DB_URL);
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

  const updatedData = initData.data.map((obj) => {
    const coords = sampleCoordinates[obj.location] || [77.2090, 28.6139];
    return {
      ...obj,
      owner: demoUser._id,
      geometry: {
        type: "Point",
        coordinates: coords,
      },
    };
  });

  await Listing.insertMany(updatedData); 
  console.log("data was initialized with geometry coordinates");
};
