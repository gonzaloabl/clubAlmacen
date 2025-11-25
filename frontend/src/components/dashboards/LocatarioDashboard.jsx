import { useState, useEffect } from 'react';
import { useLocatario } from '../../hooks/useLocatario';
import { useAuth } from '../../hooks/useAuth';
import { DashboardLayout } from '../layouts/DashboardLayout';
import {ProfileSettings} from './ProfileSettings'

export function LocatarioDashboard() {
  const { isLocatario, reservas, espacios, loadLocatarioData, hacerReserva } = useLocatario();
  const { user } = useAuth();
  
  // Estado para la navegación interna (SPA)
  const [activeTab, setActiveTab] = useState('overview');
  // Estado para el formulario de reserva simple
  const [fechaReserva, setFechaReserva] = useState('');

  useEffect(() => {
    loadLocatarioData();
  }, []);

  if (!isLocatario) return null;

  // 1. Definimos el Menú Lateral del Locatario
  const sidebarItems = [
    { label: 'Mi Resumen', icon: '🏠', onClick: () => setActiveTab('overview'), isActive: activeTab === 'overview' },
    { label: 'Mi Perfil', icon: '⚙️', onClick: () => setActiveTab('profile'), isActive: activeTab === 'profile' },
    { label: 'Mis Reservas', icon: '📅', onClick: () => setActiveTab('reservas'), isActive: activeTab === 'reservas' },
    { label: 'Buscar Espacios', icon: '🔍', onClick: () => setActiveTab('buscar'), isActive: activeTab === 'buscar' },
    { label: 'Comunidad', icon: '💬', path: '/forum' }, // Enlace directo al foro
  ];

  const handleReservar = (id) => {
    if(!fechaReserva) return alert('Selecciona una fecha');
    const exito = hacerReserva(id, fechaReserva);
    if(exito) {
        alert('¡Reserva creada!');
        setFechaReserva('');
        setActiveTab('reservas'); // Llevar al usuario a ver sus reservas
    }
  };

  return (
    <DashboardLayout 
      title="Panel de Locatario"
      subtitle={`Hola, ${user?.name}. Gestiona tus alquileres.`}
      sidebarItems={sidebarItems}
    >
      
      {/* --- VISTA GENERAL --- */}
      {activeTab === 'overview' && (
        <div>
          <h2 style={{color: 'var(--text-main)'}}>Resumen de Actividad</h2>
          
          {/* Stats Cards */}
          <div style={styles.statsGrid}>
            <div style={styles.card}>
                <span style={{fontSize: '2rem'}}>📅</span>
                <h3>{reservas.length}</h3>
                <p>Reservas Activas</p>
            </div>
            <div style={styles.card}>
                <span style={{fontSize: '2rem'}}>💬</span>
                <h3>0</h3>
                <p>Msjes en Foro</p>
            </div>
          </div>

          {/* Notificación estilo Foro */}
          <div style={styles.noticeBox}>
             <strong>📢 Aviso de Administración:</strong> Recuerda actualizar datos de contacto.
          </div>
        </div>
      )}

      {/* 3️⃣ RENDERIZAR EL COMPONENTE CUANDO LA PESTAÑA ESTÁ ACTIVA */}
      {activeTab === 'profile' && (
        <ProfileSettings />
      )}

      {/* --- MIS RESERVAS --- */}
      {activeTab === 'reservas' && (
        <div>
          <h2 style={{color: 'var(--text-main)', marginBottom:'20px'}}>Mis Reservas</h2>
          {reservas.length === 0 ? (
            <p style={{color: 'var(--text-muted)'}}>No tienes reservas activas.</p>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                {reservas.map(res => (
                    <div key={res.id} style={styles.rowCard}>
                        <div style={styles.dateBadge}>
                            <span style={{fontWeight:'bold'}}>{new Date(res.fecha).getDate()}</span>
                            <small>{new Date(res.fecha).toLocaleString('es-CL', { month: 'short' })}</small>
                        </div>
                        <div style={{flex: 1}}>
                            <h4 style={{margin: 0, color: 'var(--text-main)'}}>{res.espacio}</h4>
                            <small style={{color: 'var(--text-muted)'}}>Confirmada • ${res.total}</small>
                        </div>
                        <button style={styles.btnSmall}>Ver Detalle</button>
                    </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* --- BUSCAR ESPACIOS --- */}
      {activeTab === 'buscar' && (
        <div>
          <h2 style={{color: 'var(--text-main)', marginBottom:'20px'}}>Espacios Disponibles</h2>
          <div style={styles.gridEspacios}>
            {espacios.map(espacio => (
                <div key={espacio.id} style={styles.espacioCard}>
                    <div style={{height: '100px', background: '#ccc', borderRadius: '5px 5px 0 0', display:'flex', alignItems:'center', justifyContent:'center', color:'#666'}}>
                        Imagen Espacio
                    </div>
                    <div style={{padding: '15px'}}>
                        <h4 style={{margin: '0 0 5px 0', color: 'var(--text-main)'}}>{espacio.nombre}</h4>
                        <p style={{color: 'var(--accent)', fontWeight: 'bold'}}>${espacio.precio} / día</p>
                        
                        {espacio.disponible ? (
                            <div style={{marginTop: '10px'}}>
                                <input 
                                    type="date" 
                                    style={styles.inputDate}
                                    onChange={(e) => setFechaReserva(e.target.value)}
                                />
                                <button 
                                    onClick={() => handleReservar(espacio.id)}
                                    style={styles.btnPrimary}
                                >
                                    Reservar
                                </button>
                            </div>
                        ) : (
                            <span style={{color: 'var(--danger)', fontSize: '0.9rem'}}>🚫 No disponible</span>
                        )}
                    </div>
                </div>
            ))}
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

const styles = {
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '30px' },
  card: { padding: '20px', border: '1px solid var(--border)', borderRadius: '10px', textAlign: 'center', background: 'var(--bg-body)' },
  noticeBox: { padding: '15px', background: 'rgba(52, 152, 219, 0.1)', borderLeft: '4px solid var(--accent)', color: 'var(--text-main)', borderRadius: '4px' },
  
  // Estilos de lista de reservas
  rowCard: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'var(--bg-body)', borderRadius: '8px', border: '1px solid var(--border)' },
  dateBadge: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-card)', padding: '5px 10px', borderRadius: '5px', border: '1px solid var(--border)', minWidth: '50px' },
  btnSmall: { padding: '5px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer', borderRadius: '4px', color: 'var(--text-muted)' },
  
  // Estilos de espacios
  gridEspacios: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' },
  espacioCard: { border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-card)' },
  inputDate: { padding: '5px', borderRadius: '4px', border: '1px solid var(--border)', marginRight: '5px', width: '110px' },
  btnPrimary: { padding: '6px 12px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};