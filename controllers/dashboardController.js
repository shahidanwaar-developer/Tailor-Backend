const Customer = require("../models/customer");
const Order = require("../models/order");
const moment = require("moment");

exports.getDashboardStats = async (req, res) => {
  try {
    const adminId = req.admin._id;
    const startOfMonth = moment().startOf("month").toDate();
    const startOfNextMonth = moment().add(1, "month").startOf("month").toDate();
    const todayStart = moment().startOf("day").toDate();
    const todayEnd = moment().endOf("day").toDate();
    const tomorrowStart = moment().add(1, "day").startOf("day").toDate();
    const tomorrowEnd = moment().add(2, "days").startOf("day").toDate();
    const upcomingEnd = moment().add(7, "days").endOf("day").toDate();

    //customer counts
    const totalCustomers = await Customer.countDocuments({
      adminId,
      isDeleted: false,
    });

    //recent order list
    const recentOrders = await Order.find({
      adminId,
      isDeleted: false,
    })
      .populate("customerId", "name phone")
      .sort({ createdAt: -1 })
      .limit(5);


    // all orders count
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

    // Payment calculation
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

          // Pending amount from all orders
          totalPendingPayment: {
            $sum: {
              $ifNull: ["$remainingAmount", 0],
            },
          },

          // Earned amount from delivered orders
          totalEarnedPayment: {
            $sum: {
              $cond: [
                {
                  $eq: ["$orderStatus", "Delivered"],
                },
                {
                  $ifNull: ["$advancePaid", 0],
                },
                0,
              ],
            },
          },

          // Earned from orders delivered this month
          totalEarnedThisMonthPayment: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: ["$orderStatus", "Delivered"],
                    },
                    {
                      $gte: ["$deliveredAt", startOfMonth],
                    },
                    {
                      $lt: ["$deliveredAt", startOfNextMonth],
                    },
                  ],
                },
                {
                  $ifNull: ["$advancePaid", 0],
                },
                0,
              ],
            },
          },
        },
      },
    ]);

    const paymentData = paymentSummary[0] || {
      totalPendingPayment: 0,
      totalEarnedPayment: 0,
      totalEarnedThisMonthPayment: 0,
    };

    // order calculating by deadline
    const todayDeadlines = await Order.countDocuments({
      adminId,
      isDeleted: false,
      orderStatus: {
        $nin: ["Completed", "Delivered"],
      },
      deadline: {
        $gte: todayStart,
        $lt: todayEnd,
      },
    });

    const tomorrowDeadlines = await Order.countDocuments({
      adminId,
      isDeleted: false,
      orderStatus: {
        $nin: ["Completed", "Delivered"],
      },
      deadline: {
        $gte: tomorrowStart,
        $lt: tomorrowEnd,
      },
    });

    const overdueDeadlines = await Order.countDocuments({
      adminId,
      isDeleted: false,
      orderStatus: {
        $nin: ["Completed", "Delivered"],
      },
      deadline: {
        $lt: todayStart,
      },
    });

    const upcomingDeadlines = await Order.countDocuments({
      adminId,
      isDeleted: false,
      orderStatus: {
        $nin: ["Completed", "Delivered"],
      },
      deadline: {
        $gt: tomorrowEnd,
        $lt: upcomingEnd,
      },
    });

    res.status(200).json({
      status: 200,
      data: {
        totalCustomers,
        recentOrders,
        orders: {
          totalOrders,
          pendingOrders,
          inProgressOrders,
          completedOrders,
          deliveredOrders,
        },
        payment: {
          totalPending: paymentData?.totalPendingPayment || 0,
          totalEarned: paymentData?.totalEarnedPayment || 0,
          earnedthismonth: paymentData?.totalEarnedThisMonthPayment || 0,
        },
        deadlines: {
          overdue: overdueDeadlines || 0,
          today: todayDeadlines || 0,
          tomorrow: tomorrowDeadlines || 0,
          upcoming: upcomingDeadlines || 0,
        },
      }
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return res.status(500).json({
      status: 500,
      message: "Failed to fetch dashboard stats",
      error: error.message,
      stack:
        process.env.NODE_ENV === "development"
          ? error.stack
          : undefined,
    });
  }
};