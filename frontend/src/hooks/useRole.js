import { useAuth } from './useAuth';

export const useRole = () => {
  const { user } = useAuth();

  // Verificar rol específico
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Verificar múltiples roles
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  // Atajos para cada rol
  const isAdmin = user?.role === 'admin';
  const isProveedor = user?.role === 'proveedor';
  const isLocatario = user?.role === 'locatario';
  const isPending = user?.role === 'pending'; // 🆕 Usuarios temporales

  // 🆕 Verificaciones de estado de registro
  const registrationComplete = user?.registrationComplete ?? true; // Por defecto true para usuarios locales
  const needsGoogleRegistration = user?.oauthProvider === 'google' && !user?.registrationComplete;

  // 🆕 Permisos específicos
  const canCreateContent = hasAnyRole(['locatario', 'proveedor', 'admin']) && registrationComplete;
  const canViewContent = hasAnyRole(['locatario', 'proveedor', 'admin', 'pending']) && registrationComplete;
  const isReadOnly = !registrationComplete || isPending;



  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    isProveedor,
    isLocatario,
    isPending,
    registrationComplete,
    needsGoogleRegistration,
    canCreateContent,
    canViewContent,
    isReadOnly,
    currentRole: user?.role
  };
};