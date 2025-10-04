import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AutoIncrement = require("mongoose-sequence")(mongoose);

const adminUserSchema = new mongoose.Schema({
  id: { type: Number },
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [255, 'El nombre no puede exceder 255 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres']
  },
  employee_id: {
    type: String,
    unique: true,
    sparse: true, // Permite valores null únicos
    trim: true
  },
  department: {
    type: String,
    trim: true,
    enum: ['IT', 'Sales', 'Marketing', 'Support', 'Management', 'Finance', 'HR']
  },
  position: {
    type: String,
    trim: true
  },
  role_id: {
    type: Number,
    required: true
  },
  role_name: {
    type: String,
    enum: ['super_admin', 'admin', 'manager', 'staff', 'viewer']
  },
  role: {
    type: String,
    enum: ['consumer', 'admin', 'vendor', 'staff'],
    default: 'consumer'
  },
  permissions: [{
    type: String,
    trim: true
  }],
  profile_image: {
    type: String,
    default: null
  },
  status: {
    type: Boolean,
    default: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_login: {
    type: Date,
    default: null
  },
  login_attempts: {
    type: Number,
    default: 0
  },
  lock_until: {
    type: Date,
    default: null
  },
  email_verified_at: {
    type: Date,
    default: Date.now
  },
  phone: {
    type: String,
    trim: true
  },
  emergency_contact: {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    relationship: { type: String, trim: true }
  },
  access_level: {
    type: String,
    enum: ['full', 'limited', 'read_only'],
    default: 'limited'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Plugin para auto-incrementar el ID
adminUserSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'admin_user_id' });

// Índices para optimizar consultas
adminUserSchema.index({ email: 1 });
adminUserSchema.index({ employee_id: 1 });
adminUserSchema.index({ role_id: 1 });
adminUserSchema.index({ status: 1, is_active: 1 });

// Middleware para encriptar contraseña antes de guardar
adminUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
adminUserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para verificar si la cuenta está bloqueada
adminUserSchema.methods.isLocked = function(): boolean {
  return !!(this.lock_until && this.lock_until > Date.now());
};

// Método para incrementar intentos de login
adminUserSchema.methods.incLoginAttempts = function(): void {
  // Si tenemos un lock anterior y ya expiró
  if (this.lock_until && this.lock_until < Date.now()) {
    return this.updateOne({
      $unset: { lock_until: 1 },
      $set: { login_attempts: 1 }
    });
  }
  
  const updates: any = { $inc: { login_attempts: 1 } };
  
  // Si llegamos al máximo de intentos y no hay lock, crear uno
  if (this.login_attempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lock_until: Date.now() + 2 * 60 * 60 * 1000 }; // 2 horas
  }
  
  return this.updateOne(updates);
};

// Método para resetear intentos de login
adminUserSchema.methods.resetLoginAttempts = function(): void {
  return this.updateOne({
    $unset: { login_attempts: 1, lock_until: 1 }
  });
};

// Método para actualizar último login
adminUserSchema.methods.updateLastLogin = function(): void {
  return this.updateOne({
    $set: { last_login: new Date() },
    $unset: { login_attempts: 1, lock_until: 1 }
  });
};

// Virtual para obtener el nombre completo con departamento
adminUserSchema.virtual('full_info').get(function() {
  return `${this.name} (${this.department || 'Sin departamento'})`;
});

// Virtual para verificar si es super admin
adminUserSchema.virtual('is_super_admin').get(function() {
  return this.role_name === 'super_admin';
});

// Configurar JSON transform para excluir campos sensibles
adminUserSchema.set('toJSON', {
  transform: function(_doc: any, ret: any) {
    delete ret.password;
    delete ret.login_attempts;
    delete ret.lock_until;
    return ret;
  }
});

export default mongoose.model('AdminUser', adminUserSchema);
