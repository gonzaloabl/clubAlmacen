import { useRole } from './useRole';
import { useState } from 'react';

export const useLocatario = () => {
  const { isLocatario } = useRole();
  const [espacios, setEspacios] = useState([]);
  const [reservas, setReservas] = useState([]);

  // Simular datos de locatario
  const loadLocatarioData = () => {
    if (!isLocatario) return;

    setEspacios([
      { id: 1, nombre: 'Oficina Pequeña', precio: 500, disponible: true },
      { id: 2, nombre: 'Sala de Reuniones', precio: 300, disponible: false },
      { id: 3, nombre: 'Espacio Coworking', precio: 200, disponible: true }
    ]);

    setReservas([
      { id: 1, espacio: 'Oficina Pequeña', fecha: '2024-01-15', total: 500 },
      { id: 2, espacio: 'Sala de Reuniones', fecha: '2024-01-10', total: 300 }
    ]);
  };

  const hacerReserva = (espacioId, fecha) => {
    const espacio = espacios.find(e => e.id === espacioId);
    if (espacio && espacio.disponible) {
      const nuevaReserva = {
        id: Date.now(),
        espacio: espacio.nombre,
        fecha,
        total: espacio.precio
      };
      setReservas(prev => [...prev, nuevaReserva]);
      return true;
    }
    return false;
  };

  return {
    isLocatario,
    espacios,
    reservas,
    loadLocatarioData,
    hacerReserva
  };
};