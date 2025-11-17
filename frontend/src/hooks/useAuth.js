import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  // ✅ Asegurarse de que completeGoogleRegistration esté disponible
  if (!context.completeGoogleRegistration) {
    console.warn('⚠️ completeGoogleRegistration no está disponible en el contexto');
  }
  
  return context;
};