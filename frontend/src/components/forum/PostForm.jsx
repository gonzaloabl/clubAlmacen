import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { postAPI, categoryAPI } from '../../services/api';
import { REGIONES } from '../../utils/regions';
import styles from './PostForm.module.css';

export function PostForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [type, setType] = useState('forum');
  const [region, setRegion] = useState('Nacional');
  
  // 📸 ESTADOS PARA IMAGEN
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryAPI.getAll();
        setCategories(data);
        
        if (location.state?.preSelectedCategory) {
            setCategory(location.state.preSelectedCategory);
        } else if (data.length > 0) {
            setCategory(data[0]._id);
        }
      } catch (err) {
        setError('Error al cargar categorías');
      }
    };
    loadCategories();
  }, [location.state]);
  
  useEffect(() => {
    if (user?.region) {
      setRegion(user.region);
    }
  }, [user]);

  // 📸 MANEJADOR DE IMAGEN
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!title.trim() || !content.trim() || !category) {
      setError('Título, contenido y categoría son obligatorios');
      setLoading(false);
      return;
    }

    try {
      // 📦 USAMOS FORMDATA PARA ENVIAR ARCHIVOS
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('category', category);
      formData.append('type', type);
      formData.append('region', region);
      formData.append('tags', tags); // El backend lo parseará
      
      if (image) {
        formData.append('image', image);
      }

      await postAPI.create(formData);
      navigate(`/forum/category/${category}`);
    } catch (err) {
      setError('Error al crear la publicación: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryOptions = () => {
    const groups = {
        'locatarios': '🏠 Zona Locatarios',
        'proveedores': '🚚 Zona Proveedores',
        'comunidad': '🌳 Plaza Pública'
    };

    return Object.entries(groups).map(([key, label]) => {
        const isAdminUser = user?.role === 'admin';
        const isLocatario = user?.role === 'locatario';
        const isProveedor = user?.role === 'proveedor';

        let isVisible = false;
        if (key === 'comunidad') isVisible = true;
        if (key === 'locatarios' && (isLocatario || isAdminUser)) isVisible = true;
        if (key === 'proveedores' && (isProveedor || isAdminUser)) isVisible = true;

        if (!isVisible) return null;

        const groupCats = categories.filter(c => c.group === key).filter(cat => {
            // 🛡️ Ocultar categoría "Anuncios Oficiales" si no es admin
            if (cat.name.toLowerCase().includes('anuncios oficiales') && !isAdminUser) return false;
            return true;
        });

        if (groupCats.length === 0) return null;

        return (
            <optgroup key={key} label={label}>
                {groupCats.map(cat => (
                    <option key={cat._id} value={cat._id}>
                        {cat.icon || '📁'} {cat.name}
                    </option>
                ))}
            </optgroup>
        );
    });
  };

  if (!user) return <div style={{padding:'50px', textAlign:'center'}}>Acceso denegado.</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.editorCard}>
        
        <div className={styles.header}>
          <h2 className={styles.title}>📝 Iniciar Nueva Discusión</h2>
          <p className={styles.subtitle}>Comparte tus dudas, ideas o noticias con la comunidad.</p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          
          <div className={styles.group}>
            <label className={styles.label}>Título de tu tema</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: ¿Cuál es el mejor proveedor de lácteos en Santiago?"
              className={styles.inputLg}
              autoFocus
              disabled={loading}
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Contenido</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe tu consulta o tema en detalle..."
              className={styles.textarea}
              disabled={loading}
            />
          </div>

          {/* 📸 CAMPO DE IMAGEN NUEVO */}
          <div className={styles.group}>
             <label className={styles.label}>Imagen (Opcional)</label>
             <div style={{display:'flex', alignItems:'center', gap:'15px', flexWrap: 'wrap'}}>
               <input 
                 type="file" 
                 accept="image/*" 
                 onChange={handleImageChange}
                 className={styles.input}
                 disabled={loading}
               />
               {preview && (
                 <div style={{position:'relative', marginTop: '10px'}}>
                   <img src={preview} alt="Preview" style={{height:'80px', borderRadius:'6px', border:'1px solid #ddd'}} />
                   <button 
                     type="button"
                     onClick={()=>{setImage(null); setPreview(null);}}
                     style={{
                        position:'absolute', top:-8, right:-8, 
                        background:'#e74c3c', color:'white', 
                        border:'none', borderRadius:'50%', 
                        width:'24px', height:'24px', 
                        cursor:'pointer', fontWeight: 'bold'
                     }}
                   >
                     ×
                   </button>
                 </div>
               )}
             </div>
          </div>

          <div className={styles.row}>
            
            <div className={`${styles.group} ${styles.flex1}`}>
              <label className={styles.label}>Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={styles.select}
                disabled={loading}
              >
                {categories.length === 0 && <option>Cargando...</option>}
                {renderCategoryOptions()}
              </select>
            </div>

            <div className={`${styles.group} ${styles.flex1}`}>
              <label className={styles.label}>Región</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className={styles.select}
                disabled={loading}
              >
                {REGIONES.map(reg => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>

            <div className={`${styles.group} ${styles.flex15}`}>
              <label className={styles.label}>Etiquetas (Opcional)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Ej: urgente, dato, oferta"
                className={styles.input}
                disabled={loading}
              />
              <span className={styles.helper}>Separadas por comas</span>
            </div>
          </div>

          <div className={styles.footerActions}>
            <button 
              type="button" 
              onClick={() => navigate('/forum')} 
              className={styles.btnCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={styles.btnSubmit}
              disabled={loading}
            >
              {loading ? 'Subiendo...' : '🚀 Publicar Tema'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}