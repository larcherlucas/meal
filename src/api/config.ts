import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth'

// Temps entre les retry sur les erreurs réseau
const RETRY_DELAY = 1000
const MAX_RETRIES = 2

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000, // Timeout augmenté pour les réseaux lents
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Flag pour éviter des redirections multiples
let isHandlingAuthError = false

// Intercepteur de requêtes amélioré
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    
    // Ajouter un ID unique pour traquer les requêtes
    config.headers['X-Request-ID'] = `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    
    return config
  },
  (error) => {
    console.error('Erreur de requête:', error)
    return Promise.reject(error)
  }
)

// Intercepteur de réponses amélioré avec gestion des retries
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: number }
    
    // Gestion des erreurs réseau (pas de connexion)
    if (!error.response && !originalRequest._retry) {
      originalRequest._retry = (originalRequest._retry || 0) + 1
      
      if (originalRequest._retry <= MAX_RETRIES) {
        console.log(`Tentative de reconnexion (${originalRequest._retry}/${MAX_RETRIES})...`)
        
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(api(originalRequest))
          }, RETRY_DELAY)
        })
      }
    }
    
    // Gestion des erreurs d'authentification
    if (error.response?.status === 401 && 
        error.config?.url !== '/logout' && 
        !isHandlingAuthError) {
      
      isHandlingAuthError = true
      
      try {
        const authStore = useAuthStore()
        
        // Vérifier si l'erreur vient de l'endpoint verify-token
        if (error.config?.url === '/verify-token') {
          console.log('Token invalide détecté')
        } else {
          console.warn('Erreur d\'authentification 401 détectée')
        }
        
        await authStore.logout()
        
        // Rediriger vers la page de connexion avec un message
        window.location.href = '/login?session=expired'
      } catch (logoutError) {
        console.error('Erreur lors de la déconnexion:', logoutError)
        // Forcer la redirection même en cas d'erreur
        window.location.href = '/login'
      } finally {
        isHandlingAuthError = false
      }
    }
    
    // Logguer les erreurs serveur pour debugging
    if (error.response?.status && error.response.status >= 500) {
      console.error('Erreur serveur:', error.response.status, error.response.data)
    }
    
    return Promise.reject(error)
  }
)

// Structure API plus claire
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

  // Auth routes avec typages
  auth: {
    login: (credentials: { email: string; password: string }) => 
      api.post('/login', credentials),
    logout: () => api.post('/logout'),
    signup: (userData: any) => api.post('/signup', userData),
    forgotPassword: (email: string) => api.post('/forgot-password', { email })
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
    getAll: () => api.get('/weekly-menus'),
    getById: (id: number) => api.get(`/weekly-menus/${id}`),
    create: (data: any) => api.post('/weekly-menus', data),
    generateMenu: (params: any) => api.post('/weekly-menus/generate', params),
    update: (id: number, data: any) => api.put(`/weekly-menus/${id}`, data),
    delete: (id: number) => api.delete(`/weekly-menus/${id}`)
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
    getByType: (type: string) => api.get(`/recipes/type/${type}`),
    getOne: (id: number) => api.get(`/recipes/${id}`),
    getIngredients: (id: number) => api.get(`/recipes/${id}/ingredients`),
    getSuggestions: () => api.get('/recipes/suggestions'),
    create: (data: any) => api.post('/recipes', data),
    update: (id: number, data: any) => api.patch(`/recipes/${id}`, data),
    delete: (id: number) => api.delete(`/recipes/${id}`),
    addIngredient: (id: number, data: any) => api.post(`/recipes/${id}/ingredients`, data),
    deleteIngredient: (id: number, ingredientId: number) => api.delete(`/recipes/${id}/ingredients/${ingredientId}`),
    deleteAllIngredients: (id: number) => api.delete(`/recipes/${id}/ingredients`)
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