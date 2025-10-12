import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "❌ El nombre es obligatorio"]
  },
  price: {
    type: Number,
    required: true,
    min: [0.01, "💸 El precio debe ser mayor a $0.01"]
  },
  description: String,
  image: String,
  stock: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: true,
    enum: ["electronica", "ropa", "hogar", "otros"]
  }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);