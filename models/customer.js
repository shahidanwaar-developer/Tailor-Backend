const mongoose = require("mongoose");

const measurementSchema = new mongoose.Schema(
  {
    lmbai: { type: Number, default: 0 },
    bazoo: { type: Number, default: 0 },
    teera: { type: Number, default: 0 },
    gla: { type: Number, default: 0 },
    chati: { type: Number, default: 0 },
    kmr: { type: Number, default: 0 },
    geera: { type: Number, default: 0 },
    shalwar: { type: Number, default: 0 },
    pancha: { type: Number, default: 0 },
    knda: { type: Number, default: 0 },
    kaf: { type: Number, default: 0 },

    slai: {
      type: String,
      enum: ["Single", "Double"],
      default: "Single",
    },

    reshmi: { type: Boolean, default: false },
    front: { type: Number, default: 0 },
    side: { type: Number, default: 0 },
    zip: { type: Number, default: 0 },
    colr: { type: Boolean, default: false },
    ban: { type: Boolean, default: false },
    pleat: { type: Boolean, default: false },

    message: {
      type: String,
      trim: true,
      default: "",
    },

    detail: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const customerSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    isNotify: {
      type: Boolean,
      default: true,
    },

    measurements: {
      type: measurementSchema,
      default: {},
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
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

module.exports =
  mongoose.models.Customer || mongoose.model("Customer", customerSchema);