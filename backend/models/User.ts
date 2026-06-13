import mongoose, { Schema } from 'mongoose';

const PasskeySchema = new Schema({
  credentialID: { type: String, required: true },
  publicKey: { type: String, required: true }, // Base64url encoded
  counter: { type: Number, default: 0 },
  deviceType: { type: String, default: 'singleDevice' },
  backedUp: { type: Boolean, default: false },
  transports: [String]
});

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, required: true },
  password: { type: String }, // Optional for Passkey-only / OAuth users
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  passkeys: [PasskeySchema]
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
