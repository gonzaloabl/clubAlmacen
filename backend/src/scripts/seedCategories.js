import Category from '../models/Category.js';

// DATOS REALES DE CLUB ALMACÉN
const categoriesData = [
  // --- GRUPO 1: ZONA LOCATARIOS ---
  {
    name: 'Operación & Gestión',
    description: 'Tips para mejorar la administración, manejo de caja y control de mermas.',
    color: '#3498db', // Azul
    icon: '🏪',
    group: 'locatarios',
    order: 1
  },
  {
    name: 'Seguridad Vecinal',
    description: 'Alertas, consejos de seguridad y experiencias con sistemas de alarmas.',
    color: '#e74c3c', // Rojo
    icon: '🛡️',
    group: 'locatarios',
    order: 2
  },
  {
    name: 'Datos & Picadas',
    description: '¿Dónde comprar más barato? Comparte tus mejores datos de abastecimiento.',
    color: '#f1c40f', // Amarillo
    icon: '💡',
    group: 'locatarios',
    order: 3
  },

  // --- GRUPO 2: ZONA PROVEEDORES ---
  {
    name: 'Ofertas Mayoristas',
    description: 'Espacio exclusivo para publicar promociones y descuentos por volumen.',
    color: '#2ecc71', // Verde
    icon: '🏷️',
    group: 'proveedores',
    order: 4
  },
  {
    name: 'Logística & Rutas',
    description: 'Coordinación de despachos, estado de rutas y horarios de entrega.',
    color: '#9b59b6', // Violeta
    icon: '🚚',
    group: 'proveedores',
    order: 5
  },

  // --- GRUPO 3: PLAZA COMÚN ---
  {
    name: 'Anuncios Oficiales',
    description: 'Noticias importantes sobre la plataforma Club Almacén.',
    color: '#34495e', // Gris oscuro
    icon: '📢',
    group: 'comunidad',
    order: 0 // Para que aparezca primero si ordenamos por ID, pero usaremos grupos
  },
  {
    name: 'Bienvenida',
    description: '¿Eres nuevo? Preséntate aquí ante la comunidad.',
    color: '#1abc9c', // Turquesa
    icon: '👋',
    group: 'comunidad',
    order: 6
  },
  {
    name: 'Cafetería (Off-Topic)',
    description: 'Fútbol, clima, política o simplemente conversar un rato.',
    color: '#95a5a6', // Gris claro
    icon: '☕',
    group: 'comunidad',
    order: 7
  }
];

// Función que el servidor ejecutará automáticamente
export const seedCategories = async () => {
  try {
    // 1. Verificar si ya existen categorías
    const count = await Category.countDocuments();

    if (count > 0) {
      console.log('✅ Las categorías ya están inicializadas. No se requiere acción.');
      return; // Salimos, no hacemos nada
    }

    console.log('🌱 Base de datos de categorías vacía. Sembrando datos iniciales...');

    // 2. Insertar todas las categorías
    await Category.insertMany(categoriesData);
    
    console.log('✅ Categorías creadas exitosamente.');
    
  } catch (error) {
    console.error('❌ Error al sembrar categorías:', error);
  }
};