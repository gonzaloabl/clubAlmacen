import mongoose from 'mongoose';

const ticketSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Soporte Software POS', 'Falla Hardware POS', 'Duda General', 'Solicitud Visita Técnica'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Baja', 'Media', 'Alta', 'Urgente'],
    default: 'Media'
  },
  status: {
    type: String,
    enum: ['Abierto', 'En Proceso', 'Cerrado'],
    default: 'Abierto'
  },
  // Chat del ticket
  responses: [{
    sender: { type: String }, // 'Usuario' o 'Soporte'
    message: { type: String },
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export default mongoose.model('Ticket', ticketSchema);