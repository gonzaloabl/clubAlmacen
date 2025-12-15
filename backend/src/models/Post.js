import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  
  // ❤️ NUEVO: Likes en comentarios (Híbrido)
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
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
  image: {
    type: String,
    default: null
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
  
  // REGIÓN
  region: {
    type: String,
    default: 'Nacional',
    index: true
  },

  // 🗳️ SISTEMA DE VOTACIÓN (Reemplaza a los likes simples)
  votes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    value: { type: Number, enum: [1, -1] } // 1 = Upvote, -1 = Downvote
  }],

  // ⚡ SCORE CACHEADO (Upvotes - Downvotes) para ordenar rápido
  score: { 
    type: Number, 
    default: 0 
  },

  // Comentarios (usando el schema de arriba que ahora tiene likes)
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
// ⚡ Índice para ordenar por popularidad (score)
postSchema.index({ score: -1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });

export default mongoose.model('Post', postSchema);