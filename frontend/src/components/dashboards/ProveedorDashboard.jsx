import { useProveedor } from '../../hooks/useProveedor';
import { useState, useEffect } from 'react';

export function ProveedorDashboard() {
  const { isProveedor, productos, pedidos, loadProveedorData, agregarProducto } = useProveedor();
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', precio: '', stock: '' });

  useEffect(() => {
    loadProveedorData();
  }, []);

  if (!isProveedor) {
    return (
      <div style={styles.error}>
        <h2>⛔ Acceso Denegado</h2>
        <p>No tienes permisos de proveedor para ver este panel.</p>
      </div>
    );
  }

  const handleAgregarProducto = (e) => {
    e.preventDefault();
    if (nuevoProducto.nombre && nuevoProducto.precio && nuevoProducto.stock) {
      agregarProducto({
        nombre: nuevoProducto.nombre,
        precio: parseInt(nuevoProducto.precio),
        stock: parseInt(nuevoProducto.stock)
      });
      setNuevoProducto({ nombre: '', precio: '', stock: '' });
    }
  };

  return (
    <div style={styles.container}>
      <h1>🚚 Panel de Proveedor</h1>

      <div style={styles.grid}>
        {/* Gestión de Productos */}
        <div style={styles.section}>
          <h2>📦 Mis Productos</h2>
          <div style={styles.productList}>
            {productos.map(producto => (
              <div key={producto.id} style={styles.productCard}>
                <h4>{producto.nombre}</h4>
                <p>Precio: ${producto.precio}</p>
                <p>Stock: {producto.stock}</p>
                <button style={styles.smallButton}>Editar</button>
              </div>
            ))}
          </div>

          {/* Formulario para agregar producto */}
          <form onSubmit={handleAgregarProducto} style={styles.form}>
            <h3>Agregar Nuevo Producto</h3>
            <input
              type="text"
              placeholder="Nombre del producto"
              value={nuevoProducto.nombre}
              onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Precio"
              value={nuevoProducto.precio}
              onChange={(e) => setNuevoProducto({...nuevoProducto, precio: e.target.value})}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="Stock"
              value={nuevoProducto.stock}
              onChange={(e) => setNuevoProducto({...nuevoProducto, stock: e.target.value})}
              style={styles.input}
            />
            <button type="submit" style={styles.button}>
              ➕ Agregar Producto
            </button>
          </form>
        </div>

        {/* Pedidos */}
        <div style={styles.section}>
          <h2>📋 Pedidos Recientes</h2>
          <div style={styles.pedidosList}>
            {pedidos.map(pedido => (
              <div key={pedido.id} style={styles.pedidoCard}>
                <h4>Pedido #{pedido.id}</h4>
                <p>Cliente: {pedido.cliente}</p>
                <p>Total: ${pedido.total}</p>
                <p>Estado: 
                  <span style={{
                    color: pedido.estado === 'completado' ? '#198754' : '#ffc107',
                    fontWeight: 'bold'
                  }}>
                    {pedido.estado}
                  </span>
                </p>
                <button style={styles.smallButton}>
                  {pedido.estado === 'pendiente' ? '✅ Completar' : '👀 Ver Detalles'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div style={styles.stats}>
        <h2>📊 Estadísticas</h2>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3>Productos Activos</h3>
            <p style={styles.statNumber}>{productos.length}</p>
          </div>
          <div style={styles.statCard}>
            <h3>Pedidos Pendientes</h3>
            <p style={styles.statNumber}>
              {pedidos.filter(p => p.estado === 'pendiente').length}
            </p>
          </div>
          <div style={styles.statCard}>
            <h3>Ingresos Totales</h3>
            <p style={styles.statNumber}>
              ${pedidos.reduce((total, pedido) => total + pedido.total, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    marginBottom: '30px'
  },
  section: {
    background: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  productList: {
    display: 'grid',
    gap: '15px',
    marginBottom: '20px'
  },
  productCard: {
    padding: '15px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    background: '#f8f9fa'
  },
  pedidosList: {
    display: 'grid',
    gap: '15px'
  },
  pedidoCard: {
    padding: '15px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    background: '#f8f9fa'
  },
  form: {
    marginTop: '20px',
    padding: '20px',
    background: '#e7f3ff',
    borderRadius: '8px'
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    border: '1px solid #ccc',
    borderRadius: '5px'
  },
  button: {
    padding: '10px 20px',
    background: '#198754',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  smallButton: {
    padding: '5px 10px',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  stats: {
    background: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px'
  },
  statCard: {
    textAlign: 'center',
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  statNumber: {
    fontSize: '2em',
    fontWeight: 'bold',
    color: '#0d6efd',
    margin: '10px 0'
  },
  error: {
    textAlign: 'center',
    padding: '50px',
    color: '#dc3545'
  }
};