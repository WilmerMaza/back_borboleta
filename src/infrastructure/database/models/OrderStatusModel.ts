import mongoose from 'mongoose';

const AutoIncrement = require("mongoose-sequence")(mongoose);

const orderStatusSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String, required: true },
  sequence: { type: Number, required: true },
  slug: { type: String, required: true, unique: true },
  activities_date: { type: String, required: true },
  created_by_id: { type: Number, required: true },
  status: { type: Boolean, default: true },
  deleted_at: { type: Date, default: null }
}, {
  timestamps: true
});

// Plugin para auto-incrementar el ID
orderStatusSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'order_status_id' });

export default mongoose.model('OrderStatus', orderStatusSchema);
