import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "👑 El nombre es obligatorio, mi rey"]
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "📧 Correo inválido"]
  },
  password: {
    type: String,
    required: function() {
    // Solo requerido para autenticación local, no para Google
    return this.oauthProvider === 'local';
  },
    minlength: [6, "⚠️ Mínimo 6 caracteres"]
  },
  role: {
    type: String,
    enum: ['locatario', 'proveedor', 'admin','pending'],
    default: 'locatario'
  },
  adminRole: {
    type: String,
    enum: [
      'superadmin', // El Mandante/Dueño
      'regional',   // Admin de Zona
      'technical',  // Soporte Técnico
      null          // Para usuarios normales
    ],
    default: null
  },
  // 🆕 Región (Solo para Admin Regional)
  region: {
    type: String,
    default: null 
  },
  adminCreationCode: {
    type: String,
    select: false
  },
  registrationComplete: {
    type: Boolean,
    default: true, //para los usuarios locales
  },
  cart: {
    type: [
      {
        product: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Product' 
        },
        quantity: { 
          type: Number, 
          default: 1 
        }
      }
    ],
    default: []
  },
  googleId: {
      type: String,
      sparse: true  // Permite tener null para usuarios locales
  },
  avatar: {
      type: String,
      default: ''
  },
  isVerified: {
      type: Boolean,
      default: false
  },
  oauthProvider: {
      type: String,
      enum: ['google', 'local'],
      default: 'local'
  },
  phone: { 
    type: String, 
    default: '' 
  },
  address: { 
    type: String, 
    default: '' 
  },
  businessName: { 
    type: String, 
    default: '' 
  }, // Ej: "Almacén Don Pepe"
  businessDescription: { 
    type: String, 
    default: '' 
  }, // Ej: "Venta de abarrotes..."
  website: { 
    type: String, 
    default: '' 
  },
  whatsapp: {
     type: String,
    default: '' 
  },
  avatar: { 
    type: String, 
    default: '' 
  },
  
}, { timestamps: true });

// Hash password ANTES de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar passwords
userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);