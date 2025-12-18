import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { DirectoryLayout } from './DirectoryLayout';

export function LocatariosDirectory() {
  const [locatarios, setLocatarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLocatarios = async () => {
      try {
        const data = await userAPI.getLocatarios();
        setLocatarios(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadLocatarios();
  }, []);

  return (
    <DirectoryLayout
      title="Comercios del Barrio"
      subtitle="Conoce a los almacenes y negocios que dan vida a nuestra comunidad."
      items={locatarios}
      loading={loading}
      searchPlaceholder="🔍 Buscar por nombre o dirección..."
      renderItem={(loc) => {
            // 🔧 CORRECCIÓN: Definimos cuál es el número de contacto disponible
            const contactNumber = loc.whatsapp || loc.phone;

            return (
              <div key={loc._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.avatar}>
                    {loc.avatar ? (
                      <img src={loc.avatar} alt="Logo" style={styles.avatarImg} />
                    ) : (
                      <span style={{fontSize:'1.5rem'}}>🏪</span>
                    )}
                  </div>
                  <div>
                    <h3 style={styles.businessName}>{loc.businessName || loc.name}</h3>
                    <span style={styles.regionBadge}>
                      📍 {loc.region || 'Región no especificada'}
                    </span>
                  </div>
                </div>

                <div style={styles.cardBody}>
                  <p style={styles.desc}>
                    {loc.businessDescription || "Almacén de barrio miembro de la comunidad."}
                  </p>
                  
                  <div style={styles.contactInfo}>
                    {loc.address && (
                      <div style={styles.infoRow}>
                        <span style={styles.icon}>🏠</span> {loc.address}
                      </div>
                    )}
                    {/* Mostramos el teléfono visualmente */}
                    {contactNumber && (
                      <div style={styles.infoRow}>
                        <span style={styles.icon}>📞</span> {contactNumber}
                      </div>
                    )}
                    {loc.email && (
                      <div style={styles.infoRow}>
                        <span style={styles.icon}>📧</span> {loc.email}
                      </div>
                    )}
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  {/* 🔧 CORRECCIÓN: Usamos 'contactNumber' para el enlace */}
                  {contactNumber ? (
                    <a 
                      href={`https://wa.me/${contactNumber.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noreferrer"
                      style={styles.whatsappBtn}
                    >
                      💬 Contactar por WhatsApp
                    </a>
                  ) : (
                    <div style={styles.disabledBtn}>Sin contacto directo</div>
                  )}
                </div>
              </div>
            );
      }}
    />
  );
}

const styles = {
  card: { background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)', borderTop: '4px solid var(--accent)', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition: 'transform 0.2s', height: '100%' },
  
  cardHeader: { padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px dashed var(--border)', background: 'var(--bg-body)' },
  avatar: { width: '50px', height: '50px', borderRadius: '8px', background: 'var(--bg-body)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  
  businessName: { margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: '700' },
  regionBadge: { fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-body)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)' },
  
  cardBody: { padding: '20px', flex: 1 },
  desc: { color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '20px', fontStyle: 'italic' },
  contactInfo: { fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' },
  infoRow: { display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' },
  icon: { width: '20px', textAlign: 'center' },
  
  cardFooter: { padding: '20px', borderTop: '1px solid var(--border)', textAlign: 'center' },
  
  whatsappBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '8px', 
    width: '100%', 
    padding: '10px', 
    background: '#25D366', 
    color: 'white', 
    textDecoration: 'none', 
    borderRadius: '6px', 
    fontWeight: 'bold', 
    textAlign: 'center', 
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  
  disabledBtn: { display: 'block', width: '100%', padding: '10px', background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '6px', textAlign: 'center', fontSize: '0.9rem' },
};