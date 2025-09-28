import mongoose from 'mongoose';

const AutoIncrement = require("mongoose-sequence")(mongoose);

const roleSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String, required: true, unique: true },
  guard_name: { type: String, default: 'web' },
  system_reserve: { type: Number, default: 0 }, // 0 = no reservado, 1 = reservado del sistema
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }]
}, {
  timestamps: true // Esto agregará created_at y updated_at automáticamente
});

// Plugin para auto-incrementar el ID
roleSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'role_id' });

export default mongoose.model('Role', roleSchema);
