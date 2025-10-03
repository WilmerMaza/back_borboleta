import mongoose from 'mongoose';

const AutoIncrement = require("mongoose-sequence")(mongoose);

const orderStatusActivitySchema = new mongoose.Schema({
  id: { type: Number },
  order_id: { type: Number, required: true },
  order_status_id: { type: Number, required: true },
  status: { type: String, required: true },
  status_name: { type: String },
  note: { type: String },
  changed_at: { type: Date, required: true }
}, {
  timestamps: true
});

// Plugin para auto-incrementar el ID
orderStatusActivitySchema.plugin(AutoIncrement, { inc_field: 'id', id: 'order_status_activity_id' });

export default mongoose.model('OrderStatusActivity', orderStatusActivitySchema);
