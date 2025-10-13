// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay un token al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔍 Token encontrado:', !!token);
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      console.log('🔄 Cargando datos del usuario...');
      const userData = await userAPI.getProfile();
      console.log('✅ Usuario cargado:', userData);
      setUser(userData);
    } catch (err) {
      console.error('❌ Error al cargar usuario:', err);
      localStorage.removeItem('token');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      console.log('🔄 Intentando login...');
      const data = await authAPI.login({ email, password });
      console.log('✅ Login exitoso:', data);
      
      localStorage.setItem('token', data.token);
      // Actualizar el estado del usuario
      setUser({ 
        _id: data._id, 
        name: data.name, 
        email: data.email,
        role: data.role 
      });
      return { success: true };
    } catch (err) {
      console.error('❌ Error en login:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    try {
      setError(null);
      setLoading(true);
      console.log('🔄 Intentando registro...');
      const data = await authAPI.register({ name, email, password });
      console.log('✅ Registro exitoso:', data);
      
      localStorage.setItem('token', data.token);
      setUser({ 
        _id: data._id, 
        name: data.name, 
        email: data.email,
        role: data.role 
      });
      return { success: true };
    } catch (err) {
      console.error('❌ Error en registro:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Cerrando sesión...');
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
    // Limpiar completamente el estado
    setLoading(false);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};