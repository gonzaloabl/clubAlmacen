import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { userAPI } from '../../services/api';

export function ProfileSettings() {
  const { user, loadUser } = useAuth();
  // Estado para todos los campos posibles
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    phone: '',
    address: '',
    businessName: '',
    businessDescription: '',
    website: '',
    whatsapp: '',
    avatar: ''
  });
  
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos actuales al montar
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        password: '', // Siempre vacío por seguridad
        phone: user.phone || '',
        address: user.address || '',
        businessName: user.businessName || '',
        businessDescription: user.businessDescription || '',
        website: user.website || '',
        whatsapp: user.whatsapp || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    try {
      // Llamamos a la API
      await userAPI.updateProfile(formData);
      
      // Recargamos el usuario en el contexto global para que se actualice la UI
      await loadUser(); 
      
      setMessage('✅ Perfil actualizado correctamente');
    } catch (error) {
      console.error(error);
      setMessage('❌ Error al actualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  // Estilos en línea (puedes moverlos a CSS Module si prefieres)
  const styles = {
    container: { padding: '20px', maxWidth: '800px', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)' },
    header: { borderBottom: '1px solid var(--border)', paddingBottom: '15px', marginBottom: '20px' },
    title: { margin: 0, color: 'var(--text-main)' },
    subtitle: { margin: '5px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' },
    
    sectionTitle: { color: 'var(--accent)', marginTop: '30px', marginBottom: '15px', fontSize: '1.1rem', borderBottom: '1px solid var(--border)', paddingBottom: '5px' },
    
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
    fullWidth: { gridColumn: '1 / -1' },
    
    label: { display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.9rem' },
    input: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '1rem' },
    textarea: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '1rem', minHeight: '100px', resize: 'vertical' },
    
    btnSave: { marginTop: '30px', padding: '12px 30px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', transition: 'background 0.2s' },
    
    alert: { padding: '15px', marginBottom: '20px', borderRadius: '6px', background: message.includes('✅') ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)', color: message.includes('✅') ? 'var(--success)' : 'var(--danger)', border: `1px solid ${message.includes('✅') ? 'var(--success)' : 'var(--danger)'}` }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>⚙️ Editar Perfil</h2>
        <p style={styles.subtitle}>Completa tu información para que otros miembros puedan contactarte.</p>
      </div>
      
      {message && <div style={styles.alert}>{message}</div>}
      
      <form onSubmit={handleSubmit}>
        
        {/* 1. DATOS PERSONALES (TODOS) */}
        <div style={styles.formGrid}>
            <div>
                <label style={styles.label}>Nombre Personal</label>
                <input type="text" style={styles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
                <label style={styles.label}>Avatar (URL Imagen)</label>
                <input type="text" style={styles.input} placeholder="https://..." value={formData.avatar} onChange={e => setFormData({...formData, avatar: e.target.value})} />
            </div>
            <div>
                <label style={styles.label}>Nueva Contraseña (Opcional)</label>
                <input type="password" style={styles.input} placeholder="Dejar vacío para mantener la actual" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
        </div>

        {/* 2. DATOS DE LOCATARIO */}
        {user?.role === 'locatario' && (
            <>
                <h3 style={styles.sectionTitle}>🏠 Datos de tu Almacén</h3>
                <div style={styles.formGrid}>
                    <div style={styles.fullWidth}>
                        <label style={styles.label}>Nombre del Almacén (Fantasía)</label>
                        <input type="text" style={styles.input} placeholder="Ej: Almacén Don Tito" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
                    </div>
                    <div style={styles.fullWidth}>
                        <label style={styles.label}>Dirección del Local</label>
                        <input type="text" style={styles.input} placeholder="Calle Principal 123, Valparaíso" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                    <div>
                        <label style={styles.label}>Teléfono / WhatsApp</label>
                        <input type="text" style={styles.input} placeholder="+56 9..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                </div>
            </>
        )}

        {/* 3. DATOS DE PROVEEDOR */}
        {user?.role === 'proveedor' && (
            <>
                <h3 style={styles.sectionTitle}>🚚 Datos de la Empresa</h3>
                <div style={styles.formGrid}>
                    <div style={styles.fullWidth}>
                        <label style={styles.label}>Nombre de la Empresa</label>
                        <input type="text" style={styles.input} placeholder="Ej: Distribuidora del Sur" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
                    </div>
                    <div style={styles.fullWidth}>
                        <label style={styles.label}>Descripción / Catálogo</label>
                        <textarea style={styles.textarea} placeholder="Describe tus productos, zonas de reparto, etc." value={formData.businessDescription} onChange={e => setFormData({...formData, businessDescription: e.target.value})} />
                    </div>
                    <div>
                        <label style={styles.label}>Sitio Web</label>
                        <input type="text" style={styles.input} placeholder="www.miempresa.cl" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
                    </div>
                    <div>
                        <label style={styles.label}>WhatsApp Ventas</label>
                        <input type="text" style={styles.input} value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                    </div>
                </div>
            </>
        )}

        <button type="submit" style={styles.btnSave} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}