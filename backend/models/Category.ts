import mongoose, { Schema } from 'mongoose';

const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  image: { type: String, required: true }
}, { timestamps: true });

export const Category = mongoose.model('Category', CategorySchema);
