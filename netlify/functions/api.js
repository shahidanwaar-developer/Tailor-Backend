const serverless = require("serverless-http");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("../../config/db");

const authRoutes = require("../../routes/authRoutes");
const customerRoutes = require("../../routes/customerRoutes");
const orderRoutes = require("../../routes/orderRoutes");
const dashboardRoutes = require("../../routes/dashboardRoutes");

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://tailor-master.netlify.app",
].filter(Boolean);

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "token"],
    credentials: true,
  })
);
app.use(express.json());

app.use((req, res, next) => {
  req.url = req.url.replace("/.netlify/functions/api", "") || "/";
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "TailorFlow Backend is running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: true,
    message: "TailorFlow API working",
  });
});

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.log("DB ERROR:", error.message);

    res.status(500).json({
      status: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});


app.get("/api/db-check", async (req, res) => {
  try {
    const conn = await connectDB();

    res.status(200).json({
      status: true,
      message: "Database connected successfully",
      dbName: conn.connection.name,
      host: conn.connection.host,
      readyState: conn.connection.readyState,
    });
  } catch (error) {
    console.log(error.message, "ttttttttttt");
    
    res.status(500).json({
      status: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

module.exports.handler = serverless(app);