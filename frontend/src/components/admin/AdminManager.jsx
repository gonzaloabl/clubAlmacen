import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
// import { useAuth } from '../../hooks/useAuth'; // 👈 Ya no lo necesitamos aquí

export function AdminManager() {
  // ✅ CORRECCIÓN: Sacamos el token directo del localStorage (igual que en el Panel Técnico)
  const token = localStorage.getItem('token'); 
  
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    adminType: 'regional', // default
    region: ''
  });

  // Cargar usuarios y filtrar solo los admins
  const loadAdmins = async () => {
    try {
      const data = await userAPI.getAllUsers();
      // Filtramos: Que sea admin, pero que NO sea superadmin (no queremos que te borres a ti mismo)
      const staff = data.filter(u => u.role === 'admin' && u.adminRole !== 'superadmin');
      setAdmins(staff);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAdmins(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.adminType === 'regional' && !formData.region) {
        return alert("⚠️ Debes especificar una región para el Admin Regional.");
    }

    try {
        const res = await fetch('http://localhost:3000/api/users/create-admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // 👈 Aquí usamos el token correcto
            },
            body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        alert("✅ Nuevo Administrador creado correctamente");
        setFormData({ name: '', email: '', password: '', adminType: 'regional', region: '' }); // Limpiar
        loadAdmins(); // Recargar lista

    } catch (error) {
        alert("Error: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("¿Estás seguro de ELIMINAR a este administrador?")) return;
    try {
        // Para borrar usamos la API normal (asegúrate de que userAPI.deleteUser use el token internamente o pásaselo si es necesario)
        // Si userAPI usa axios interceptors o headers automáticos, esto funcionará.
        await userAPI.deleteUser(id); 
        loadAdmins();
    } catch (error) {
        alert("Error al eliminar");
    }
  };

  if (loading) return <div>Cargando staff...</div>;

  return (
    <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
      
      {/* COLUMNA IZQUIERDA: CREAR */}
      <div style={cardStyle}>
        <h3 style={{borderBottom:'2px solid #3498db', paddingBottom:'10px', marginBottom:'20px'}}>✨ Crear Nuevo Admin</h3>
        
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
            <div>
                <label style={labelStyle}>Nombre</label>
                <input required type="text" style={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej: Roberto Gómez" />
            </div>
            <div>
                <label style={labelStyle}>Email Corporativo</label>
                <input required type="email" style={inputStyle} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="admin@clubalmacen.com" />
            </div>
            <div>
                <label style={labelStyle}>Contraseña Inicial</label>
                <input required type="password" style={inputStyle} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
            </div>
            
            <div>
                <label style={labelStyle}>Tipo de Rol</label>
                <select style={inputStyle} value={formData.adminType} onChange={e => setFormData({...formData, adminType: e.target.value})}>
                    <option value="regional">🗺️ Admin Regional (Zona)</option>
                    <option value="technical">🛠️ Admin Técnico (Soporte)</option>
                </select>
            </div>

            {formData.adminType === 'regional' && (
                <div>
                    <label style={labelStyle}>Asignar Región</label>
                    <select required style={inputStyle} value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})}>
                        <option value="">-- Selecciona Región --</option>
                        <option value="Arica y Parinacota">Arica y Parinacota</option>
                        <option value="Tarapacá">Tarapacá</option>
                        <option value="Antofagasta">Antofagasta</option>
                        <option value="Atacama">Atacama</option>
                        <option value="Coquimbo">Coquimbo</option>
                        <option value="Valparaíso">Valparaíso</option>
                        <option value="Metropolitana">Metropolitana</option>
                        <option value="O'Higgins">O'Higgins</option>
                        <option value="Maule">Maule</option>
                        <option value="Ñuble">Ñuble</option>
                        <option value="Biobío">Biobío</option>
                        <option value="Araucanía">Araucanía</option>
                        <option value="Los Ríos">Los Ríos</option>
                        <option value="Los Lagos">Los Lagos</option>
                        <option value="Aysén">Aysén</option>
                        <option value="Magallanes">Magallanes</option>
                    </select>
                </div>
            )}

            <button type="submit" style={btnSubmitStyle}>Crear Administrador</button>
        </form>
      </div>

      {/* COLUMNA DERECHA: LISTA */}
      <div style={cardStyle}>
        <h3 style={{borderBottom:'2px solid #2ecc71', paddingBottom:'10px', marginBottom:'20px'}}>👥 Mi Equipo ({admins.length})</h3>
        
        {admins.length === 0 ? (
            <p style={{color:'#777'}}>No tienes administradores creados aún.</p>
        ) : (
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                {admins.map(admin => (
                    <div key={admin._id} style={itemStyle}>
                        <div>
                            <div style={{fontWeight:'bold', fontSize:'1.1rem'}}>{admin.name}</div>
                            <div style={{color:'#666', fontSize:'0.9rem'}}>{admin.email}</div>
                            <div style={{marginTop:'5px'}}>
                                {admin.adminRole === 'regional' ? (
                                    <span style={badgeBlue}>📍 {admin.region}</span>
                                ) : (
                                    <span style={badgeOrange}>🛠️ Soporte Técnico</span>
                                )}
                            </div>
                        </div>
                        <button onClick={() => handleDelete(admin._id)} style={btnDeleteStyle}>🗑️ Eliminar</button>
                    </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
}

// Estilos Simples
const cardStyle = { background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' };
const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#444' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', marginBottom: '5px' };
const btnSubmitStyle = { width: '100%', padding: '12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };
const itemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #eee', borderRadius: '8px', background: '#f9f9f9' };
const badgeBlue = { background: '#d6eaf8', color: '#2980b9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight:'bold' };
const badgeOrange = { background: '#fce6c9', color: '#d35400', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight:'bold' };
const btnDeleteStyle = { background: '#ffeded', color: '#e74c3c', border: '1px solid #e74c3c', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' };