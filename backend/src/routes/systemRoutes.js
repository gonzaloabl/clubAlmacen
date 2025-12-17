import express from 'express';
import mongoose from 'mongoose';
import { protect, admin } from '../middleware/authMiddleware.js';
import SystemConfig from '../models/SystemConfig.js';
// 👇 IMPORTACIONES CRÍTICAS QUE FALTABAN 👇
import User from '../models/User.js';
import Post from '../models/Post.js';

const router = express.Router();

// @desc    Obtener métricas para el Dashboard (Fila 1)
// @route   GET /api/system/stats
router.get('/stats', protect, admin, async (req, res) => {
  try {
    // 1. Usuarios totales
    const totalUsers = await User.countDocuments();

    // 2. Posts activos
    const totalPosts = await Post.countDocuments({ isActive: true });

    // 3. Posts que tienen reportes (Lógica embebida)
    // Verificamos si el array 'reports' tiene al menos un elemento
    const pendingReports = await Post.countDocuments({ 
      "reports.0": { $exists: true },
      isActive: true 
    });

    res.json({
      totalUsers,
      totalPosts,
      pendingReports
    });
  } catch (error) {
    console.error('💥 ERROR EN /STATS:', error);
    res.status(500).json({ 
      message: 'Error al calcular métricas',
      error: error.message 
    });
  }
});

// Middleware interno para nivel Técnico o SuperAdmin
const requireTechnicalAccess = (req, res, next) => {
    if (
        req.user && 
        req.user.role === 'admin' && 
        (req.user.adminRole === 'superadmin' || req.user.adminRole === 'technical')
    ) {
        next();
    } else {
        res.status(403).json({ message: '⛔ Acceso denegado: Se requiere nivel Técnico o SuperAdmin.' });
    }
};

// Ruta pública para verificar mantenimiento
router.get('/public-status', async (req, res) => {
    try {
        const config = await SystemConfig.findOne({ key: 'global_config' });
        res.json({ maintenance: config ? config.isMaintenanceMode : false });
    } catch (error) {
        res.json({ maintenance: false });
    }
});

// @desc    Estado del servidor (Fila 2)
// @route   GET /api/system/status
router.get('/status', protect, requireTechnicalAccess, async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado';
        
        let config = await SystemConfig.findOne({ key: 'global_config' });
        if (!config) config = await SystemConfig.create({ key: 'global_config' });

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
router.put('/maintenance', protect, requireTechnicalAccess, async (req, res) => {
    try {
        let config = await SystemConfig.findOne({ key: 'global_config' });
        if (!config) config = await SystemConfig.create({ key: 'global_config' });

        config.isMaintenanceMode = !config.isMaintenanceMode;
        config.lastMaintenanceBy = req.user.email;
        config.lastMaintenanceDate = new Date();
        await config.save();

        res.json({ 
            message: `Modo mantenimiento ${config.isMaintenanceMode ? 'ACTIVADO' : 'DESACTIVADO'}`,
            maintenanceMode: config.isMaintenanceMode 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al cambiar modo', error: error.message });
    }
});

export default router;