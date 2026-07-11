const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createNewCustomer,
  getAllCustomersList,
  getCustomerById,
  updateCustomerById,
  deleteCustomerById,
} = require("../controllers/customerController");

const router = express.Router();

router.post("/create_new_customer", authMiddleware, createNewCustomer);
router.get("/get_all_customers_list", authMiddleware, getAllCustomersList);
router.get("/get_customer_by_id/:id", authMiddleware, getCustomerById);
router.put("/update_customer_by_id/:id", authMiddleware, updateCustomerById);
router.delete("/delete_customer_by_id/:id", authMiddleware, deleteCustomerById);

// router.post("/create_new_customer", createNewCustomer);
// router.get("/get_all_customers_list", getAllCustomersList);
// router.get("/get_customer_by_id/:id", getCustomerById);
// router.put("/update_customer_by_id/:id", updateCustomerById);
// router.delete("/delete_customer_by_id/:id", deleteCustomerById);

module.exports = router;