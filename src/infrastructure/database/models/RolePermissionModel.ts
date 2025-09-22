import mongoose from 'mongoose';

const rolePermissionSchema = new mongoose.Schema({
  role_id: { type: Number, required: true },
  permission_id: { type: Number, required: true }
}, {
  timestamps: true // Esto agregará created_at y updated_at automáticamente
});

// Índice compuesto para evitar duplicados
rolePermissionSchema.index({ role_id: 1, permission_id: 1 }, { unique: true });

export default mongoose.model('RolePermission', rolePermissionSchema);

