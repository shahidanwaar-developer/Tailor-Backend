const dns = require("dns");
const mongoose = require("mongoose");

// Optional: helps sometimes with MongoDB Atlas SRV DNS issues
dns.setServers(["8.8.8.8", "1.1.1.1"]);

mongoose.set("strictQuery", true);

// Important: stop Mongoose from waiting silently when DB is not connected
mongoose.set("bufferCommands", false);

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

async function connectDB() {
  const mongoUrl = process.env.MONGO_URI;

  if (!mongoUrl) {
    throw new Error("MongoDB URL is missing in .env");
  }

  // 0 = disconnected
  // 1 = connected
  // 2 = connecting
  // 3 = disconnecting
  if (cached.conn && mongoose.connection.readyState === 1) {
    console.log("MongoDB already connected");
    return cached.conn;
  }

  // If old cached connection exists but is not connected, clear it
  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    console.log("Connecting to MongoDB...");

    cached.promise = mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
    });
  }

  try {
    cached.conn = await cached.promise;

    console.log("Database connected successfully");
    console.log("Database name:", cached.conn.connection.name);
    console.log("Database host:", cached.conn.connection.host);
    console.log("Ready state:", cached.conn.connection.readyState);

    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;

    console.log("MongoDB connection error:", error.message);

    throw error;
  }
}

module.exports = connectDB;