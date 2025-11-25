// backend/src/scripts/initSuperAdmin.js
import mongoose from 'mongoose';
import User from '../models/User.js'; // Asegúrate que la ruta sea correcta
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configuración para cargar .env correctamente
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Ajustamos la ruta para buscar el .env en la raíz del backend o del proyecto
dotenv.config({ path: join(__dirname, '../../.env') }); 

const createSuperAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('❌ MONGODB_URI no definida en .env');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔌 Conectado a MongoDB...');

    // Datos del Superadmin (Definir en .env o usar defaults seguros para dev)
    const email = process.env.SUPERADMIN_EMAIL || 'admin@clubalmacen.cl';
    const password = process.env.SUPERADMIN_PASSWORD || 'Admin123!';
    const name = process.env.SUPERADMIN_NAME || 'Super Admin';

    // Verificar si ya existe
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Si existe, lo actualizamos para asegurar que tenga el rango máximo
      let updated = false;
      if (existingUser.role !== 'admin' || existingUser.adminRole !== 'superadmin') {
        existingUser.role = 'admin';
        existingUser.adminRole = 'superadmin';
        await existingUser.save();
        updated = true;
      }
      console.log(updated 
        ? '⚠️ Usuario existente actualizado a Superadmin.' 
        : '✅ El Superadmin ya existe y está configurado.');
    } else {
      // Crear nuevo Superadmin
      await User.create({
        name,
        email,
        password, // El modelo lo hasheará automáticamente
        role: 'admin',
        adminRole: 'superadmin',
        isVerified: true,
        registrationComplete: true,
        oauthProvider: 'local'
      });
      console.log(`👑 Superadmin creado: ${email}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

createSuperAdmin();