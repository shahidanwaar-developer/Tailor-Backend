const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String },
  address: { type: String },
  col_time: { type: Date },
  last_date: { type: Date }, // Consider using Date if you're storing datetime

  items: { type: Number, default: 0 },
  status: { type: String, default: 'Pending' },

  kameez: { type: Number, default: 0 },
  bazoo: { type: Number, default: 0 },
  teera: { type: Number, default: 0 },
  gla: { type: Number, default: 0 },
  chati: { type: Number, default: 0 },
  kmr: { type: Number, default: 0 },
  geera: { type: Number, default: 0 },
  shalwar: { type: Number, default: 0 },
  pancha: { type: Number, default: 0 },
  front: { type: Number, default: 0 },
  side: { type: Number, default: 0 },
  zip: { type: Number, default: 0 },

  colr: { type: Boolean, default: false },
  ban: { type: Boolean, default: false },
  kaf: { type: Boolean, default: false },
  pleat: { type: Boolean, default: false },
});

module.exports = mongoose.model('Customer', CustomerSchema);
