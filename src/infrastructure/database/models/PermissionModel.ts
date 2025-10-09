import mongoose, { Schema, Document } from 'mongoose';

const AutoIncrement = require("mongoose-sequence")(mongoose);

export interface IPermissionDocument extends Document {
  id: number;
  name: string;
  slug: string;
  guard_name: string;
  description?: string;
  module: string;
  action: string;
  resource?: string;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

const permissionSchema = new Schema<IPermissionDocument>({
  id: {
    type: Number,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  guard_name: {
    type: String,
    required: true,
    default: 'web',
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  module: {
    type: String,
    required: true,
    enum: ['users', 'products', 'orders', 'reports', 'settings', 'categories', 'dashboard', 'admin', 'roles', 'stores', 'wallet', 'refunds', 'reviews']
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'manage', 'export', 'import']
  },
  resource: {
    type: String,
    enum: ['all', 'own', 'department'],
    default: 'all'
  },
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Plugin para auto-incremento (solo si no se especifica el ID)
permissionSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'permission_id' });

// Índices
permissionSchema.index({ slug: 1 });
permissionSchema.index({ module: 1 });
permissionSchema.index({ action: 1 });
permissionSchema.index({ status: 1 });

// Transformar el documento al convertir a JSON
permissionSchema.set('toJSON', {
  transform: function(_doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const PermissionModel = mongoose.model<IPermissionDocument>('Permission', permissionSchema);

export default PermissionModel;