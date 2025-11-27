// ✅ CONFIGURACIÓN CORRECTA PARA PROXY DE VITE
const API_URL = '/api'; // Ruta relativa para que el proxy funcione

// Helper para manejar respuestas
const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    throw new Error(data.message || 'Error en la petición');
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
        // ⚠️ TRUCO: Si es FormData, NO ponemos Content-Type (el navegador lo pone solo)
        // Si es JSON, ponemos application/json
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
};



// --- NUEVO: API DE BLOG OFICIAL ---
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
  // Crear producto (Backend asigna el proveedor automáticamente)
  createProduct: async (productData) => {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  },

  // Obtener todos (Mercado global)
  getAllProducts: async () => {
    const response = await fetch(`${API_URL}/products`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Obtener MIS productos (Dashboard Proveedor)
  getMyProducts: async () => {
    const response = await fetch(`${API_URL}/products/mine`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  // Obtener productos de un proveedor (Catálogo Público)
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


// --- NUEVA FUNCIÓN PARA NOTICIAS (CORREGIDA) ---
export const getNews = async (filters = {}) => {
  // 1. Construir query params (similar a postAPI.getAll)
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  
  // 2. Realizar la petición con fetch y el URL construido
  const response = await fetch(`${API_URL}/news?${queryParams}`, {
    headers: {
      'Content-Type': 'application/json',
      // No necesita token de autenticación
    },
  });
  
  // 3. Manejar la respuesta
  // La respuesta JSON del backend es: { news: [...] }
  return handleResponse(response);
};

// API de publicaciones
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

  create: async (postData) => {
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(postData),
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

  like: async (id) => {
    const response = await fetch(`${API_URL}/posts/${id}/like`, {
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
};

export default {
  auth: authAPI,
  user: userAPI,
  category: categoryAPI,
  post: postAPI,
  blog: blogAPI,
};