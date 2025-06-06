import mongoose from 'mongoose';
import { IUser } from 'src/domain/entities/User';

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

const roleSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String },
  permissions: [{ type: mongoose.Schema.Types.Mixed }],
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
  profile_image: { type: attachmentSchema },
  profile_image_id: { type: Number },
  status: { type: Boolean, default: true },
  email_verified_at: { type: Date },
  payment_account: { type: paymentDetailsSchema },
  role_id: { type: Number, required: true },
  role_name: { type: String },
  role: { type: roleSchema },
  address: [userAddressSchema],
  point: { type: pointSchema },
  wallet: { type: walletSchema },
  is_approved: { type: Boolean, default: false },
  deleted_at: { type: Date }
}, {
  timestamps: true // Esto agregará created_at y updated_at automáticamente
});

export default mongoose.model<IUser & mongoose.Document>('User', userSchema);