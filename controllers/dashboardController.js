const Customer = require("../models/customer");
const Order = require("../models/order");

exports.getDashboardStats = async (req, res) => {
  try {
    const adminId = req.admin._id;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const upcomingEnd = new Date();
    upcomingEnd.setDate(upcomingEnd.getDate() + 7);
    upcomingEnd.setHours(23, 59, 59, 999);

    const totalCustomers = await Customer.countDocuments({
      adminId,
      isDeleted: false,
    });

    const totalOrders = await Order.countDocuments({
      adminId,
      isDeleted: false,
    });

    const pendingOrders = await Order.countDocuments({
      adminId,
      isDeleted: false,
      orderStatus: "Pending",
    });

    const inProgressOrders = await Order.countDocuments({
      adminId,
      isDeleted: false,
      orderStatus: "In Progress",
    });

    const completedOrders = await Order.countDocuments({
      adminId,
      isDeleted: false,
      orderStatus: "Completed",
    });

    const deliveredOrders = await Order.countDocuments({
      adminId,
      isDeleted: false,
      orderStatus: "Delivered",
    });

    const paymentSummary = await Order.aggregate([
      {
        $match: {
          adminId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          totalPendingPayment: {
            $sum: "$remainingAmount",
          },
        },
      },
    ]);

    const todayDeadlines = await Order.countDocuments({
      adminId,
      isDeleted: false,
      deadline: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    });

    const upcomingDeadlines = await Order.countDocuments({
      adminId,
      isDeleted: false,
      deadline: {
        $gt: todayEnd,
        $lte: upcomingEnd,
      },
    });

    const recentOrders = await Order.find({
      adminId,
      isDeleted: false,
    })
      .populate("customerId", "name phone")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      totalCustomers,
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      deliveredOrders,
      totalPendingPayment: paymentSummary[0]?.totalPendingPayment || 0,
      todayDeadlines,
      upcomingDeadlines,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard stats",
    });
  }
};