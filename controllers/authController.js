const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

function generateToken(adminId) {
  return jwt.sign(
    {
      id: adminId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

const registerAdmin = async (req, res) => {
  try {
    const { username, email, password, shopName, phone } = req.body;

    console.log("user detail.....", {
      username,
      email,
      shopName,
      phone,
    });

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email and password are required",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET is missing in .env",
      });
    }

    const existingAdmin = await Admin.findOne({
      email: email.toLowerCase(),
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("ppp", hashedPassword);
    

    const admin = await Admin.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      shopName,
      phone,
    });

    // const token = generateToken(admin._id);

    return res.status(201).json({
      message: "Admin registered successfully",
      // token,
      status: 201,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        shopName: admin.shopName,
        phone: admin.phone,
      },
    });
  } catch (error) {
    console.error("Register admin error:", error);

    return res.status(500).json({
      message: "Failed to register admin",
      error: error.message,
    });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET is missing in .env",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase(),
    });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(admin._id);

    return res.status(200).json({
      message: "Login successful",
      token,
      status: 200,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        shopName: admin.shopName,
        phone: admin.phone,
      },
    });
  } catch (error) {
    console.error("Login admin error:", error);

    return res.status(500).json({
      message: "Failed to login admin",
      error: error.message,
    });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
};