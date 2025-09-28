import mongoose from 'mongoose';

const AutoIncrement = require("mongoose-sequence")(mongoose);

const permissionSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String, required: true, unique: true },
  guard_name: { type: String, default: 'web' },
  description: { type: String },
  resource: { type: String }, // ej: 'users', 'products', 'orders'
  action: { type: String }, // ej: 'read', 'write', 'delete'
  status: { type: Boolean, default: true }
}, {
  timestamps: true // Esto agregará created_at y updated_at automáticamente
});

// Plugin para auto-incrementar el ID
permissionSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'permission_id' });

export default mongoose.model('Permission', permissionSchema);
