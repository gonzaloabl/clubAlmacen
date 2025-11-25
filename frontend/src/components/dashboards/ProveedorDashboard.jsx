import { useState, useEffect } from 'react';
import { useProveedor } from '../../hooks/useProveedor';
import { useAuth } from '../../hooks/useAuth';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProfileSettings } from './ProfileSettings';


export function ProveedorDashboard() {
  const { isProveedor, productos, pedidos, loadProveedorData, agregarProducto } = useProveedor();
  const { user } = useAuth();
  
  // Estado para pestañas (SPA)
  const [activeTab, setActiveTab] = useState('overview');
  
  // Estado para formulario de producto
  const [newProduct, setNewProduct] = useState({ nombre: '', precio: '', stock: '' });

  useEffect(() => {
    loadProveedorData();
  }, []);

  // Función para manejar el envío del formulario
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (newProduct.nombre && newProduct.precio && newProduct.stock) {
      agregarProducto({
        nombre: newProduct.nombre,
        precio: Number(newProduct.precio),
        stock: Number(newProduct.stock)
      });
      setNewProduct({ nombre: '', precio: '', stock: '' }); // Limpiar
      alert('✅ Producto agregado correctamente');
    }
  };

  if (!isProveedor) return null;

  // 1. Menú Lateral del Proveedor
  const sidebarItems = [
    { label: 'Resumen Ventas', icon: '📈', onClick: () => setActiveTab('overview'), isActive: activeTab === 'overview' },
    { label: 'Mi Perfil', icon: '⚙️', onClick: () => setActiveTab('profile'), isActive: activeTab === 'profile' },
    { label: 'Mis Productos', icon: '📦', onClick: () => setActiveTab('products'), isActive: activeTab === 'products' },
    { label: 'Pedidos Entrantes', icon: '🔔', onClick: () => setActiveTab('orders'), isActive: activeTab === 'orders' },
    { label: 'Foro Proveedores', icon: '🚚', path: '/forum' },
  ];

  return (
    <DashboardLayout 
      title="Panel de Proveedor"
      subtitle={`Hola, ${user?.name}. Gestiona tu inventario y ventas.`}
      sidebarItems={sidebarItems}
    >
      
      {/* --- VISTA GENERAL --- */}
      {activeTab === 'overview' && (
        <div>
          <h2 style={{color: 'var(--text-main)'}}>Métricas de Negocio</h2>
          
          <div style={styles.statsGrid}>
             <div style={styles.card}>
                <span style={{fontSize: '2rem'}}>💵</span>
                <h3>${pedidos.reduce((acc, curr) => acc + curr.total, 0)}</h3>
                <p>Ventas Totales</p>
             </div>
             <div style={styles.card}>
                <span style={{fontSize: '2rem'}}>📦</span>
                <h3>{productos.length}</h3>
                <p>Productos Activos</p>
             </div>
             <div style={styles.card}>
                <span style={{fontSize: '2rem'}}>⏳</span>
                <h3>{pedidos.filter(p => p.estado === 'pendiente').length}</h3>
                <p>Pedidos Pendientes</p>
             </div>
          </div>
        </div>
      )}

      {/* 3️⃣ RENDERIZAR EL COMPONENTE CUANDO LA PESTAÑA ESTÁ ACTIVA */}
      {activeTab === 'profile' && (
        <ProfileSettings />
      )}

      {/* --- GESTIÓN DE PRODUCTOS --- */}
      {activeTab === 'products' && (
        <div>
          <h2 style={{color: 'var(--text-main)'}}>Inventario</h2>
          
          {/* Formulario Rápido */}
          <div style={styles.formBox}>
            <h4 style={{marginTop:0}}>Agregar Nuevo Item</h4>
            <form onSubmit={handleAddProduct} style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                <input 
                    type="text" placeholder="Nombre Producto" style={styles.input}
                    value={newProduct.nombre}
                    onChange={e => setNewProduct({...newProduct, nombre: e.target.value})}
                />
                <input 
                    type="number" placeholder="Precio ($)" style={styles.input}
                    value={newProduct.precio}
                    onChange={e => setNewProduct({...newProduct, precio: e.target.value})}
                />
                <input 
                    type="number" placeholder="Stock" style={{...styles.input, width:'80px'}}
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                />
                <button type="submit" style={styles.btnAction}>➕ Agregar</button>
            </form>
          </div>

          {/* Lista de Productos */}
          <div style={styles.gridProducts}>
             {productos.map(prod => (
                <div key={prod.id} style={styles.productCard}>
                    <div style={{fontWeight:'bold', marginBottom:'5px'}}>{prod.nombre}</div>
                    <div style={{color:'var(--text-muted)', fontSize:'0.9rem'}}>Stock: {prod.stock} un.</div>
                    <div style={{color:'var(--accent)', fontWeight:'bold', marginTop:'5px'}}>${prod.precio}</div>
                    <div style={{marginTop:'10px', display:'flex', gap:'5px'}}>
                        <button style={styles.btnSmall}>✏️</button>
                        <button style={styles.btnSmallDanger}>🗑️</button>
                    </div>
                </div>
             ))}
          </div>
        </div>
      )}

      {/* --- PEDIDOS --- */}
      {activeTab === 'orders' && (
        <div>
           <h2 style={{color: 'var(--text-main)'}}>Pedidos Recientes</h2>
           <table style={styles.table}>
             <thead>
                <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Cliente</th>
                    <th style={styles.th}>Total</th>
                    <th style={styles.th}>Estado</th>
                    <th style={styles.th}>Acción</th>
                </tr>
             </thead>
             <tbody>
                {pedidos.map(pedido => (
                    <tr key={pedido.id}>
                        <td style={styles.td}>#{pedido.id}</td>
                        <td style={styles.td}>{pedido.cliente}</td>
                        <td style={styles.td}>${pedido.total}</td>
                        <td style={styles.td}>
                            <span style={{
                                ...styles.badge, 
                                background: pedido.estado === 'completado' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(241, 196, 15, 0.1)',
                                color: pedido.estado === 'completado' ? 'var(--success)' : '#d35400'
                            }}>
                                {pedido.estado}
                            </span>
                        </td>
                        <td style={styles.td}>
                            <button style={styles.btnTable}>Ver</button>
                        </td>
                    </tr>
                ))}
             </tbody>
           </table>
        </div>
      )}

    </DashboardLayout>
  );
}

const styles = {
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
  card: { padding: '20px', border: '1px solid var(--border)', borderRadius: '10px', textAlign: 'center', background: 'var(--bg-body)' },
  
  // Formulario
  formBox: { padding: '20px', background: 'var(--bg-body)', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border)' },
  input: { padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', flex: 1 },
  btnAction: { padding: '8px 15px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },

  // Productos
  gridProducts: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' },
  productCard: { padding: '15px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-card)' },
  btnSmall: { padding: '5px 10px', background: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnSmallDanger: { padding: '5px 10px', background: 'rgba(231, 76, 60, 0.1)', color: 'var(--danger)', border: 'none', borderRadius: '4px', cursor: 'pointer' },

  // Tabla
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' },
  td: { padding: '12px', borderBottom: '1px solid var(--border)', color: 'var(--text-main)' },
  badge: { padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' },
  btnTable: { padding: '5px 10px', background: 'var(--bg-body)', border: '1px solid var(--border)', cursor: 'pointer', borderRadius: '4px' }
};