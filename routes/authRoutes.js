const express = require("express");

const {
  registerAdmin,
  loginAdmin,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register_admin", registerAdmin);
router.post("/login_admin", loginAdmin);

module.exports = router;