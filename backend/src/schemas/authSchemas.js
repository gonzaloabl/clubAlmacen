import * as yup from 'yup';

// Esquema de validación para registro - COMPATIBLE con yup@1.7.1
export const registerSchema = yup.object({
  name: yup
    .string()
    .min(2, 'name:👑 El nombre debe tener al menos 2 caracteres')
    .max(50, 'name:El nombre no puede exceder 50 caracteres')
    .required('name:👑 El nombre es obligatorio'),
  
  email: yup
    .string()
    .email('email:📧 Debe ser un correo electrónico válido')
    .required('email:📧 El correo electrónico es obligatorio'),
  
  password: yup
    .string()
    .min(8, 'password:🔒 La contraseña debe tener al menos 8 caracteres')
    .matches(/[a-z]/, 'password:🔒 Debe contener al menos una letra minúscula')
    .matches(/[A-Z]/, 'password:🔒 Debe contener al menos una letra mayúscula')
    .matches(/\d/, 'password:🔒 Debe contener al menos un número')
    .matches(/[@$!%*?&]/, 'password:🔒 Debe contener al menos un carácter especial')
    .required('password:🔒 La contraseña es obligatoria'),
  
  role: yup
    .string()
    .oneOf(['locatario', 'proveedor', 'admin'], 'role:Rol no válido')
    .default('locatario'),
  
  // SOLUCIÓN COMPATIBLE con yup@1.7.1
  adminCreationCode: yup
    .string()
    .nullable()
    .test('admin-code-required', 'adminCreationCode:🔐 Código de administrador es requerido', function(value) {
      const { role } = this.parent;
      // Solo validar si el rol es 'admin'
      if (role === 'admin') {
        return value != null && value.trim().length > 0;
      }
      return true; // Para otros roles, no es requerido
    })
});

// Los demás esquemas se mantienen igual...
export const loginSchema = yup.object({
  email: yup
    .string()
    .email('email:📧 Debe ser un correo electrónico válido')
    .required('email:📧 El correo electrónico es obligatorio'),
  
  password: yup
    .string()
    .required('password:🔒 La contraseña es obligatoria')
});

// Función de validación (igual que antes)
export const validateData = async (schema, data) => {
  try {
    console.log('🔍 Validando datos:', { ...data, password: '[HIDDEN]' });
    
    const validatedData = await schema.validate(data, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    console.log('✅ Validación exitosa');
    return { 
      isValid: true, 
      data: validatedData, 
      errors: null 
    };
    
  } catch (error) {
    console.log('❌ Error de validación Yup:', error.name, error.message);
    
    const errors = {};
    
    if (error.name === 'ValidationError' && error.inner) {
      error.inner.forEach((err) => {
        if (err.path) {
          const field = err.path;
          const message = err.message;
          errors[field] = message;
        }
      });
      
      if (Object.keys(errors).length === 0 && error.errors) {
        error.errors.forEach((errorMessage) => {
          const parts = errorMessage.split(':');
          if (parts.length >= 2) {
            const field = parts[0].trim();
            const message = parts.slice(1).join(':').trim();
            errors[field] = message;
          }
        });
      }
    }
    
    if (Object.keys(errors).length === 0) {
      errors.general = error.message || 'Error de validación desconocido';
    }
    
    console.log('📋 Errores procesados:', errors);
    return { isValid: false, data: null, errors };
  }
};