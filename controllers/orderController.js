const mongoose = require("mongoose");
const Order = require("../models/order");
const Customer = require("../models/customer");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function calculatePayment(totalAmount, advancePaid) {
  const remainingAmount = Math.max(totalAmount - advancePaid, 0);

  let paymentStatus = "Unpaid";

  if (remainingAmount === 0) {
    paymentStatus = "Paid";
  } else if (advancePaid > 0) {
    paymentStatus = "Partial";
  }

  return {
    remainingAmount,
    paymentStatus,
  };
}

exports.createNewOrder = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.body.customerId,
      adminId: req.admin._id,
      isDeleted: false,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const totalAmount = Number(req.body.totalAmount || 0);
    const advancePaid = Number(req.body.advancePaid || 0);

    const payment = calculatePayment(totalAmount, advancePaid);

    const order = await Order.create({
      adminId: req.admin._id,
      customerId: req.body.customerId,
      suits: req.body.suits,
      totalAmount,
      advancePaid,
      remainingAmount: payment.remainingAmount,
      paymentStatus: payment.paymentStatus,
      deadline: req.body.deadline,
      orderStatus: req.body.orderStatus || "Pending",
    });

    res.status(201).json({
      status: 201,
      order
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to create order",
    });
  }
};

exports.getAllOrdersList = async (req, res) => {
  try {
    const orders = await Order.find({
      adminId: req.admin._id,
      isDeleted: false,
    })
      .populate("customerId", "name phone email")
      .sort({ deadline: 1 });

    res.status(200).json({
      status: 200,
      orders
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order id",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
      isDeleted: false,
    }).populate("customerId");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      status: 200,
      order
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch order",
    });
  }
};

exports.updateOrderById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order id",
      });
    }

    const updateData = {
      customerId: req.body.customerId,
      suits: req.body.suits,
      deadline: req.body.deadline,
      totalAmount: req.body.totalAmount,
      advancePaid: req.body.advancePaid,
      orderStatus: req.body.orderStatus,
    };

    if (
      req.body.totalAmount !== undefined ||
      req.body.advancePaid !== undefined
    ) {
      const oldOrder = await Order.findOne({
        _id: req.params.id,
        adminId: req.admin._id,
        isDeleted: false,
      });

      if (!oldOrder) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      const totalAmount =
        req.body.totalAmount !== undefined
          ? Number(req.body.totalAmount)
          : oldOrder.totalAmount;

      const advancePaid =
        req.body.advancePaid !== undefined
          ? Number(req.body.advancePaid)
          : oldOrder.advancePaid;

      const payment = calculatePayment(totalAmount, advancePaid);

      updateData.totalAmount = totalAmount;
      updateData.advancePaid = advancePaid;
      updateData.remainingAmount = payment.remainingAmount;
      updateData.paymentStatus = payment.paymentStatus;
    }

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        adminId: req.admin._id,
        isDeleted: false,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      status: 200,
      order
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update order",
    });
  }
};

exports.deleteOrderById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order id",
      });
    }

    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        adminId: req.admin._id,
        isDeleted: false,
      },
      {
        isDeleted: true,
      },
      {
        new: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      status: 200,
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete order",
    });
  }
};

exports.updateOrderStatusById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order id",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      adminId: req.admin._id,
      isDeleted: false,
    }).populate("customerId");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    console.log("body.....", req.body);

    const { orderStatus, paymentDone, pendingAmount } = req.body;

    order.orderStatus = orderStatus;

    if (orderStatus === "Delivered") {
      order.deliveredAt = new Date();

      if (paymentDone === true) {
        order.advancePaid = order.totalAmount;
        order.remainingAmount = 0;
        order.paymentStatus = "Paid";
      } else {
        const pending = Number(pendingAmount || order.remainingAmount || 0);

        order.remainingAmount = pending;
        order.advancePaid = Math.max(order.totalAmount - pending, 0);

        if (order.remainingAmount === 0) {
          order.paymentStatus = "Paid";
        } else if (order.advancePaid > 0) {
          order.paymentStatus = "Partial";
        } else {
          order.paymentStatus = "Unpaid";
        }
      }
    }

    await order.save();

    res.status(200).json({
      status: 200,
      order
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update order status",
    });
  }
};