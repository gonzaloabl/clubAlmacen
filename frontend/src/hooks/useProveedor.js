import { useRole } from './useRole';
import { useState } from 'react';

export const useProveedor = () => {
  const { isProveedor, currentRole } = useRole();
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);

  // Simular datos de proveedor (luego los conectaremos con el backend)
  const loadProveedorData = () => {
    if (!isProveedor) return;

    // Datos de ejemplo
    setProductos([
      { id: 1, nombre: 'Producto A', stock: 10, precio: 100 },
      { id: 2, nombre: 'Producto B', stock: 5, precio: 200 }
    ]);

    setPedidos([
      { id: 1, cliente: 'Cliente 1', total: 300, estado: 'pendiente' },
      { id: 2, cliente: 'Cliente 2', total: 150, estado: 'completado' }
    ]);
  };

  const agregarProducto = (nuevoProducto) => {
    setProductos(prev => [...prev, { ...nuevoProducto, id: Date.now() }]);
  };

  return {
    isProveedor,
    productos,
    pedidos,
    loadProveedorData,
    agregarProducto
  };
};