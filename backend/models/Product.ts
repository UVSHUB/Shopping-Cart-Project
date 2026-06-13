import mongoose, { Schema } from 'mongoose';

const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true, index: true },
  image: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  rating: { type: Number, default: 4.5 },
  reviewsCount: { type: Number, default: 12 }
}, { timestamps: true });

export const Product = mongoose.model('Product', ProductSchema);
