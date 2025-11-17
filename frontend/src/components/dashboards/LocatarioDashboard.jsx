import { useLocatario } from '../../hooks/useLocatario';
import { useState, useEffect } from 'react';

export function LocatarioDashboard() {
  const { isLocatario, espacios, reservas, loadLocatarioData, hacerReserva } = useLocatario();
  const [fechaReserva, setFechaReserva] = useState('');
  const [espacioSeleccionado, setEspacioSeleccionado] = useState(null);

  useEffect(() => {
    loadLocatarioData();
  }, []);

  if (!isLocatario) {
    return (
      <div style={styles.error}>
        <h2>⛔ Acceso Denegado</h2>
        <p>No tienes permisos de locatario para ver este panel.</p>
      </div>
    );
  }

  const handleReserva = (espacioId) => {
    if (!fechaReserva) {
      alert('Por favor selecciona una fecha');
      return;
    }

    const success = hacerReserva(espacioId, fechaReserva);
    if (success) {
      alert('¡Reserva realizada con éxito!');
      setFechaReserva('');
      setEspacioSeleccionado(null);
    } else {
      alert('No se pudo realizar la reserva. El espacio no está disponible.');
    }
  };

  return (
    <div style={styles.container}>
      <h1>🏠 Panel de Locatario</h1>

      <div style={styles.grid}>
        {/* Espacios Disponibles */}
        <div style={styles.section}>
          <h2>📍 Espacios Disponibles</h2>
          <div style={styles.espaciosList}>
            {espacios.map(espacio => (
              <div key={espacio.id} style={styles.espacioCard}>
                <h3>{espacio.nombre}</h3>
                <p>Precio: ${espacio.precio}/día</p>
                <p>Estado: 
                  <span style={{
                    color: espacio.disponible ? '#198754' : '#dc3545',
                    fontWeight: 'bold'
                  }}>
                    {espacio.disponible ? ' ✅ Disponible' : ' ❌ No disponible'}
                  </span>
                </p>
                
                {espacio.disponible && (
                  <div style={styles.reservaForm}>
                    <input
                      type="date"
                      value={fechaReserva}
                      onChange={(e) => setFechaReserva(e.target.value)}
                      style={styles.input}
                    />
                    <button 
                      onClick={() => handleReserva(espacio.id)}
                      style={styles.reservaButton}
                    >
                      🗓️ Reservar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mis Reservas */}
        <div style={styles.section}>
          <h2>📅 Mis Reservas</h2>
          {reservas.length === 0 ? (
            <p style={styles.noReservas}>No tienes reservas activas</p>
          ) : (
            <div style={styles.reservasList}>
              {reservas.map(reserva => (
                <div key={reserva.id} style={styles.reservaCard}>
                  <h4>{reserva.espacio}</h4>
                  <p>Fecha: {reserva.fecha}</p>
                  <p>Total: ${reserva.total}</p>
                  <div style={styles.reservaActions}>
                    <button style={styles.smallButton}>👀 Ver Detalles</button>
                    <button style={styles.smallButton}>📧 Contactar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Información Rápida */}
      <div style={styles.quickInfo}>
        <h2>ℹ️ Información Rápida</h2>
        <div style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <h3>💰 Precios</h3>
            <ul>
              <li>Oficinas: $300 - $800/día</li>
              <li>Salas de reuniones: $200 - $500/día</li>
              <li>Espacios coworking: $150 - $300/día</li>
            </ul>
          </div>
          <div style={styles.infoCard}>
            <h3>📞 Contacto</h3>
            <p>Teléfono: +56 2 1234 5678</p>
            <p>Email: contacto@clubalmacen.cl</p>
            <p>Horario: Lunes a Viernes 8:00 - 20:00</p>
          </div>
          <div style={styles.infoCard}>
            <h3>🔧 Servicios Incluidos</h3>
            <ul>
              <li>WiFi de alta velocidad</li>
              <li>Impresión básica</li>
              <li>Recepción de paquetes</li>
              <li>Café y agua</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    marginBottom: '30px'
  },
  section: {
    background: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  espaciosList: {
    display: 'grid',
    gap: '20px'
  },
  espacioCard: {
    padding: '20px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    background: '#f8f9fa'
  },
  reservaForm: {
    marginTop: '15px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  input: {
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '5px'
  },
  reservaButton: {
    padding: '8px 15px',
    background: '#198754',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  reservasList: {
    display: 'grid',
    gap: '15px'
  },
  reservaCard: {
    padding: '15px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    background: '#e7f3ff'
  },
  reservaActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  smallButton: {
    padding: '5px 10px',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  noReservas: {
    textAlign: 'center',
    color: '#6c757d',
    fontStyle: 'italic',
    padding: '20px'
  },
  quickInfo: {
    background: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px'
  },
  infoCard: {
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  error: {
    textAlign: 'center',
    padding: '50px',
    color: '#dc3545'
  }
};