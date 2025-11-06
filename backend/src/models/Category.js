import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'categories' // Forzar nombre de colección
});

// Asegurarse de que use la colección correcta
categorySchema.set('collection', 'categories');

export default mongoose.model('Category', categorySchema);