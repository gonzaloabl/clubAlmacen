import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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

// Middleware para admin
export const admin = (req, res, next) => {
  if (req.user?.role === "admin") { // Usa optional chaining por seguridad
    next();
  } else {
    res.status(403).json({ message: "⛔ Acceso denegado: Requiere ser admin" });
  }
};