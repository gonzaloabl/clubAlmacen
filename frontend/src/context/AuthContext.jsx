// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, userAPI } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay un token al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔍 AuthContext: Verificando token al inicio...');
    
    if (token) {
      console.log('🔍 AuthContext: Token encontrado, llamando a loadUser().');
      // No necesitamos 'loadUser' en las dependencias aquí
      // porque el 'useCallback' de abajo asegura que es estable.
      // Pero como el array está vacío, solo llamamos la función.
      // (Para ser 100% estricto, podríamos añadir loadUser
      // a las dependencias si también lo añadimos al array de 
      // dependencias de loadUser, pero no es necesario para este efecto).
      
      // Corrección: El loadUser de abajo aún no está definido
      // en el scope de este useEffect. Lo mejor es mover la lógica
      // de loadUser *dentro* del useEffect o llamarlo como está.
      
      // La lógica original está bien, pero 'loadUser' debe estar
      // definido ANTES de este useEffect o ser llamado sin ser
      // dependencia. Vamos a definirlo primero.

      // Definimos loadUser primero (movido de abajo)
      const loadUserInternal = async () => {
        try {
          console.log('🔄 Cargando datos del usuario...');
          const userData = await userAPI.getProfile();
          console.log('✅ Usuario cargado:', userData);
          setUser(userData);

          if (userData.oauthProvider === 'google' && !userData.registrationComplete) {
            console.log('🔄 Usuario Google necesita completar registro');
          }

        } catch (err) {
          console.error('❌ Error al cargar usuario:', err);
          localStorage.removeItem('token');
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      loadUserInternal();

    } else {
      console.log('🔍 AuthContext: No hay token, estableciendo loading a false.');
      setLoading(false);
    }
  }, []); // <-- Correcto: Ejecutar solo una vez

  // --- FUNCIONES MEMOIZADAS CON useCallback ---

  const loadUser = useCallback(async () => {
    try {
      console.log('🔄 Cargando datos del usuario...');
      const userData = await userAPI.getProfile();
      console.log('✅ Usuario cargado:', userData);
      setUser(userData);

      if (userData.oauthProvider === 'google' && !userData.registrationComplete) {
        console.log('🔄 Usuario Google necesita completar registro');
      }

    } catch (err) {
      console.error('❌ Error al cargar usuario:', err);
      localStorage.removeItem('token');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []); // <-- ✅ Array de dependencias vacío

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      console.log('🔄 Intentando login...');
      const data = await authAPI.login({ email, password });
      console.log('✅ Login exitoso:', data);
      
      localStorage.setItem('token', data.token);
      setUser({ 
        _id: data._id, 
        name: data.name, 
        email: data.email,
        role: data.role,
        adminRole: data.adminRole
      });
      return { success: true };
    } catch (err) {
      console.error('❌ Error en login:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []); // <-- ✅ Array de dependencias vacío

  const register = useCallback(async (name, email, password, role = 'locatario', adminCreationCode = '') => {
    try {
      setError(null);
      setLoading(true);
      console.log('🔄 Intentando registro...', { name, email, role });
      
      const data = await authAPI.register({ 
        name, 
        email, 
        password, 
        role,
        adminCreationCode 
      });
      
      console.log('✅ Registro exitoso:', data);
      
      localStorage.setItem('token', data.token);
      setUser({ 
        _id: data._id, 
        name: data.name, 
        email: data.email,
        role: data.role,
        adminRole: data.adminRole,
        oauthProvider: 'local',
        registrationComplete: true
      });
      return { success: true };
    } catch (err) {
      console.error('❌ Error en registro:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []); // <-- ✅ Array de dependencias vacío

  const completeGoogleRegistration = useCallback(async (role, adminCreationCode = '') => {
    try {
      setError(null);
      setLoading(true);
      
      const url = '/api/auth/google/complete';
      console.log('🔄 Completando registro Google...', { role, url });

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación disponible');
      }

      console.log('🔑 Token disponible: ✅');
      
      const requestBody = {
        role,
        ...(role === 'admin' && adminCreationCode ? { adminCreationCode } : {})
      };

      console.log('📦 Enviando datos:', requestBody);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          const text = await response.text();
          throw new Error(`Error ${response.status}: ${text || 'Error del servidor'}`);
        }
        throw new Error(errorData.message || `Error ${response.status}`);
      }

      const responseData = await response.json();
      console.log('✅ Registro Google completado:', responseData);
      
      const updatedUser = {
        _id: responseData._id, 
        name: responseData.name, 
        email: responseData.email,
        role: responseData.role,
        oauthProvider: 'google',
        registrationComplete: responseData.registrationComplete
      };
      
      setUser(updatedUser);
      console.log('✅ Usuario actualizado en estado:', updatedUser);

      return { success: true, data: responseData };
    } catch (err) {
      console.error('❌ Error al completar registro Google:', err);
      const errorMessage = err.message || 'Error desconocido al completar el registro';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []); // <-- ✅ Array de dependencias vacío

  const logout = useCallback(() => {
    console.log('🚪 Cerrando sesión...');
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
    setLoading(false); // Asegúrate que loading sea false al salir
  }, []); // <-- ✅ Array de dependencias vacío

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    loadUser,
    completeGoogleRegistration,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};