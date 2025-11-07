import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ✅ MANTENEMOS TU PROTECT ACTUAL (está bien)
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: "🔒 No autorizado - Sin token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.status(401).json({ message: "🔐 Token inválido o expirado" });
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

// 🆕 MIDDLEWARES COMBINADOS PARA USO COMÚN
export const requireAdmin = [protect, authorize('admin')];
export const requireProveedor = [protect, authorize('proveedor')];
export const requireLocatario = [protect, authorize('locatario')];
export const requireAdminOrProveedor = [protect, authorize('admin', 'proveedor')];