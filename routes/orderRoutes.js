const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createNewOrder,
  getAllOrdersList,
  getOrderById,
  updateOrderById,
  deleteOrderById,
  updateOrderStatusById,
} = require("../controllers/orderController");

const router = express.Router();

router.post("/create_new_order", authMiddleware, createNewOrder);
router.get("/get_all_orders_list", authMiddleware, getAllOrdersList);
router.get("/get_order_by_id/:id", authMiddleware, getOrderById);
router.put("/update_order_by_id/:id", authMiddleware, updateOrderById);
router.delete("/delete_order_by_id/:id", authMiddleware, deleteOrderById);
router.patch("/update_order_status_by_id/:id", authMiddleware, updateOrderStatusById);

module.exports = router;