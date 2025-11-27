import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { userAPI } from '../../services/api';
import { REGIONES } from '../../utils/regions';

export function ProfileSettings() {
  const { user, loadUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '', password: '', phone: '', address: '',
    businessName: '', businessDescription: '',
    website: '', whatsapp: '', region: ''
  });
  
  // Estados para la imagen
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '', password: '',
        phone: user.phone || '', address: user.address || '',
        businessName: user.businessName || '', businessDescription: user.businessDescription || '',
        website: user.website || '', whatsapp: user.whatsapp || '',
        region: user.region || 'Nacional'
      });
      // Si tiene avatar, mostrarlo. (Si viene del backend local, agregar prefijo si es necesario)
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  // Manejar selección de archivo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Crear URL temporal para previsualizar
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    try {
      // 1. Crear FormData
      const dataToSend = new FormData();
      
      // 2. Agregar campos de texto
      Object.keys(formData).forEach(key => {
        dataToSend.append(key, formData[key]);
      });

      // 3. Agregar archivo si existe
      if (avatarFile) {
        dataToSend.append('avatar', avatarFile);
      }

      // 4. Enviar
      await userAPI.updateProfile(dataToSend);
      await loadUser();
      
      setMessage('✅ Perfil actualizado correctamente');
    } catch (error) {
      console.error(error);
      setMessage('❌ Error al actualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const styles = {
    container: { padding: '30px', maxWidth: '800px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', boxShadow:'0 4px 6px rgba(0,0,0,0.02)' },
    sectionTitle: { color: 'var(--accent)', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '20px', marginTop:'30px', fontSize:'1.1rem' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    fullWidth: { gridColumn: '1 / -1' },
    label: { display: 'block', marginBottom: '8px', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.9rem' },
    input: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '1rem' },
    select: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '1rem', cursor:'pointer' },
    textarea: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '1rem', minHeight: '100px', resize: 'vertical', fontFamily:'inherit' },
    btnSave: { marginTop: '30px', padding: '12px 30px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' },
    
    // Estilo Avatar
    avatarSection: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' },
    avatarPreview: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)', background: '#eee' },
    fileInput: { fontSize: '0.9rem', color: 'var(--text-muted)' }
  };

  return (
    <div style={styles.container}>
      <h2 style={{color: 'var(--text-main)', marginTop: 0}}>⚙️ Editar Perfil</h2>
      {message && <div style={{padding:'15px', marginBottom:'20px', borderRadius:'6px', background: message.includes('✅')?'#d4edda':'#f8d7da', color: message.includes('✅')?'#155724':'#721c24'}}>{message}</div>}
      
      <form onSubmit={handleSubmit}>
        
        {/* SECCIÓN AVATAR MEJORADA */}
        <div style={styles.avatarSection}>
            {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" style={styles.avatarPreview} />
            ) : (
                <div style={{...styles.avatarPreview, display:'flex', alignItems:'center', justifyContent:'center'}}>📷</div>
            )}
            <div>
                <label style={styles.label}>Foto de Perfil / Logo</label>
                <input type="file" accept="image/*" onChange={handleFileChange} style={styles.fileInput} />
            </div>
        </div>

        <div style={styles.formGrid}>
            <div>
                <label style={styles.label}>Nombre Personal</label>
                <input type="text" style={styles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
                <label style={styles.label}>Región</label>
                <select style={styles.select} value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})}>
                    <option value="">Selecciona...</option>
                    {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
            <div>
                <label style={styles.label}>Nueva Contraseña (Opcional)</label>
                <input type="password" style={styles.input} placeholder="Mantener actual" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
        </div>

        {user?.role === 'locatario' && (
            <>
                <h3 style={styles.sectionTitle}>🏠 Datos de tu Almacén</h3>
                <div style={styles.formGrid}>
                    <div style={styles.fullWidth}>
                        <label style={styles.label}>Nombre del Almacén</label>
                        <input type="text" style={styles.input} value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
                    </div>
                    <div style={styles.fullWidth}>
                        <label style={styles.label}>Dirección</label>
                        <input type="text" style={styles.input} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                    <div>
                        <label style={styles.label}>WhatsApp</label>
                        <input type="text" style={styles.input} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                </div>
            </>
        )}

        {user?.role === 'proveedor' && (
            <>
                <h3 style={styles.sectionTitle}>🚚 Datos de Empresa</h3>
                <div style={styles.formGrid}>
                    <div style={styles.fullWidth}>
                        <label style={styles.label}>Nombre de la Empresa</label>
                        <input type="text" style={styles.input} value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
                    </div>
                    <div style={styles.fullWidth}>
                        <label style={styles.label}>Descripción</label>
                        <textarea style={styles.textarea} value={formData.businessDescription} onChange={e => setFormData({...formData, businessDescription: e.target.value})} />
                    </div>
                    <div>
                        <label style={styles.label}>Sitio Web</label>
                        <input type="text" style={styles.input} value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
                    </div>
                    <div>
                        <label style={styles.label}>WhatsApp</label>
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