import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, "El nombre del producto es obligatorio"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "La descripción es obligatoria"]
  },
  price: {
    type: Number,
    required: [true, "El precio es obligatorio"],
    min: 0
  },
  stock: {
    type: Number,
    default: 1,
    min: 0
  },
  image: {
    type: String, // Guardaremos la URL de la imagen subida
    default: null
  },
  category: {
    type: String,
    default: 'General' // Podríamos usar el modelo Category, pero para empezar simple usamos string
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);