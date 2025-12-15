import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { userAPI } from '../../services/api';
import { REGIONES } from '../../utils/regions';
import styles from './ProfileSettings.module.css';

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
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    
    try {
      const dataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        dataToSend.append(key, formData[key]);
      });
      if (avatarFile) {
        dataToSend.append('avatar', avatarFile);
      }

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
  

  return (
    <div className={styles.container}>
      <h2 className={styles.mainTitle}>⚙️ Editar Perfil</h2>
      
      {/* Mantenemos el estilo inline solo para la lógica de color dinámica, ya que no estaba en el CSS */}
      {message && (
        <div style={{
          padding:'15px', 
          marginBottom:'20px', 
          borderRadius:'6px', 
          background: message.includes('✅') ? '#d4edda' : '#f8d7da', 
          color: message.includes('✅') ? '#155724' : '#721c24'
        }}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        
        {/* SECCIÓN AVATAR */}
        <div className={styles.avatarSection}>
            {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className={styles.avatarPreview} />
            ) : (
                <div className={styles.avatarPreview}>📷</div>
            )}
            <div>
                <label className={styles.label}>Foto de Perfil / Logo</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className={styles.fileInput} />
            </div>
        </div>

        <div className={styles.formGrid}>
            <div>
                <label className={styles.label}>Nombre Personal</label>
                <input type="text" className={styles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
                <label className={styles.label}>Región</label>
                <select className={styles.select} value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})}>
                    <option value="">Selecciona...</option>
                    {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
            <div>
                <label className={styles.label}>Nueva Contraseña (Opcional)</label>
                <input type="password" className={styles.input} placeholder="Mantener actual" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
        </div>

        {user?.role === 'locatario' && (
            <>
                <h3 className={styles.sectionTitle}>🏠 Datos de tu Almacén</h3>
                <div className={styles.formGrid}>
                    <div className={styles.fullWidth}>
                        <label className={styles.label}>Nombre del Almacén</label>
                        <input type="text" className={styles.input} value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
                    </div>
                    <div className={styles.fullWidth}>
                        <label className={styles.label}>Dirección</label>
                        <input type="text" className={styles.input} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                    <div>
                        <label className={styles.label}>WhatsApp</label>
                        <input type="text" className={styles.input} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                </div>
            </>
        )}

        {user?.role === 'proveedor' && (
            <>
                <h3 className={styles.sectionTitle}>🚚 Datos de Empresa</h3>
                <div className={styles.formGrid}>
                    <div className={styles.fullWidth}>
                        <label className={styles.label}>Nombre de la Empresa</label>
                        <input type="text" className={styles.input} value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
                    </div>
                    <div className={styles.fullWidth}>
                        <label className={styles.label}>Descripción</label>
                        <textarea className={styles.textarea} value={formData.businessDescription} onChange={e => setFormData({...formData, businessDescription: e.target.value})} />
                    </div>
                    <div>
                        <label className={styles.label}>Sitio Web</label>
                        <input type="text" className={styles.input} value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
                    </div>
                    <div>
                        <label className={styles.label}>WhatsApp</label>
                        <input type="text" className={styles.input} value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
                    </div>
                </div>
            </>
        )}

        <button type="submit" className={styles.btnSave} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}