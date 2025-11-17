import { useRole } from './useRole';
import { useState, useEffect } from 'react';

export const useAdmin = () => {
  const { isAdmin, currentRole } = useRole();
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Obtener datos del panel de administración
  const fetchAdminData = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdminData(data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  return {
    isAdmin,
    adminData,
    loading,
    refreshAdminData: fetchAdminData
  };
};