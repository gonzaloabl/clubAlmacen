import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "El título es obligatorio"],
    trim: true,
    maxlength: [200, "El título no puede tener más de 200 caracteres"]
  },
  content: {
    type: String,
    required: [true, "El contenido es obligatorio"],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  tags: [{ type: String, trim: true }],
  
  // 🆕 NUEVO CAMPO: REGIÓN
  region: {
    type: String,
    default: 'Nacional',
    index: true
  },

  // Campos de interacción
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  
  // Campos de control
  isPinned: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
  
  // Reportes
  reports: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    description: String,
    createdAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true },
  reportCount: { type: Number, default: 0 }

}, { timestamps: true });

// Índices
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ category: 1, createdAt: -1 });


export default mongoose.model('Post', postSchema);