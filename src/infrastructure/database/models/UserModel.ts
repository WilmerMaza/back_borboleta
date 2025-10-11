import mongoose from 'mongoose';
import { IUser } from 'src/domain/entities/User';

const AutoIncrement = require("mongoose-sequence")(mongoose);

// Esquemas para los subdocumentos
const attachmentSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String },
  url: { type: String },
  type: { type: String },
  size: { type: Number },
  created_at: { type: Date },
  updated_at: { type: Date }
}, { _id: false });

const paymentDetailsSchema = new mongoose.Schema({
  id: { type: Number },
  user_id: { type: Number },
  account_type: { type: String },
  account_number: { type: String },
  bank_name: { type: String },
  is_default: { type: Boolean, default: false },
  created_at: { type: Date },
  updated_at: { type: Date }
}, { _id: false });


const userAddressSchema = new mongoose.Schema({
  id: { type: Number },
  user_id: { type: Number },
  title: { type: String },
  default: { type: Boolean, default: false },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zip: { type: String },
  country: { type: String },
  created_at: { type: Date },
  updated_at: { type: Date }
}, { _id: false });

const pointSchema = new mongoose.Schema({
  id: { type: Number },
  user_id: { type: Number },
  points: { type: Number, default: 0 },
  created_at: { type: Date },
  updated_at: { type: Date }
}, { _id: false });

const walletSchema = new mongoose.Schema({
  id: { type: Number },
  user_id: { type: Number },
  balance: { type: Number, default: 0 },
  created_at: { type: Date },
  updated_at: { type: Date }
}, { _id: false });

const userSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  country_code: { type: Number, required: true },
  password: { type: String, required: true },
  profile_image: { type: attachmentSchema },
  profile_image_id: { type: Number },
  status: { type: Boolean, default: true },
  email_verified_at: { type: Date },
  payment_account: { type: paymentDetailsSchema },
  role_id: { type: Number },
  role_name: { type: String },
  address: [userAddressSchema],
  point: { type: pointSchema },
  wallet: { type: walletSchema },
  is_approved: { type: Boolean, default: false },
  deleted_at: { type: Date }
}, {
  timestamps: true // Esto agregará created_at y updated_at automáticamente
});

// Plugin para auto-incrementar el ID
userSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'user_id' });

// Método para verificar contraseña
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para generar hash de contraseña
userSchema.methods.hashPassword = async function(password: string): Promise<string> {
  const bcrypt = require('bcryptjs');
  const { authConfig } = require('../../../config/auth');
  return bcrypt.hash(password, authConfig.BCRYPT_SALT_ROUNDS);
};

export default mongoose.model<IUser & mongoose.Document>('User', userSchema);