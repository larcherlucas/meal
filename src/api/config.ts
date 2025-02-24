import axios, { type AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Variable pour suivre si une déconnexion est en cours
let isLoggingOut = false

// Intercepteurs
api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Vérifier si l'URL de la requête n'est pas déjà '/logout' ET qu'une déconnexion n'est pas déjà en cours
    if (error.response?.status === 401 && error.config.url !== '/logout' && !isLoggingOut) {
      isLoggingOut = true
      try {
        const authStore = useAuthStore()
        await authStore.logout()
        window.location.href = '/login'
      } finally {
        isLoggingOut = false
      }
    }
    return Promise.reject(error)
  }
);


// API Services correspondant à vos routes backend
export const apiService = {
  // Account routes
  account: {
    create: (userData: any) => api.post('/account', userData),
    getAll: () => api.get('/account'),
    getOne: (id: string) => api.get(`/account/${id}`),
    update: (id: string, data: any) => api.patch(`/account/${id}`, data),
    delete: (id: string) => api.delete(`/account/${id}`),
    verifyToken: () => api.get('/verify-token')
  },

  // Auth routes
  auth: {
    login: (credentials: { email: string; password: string }) => 
      api.post('/login', credentials),
    logout: () => api.post('/logout'),
    signup: (userData: any) => api.post('/signup', userData)
  },

  // Dietary restrictions routes
  dietaryRestrictions: {
    getAll: () => api.get('/dietary-restrictions'),
    create: (data: any) => api.post('/dietary-restrictions', data),
    update: (type: string, data: any) => api.put(`/dietary-restrictions/${type}`, data),
    delete: (type: string) => api.delete(`/dietary-restrictions/${type}`),
    deleteAll: () => api.delete('/dietary-restrictions')
  },

  // Favorites routes
  favorites: {
    getAll: () => api.get('/favorites'),
    checkFavorite: (recipeId: number) => api.get(`/favorites/${recipeId}/check`),
    create: (data: any) => api.post('/favorites', data),
    delete: (recipeId: number) => api.delete(`/favorites/${recipeId}`)
  },

  // Menu routes
  menus: {
    getAll: () => api.get('/menus'),
    getActive: () => api.get('/menus/active'),
    getById: (id: number) => api.get(`/menus/${id}`),
    create: (data: any) => api.post('/menus', data),
    update: (id: number, data: any) => api.put(`/menus/${id}`, data),
    delete: (id: number) => api.delete(`/menus/${id}`)
  },

  // Payment routes
  payment: {
    createSubscription: (data: any) => api.post('/subscription', data),
    cancelSubscription: () => api.post('/subscription/cancel'),
    getPaymentHistory: () => api.get('/payment-history'),
    getAllPayments: () => api.get('/admin/payments') // Route admin
  },

  // Recipe routes
  recipes: {
    getAll: () => api.get('/recipes'),
    getOne: (id: number) => api.get(`/recipes/${id}`),
    create: (data: any) => api.post('/recipes', data),
    update: (id: number, data: any) => api.patch(`/recipes/${id}`, data),
    delete: (id: number) => api.delete(`/recipes/${id}`)
  },

  // Recipe reviews routes
  reviews: {
    getAllByRecipe: (recipeId: number) => api.get(`/recipes/${recipeId}/reviews`),
    getStats: (recipeId: number) => api.get(`/recipes/${recipeId}/reviews/stats`),
    getAllByUser: () => api.get('/my/reviews'),
    create: (recipeId: number, data: any) => api.post(`/recipes/${recipeId}/reviews`, data),
    update: (recipeId: number, data: any) => api.put(`/recipes/${recipeId}/reviews`, data),
    delete: (recipeId: number) => api.delete(`/recipes/${recipeId}/reviews`)
  },

  // Seasonal items routes
  seasonal: {
    getAll: () => api.get('/seasonal-items'),
    getById: (id: number) => api.get(`/seasonal-items/${id}`),
    getByType: (type: string) => api.get(`/seasonal-items/type/${type}`),
    create: (data: any) => api.post('/seasonal-items', data),
    update: (id: number, data: any) => api.put(`/seasonal-items/${id}`, data),
    delete: (id: number) => api.delete(`/seasonal-items/${id}`)
  }
};

export default api;