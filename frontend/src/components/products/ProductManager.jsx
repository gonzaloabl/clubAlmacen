import { useState, useEffect } from 'react';
import { productAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import styles from './ProductManager.module.css';

export function ProductManager() {
  const [products, setProducts] = useState([]);
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // ID del producto a editar

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Abarrotes',
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
      category: product.category || 'Abarrotes',
      image: null
    });
    setPreview(product.image);
    setEditingId(product._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setFormData({ name: '', description: '', price: '', stock: '', category: 'Abarrotes', image: null });
    setPreview(null);
    setEditingId(null);
    setShowForm(false);
  };

  const executeDelete = async (id) => {
    try {
      await productAPI.deleteProduct(id);
      toast.success("🗑️ Producto eliminado");
      loadProducts();
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  const confirmDelete = (id) => {
    toast((t) => (
      <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
        <span style={{fontSize:'0.9rem'}}>⚠️ ¿Eliminar este producto?</span>
        <div style={{display:'flex', gap:'8px', justifyContent:'flex-end'}}>
          <button onClick={() => { toast.dismiss(t.id); executeDelete(id); }} style={{background:'#e74c3c', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer', fontSize:'0.85rem'}}>Eliminar</button>
          <button onClick={() => toast.dismiss(t.id)} style={{background:'#ecf0f1', color:'#333', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer', fontSize:'0.85rem'}}>Cancelar</button>
        </div>
      </div>
    ), { duration: 5000, icon: '📦' });
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
        data.append('category', formData.category);
        if (formData.image) {
            data.append('image', formData.image);
        }

        const promise = editingId 
            ? productAPI.updateProduct(editingId, data)
            : productAPI.createProduct(data);

        toast.promise(promise, {
            loading: editingId ? 'Actualizando...' : 'Creando...',
            success: () => {
                cancelEdit();
                loadProducts();
                return editingId ? '✅ Producto actualizado' : '✅ Producto creado';
            },
            error: 'Error al guardar'
        });

    } catch (error) {
        console.error(error);
    }
  };

  const filteredProducts = filterCategory === 'Todas' 
    ? products 
    : products.filter(p => p.category === filterCategory);

  return (
    <div className={styles.managerContainer}>
      <div className={styles.header}>
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
            <h3>📦 Inventario ({products.length})</h3>
            <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{padding: '8px', borderRadius: '6px', border: '1px solid #ccc', cursor:'pointer'}}
            >
                <option value="Todas">Todas las Categorías</option>
                {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
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
            <div className={styles.formGroup}>
                <label style={{display:'block', marginBottom:'5px', fontSize:'0.9rem', fontWeight:'600'}}>Categoría</label>
                <select name="category" value={formData.category} onChange={handleInputChange} style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #ccc'}}>
                    {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
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
            {filteredProducts.map(p => (
                <div key={p._id} className={styles.productCard}>
                    <div className={styles.imgContainer}>
                        {p.image ? <img src={p.image} alt={p.name} /> : <span style={{fontSize:'2rem'}}>📦</span>}
                    </div>
                    <div className={styles.cardInfo}>
                        <h5>{p.name}</h5>
                        <p className={styles.price}>${p.price}</p>
                        <div style={{display:'flex', gap:'5px', marginTop:'10px'}}>
                            <button onClick={() => handleEdit(p)} className={styles.btnEdit} style={{flex:1, cursor:'pointer', background:'#f39c12', color:'white', border:'none', padding:'5px', borderRadius:'4px'}}>Editar</button>
                            <button onClick={() => confirmDelete(p._id)} className={styles.btnDelete} style={{flex:1}}>Eliminar</button>
                        </div>
                    </div>
                </div>
            ))}
            {filteredProducts.length === 0 && (
                <div className={styles.emptyState}>
                    No se encontraron productos en esta categoría.
                </div>
            )}
        </div>
      )}
    </div>
  );
}