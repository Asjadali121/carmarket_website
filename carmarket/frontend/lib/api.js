import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach access token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh: refreshToken });
        localStorage.setItem('access_token', data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  changePassword: (data) => api.put('/auth/change-password/', data),
};

// Cars APIs
export const carsAPI = {
  getAll: (params) => api.get('/cars/', { params }),
  getById: (id) => api.get(`/cars/${id}/`),
  getFeatured: () => api.get('/cars/featured/'),
  create: (data) => api.post('/cars/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.patch(`/cars/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/cars/${id}/`),
  getMyListings: () => api.get('/cars/my-listings/'),
  addImages: (id, formData) => api.post(`/cars/${id}/images/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (id) => api.delete(`/cars/images/${id}/delete/`),
  // Admin
  adminGetAll: (params) => api.get('/cars/admin/all/', { params }),
  approveCar: (id) => api.post(`/cars/admin/${id}/approve/`),
  getDashboard: () => api.get('/cars/admin/dashboard/'),
};

// Classification APIs
export const classAPI = {
  getCategories: () => api.get('/cars/categories/'),
  getTypes: () => api.get('/cars/types/'),
  getClasses: () => api.get('/cars/classes/'),
  getTags: () => api.get('/cars/tags/'),
};

// Orders APIs
export const ordersAPI = {
  getCart: () => api.get('/orders/cart/'),
  addToCart: (data) => api.post('/orders/cart/items/', data),
  updateCartItem: (itemId, data) => api.patch(`/orders/cart/items/${itemId}/`, data),
  removeFromCart: (itemId) => api.delete(`/orders/cart/items/${itemId}/`),
  clearCart: () => api.delete('/orders/cart/clear/'),
  getOrders: () => api.get('/orders/'),
  createOrder: (data) => api.post('/orders/', data),
  getOrder: (id) => api.get(`/orders/${id}/`),
  calculateEMI: (data) => api.post('/orders/emi/', data),
  // Admin
  adminGetOrders: () => api.get('/orders/admin/all/'),
};

// Wishlist APIs
export const wishlistAPI = {
  getAll: () => api.get('/wishlist/'),
  toggle: (car_id) => api.post('/wishlist/toggle/', { car_id }),
  remove: (car_id) => api.delete(`/wishlist/${car_id}/remove/`),
};

// Admin APIs
export const adminAPI = {
  getUsers: () => api.get('/auth/users/'),
  updateUser: (id, data) => api.patch(`/auth/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}/`),
};

export default api;
