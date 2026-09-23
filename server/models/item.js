const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: { type: String, required: true },
  category: { type: String, default: 'Other' },
  store: { type: String },
  purchaseDate: { type: Date, required: true },
  amount: { type: Number },
  warrantyMonths: { type: Number, required: true },
  expiresOn: { type: Date, required: true },
  receiptUrl: { type: String },
  notes: { type: String },
  reminderSentAt: { type: Date, default: null },
}, { timestamps: true });

itemSchema.index({ expiresOn: 1, reminderSentAt: 1 });
itemSchema.index({ user: 1 });

module.exports = mongoose.model('Item', itemSchema);