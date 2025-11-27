import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "El título es obligatorio"],
    trim: true
  },
  content: {
    type: String,
    required: [true, "El contenido es obligatorio"]
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Opcional: Para darle el toque visual "Disputo", podríamos agregar una categoría o etiqueta
  tag: {
    type: String,
    default: 'Comunicado'
  }
}, { timestamps: true });

export default mongoose.model('Blog', blogSchema);