import dotenv from 'dotenv';
dotenv.config();
console.log('🔄 Variables después de dotenv:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID || '❌ No definido');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Existe' : '❌ No existe');
import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cron from 'node-cron';  
import { fileURLToPath } from 'url';               
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import postRoutes from './routes/postRoutes.js';
import googleAuthRoutes from './routes/googleAuthRoutes.js';
import passport, { configurePassport } from './config/passport.js';
import adminRoutes from './routes/adminRoutes.js';
import googleCompleteRoutes from './routes/googleCompleteRoutes.js';
import newsRoutes from './routes/newsRoutes.js'; // Importamos la nueva ruta
import { fetchAndSaveNews } from './scripts/fetchNews.js'; // Importamos la función del script
import blogRoutes from './routes/blogRoutes.js';




const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(passport.initialize());
configurePassport();
// Debug de rutas (agregar temporalmente)
app.use((req, res, next) => {
  console.log(`🔍 [${req.method}] ${req.originalUrl}`);
  next();
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error de conexión:', err));


// Ruta de prueba

app.use('/api/auth', authRoutes);
app.use('/api/auth/google', googleAuthRoutes);
app.use('/api/auth/google/complete', googleCompleteRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes); 
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// --- TAREA PROGRAMADA (CRON JOB) ---
// Se ejecutará "cada 30 minutos"
cron.schedule('*/30 * * * *', () => {
  console.log('EJECUTANDO TAREA PROGRAMADA: Buscando noticias RSS...');
  
  // Aseguramos que la ejecución no detenga el servidor en caso de error
  fetchAndSaveNews().catch(err => {
    console.error('Error en la tarea programada de noticias:', err);
  });
});


app.get('/api/ping', (req, res) => {
  res.json({ message: '🐶 ¡Backend activo, mi perro loco!' });
});

// � DEBUG: Listar todas las rutas montadas
app.use((req, res, next) => {
  console.log('🔍 Solicitud recibida:', {
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    path: req.path
  });
  next();
});

// 🆕 MANEJO DE ERRORES GLOBAL
app.use((err, req, res, next) => {
  console.error('💥 Error global no capturado:', err);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// 🆕 MANEJADOR PARA RUTAS NO ENCONTRADAS
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend en http://localhost:${PORT}`);
  fetchAndSaveNews();
});

console.log('✅ Ruta /api/categories registrada');
// � DEBUG: Listar todas las rutas montadas
app.use((req, res, next) => {
  console.log('🔍 Solicitud recibida:', {
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    path: req.path
  });
  next();
});