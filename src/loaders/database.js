const mongoose = require("mongoose");

module.exports = async () => {
  try {
    mongoose.set("strictQuery", true); // optional but recommended

    await mongoose.connect(process.env.MONGO_URI);

    console.log("📦 MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error", err);
    process.exit(1);
  }
};
