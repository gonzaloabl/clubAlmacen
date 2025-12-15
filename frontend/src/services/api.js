// ✅ CONFIGURACIÓN CORRECTA PARA PROXY DE VITE
const API_URL = '/api'; // Ruta relativa para que el proxy funcione

// Helper para manejar respuestas
const handleResponse = async (response) => {
  // Intentamos leer el JSON, si falla devolvemos objeto vacío
  const data = await response.json().catch(() => ({}));
  
  // 1. SI LA RESPUESTA NO ES OK
  if (!response.ok) {
    
    // 🛑 DETECTOR DE BANEO (ASIENTO EYECTABLE)
    // Si el error es 403 Y el mensaje menciona "suspendida" o "bloqueada"
    if (response.status === 403 && data.message && (data.message.includes('suspendida') || data.message.includes('bloqueada'))) {
        console.warn("⛔ USUARIO BANEADO DETECTADO - CERRANDO SESIÓN...");
        
        // 1. Borramos credenciales
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // Si guardas el user también bórralo
        
        // 2. Redirección forzosa al login (usamos window.location para recargar todo)
        window.location.href = '/login?error=suspended';
        
        // Detenemos la ejecución tirando un error silencioso
        throw new Error('Sesión cerrada por suspensión');
    }

    // Si es otro error (ej: 400, 500), lanzamos el error normal para que el componente lo maneje
    const errorMessage = data.message || response.statusText;
    throw new Error(errorMessage);
  }
  
  return data;
};

// Helper para obtener el token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API de autenticación
export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },
};

// API de usuario
export const userAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
  // Actualizar perfil propio (Soporta FormData para imágenes)
  updateProfile: async (formData) => {
    const token = localStorage.getItem('token');
    
    // Verificamos si es FormData (archivo) o JSON normal
    const isFormData = formData instanceof FormData;

    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        // ⚠️ TRUCO: Si es FormData, NO ponemos Content-Type
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        'Authorization': `Bearer ${token}`,
      },
      body: isFormData ? formData : JSON.stringify(formData),
    });
    return handleResponse(response);
  },
  getProviders: async () => {
    const response = await fetch(`${API_URL}/users/public/providers`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },
  // Obtener perfil público por ID
  getPublicProfile: async (userId) => {
    const response = await fetch(`${API_URL}/users/public/${userId}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  // Obtener lista pública de locatarios
  getLocatarios: async () => {
    const response = await fetch(`${API_URL}/users/public/locatarios`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  getAllUsers: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/users`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // 2. Modificar usuario (Admin)
  updateUserStatus: async (id, data) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/users/${id}/admin-action`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data), // Ej: { isActive: false } para banear
    });
    return handleResponse(response);
  }
};

// API DE BLOG OFICIAL
export const blogAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/blog`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },
  create: async (data) => {
    const response = await fetch(`${API_URL}/blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
  delete: async (id) => {
    const response = await fetch(`${API_URL}/blog/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  }
};

export const productAPI = {
  // Crear producto (Soporta Imagen)
  createProduct: async (productData) => {
    const token = localStorage.getItem('token');
    const isFormData = productData instanceof FormData;

    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        'Authorization': `Bearer ${token}`,
      },
      body: isFormData ? productData : JSON.stringify(productData),
    });
    return handleResponse(response);
  },

  // Actualizar producto (Soporta Imagen)
  updateProduct: async (id, productData) => {
    const token = localStorage.getItem('token');
    const isFormData = productData instanceof FormData;

    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        'Authorization': `Bearer ${token}`,
      },
      body: isFormData ? productData : JSON.stringify(productData),
    });
    return handleResponse(response);
  },

  // Eliminar producto
  deleteProduct: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Obtener MIS productos (Dashboard Proveedor)
  getMyProducts: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/products/mine`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Obtener todos los productos (Catálogo Global)
  getAllProducts: async () => {
    const response = await fetch(`${API_URL}/products`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  // 👇 ESTA ES LA QUE FALTABA (Catálogo de un Proveedor)
  getProductsByProvider: async (providerId) => {
    const response = await fetch(`${API_URL}/products/provider/${providerId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  }
};

export const categoryAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/categories`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },
  create: async (categoryData) => {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(categoryData),
    });
    return handleResponse(response);
  },
};

// API NOTICIAS
export const getNews = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  const response = await fetch(`${API_URL}/news?${queryParams}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

// API DE PUBLICACIONES (FORO)
export const postAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    const response = await fetch(`${API_URL}/posts?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/posts/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // 👇 ACTUALIZADO PARA SOPORTAR IMÁGENES
  create: async (postData) => {
    const token = localStorage.getItem('token');
    
    // Detectamos si es FormData o JSON
    const isFormData = postData instanceof FormData;

    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        // Si es FormData, el navegador pone el boundary automáticamente
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        'Authorization': `Bearer ${token}`
      },
      body: isFormData ? postData : JSON.stringify(postData),
    });
    return handleResponse(response);
  },

  update: async (id, postData) => {
    const response = await fetch(`${API_URL}/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(postData),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  addComment: async (id, commentData) => {
    const response = await fetch(`${API_URL}/posts/${id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(commentData),
    });
    return handleResponse(response);
  },

  vote: async (id, value) => {
    const response = await fetch(`${API_URL}/posts/${id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ value }), // Enviamos si es upvote o downvote
    });
    return handleResponse(response);
  },

  
  likeComment: async (postId, commentId) => {
    const response = await fetch(`${API_URL}/posts/${postId}/comments/${commentId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  report: async (id, reportData) => {
    const response = await fetch(`${API_URL}/posts/${id}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(reportData),
    });
    return handleResponse(response);
  },

  registerView: async (id) => {
    const response = await fetch(`${API_URL}/posts/${id}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },  

  // 1. Obtener lista de reportes
  getReportedPosts: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/posts/admin/reported`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // 2. Perdonar Post (Dismiss)
  dismissReports: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/posts/${id}/dismiss-reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }
};

export default {
  auth: authAPI,
  user: userAPI,
  category: categoryAPI,
  post: postAPI,
  blog: blogAPI,
};