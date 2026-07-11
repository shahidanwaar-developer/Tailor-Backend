const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

async function authMiddleware(req, res, next) {
  try {
    const adminToken = req.headers.token;

    if (!adminToken) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({
        message: "Admin not found",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
}

module.exports = authMiddleware;