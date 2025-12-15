import { useState, useEffect } from 'react';

export function SupportPanel() {
  const token = localStorage.getItem('token');
  const [tickets, setTickets] = useState([]); // Inicializado como array vacío
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: 'Soporte Software POS', priority: 'Media', description: '' });

  // 🛡️ FUNCIÓN BLINDADA CONTRA ERRORES
  const loadTickets = async () => {
    // Si no hay token, no intentamos nada (evita errores 401)
    if (!token) return; 

    try {
      const res = await fetch('http://localhost:3000/api/tickets/my-tickets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Si el servidor da error (ej: 404, 500), lanzamos excepción manual
      if (!res.ok) {
          throw new Error('No se pudieron cargar los tickets');
      }

      const data = await res.json();
      
      // Validación extra: ¿Es realmente un array?
      if (Array.isArray(data)) {
          setTickets(data);
      } else {
          setTickets([]); // Si llega basura, ponemos lista vacía
      }

    } catch (e) { 
        console.error("Error cargando tickets:", e);
        setTickets([]); // En caso de error, aseguramos que sea un array vacío para no romper la UI
    }
  };

  useEffect(() => { loadTickets(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch('http://localhost:3000/api/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            alert("✅ Solicitud enviada correctamente.");
            setFormData({ title: '', category: 'Soporte Software POS', priority: 'Media', description: '' });
            setShowForm(false);
            loadTickets();
        } else {
            alert("Hubo un problema al enviar el ticket.");
        }
    } catch (error) { alert("Error de conexión"); }
  };

  return (
    <div style={panelStyle}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px', borderBottom:'1px solid #eee', paddingBottom:'10px'}}>
        <h3 style={{margin:0, color:'#2c3e50', fontSize:'1.1rem'}}>🛟 Soporte Técnico</h3>
        <button onClick={() => setShowForm(!showForm)} style={btnStyle}>
            {showForm ? 'Cancelar' : '➕ Nuevo Ticket'}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'10px', background:'#f8f9fa', padding:'15px', borderRadius:'8px'}}>
            <input required placeholder="Asunto (ej: Falla impresora)" value={formData.title} onChange={e=>setFormData({...formData, title:e.target.value})} style={inputStyle} />
            <div style={{display:'flex', gap:'10px'}}>
                <select style={inputStyle} value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})}>
                    <option>Soporte Software POS</option>
                    <option>Falla Hardware POS</option>
                    <option>Duda General</option>
                    <option>Solicitud Visita Técnica</option>
                </select>
                <select style={inputStyle} value={formData.priority} onChange={e=>setFormData({...formData, priority:e.target.value})}>
                    <option>Baja</option>
                    <option>Media</option>
                    <option>Alta</option>
                    <option>Urgente</option>
                </select>
            </div>
            <textarea required placeholder="Describe el problema..." rows="3" value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} style={inputStyle} />
            <button type="submit" style={{...btnStyle, background:'#2ecc71', width:'100%'}}>Enviar Solicitud</button>
        </form>
      ) : (
        <div style={{maxHeight:'300px', overflowY:'auto'}}>
            {/* Validamos tickets antes de medir su largo */}
            {!tickets || tickets.length === 0 ? (
                <div style={{textAlign:'center', padding:'20px', color:'#999', fontSize:'0.9rem'}}>
                    No tienes solicitudes pendientes. <br/> ¡Todo funciona bien! 🎉
                </div>
            ) : (
                <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    {tickets.map(t => (
                        <div key={t._id} style={ticketItemStyle}>
                            <div style={{display:'flex', justifyContent:'space-between'}}>
                                <strong style={{fontSize:'0.95rem'}}>{t.title}</strong>
                                <span style={{
                                    fontSize:'0.75rem', padding:'2px 8px', borderRadius:'10px', color:'white', fontWeight:'bold',
                                    background: t.status === 'Abierto' ? '#e74c3c' : t.status === 'Cerrado' ? '#95a5a6' : '#f39c12'
                                }}>{t.status?.toUpperCase() || 'ABIERTO'}</span>
                            </div>
                            <div style={{fontSize:'0.8rem', color:'#666', marginTop:'2px'}}>{t.category}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}
    </div>
  );
}

const panelStyle = { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', height: '100%' };
const btnStyle = { padding: '6px 12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize:'0.85rem', fontWeight:'600' };
const inputStyle = { padding: '8px', borderRadius: '6px', border: '1px solid #ddd', width: '100%', fontSize:'0.9rem' };
const ticketItemStyle = { border: '1px solid #eee', padding: '12px', borderRadius: '8px', background: '#fff', transition:'all 0.2s' };