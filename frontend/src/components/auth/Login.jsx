import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { GoogleAuthButton } from './GoogleAuthButton.jsx';

// 🆕 LIBRERÍAS NUEVAS
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';

// 👇 IMPORTAMOS LOS ESQUEMAS CENTRALIZADOS
import { loginSchema, registerSchema } from '../../schemas/authSchemas';

export function Login() {
  // Estado local para UI
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState('locatario');
  const [adminCreationCode, setAdminCreationCode] = useState('');
  
  const location = useLocation();
  const { login, register: registerUser, loading, user } = useAuth();

  // 🆕 HOOK FORM CONFIG
  // Agregamos 'watch' para la ayuda visual de la contraseña
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: yupResolver(isRegistering ? registerSchema : loginSchema),
    mode: "onChange"
  });

  // Monitoreamos el valor del password para pintar los requisitos en verde
  const passwordValue = watch('password', '');

  // Limpiar formulario al cambiar modo
  useEffect(() => { reset(); }, [isRegistering, reset]);

  // 🛡️ LÓGICA DE ERRORES DE URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorType = params.get('error');
    if (errorType) {
      const msgs = {
        'account_suspended': '⛔ Tu cuenta ha sido suspendida.',
        'google_auth_failed': '❌ Error al autenticar con Google.',
        'auth_failed': '❌ Falló la autenticación.',
        'google_not_configured': '⚠️ Google Auth no configurado.'
      };
      toast.error(msgs[errorType] || 'Ocurrió un error desconocido.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  if (user) return null;

  // 🚀 MANEJO DEL SUBMIT
  const onSubmit = async (data) => {
    try {
      if (isRegistering) {
        // data contiene 'confirmPassword', pero registerUser solo pide lo necesario
        // así que no hace falta borrarlo manualmente, solo pasamos lo que el hook pide.
        const res = await registerUser(data.name, data.email, data.password, role, adminCreationCode);
        if(res.success) toast.success("¡Bienvenido a Club Almacén!");
        else toast.error(res.error || "Error al registrarse");
      } else {
        const res = await login(data.email, data.password);
        if(res.success) toast.success("¡Hola de nuevo!");
        else toast.error("Credenciales incorrectas");
      }
    } catch (err) {
      toast.error("Error de conexión");
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.backgroundShape}></div>

      <div style={styles.authCard}>
        <div style={styles.header}>
          <Link to="/" style={styles.logoLink}>🏪 Club Almacén</Link>
          <h2 style={styles.title}>
            {isRegistering ? 'Únete a la comunidad' : 'Bienvenido de vuelta'}
          </h2>
          <p style={styles.subtitle}>
            {isRegistering 
              ? 'Crea tu cuenta para conectar con proveedores y locatarios.' 
              : 'Ingresa tus credenciales para acceder a tu panel.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          
          {isRegistering && (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nombre Completo</label>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  style={{...styles.input, borderColor: errors.name ? '#e74c3c' : 'var(--border)'}}
                />
                {errors.name && <span style={styles.errorMsg}>{errors.name.message}</span>}
              </div>

              {/* SELECTOR DE ROLES */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Quiero registrarme como:</label>
                <div style={styles.roleSelector}>
                  <button type="button" style={role === 'locatario' ? styles.roleBtnActive : styles.roleBtn} onClick={() => setRole('locatario')}>
                    🏪 Locatario
                  </button>
                  <button type="button" style={role === 'proveedor' ? styles.roleBtnActive : styles.roleBtn} onClick={() => setRole('proveedor')}>
                    🚚 Proveedor
                  </button>
                </div>
              </div>
            </>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <input
              {...register("email")}
              type="email"
              placeholder="tucorreo@ejemplo.com"
              style={{...styles.input, borderColor: errors.email ? '#e74c3c' : 'var(--border)'}}
            />
            {errors.email && <span style={styles.errorMsg}>{errors.email.message}</span>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              style={{...styles.input, borderColor: errors.password ? '#e74c3c' : 'var(--border)'}}
            />
            {errors.password && <span style={styles.errorMsg}>{errors.password.message}</span>}
            
            {/* 👇 AYUDA VISUAL DE REQUISITOS (Solo en registro) */}
            {isRegistering && (
               <div style={{fontSize: '0.75rem', color: '#666', marginTop: '5px', paddingLeft: '5px'}}>
                  Requisitos: 
                  <span style={{color: passwordValue.length >= 8 ? '#2ecc71' : '#999'}}> 8+ chars</span> • 
                  <span style={{color: /[A-Z]/.test(passwordValue) ? '#2ecc71' : '#999'}}> Mayús</span> • 
                  <span style={{color: /\d/.test(passwordValue) ? '#2ecc71' : '#999'}}> Núm</span> • 
                  <span style={{color: /[@$!%*?&]/.test(passwordValue) ? '#2ecc71' : '#999'}}> Símbolo</span>
               </div>
            )}
          </div>

          {/* 👇 NUEVO CAMPO: CONFIRMAR CONTRASEÑA (Solo en registro) */}
          {isRegistering && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirmar Contraseña</label>
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder="Repite la contraseña"
                style={{...styles.input, borderColor: errors.confirmPassword ? '#e74c3c' : 'var(--border)'}}
              />
              {errors.confirmPassword && <span style={styles.errorMsg}>{errors.confirmPassword.message}</span>}
            </div>
          )}

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Procesando...' : (isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión')}
          </button>
        </form>

        <div style={styles.divider}><span>o continúa con</span></div>

        <div style={styles.googleWrapper}>
           <GoogleAuthButton type={isRegistering ? 'register' : 'login'} />
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            <button 
              onClick={() => setIsRegistering(!isRegistering)} 
              style={styles.toggleBtn}
            >
              {isRegistering ? 'Inicia Sesión' : 'Regístrate gratis'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)', position: 'relative', overflow: 'hidden', padding: '20px' },
  backgroundShape: { position: 'absolute', top: '-10%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, rgba(0,0,0,0) 70%)', zIndex: 0 },
  authCard: { width: '100%', maxWidth: '450px', background: 'var(--bg-card)', borderRadius: '16px', padding: '40px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', border: '1px solid var(--border)', zIndex: 1, position: 'relative' },
  header: { textAlign: 'center', marginBottom: '30px' },
  logoLink: { textDecoration: 'none', color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.2rem', display: 'block', marginBottom: '15px' },
  title: { margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '1.8rem' },
  subtitle: { color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' },
  input: { padding: '12px 15px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-main)', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' },
  errorMsg: { color: '#e74c3c', fontSize: '0.8rem', marginTop: '2px' },
  roleSelector: { display: 'flex', gap: '10px' },
  roleBtn: { flex: 1, padding: '10px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-muted)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' },
  roleBtnActive: { flex: 1, padding: '10px', border: '1px solid var(--accent)', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' },
  submitBtn: { padding: '14px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.1s', marginTop: '10px' },
  divider: { display: 'flex', alignItems: 'center', margin: '25px 0', color: 'var(--text-muted)', fontSize: '0.85rem', justifyContent: 'center' },
  googleWrapper: { marginBottom: '25px' },
  footer: { textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '20px' },
  footerText: { color: 'var(--text-muted)', fontSize: '0.95rem' },
  toggleBtn: { background: 'transparent', border: 'none', color: 'var(--accent)', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px', fontSize: '0.95rem' }
};