import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userAPI, productAPI } from '../../services/api';

export function ProviderProfile() {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await userAPI.getPublicProfile(id);
        setProvider(userData);
        const prodData = await productAPI.getProductsByProvider(id);
        setProducts(prodData);
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Cargando perfil...</div>;
  if (!provider) return <div style={{textAlign:'center', padding:'50px'}}>Proveedor no encontrado</div>;

  return (
    <div style={styles.container}>
      {/* CABECERA */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.avatar}>
            {provider.avatar ? <img src={provider.avatar} alt="Avatar" style={styles.avatarImg} /> : (provider.businessName || provider.name).charAt(0)}
          </div>
          <div style={styles.info}>
            <h1 style={styles.name}>{provider.businessName || provider.name}</h1>
            <p style={styles.desc}>{provider.businessDescription || 'Sin descripción'}</p>
            <div style={styles.meta}>
               <span>📍 {provider.region || 'Nacional'}</span>
               {provider.website && <a href={provider.website} target="_blank" rel="noreferrer" style={styles.link}>🌐 Sitio Web</a>}
            </div>
          </div>
          <div style={styles.actions}>
             {provider.whatsapp && (
                <a href={`https://wa.me/${provider.whatsapp}`} target="_blank" rel="noreferrer" style={styles.whatsappBtn}>
                  💬 Contactar
                </a>
             )}
          </div>
        </div>
      </div>

      {/* CATÁLOGO */}
      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>Catálogo de Productos ({products.length})</h2>
        
        {products.length === 0 ? (
          <div style={styles.emptyState}>Este proveedor aún no ha subido productos.</div>
        ) : (
          <div style={styles.grid}>
            {products.map(prod => (
              <div key={prod._id} style={styles.card}>
                
                {/* 👇 AQUÍ ESTÁ EL CAMBIO DE LA IMAGEN */}
                <div style={styles.prodImage}>
                   {prod.image ? (
                     <img src={prod.image} alt={prod.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                   ) : (
                     <span style={{fontSize:'3rem'}}>📦</span>
                   )}
                </div>

                <div style={styles.cardBody}>
                   <h3 style={styles.prodName}>{prod.name}</h3>
                   <p style={styles.prodCat}>{prod.category}</p>
                   <div style={styles.priceRow}>
                      <span style={styles.price}>${prod.price.toLocaleString()}</span>
                      <span style={styles.stock}>
                          {prod.stock > 0 ? 'Disponible' : 'Agotado'}
                      </span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { background: 'var(--bg-body)', minHeight: '100vh', paddingBottom: '60px' },
  header: { background: 'var(--bg-sidebar)', color: 'white', padding: '40px 20px' },
  headerContent: { maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' },
  avatar: { width: '100px', height: '100px', borderRadius: '50%', background: 'white', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  info: { flex: 1 },
  name: { margin: '0 0 10px 0', fontSize: '2rem' },
  desc: { opacity: 0.9, fontSize: '1rem', marginBottom: '15px', lineHeight: '1.5' },
  meta: { display: 'flex', gap: '15px', fontSize: '0.9rem', opacity: 0.8 },
  link: { color: 'white', textDecoration: 'underline' },
  actions: { minWidth: '200px' },
  whatsappBtn: { display: 'block', padding: '12px 20px', background: '#25D366', color: 'white', borderRadius: '30px', textAlign: 'center', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' },
  
  content: { maxWidth: '1000px', margin: '40px auto', padding: '0 20px' },
  sectionTitle: { color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '15px', marginBottom: '30px' },
  emptyState: { textAlign: 'center', padding: '40px', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' },
  card: { background: 'var(--bg-card)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)', transition: 'transform 0.2s', height: '100%' }, // height 100% fix
  prodImage: { height: '150px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }, // Quitamos font-size fijo aquí para que la imagen ocupe bien
  cardBody: { padding: '15px' },
  prodName: { margin: '0 0 5px 0', fontSize: '1.1rem', color: 'var(--text-main)' },
  prodCat: { fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'capitalize', marginBottom: '10px' },
  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontWeight: 'bold', color: 'var(--accent)', fontSize: '1.2rem' },
  stock: { fontSize: '0.8rem', color: '#27ae60', background: 'rgba(39, 174, 96, 0.1)', padding: '2px 6px', borderRadius: '4px' }
};