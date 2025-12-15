import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import SystemConfig from '../models/SystemConfig.js';

// ✅ MANTENEMOS TU PROTECT ACTUAL CON LOGS MEJORADOS
export const protect = async (req, res, next) => {
  console.log('🔐 Middleware protect ejecutándose...');
  
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('🔑 Token encontrado en headers');
  } else {
    console.log('❌ No hay token en headers');
  }

  if (!token) {
    console.log('❌ No hay token disponible');
    return res.status(401).json({ message: "🔒 No autorizado - Sin token" });
  }

  try {
    console.log('🔍 Verificando token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decodificado:', decoded);
    
    console.log('🔍 Buscando usuario en BD...');
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      console.log('❌ Usuario no encontrado en BD');
      return res.status(401).json({ message: "🔒 Usuario no encontrado" });
    }

    if (req.user.isActive === false) {
       console.log('⛔ Token válido pero usuario baneado:', req.user.email);
       return res.status(403).json({ message: "⛔ Tu cuenta ha sido suspendida." });
    }

    // Buscamos la configuración global
    const config = await SystemConfig.findOne({ key: 'global_config' });
    
    // Si está activado Y el usuario NO es admin... ¡FUERA!
    if (config && config.isMaintenanceMode && req.user.role !== 'admin') {
        console.log(`🚧 Bloqueando acceso a ${req.user.email} por Mantenimiento`);
        return res.status(503).json({ 
            message: "🚧 El sistema está en mantenimiento. Vuelve en unos minutos." 
        });
    }
    
    console.log('✅ Usuario encontrado:', {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    });
    
    next();
  } catch (error) {
    console.error('💥 Error en middleware protect:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "🔐 Token inválido" });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "🔐 Token expirado" });
    } else {
      return res.status(401).json({ message: "🔐 Error de autenticación" });
    }
  }
};

// ✅ MANTENEMOS TU ADMIN ACTUAL 
export const admin = (req, res, next) => {
  if (req.user?.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "⛔ Acceso denegado: Requiere ser admin" });
  }
};

// 🆕 AGREGAMOS MIDDLEWARE PARA MÚLTIPLES ROLES
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado, usuario no autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `⛔ Acceso denegado. Rol ${req.user.role} no autorizado. Roles permitidos: ${roles.join(', ')}`
      });
    }

    next();
  };
};
export const requireSuperAdmin = (req, res, next) => {
  // Verificamos si es admin Y si su sub-rol es superadmin
  if (req.user && req.user.role === 'admin' && req.user.adminRole === 'superadmin') {
    next();
  } else {
    res.status(403).json({ message: "⛔ Acceso denegado: Se requiere nivel Superadmin" });
  }
};

// 🆕 MIDDLEWARES COMBINADOS PARA USO COMÚN
export const requireAdmin = [protect, authorize('admin')];
export const requireProveedor = [protect, authorize('proveedor')];
export const requireLocatario = [protect, authorize('locatario')];
export const requireAdminOrProveedor = [protect, authorize('admin', 'proveedor')];