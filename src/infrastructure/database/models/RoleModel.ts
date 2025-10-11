import mongoose, { Schema, Document } from 'mongoose';

const AutoIncrement = require("mongoose-sequence")(mongoose);

export interface IRoleDocument extends Document {
  id: number;
  name: string;
  slug: string;
  guard_name?: string;
  system_reserve?: number;
  description?: string;
  permissions: number[]; // Array de IDs de permisos
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

const roleSchema = new Schema<IRoleDocument>({
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
    default: 'web',
    trim: true
  },
  system_reserve: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true
  },
  permissions: [{
    type: Number,
    ref: 'Permission'
  }],
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Plugin para auto-incremento
roleSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'role_id' });

// Índices
roleSchema.index({ slug: 1 });
roleSchema.index({ status: 1 });
roleSchema.index({ permissions: 1 });

// Transformar el documento al convertir a JSON
roleSchema.set('toJSON', {
  transform: function(_doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const RoleModel = mongoose.model<IRoleDocument>('Role', roleSchema);

export default RoleModel;