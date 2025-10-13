import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre de la categoría es obligatorio"],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  color: {
    type: String,
    default: "#8d8d8d" // Color por defecto para la categoría
  }
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);