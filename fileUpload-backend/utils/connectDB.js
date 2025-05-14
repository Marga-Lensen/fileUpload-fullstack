
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export default async function connect() {
  // first check if the .env has the right connection string
const uri = process.env.CONNECTION_STRING || process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ Connection string is missing! 👉️ Set CONNECTION_STRING in .env.");
    // process.exit(1);
    return; // ❌ No process.exit(1), just return
  }

  mongoose.connection.on("connected", () => {
    console.log("🗃️  MongoDB connected 🤓");
  });

  mongoose.connection.on("error", (error) => {
    console.error(  "⚠️ Warning: MongoDB connection failed. Server will start without database connection.");
  });

  try {
    await mongoose.connect(uri);
  } catch (error) {
    console.error("✖️ MongoDB connection failed; 🕵️ check your  CONNECTION_STRING in .env for typos");
    // process.exit(1);
  }
}
