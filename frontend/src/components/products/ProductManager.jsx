import { useState, useEffect } from 'react';
import { productAPI } from '../../services/api';
import styles from './ProductManager.module.css';

export function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // ID del producto a editar

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: null
  });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getMyProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos para editar
  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image: null
    });
    setPreview(product.image);
    setEditingId(product._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setFormData({ name: '', description: '', price: '', stock: '', image: null });
    setPreview(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Borrar producto?")) return;
    try {
      await productAPI.deleteProduct(id);
      loadProducts();
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setFormData(prev => ({ ...prev, image: file }));
        setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('stock', formData.stock);
        if (formData.image) {
            data.append('image', formData.image);
        }

        if (editingId) {
            await productAPI.updateProduct(editingId, data);
            alert("✅ Producto actualizado");
        } else {
            await productAPI.createProduct(data);
            alert("✅ Producto creado");
        }
        
        cancelEdit();
        loadProducts();
        
    } catch (error) {
        alert("Error al guardar");
    }
  };

  return (
    <div className={styles.managerContainer}>
      <div className={styles.header}>
        <h3>📦 Inventario ({products.length})</h3>
        <button 
            className={styles.btnAdd} 
            onClick={showForm ? cancelEdit : () => setShowForm(true)}
            style={{backgroundColor: showForm ? '#e74c3c' : '#27ae60'}}
        >
            {showForm ? '✖ Cancelar' : '+ Nuevo Producto'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.formCard}>
            <h4>{editingId ? '✏️ Editar Producto' : '✨ Nuevo Producto'}</h4>
            <div className={styles.formGroup}>
                <input type="text" name="name" placeholder="Nombre" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className={styles.formGroup}>
                <textarea name="description" placeholder="Descripción" value={formData.description} onChange={handleInputChange} required />
            </div>
            <div className={styles.row}>
                <input type="number" name="price" placeholder="Precio ($)" value={formData.price} onChange={handleInputChange} required />
                <input type="number" name="stock" placeholder="Stock" value={formData.stock} onChange={handleInputChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Imagen</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {preview && <img src={preview} alt="Vista previa" className={styles.previewImg} />}
            </div>
            <button type="submit" className={styles.btnSave}>
                {editingId ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
        </form>
      )}

      {loading ? <p>Cargando...</p> : (
        <div className={styles.grid}>
            {products.map(p => (
                <div key={p._id} className={styles.productCard}>
                    <div className={styles.imgContainer}>
                        {p.image ? <img src={p.image} alt={p.name} /> : <span style={{fontSize:'2rem'}}>📦</span>}
                    </div>
                    <div className={styles.cardInfo}>
                        <h5>{p.name}</h5>
                        <p className={styles.price}>${p.price}</p>
                        <div style={{display:'flex', gap:'5px', marginTop:'10px'}}>
                            <button onClick={() => handleEdit(p)} className={styles.btnEdit} style={{flex:1, cursor:'pointer', background:'#f39c12', color:'white', border:'none', padding:'5px', borderRadius:'4px'}}>Editar</button>
                            <button onClick={() => handleDelete(p._id)} className={styles.btnDelete} style={{flex:1}}>Eliminar</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}