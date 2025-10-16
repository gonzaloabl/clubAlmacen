import dotenv from 'dotenv';
dotenv.config();
console.log('🔄 Variables después de dotenv:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID || '❌ No definido');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Existe' : '❌ No existe');
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import postRoutes from './routes/postRoutes.js';
import googleAuthRoutes from './routes/googleAuthRoutes.js';
import passport from './config/passport.js';



const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(passport.initialize());


// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error de conexión:', err));


// Ruta de prueba
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes); 
app.use('/api/posts', postRoutes);
app.use('/api/auth/google', googleAuthRoutes);

app.get('/api/ping', (req, res) => {
  res.json({ message: '🐶 ¡Backend activo, mi perro loco!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend en http://localhost:${PORT}`);
});