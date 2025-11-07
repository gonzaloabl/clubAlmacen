import { useAuth } from './useAuth';

export const useRole = () => {
  const { user } = useAuth();

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const isAdmin = user?.role === 'admin';
  const isProveedor = user?.role === 'proveedor';
  const isLocatario = user?.role === 'locatario';

  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    isProveedor,
    isLocatario,
    currentRole: user?.role
  };
};