import * as yup from 'yup';

export const registerSchema = yup.object({
  name: yup
    .string()
    .min(2, '👑 El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .required('👑 El nombre es obligatorio'),
  
  email: yup
    .string()
    .email('📧 Debe ser un correo electrónico válido')
    .required('📧 El correo electrónico es obligatorio'),
  
  password: yup
    .string()
    .min(8, '🔒 La contraseña debe tener al menos 8 caracteres')
    .matches(/[a-z]/, '🔒 Debe contener al menos una letra minúscula')
    .matches(/[A-Z]/, '🔒 Debe contener al menos una letra mayúscula')
    .matches(/\d/, '🔒 Debe contener al menos un número')
    .matches(/[@$!%*?&]/, '🔒 Debe contener al menos un carácter especial (@$!%*?&)')
    .required('🔒 La contraseña es obligatoria'),
  
  role: yup
    .string()
    .oneOf(['locatario', 'proveedor', 'admin'], 'Rol no válido')
    .default('locatario'),
  
  adminCreationCode: yup
    .string()
    .when('role', {
      is: 'admin',
      then: yup.string().required('🔐 Código de administrador es requerido'),
      otherwise: yup.string().optional()
    })
});

export const loginSchema = yup.object({
  email: yup
    .string()
    .email('📧 Debe ser un correo electrónico válido')
    .required('📧 El correo electrónico es obligatorio'),
  
  password: yup
    .string()
    .required('🔒 La contraseña es obligatoria')
});