import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole'; // Asegúrate de importar esto si lo usas
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProfileSettings } from './ProfileSettings';
import { productAPI } from '../../services/api';

export function ProveedorDashboard() {
  const { user } = useAuth();
  // Eliminamos isProveedor si no lo usas para renderizar condicionalmente todo el componente,
  // o lo dejas si quieres protegerlo doblemente.
  // const { isProveedor } = useRole(); 
  
  const [activeTab, setActiveTab] = useState('overview');
  const [productos, setProductos] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Formulario Producto
  const [newProduct, setNewProduct] = useState({ nombre: '', precio: '', stock: '', category: 'otros' });

  // Cargar productos solo cuando se necesita
  useEffect(() => {
    if (activeTab === 'products' || activeTab === 'overview') {
      fetchMyProducts();
    }
  }, [activeTab]);

  const fetchMyProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await productAPI.getMyProducts();
      setProductos(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (newProduct.nombre && newProduct.precio) {
      try {
        await productAPI.createProduct({
            name: newProduct.nombre,
            price: Number(newProduct.precio),
            stock: Number(newProduct.stock),
            category: newProduct.category
        });
        alert('✅ Producto publicado');
        setNewProduct({ nombre: '', precio: '', stock: '', category: 'otros' });
        fetchMyProducts();
      } catch (error) {
        alert('Error al crear');
      }
    }
  };

  const sidebarItems = [
    { label: 'Resumen', icon: '📊', onClick: () => setActiveTab('overview'), isActive: activeTab === 'overview' },
    { label: 'Perfil Empresa', icon: '⚙️', onClick: () => setActiveTab('profile'), isActive: activeTab === 'profile' },
    { label: 'Mis Productos', icon: '📦', onClick: () => setActiveTab('products'), isActive: activeTab === 'products' },
    { label: 'Ir al Directorio', icon: '👀', path: '/directorio' },
  ];

  return (
    <DashboardLayout 
      title="Panel de Proveedor"
      subtitle={`Gestiona tu catálogo: ${user?.businessName || user?.name}`}
      sidebarItems={sidebarItems}
    >
      
      {/* --- VISTA GENERAL --- */}
      {activeTab === 'overview' && (
        <div>
          <h2 style={{color: 'var(--text-main)'}}>Estado de tu Catálogo</h2>
          <div style={styles.statsGrid}>
             <div style={styles.card}>
                <span style={{fontSize: '2rem'}}>📦</span>
                <h3>{productos.length}</h3>
                <p>Productos Activos</p>
             </div>
             <div style={styles.card}>
                <span style={{fontSize: '2rem'}}>📍</span>
                <h3>{user?.region || 'Nacional'}</h3>
                <p>Zona de Cobertura</p>
             </div>
          </div>
          <div style={styles.noticeBox}>
             <strong>💡 Consejo:</strong> Mantén tu catálogo actualizado. Los locatarios ven estos productos en el Directorio Público.
          </div>
        </div>
      )}

      {activeTab === 'profile' && <ProfileSettings />}

      {/* --- GESTIÓN DE PRODUCTOS --- */}
      {activeTab === 'products' && (
        <div>
          <h2 style={{color: 'var(--text-main)'}}>Gestión de Inventario</h2>
          
          {/* Formulario */}
          <div style={styles.formBox}>
            <h4 style={{marginTop:0, color:'var(--text-main)'}}>Publicar Nuevo Item</h4>
            <form onSubmit={handleAddProduct} style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                <input 
                    type="text" placeholder="Nombre Producto" style={styles.input}
                    value={newProduct.nombre}
                    onChange={e => setNewProduct({...newProduct, nombre: e.target.value})}
                    required
                />
                <input 
                    type="number" placeholder="Precio" style={{...styles.input, width:'100px'}}
                    value={newProduct.precio}
                    onChange={e => setNewProduct({...newProduct, precio: e.target.value})}
                    required
                />
                <input 
                    type="number" placeholder="Stock" style={{...styles.input, width:'80px'}}
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                />
                <select 
                    style={styles.input}
                    value={newProduct.category}
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                >
                    <option value="alimentos">Alimentos</option>
                    <option value="bebidas">Bebidas</option>
                    <option value="limpieza">Limpieza</option>
                    <option value="otros">Otros</option>
                </select>
                <button type="submit" style={styles.btnAction}>Publicar</button>
            </form>
          </div>

          {/* Lista */}
          <div style={styles.gridProducts}>
              {productos.length === 0 ? <p style={{color:'var(--text-muted)'}}>Tu catálogo está vacío.</p> : 
               productos.map(prod => (
                  <div key={prod._id} style={styles.productCard}>
                      <div style={{fontWeight:'bold', color:'var(--text-main)'}}>{prod.name}</div>
                      <div style={{color:'var(--text-muted)', fontSize:'0.85rem'}}>
                          {prod.category} • Stock: {prod.stock}
                      </div>
                      <div style={{color:'var(--accent)', fontWeight:'bold', marginTop:'5px'}}>${prod.price}</div>
                  </div>
               ))
              }
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

const styles = {
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
  card: { padding: '20px', border: '1px solid var(--border)', borderRadius: '10px', textAlign: 'center', background: 'var(--bg-card)' },
  noticeBox: { padding: '15px', background: 'rgba(52, 152, 219, 0.1)', borderLeft: '4px solid var(--accent)', color: 'var(--text-main)', borderRadius: '4px' },
  formBox: { padding: '20px', background: 'var(--bg-card)', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border)' },
  input: { padding: '10px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-main)', flex: 1 },
  btnAction: { padding: '10px 20px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  gridProducts: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' },
  productCard: { padding: '15px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-card)' }
};