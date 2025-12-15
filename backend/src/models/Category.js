import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true // Evitamos duplicados
  },
  description: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: '#3498db'
  },
  // 🆕 NUEVO: Icono para que se vea como en tu referencia (puede ser un emoji o clase CSS)
  icon: {
    type: String,
    default: '📁'
  },
  // 🆕 NUEVO: Agrupación para separar las secciones
  group: {
    type: String,
    enum: ['locatarios', 'proveedores', 'comunidad'],
    required: true
  },
  // Opcional: Orden para mostrar (1, 2, 3...)
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'categories'
});

export default mongoose.model('Category', categorySchema);