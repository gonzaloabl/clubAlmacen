import express from 'express';
import mongoose from 'mongoose';
import { protect } from '../middleware/authMiddleware.js';
import SystemConfig from '../models/SystemConfig.js';

const router = express.Router();

// Middleware interno para asegurar que sea Admin (Super o Técnico)
const requireTechnicalAccess = (req, res, next) => {
    // 1. Debe estar logueado (req.user existe por 'protect')
    // 2. Debe ser rol 'admin'
    // 3. Su sub-rol debe ser 'superadmin' O 'technical'
    if (
        req.user && 
        req.user.role === 'admin' && 
        (req.user.adminRole === 'superadmin' || req.user.adminRole === 'technical') // <--- AQUÍ ESTÁ EL FILTRO
    ) {
        next(); // ¡Pase usted!
    } else {
        res.status(403).json({ message: '⛔ Acceso denegado: Se requiere nivel Técnico o SuperAdmin.' });
    }
};

// 👇 NUEVA RUTA PÚBLICA (Cualquiera puede preguntar si estamos en mantenimiento)
router.get('/public-status', async (req, res) => {
    try {
        const config = await SystemConfig.findOne({ key: 'global_config' });
        res.json({ 
            maintenance: config ? config.isMaintenanceMode : false 
        });
    } catch (error) {
        // Si falla, asumimos que NO hay mantenimiento para no bloquear por error
        res.json({ maintenance: false });
    }
});

// @desc    Obtener estado del sistema y configuración
// @route   GET /api/system/status
router.get('/status', protect, requireTechnicalAccess, async (req, res) => {
    try {
        // 1. Verificar BD
        const dbStatus = mongoose.connection.readyState === 1 ? 'Conectado 🟢' : 'Desconectado 🔴';
        
        // 2. Obtener configuración (o crearla si no existe)
        let config = await SystemConfig.findOne({ key: 'global_config' });
        if (!config) {
            config = await SystemConfig.create({ key: 'global_config' });
        }

        res.json({
            status: 'online',
            database: dbStatus,
            uptime: process.uptime().toFixed(0) + ' segundos',
            maintenanceMode: config.isMaintenanceMode,
            lastMaintenance: config.lastMaintenanceDate,
            serverTime: new Date()
        });
    } catch (error) {
        res.status(500).json({ message: 'Error de sistema', error: error.message });
    }
});

// @desc    Alternar Modo Mantenimiento
// @route   PUT /api/system/maintenance
router.put('/maintenance', protect, requireTechnicalAccess, async (req, res) => {
    try {
        let config = await SystemConfig.findOne({ key: 'global_config' });
        if (!config) config = await SystemConfig.create({ key: 'global_config' });

        // Invertimos el estado
        config.isMaintenanceMode = !config.isMaintenanceMode;
        config.lastMaintenanceBy = req.user.email;
        config.lastMaintenanceDate = new Date();
        
        await config.save();

        console.log(`🔧 MODO MANTENIMIENTO: ${config.isMaintenanceMode ? 'ACTIVADO 🔴' : 'DESACTIVADO 🟢'} por ${req.user.name}`);

        res.json({ 
            message: `Modo mantenimiento ${config.isMaintenanceMode ? 'ACTIVADO' : 'DESACTIVADO'}`,
            maintenanceMode: config.isMaintenanceMode 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al cambiar modo', error: error.message });
    }
});

export default router;