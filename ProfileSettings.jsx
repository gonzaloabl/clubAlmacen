import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { REGIONES } from '../../utils/regions';
import toast from 'react-hot-toast';
import styles from './ProfileSettings.module.css';

export function ProfileSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Detectar rol para adaptar textos
  const isLocatario = user?.role === 'locatario';
  const businessTitle = isLocatario ? '🏪 Datos del Almacén' : '🏢 Datos de la Empresa';
  const businessNameLabel = isLocatario ? 'Nombre del Almacén' : 'Nombre de Fantasía';
  const businessDescLabel = isLocatario ? '¿Qué vende tu almacén?' : 'Descripción de tus servicios/productos';

  // Estados del Formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    region: 'Nacional',
    phone: '',
    address: '',
    businessName: '',
    businessDescription: '',
    website: '',
    whatsapp: '',
    password: '',
    confirmPassword: ''
  });

  // Estado para Avatar
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        region: user.region || 'Nacional',
        phone: user.phone || '',
        address: user.address || '',
        businessName: user.businessName || '',
        businessDescription: user.businessDescription || '',
        website: user.website || '',
        whatsapp: user.whatsapp || ''
      }));
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error("Las contraseñas no coinciden");
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const data = new FormData();
      // Agregar campos de texto
      Object.keys(formData).forEach(key => {
        if (key !== 'password' && key !== 'confirmPassword' && key !== 'email') {
             data.append(key, formData[key]);
        }
      });
      
      // Solo enviar password si el usuario escribió algo
      if (formData.password) data.append('password', formData.password);

      // Agregar Avatar si existe
      if (avatarFile) data.append('avatar', avatarFile);

      const res = await fetch('http://localhost:3000/api/users/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      if (!res.ok) throw new Error('Error al actualizar perfil');

      const updatedUser = await res.json();
      
      // Actualizar localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updatedUser }));
      
      toast.success("Perfil actualizado correctamente");
      setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
      console.error(error);
      toast.error("Error al guardar cambios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.mainTitle}>⚙️ Configuración de Perfil</h2>
      
      <form onSubmit={handleSubmit}>
        
        {/* SECCIÓN AVATAR */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarPreview}>
            <img 
                src={avatarPreview || '/default-avatar.png'} 
                alt="Avatar" 
                style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} 
            />
          </div>
          <div>
            <label className={styles.label}>Foto de Perfil</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className={styles.fileInput} />
          </div>
        </div>

        {/* DATOS BÁSICOS */}
        <div className={styles.formGrid}>
          <div>
            <label className={styles.label}>Nombre Completo</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className={styles.input} />
          </div>
          <div>
            <label className={styles.label}>Email (No editable)</label>
            <input type="email" value={formData.email} disabled className={styles.input} style={{background: 'var(--bg-body)', opacity: 0.7}} />
          </div>
          <div>
            <label className={styles.label}>Región</label>
            <select name="region" value={formData.region} onChange={handleChange} className={styles.select}>
              {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className={styles.label}>Teléfono / Celular</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+569..." className={styles.input} />
          </div>
        </div>

        {/* DATOS DE NEGOCIO (ADAPTATIVO) */}
        <h3 className={styles.sectionTitle}>{businessTitle}</h3>
        
        <div className={styles.formGrid}>
            <div className={styles.fullWidth}>
                <label className={styles.label}>{businessNameLabel}</label>
                <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} placeholder={isLocatario ? "Ej: Almacén Don Tito" : "Ej: Distribuidora del Sur"} className={styles.input} />
            </div>
            
            <div className={styles.fullWidth}>
                <label className={styles.label}>{businessDescLabel}</label>
                <textarea name="businessDescription" value={formData.businessDescription} onChange={handleChange} rows="3" className={styles.textarea} />
            </div>

            <div>
                <label className={styles.label}>WhatsApp Business</label>
                <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="Link o número" className={styles.input} />
            </div>
            <div>
                <label className={styles.label}>Sitio Web / Red Social</label>
                <input type="text" name="website" value={formData.website} onChange={handleChange} placeholder="https://..." className={styles.input} />
            </div>
        </div>

        {/* SEGURIDAD */}
        <h3 className={styles.sectionTitle}>🔒 Seguridad</h3>
        <div className={styles.formGrid}>
           <div>
               <label className={styles.label}>Nueva Contraseña (Opcional)</label>
               <input type="password" name="password" value={formData.password} onChange={handleChange} className={styles.input} />
           </div>
           <div>
               <label className={styles.label}>Confirmar Contraseña</label>
               <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={styles.input} />
           </div>
        </div>

        <button type="submit" disabled={loading} className={styles.btnSave}>
          {loading ? 'Guardando...' : '💾 Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}