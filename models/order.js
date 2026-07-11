const mongoose = require("mongoose");

const suitSchema = new mongoose.Schema(
  {
    suitType: {
      type: String,
      required: true,
      trim: true,
    },

    clothColor: {
      type: String,
      trim: true,
      default: "",
    },

    clothDetails: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: true,
  }
);

const orderSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    suits: {
      type: [suitSchema],
      validate: {
        validator: function (value) {
          return value.length > 0;
        },
        message: "At least one suit is required.",
      },
    },

    orderStatus: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Delivered"],
      default: "Pending",
    },

    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Partial", "Paid"],
      default: "Unpaid",
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    advancePaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    remainingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    orderDate: {
      type: Date,
      default: Date.now,
    },

    deadline: {
      type: Date,
      required: true,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", function (next) {
  this.remainingAmount = Math.max(this.totalAmount - this.advancePaid, 0);

  if (this.remainingAmount === 0) {
    this.paymentStatus = "Paid";
  } else if (this.advancePaid > 0) {
    this.paymentStatus = "Partial";
  } else {
    this.paymentStatus = "Unpaid";
  }

  next();
});

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);