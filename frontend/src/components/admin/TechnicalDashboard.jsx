import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:3000/api';

export function TechnicalDashboard() {
  const token = localStorage.getItem('token'); 
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ESTADOS PARA TICKETS
  const [tickets, setTickets] = useState([]);
  const [refreshTickets, setRefreshTickets] = useState(false);

  // ESTADOS MODAL GESTIÓN
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketForm, setTicketForm] = useState({ status: '', adminResponse: '' });

  // 1. Cargar Estado del Sistema
  const fetchStatus = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/system/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);
    } catch (error) { console.error("Error status:", error); } finally { setLoading(false); }
  };

  // 2. Cargar Tickets
  const fetchTickets = async () => {
    try {
        const res = await fetch(`${API_URL}/tickets/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setTickets(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchStatus(); fetchTickets(); }, [refreshTickets]);

  const toggleMaintenance = async () => {
    if(!stats) return;
    const action = stats.maintenanceMode ? 'DESACTIVAR' : 'ACTIVAR';
    if (!window.confirm(`⚠️ ¿Estás seguro de ${action} el Modo Mantenimiento?`)) return;

    try {
      const res = await fetch(`${API_URL}/system/maintenance`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.ok) fetchStatus();
    } catch (error) { alert('Error al cambiar estado'); }
  };

  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setTicketForm({
        status: ticket.status,
        adminResponse: ticket.adminResponse || ''
    });
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Actualizando ticket...');

    try {
        const res = await fetch(`${API_URL}/tickets/${selectedTicket._id}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ticketForm)
        });

        let data;
        try {
            data = await res.json();
        } catch (e) {
            data = { message: 'Error de respuesta del servidor' };
        }

        if (res.ok) {
            toast.success('Ticket actualizado', { id: toastId });
            setRefreshTickets(!refreshTickets); // Recargar lista
            setSelectedTicket(null); // Cerrar modal
        } else {
            throw new Error(data.message || 'Error al actualizar');
        }
    } catch (error) { 
        console.error(error);
        toast.error(error.message || 'Error al guardar cambios', { id: toastId }); 
    }
  };

  if (loading) return <div style={{padding:'20px'}}>Cargando panel técnico...</div>;

  return (
    <div style={{ padding: '20px', maxWidth:'1200px', margin:'0 auto' }}>
      <h2 style={{color:'#2c3e50', marginBottom:'30px'}}>🛠️ Panel de Soporte Técnico</h2>
      
      {/* SECCIÓN 1: INFRAESTRUCTURA (Arriba) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        {/* Estado del Server */}
        <div style={cardStyle}>
          <h3 style={{marginTop:0}}>🖥️ Servidor</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={itemStyle}><span>BD MongoDB:</span> <strong>{stats?.database}</strong></li>
            <li style={itemStyle}><span>Uptime:</span> <span>{stats?.uptime}</span></li>
            <li style={itemStyle}><span>Hora Servidor:</span> <span>{stats?.serverTime ? new Date(stats.serverTime).toLocaleTimeString() : '--'}</span></li>
          </ul>
        </div>

        {/* Control Mantenimiento */}
        <div style={{ ...cardStyle, border: stats?.maintenanceMode ? '2px solid #e74c3c' : '1px solid #ddd' }}>
          <h3 style={{marginTop:0}}>⚠️ Emergencia</h3>
          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <div style={{ fontWeight: 'bold', fontSize:'1.2rem', color: stats?.maintenanceMode ? '#e74c3c' : '#2ecc71', marginBottom:'15px'}}>
                {stats?.maintenanceMode ? '⛔ CERRADO AL PÚBLICO' : '✅ SISTEMA OPERATIVO'}
            </div>
            <button onClick={toggleMaintenance} style={{padding:'10px 20px', background: stats?.maintenanceMode ? '#2ecc71' : '#e74c3c', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold'}}>
                {stats?.maintenanceMode ? '🔓 ABRIR SISTEMA' : '🔒 CERRAR SISTEMA'}
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: GESTIÓN DE TICKETS (Abajo) */}
      <div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
            <h3 style={{margin:0, color:'#2c3e50', borderBottom:'2px solid #3498db', paddingBottom:'5px'}}>🎫 Tickets de Clientes ({tickets.length})</h3>
            <button onClick={() => setRefreshTickets(!refreshTickets)} style={btnRefreshStyle}>🔄 Refrescar</button>
        </div>

        <div style={{display:'grid', gap:'15px'}}>
            {tickets.length === 0 ? <p style={{color:'#777', padding:'20px', background:'white', borderRadius:'8px'}}>No hay tickets pendientes.</p> : tickets.map(t => (
                <div key={t._id} style={{...cardStyle, borderLeft: `5px solid ${t.priority === 'Urgente' ? '#e74c3c' : t.priority === 'Alta' ? '#e67e22' : '#3498db'}`}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'10px'}}>
                        <div>
                            <h4 style={{margin:'0 0 5px 0', fontSize:'1.1rem'}}>{t.title}</h4>
                            <p style={{margin:'0 0 8px 0', fontSize:'0.95rem', color:'#555'}}>{t.description}</p>
                            <div style={{fontSize:'0.85rem', color:'#888'}}>
                                👤 <strong>{t.user?.name}</strong> • 📍 {t.user?.region || 'Nacional'} • 📅 {new Date(t.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        
                        <div style={{textAlign:'right', minWidth:'150px'}}>
                            <div style={{marginBottom:'8px'}}>
                                <span style={{background:'#f0f2f5', padding:'4px 8px', borderRadius:'4px', fontSize:'0.75rem', marginRight:'5px', color:'#555', display:'block', marginBottom:'5px'}}>{t.category}</span>
                                <span style={{
                                    background: t.status === 'Abierto' ? '#e74c3c' : t.status === 'En Proceso' ? '#f39c12' : '#2ecc71',
                                    color:'white', padding:'4px 10px', borderRadius:'15px', fontSize:'0.8rem', fontWeight:'bold'
                                }}>{t.status.toUpperCase()}</span>
                            </div>
                            <button onClick={()=> openTicketModal(t)} style={{fontSize:'0.85rem', cursor:'pointer', color:'#3498db', background:'white', border:'1px solid #3498db', padding:'4px 10px', borderRadius:'4px'}}>
                                Gestionar
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* MODAL DE GESTIÓN */}
      {selectedTicket && (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', borderBottom:'1px solid #eee', paddingBottom:'10px'}}>
                    <h3 style={{margin:0}}>📝 Gestionar Ticket #{selectedTicket._id.slice(-6)}</h3>
                    <button onClick={() => setSelectedTicket(null)} style={{background:'transparent', border:'none', fontSize:'1.5rem', cursor:'pointer'}}>×</button>
                </div>

                <div style={{marginBottom:'20px', background:'#f8f9fa', padding:'15px', borderRadius:'8px'}}>
                    <h4 style={{margin:'0 0 5px 0'}}>{selectedTicket.title}</h4>
                    <p style={{margin:0, color:'#555'}}>{selectedTicket.description}</p>
                    <div style={{marginTop:'10px', fontSize:'0.85rem', color:'#888'}}>
                        Reportado por: {selectedTicket.user?.name} ({selectedTicket.user?.email})
                    </div>
                </div>

                <form onSubmit={handleUpdateTicket}>
                    <div style={{marginBottom:'15px'}}>
                        <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Estado del Ticket</label>
                        <select style={inputStyle} value={ticketForm.status} onChange={e => setTicketForm({...ticketForm, status: e.target.value})}>
                            <option value="Abierto">🔴 Abierto</option>
                            <option value="En Proceso">🟠 En Proceso</option>
                            <option value="Cerrado">🟢 Cerrado</option>
                        </select>
                    </div>

                    <div style={{marginBottom:'20px'}}>
                        <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Respuesta Técnica</label>
                        <textarea rows="4" style={{...inputStyle, resize:'vertical'}} value={ticketForm.adminResponse} onChange={e => setTicketForm({...ticketForm, adminResponse: e.target.value})} placeholder="Escribe la solución o respuesta para el cliente..." />
                    </div>

                    <div style={{textAlign:'right'}}>
                        <button type="button" onClick={() => setSelectedTicket(null)} style={{marginRight:'10px', padding:'10px 20px', background:'#ecf0f1', border:'none', borderRadius:'5px', cursor:'pointer'}}>Cancelar</button>
                        <button type="submit" style={{padding:'10px 20px', background:'#3498db', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}

const cardStyle = { background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #eee' };
const itemStyle = { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' };
const btnRefreshStyle = { background:'#34495e', color:'white', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { background: 'white', padding: '25px', borderRadius: '10px', width: '90%', maxWidth: '500px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '1rem' };