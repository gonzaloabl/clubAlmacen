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
    required: [true, "🔒 La contraseña es obligatoria"],
    minlength: [6, "⚠️ Mínimo 6 caracteres"]
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
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
  }
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