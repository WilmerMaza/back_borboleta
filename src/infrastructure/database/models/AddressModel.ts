import mongoose from 'mongoose';
import { IAddress } from 'src/domain/entities/Address';

const AutoIncrement = require("mongoose-sequence")(mongoose);

const stateSchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String },
  country_id: { type: Number }
}, { _id: false });

const countrySchema = new mongoose.Schema({
  id: { type: Number },
  name: { type: String },
  code: { type: String }
}, { _id: false });

const addressSchema = new mongoose.Schema({
  id: { type: Number },
  user_id: { type: Number, required: true },
  title: { type: String, required: true },
  street: { type: String, required: true },
  type: { 
    type: String, 
    required: false,
    enum: ['billing', 'shipping'],
    default: 'billing'
  },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  state_id: { type: Number, required: true },
  state: { type: stateSchema },
  country_id: { type: Number, required: true },
  country: { type: countrySchema },
  country_code: { type: Number, required: true },
  phone: { type: Number, required: true },
  is_default: { type: Boolean, default: false }
}, {
  timestamps: true // Esto agregará created_at y updated_at automáticamente
});

// Plugin para auto-incrementar el ID
addressSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'address_id' });

export default mongoose.model<IAddress & mongoose.Document>('Address', addressSchema);
