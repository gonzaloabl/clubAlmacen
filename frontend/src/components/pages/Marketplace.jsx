import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth'; // 👈 Importamos esto para saber si está logueado
import { REGIONES } from '../../utils/regions'; // 🌍 Importamos regiones
import { PRODUCT_CATEGORIES } from '../../utils/constants';

export function Marketplace() {
  const { user } = useAuth(); // Obtenemos el usuario actual
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [regionFilter, setRegionFilter] = useState('Todas'); // 🆕 Filtro de Región

  // 📋 Categorías unificadas (Agregamos 'Todas' al principio para el filtro)
  const categories = ['Todas', ...PRODUCT_CATEGORIES];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        // Usamos la API que ya tienes configurada
        const data = await productAPI.getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error cargando mercado:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Lógica de Filtrado
  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Todas' || prod.category === categoryFilter;
    // 🌍 Filtramos por la región del PROVEEDOR
    const matchesRegion = regionFilter === 'Todas' || prod.provider?.region === regionFilter;
    
    return matchesSearch && matchesCategory && matchesRegion;
  });

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
            <h1 style={styles.title}>Mercado Mayorista</h1>
            <p style={styles.subtitle}>Encuentra las mejores ofertas de proveedores verificados.</p>
            
            {/* Barra de Búsqueda */}
            <div style={styles.searchBarContainer}>
                <input 
                type="text" 
                placeholder="🔍 Busca productos (Ej: Harina, Aceite...)" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
                />
                <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={styles.categorySelect}
                >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                
                {/* 🆕 Selector de Región */}
                <select 
                    value={regionFilter} 
                    onChange={(e) => setRegionFilter(e.target.value)}
                    style={styles.categorySelect}
                >
                    <option value="Todas">🌍 Todo Chile</option>
                    {REGIONES.filter(r => r !== 'Nacional').map(r => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
            </div>
        </div>
      </div>

      {/* GRILLA DE PRODUCTOS */}
      <div style={styles.content}>
        {loading ? (
            <p style={{textAlign:'center', color:'#777', padding:'50px'}}>⏳ Cargando ofertas...</p>
        ) : filteredProducts.length === 0 ? (
            <div style={styles.emptyState}>
                <h3>No encontramos productos 🕵️‍♀️</h3>
                <p>Intenta con otro nombre o categoría.</p>
            </div>
        ) : (
            <div style={styles.grid}>
                {filteredProducts.map(prod => (
                    <div key={prod._id} style={styles.card}>
                        
                        {/* IMAGEN */}
                        <div style={styles.imageContainer}>
                            {prod.image ? (
                                <img src={prod.image} alt={prod.name} style={styles.image} />
                            ) : (
                                <span style={{fontSize:'3rem'}}>📦</span>
                            )}
                            <div style={styles.badgesContainer}>
                                <span style={styles.categoryBadge}>{prod.category || 'Varios'}</span>
                                {prod.provider?.region && <span style={styles.regionBadge}>📍 {prod.provider.region}</span>}
                            </div>
                        </div>

                        {/* INFO */}
                        <div style={styles.cardBody}>
                            <h3 style={styles.prodName}>{prod.name}</h3>
                            
                            {/* 🔒 LÓGICA DE PRECIO OCULTO */}
                            <div style={styles.priceContainer}>
                                {user ? (
                                    // Si está logueado, ve el precio
                                    <span style={styles.prodPrice}>${prod.price.toLocaleString()}</span>
                                ) : (
                                    // Si NO está logueado, ve el candado
                                    <Link to="/login" style={styles.blurPrice} title="Inicia sesión para ver precios">
                                        🔒 Ver Precio
                                    </Link>
                                )}
                            </div>
                            
                            <div style={styles.providerInfo}>
                                <span style={{fontSize:'0.8rem', color:'#666'}}>Vende:</span>
                                <Link to={`/proveedor/${prod.provider?._id}`} style={styles.providerLink}>
                                    {prod.provider?.businessName || prod.provider?.name || 'Proveedor'} 
                                </Link>
                            </div>
                        </div>

                        {/* BOTONES */}
                        <div style={styles.cardFooter}>
                            {prod.stock > 0 ? (
                                user ? (
                                    <a 
                                        href={`https://wa.me/${prod.provider?.whatsapp?.replace(/[^0-9]/g, '')}?text=Hola, vi su producto ${prod.name} en Club Almacén.`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        style={styles.contactBtn}
                                    >
                                        💬 Contactar
                                    </a>
                                ) : (
                                    <Link to="/login" style={styles.loginBtn}>
                                        Ingresar para Comprar
                                    </Link>
                                )
                            ) : (
                                <button disabled style={styles.disabledBtn}>Agotado</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}

// ESTILOS
const styles = {
  container: { minHeight: '100vh', background: 'var(--bg-body)', paddingBottom: '60px' },
  header: { background: 'var(--bg-sidebar)', color: 'white', padding: '50px 20px', textAlign: 'center', marginBottom: '40px' },
  headerContent: { maxWidth: '800px', margin: '0 auto' },
  title: { fontSize: '2.5rem', margin: '0 0 10px 0', fontWeight: '800' },
  subtitle: { opacity: 0.9, fontSize: '1.1rem', marginBottom: '30px' },
  
  searchBarContainer: { display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' },
  searchInput: { padding: '15px 25px', flex: 2, minWidth: '200px', borderRadius: '8px', border: 'none', fontSize: '1rem', outline: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
  categorySelect: { padding: '15px 25px', flex: 1, minWidth: '150px', borderRadius: '8px', border: 'none', fontSize: '1rem', outline: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', cursor: 'pointer' },

  content: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' },
  
  card: { background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  card: { ...{':hover': { transform: 'translateY(-5px)' }} }, // Nota: hover inline no funciona directo en react standard sin librerías, pero el efecto visual base está bien.

  imageContainer: { height: '180px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  badgesContainer: { position: 'absolute', top: '10px', right: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' },
  categoryBadge: { background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 'bold' },
  regionBadge: { background: 'rgba(52, 152, 219, 0.9)', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold' },

  cardBody: { padding: '20px', flex: 1 },
  prodName: { margin: '0 0 10px 0', fontSize: '1.1rem', color: 'var(--text-main)', lineHeight: '1.4' },
  
  priceContainer: { marginBottom: '15px', minHeight: '30px', display: 'flex', alignItems: 'center' },
  prodPrice: { fontSize: '1.4rem', color: '#27ae60', fontWeight: '800', margin: 0 },
  
  // Estilo del "Precio Oculto"
  blurPrice: { 
    color: '#fff', 
    background: '#95a5a6', 
    padding: '5px 12px', 
    borderRadius: '20px', 
    fontSize: '0.85rem', 
    textDecoration: 'none', 
    fontWeight: 'bold',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer'
  },

  providerInfo: { borderTop: '1px dashed var(--border)', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' },
  providerLink: { color: 'var(--accent)', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.9rem' },

  cardFooter: { padding: '15px 20px', background: 'var(--bg-body)', borderTop: '1px solid var(--border)' },
  contactBtn: { display: 'block', width: '100%', padding: '10px', background: '#25D366', color: 'white', textAlign: 'center', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.95rem' },
  loginBtn: { display: 'block', width: '100%', padding: '10px', background: 'var(--accent)', color: 'white', textAlign: 'center', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' },
  disabledBtn: { width: '100%', padding: '10px', background: '#e0e0e0', color: '#999', border: 'none', borderRadius: '6px', cursor: 'not-allowed', fontWeight: 'bold' },
  
  emptyState: { textAlign: 'center', padding: '50px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }
};