const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
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
    const response = await fetch(`${API_URL}/api/users/me`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
};

// API de carrito
export const cartAPI = {
  getCart: async () => {
    const response = await fetch(`${API_URL}/api/cart`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  addToCart: async (productId, quantity = 1) => {
    const response = await fetch(`${API_URL}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ productId, quantity }),
    });
    return handleResponse(response);
  },

  removeFromCart: async (productId) => {
    const response = await fetch(`${API_URL}/api/cart/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },
};

// API de productos
export const productAPI = {
  createProduct: async (productData) => {
    const response = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  },

  getAllProducts: async () => {
    const response = await fetch(`${API_URL}/api/products`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },
};


export const categoryAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/api/categories`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  create: async (categoryData) => {
    const response = await fetch(`${API_URL}/api/categories`, {
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


// API de publicaciones
export const postAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const response = await fetch(`${API_URL}/api/posts?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/api/posts/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  create: async (postData) => {
    const response = await fetch(`${API_URL}/api/posts`, {
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
    const response = await fetch(`${API_URL}/api/posts/${id}`, {
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
    const response = await fetch(`${API_URL}/api/posts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });
    return handleResponse(response);
  },

  addComment: async (id, content) => {
    const response = await fetch(`${API_URL}/api/posts/${id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ content }),
    });
    return handleResponse(response);
  },

  toggleLike: async (id) => {
    const response = await fetch(`${API_URL}/api/posts/${id}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
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
};

