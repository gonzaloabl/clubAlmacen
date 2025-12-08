import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Club Almacén',
      version: '1.0.0',
      description: 'Documentación técnica completa del ecosistema Club Almacén. Proyecto de Título INACAP.',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'admin@clubalmacen.cl',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Servidor Local (Desarrollo)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['locatario', 'proveedor', 'admin'] },
            businessName: { type: 'string' },
            phone: { type: 'string' },
            region: { type: 'string' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            price: { type: 'number' },
            stock: { type: 'number' },
            category: { type: 'string' },
            description: { type: 'string' },
          },
        },
        Post: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            category: { type: 'string' },
            region: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    paths: {
      // --- MÓDULO DE AUTENTICACIÓN ---
      '/auth/login': {
        post: {
          summary: 'Iniciar sesión',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'usuario@clubalmacen.cl' },
                    password: { type: 'string', example: '123456' },
                  },
                },
              },
            },
            responses: { 200: { description: 'Login exitoso - Retorna Token' } },
          },
        },
      },
      '/auth/register': {
        post: {
          summary: 'Registrar nuevo usuario',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                    role: { type: 'string', enum: ['locatario', 'proveedor'] },
                  },
                },
              },
            },
            responses: { 201: { description: 'Usuario registrado' } },
          },
        },
      },

      // --- MÓDULO DE USUARIOS ---
      '/users/me': {
        get: {
          summary: 'Obtener mi perfil completo',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Datos del usuario logueado' } },
        },
      },
      '/users/profile': {
        put: {
          summary: 'Actualizar mi perfil (Soporta Avatar)',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    phone: { type: 'string' },
                    businessName: { type: 'string' },
                    avatar: { type: 'string', format: 'binary' },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Perfil actualizado' } },
        },
      },
      '/users/public/providers': {
        get: {
          summary: 'Directorio público de Proveedores',
          tags: ['Users'],
          responses: { 200: { description: 'Lista de proveedores' } },
        },
      },
      '/users/public/locatarios': {
        get: {
          summary: 'Directorio público de Locatarios',
          tags: ['Users'],
          responses: { 200: { description: 'Lista de comercios' } },
        },
      },

      // --- MÓDULO DE PRODUCTOS ---
      '/products': {
        get: {
          summary: 'Listar todos los productos',
          tags: ['Products'],
          responses: { 200: { description: 'Catálogo completo' } },
        },
        post: {
          summary: 'Crear producto (Solo Proveedores)',
          tags: ['Products'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } },
          },
          responses: { 201: { description: 'Producto creado' } },
        },
      },
      '/products/mine': {
        get: {
          summary: 'Mis productos (Dashboard Proveedor)',
          tags: ['Products'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Inventario del proveedor' } },
        },
      },

      // --- MÓDULO DE FORO (POSTS) ---
      '/posts': {
        get: {
          summary: 'Listar publicaciones del foro',
          tags: ['Forum'],
          parameters: [
            { in: 'query', name: 'search', schema: { type: 'string' } },
            { in: 'query', name: 'region', schema: { type: 'string' } },
            { in: 'query', name: 'category', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'Lista de posts' } },
        },
        post: {
          summary: 'Crear nueva publicación',
          tags: ['Forum'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Post' } } },
          },
          responses: { 201: { description: 'Post creado' } },
        },
      },
      '/posts/{id}/comments': {
        post: {
          summary: 'Comentar una publicación',
          tags: ['Forum'],
          security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { content: { type: 'string' } } } } },
          },
          responses: { 201: { description: 'Comentario agregado' } },
        },
      },

      // --- MÓDULO DE NOTICIAS Y BLOG ---
      '/news': {
        get: {
          summary: 'Obtener noticias RSS (Scraped)',
          tags: ['News & Blog'],
          responses: { 200: { description: 'Noticias externas' } },
        },
      },
      '/blog': {
        get: {
          summary: 'Muro oficial de la administración',
          tags: ['News & Blog'],
          responses: { 200: { description: 'Comunicados oficiales' } },
        },
      },

      // --- MÓDULO DE ADMINISTRACIÓN ---
      '/admin/dashboard': {
        get: {
          summary: 'Estadísticas del sistema',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          responses: { 
            200: { description: 'Datos del dashboard' },
            403: { description: 'Requiere rol admin' }
          },
        },
      },
      '/admin/users': {
        get: {
          summary: 'Listar todos los usuarios',
          tags: ['Admin'],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Lista completa de usuarios' } },
        },
      },
      '/categories': {
        get: {
          summary: 'Listar categorías del foro',
          tags: ['Forum'],
          responses: { 200: { description: 'Categorías disponibles' } },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerDocs = swaggerJsdoc(options);