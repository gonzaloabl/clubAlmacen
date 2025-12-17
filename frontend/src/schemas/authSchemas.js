// frontend/src/schemas/authSchemas.js
import * as Yup from 'yup';

export const registerSchema = Yup.object().shape({
  name: Yup.string()
    .required('👑 El nombre es obligatorio, mi rey')
    .min(2, 'El nombre debe tener al menos 2 caracteres') // Igual al backend
    .max(50, 'El nombre no puede exceder 50 caracteres'), // Igual al backend
  
  email: Yup.string()
    .email('📧 Correo inválido')
    .required('El correo es obligatorio'),

  password: Yup.string()
    .required('La contraseña es obligatoria')
    .min(8, '⚠️ Mínimo 8 caracteres')
    .matches(/[a-z]/, 'Debe contener al menos una letra minúscula')
    .matches(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
    .matches(/\d/, 'Debe contener al menos un número') // 👈 FALTABA ESTO (Requerido por backend)
    .matches(/[@$!%*?&]/, 'Debe contener al menos un carácter especial (@$!%*?&)'), // 👈 Sincronizado con backend
    
  // Esto es solo del frontend, el backend no lo valida pero es bueno para UX
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Las contraseñas no coinciden')
    .required('Debes confirmar tu contraseña'),
    
  // Opcional: Si tienes el campo de rol en el registro visual
  role: Yup.string()
    .oneOf(['locatario', 'proveedor', 'admin'], 'Rol no válido')
    .default('locatario'),

  // Opcional: Si quieres validar el código de admin en vivo
  adminCreationCode: Yup.string()
    .nullable()
    .test('admin-code-required', '🔐 Código de administrador requerido', function(value) {
      const { role } = this.parent;
      if (role === 'admin') {
        return value != null && value.trim().length > 0;
      }
      return true;
    })
});

export const loginSchema = Yup.object().shape({
    email: Yup.string().email('Email inválido').required('Requerido'),
    password: Yup.string().required('Requerido')
});