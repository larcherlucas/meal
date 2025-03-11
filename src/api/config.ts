import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/NotificationStore'
import router from '@/router'
import type { LoginCredentials, AuthResponse, SignupData } from '@/types'

// Types pour les réponses API standardisées
export interface ApiSuccessResponse<T> {
  status: 'success'
  data: T
  message?: string
  totalCount?: number
  subscription?: any
}

export interface ApiErrorResponse {
  error: string
  status?: number
  errors?: Record<string, string>
}

// Configuration des erreurs personnalisées
export class ApiError extends Error {
  status?: number
  errors?: Record<string, string>

  constructor(
    message: string, 
    status?: number, 
    errors?: Record<string, string>
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

// Configuration des temps de retry
const RETRY_DELAY = 1000
const MAX_RETRIES = 2

// Création de l'instance Axios avec configuration de base
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1', // Fallback URL
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Intercepteur de requêtes
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    
    // Ajouter le token si disponible
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    
    // ID unique de requête pour le tracking
    config.headers['X-Request-ID'] = `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
    
    // Ajouter la langue si disponible (utile pour l'internationalisation)
    if (authStore.user?.preferences?.language) {
      config.headers['Accept-Language'] = authStore.user.preferences.language
    }
    
    console.log(`Request to ${config.url}:`, config.data);
    return config
  },
  (error) => Promise.reject(error)
)

// Intercepteur de réponses avec gestion avancée
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`Response from ${response.config.url}:`, response.data);
    
    // Si la requête concerne un endpoint admin/recipes/:id, on normalise la réponse
    if (response.config.url && 
        /\/admin\/recipes\/\d+$/.test(response.config.url) &&
        response.config.method === 'get') {
      // Pour les détails d'une recette en admin, on utilise un format normalisé
      return {
        status: 'success',
        data: response.data
      };
    }
    
    // Si la réponse est une API admin, préserver la structure complète
    if (response.config.url && response.config.url.includes('/admin')) {
      // Pour les endpoints admin, on préserve la structure exacte
      return response.data;
    }
    
    // Si la réponse est déjà dans le format attendu avec status: success
    if (response.data && response.data.status === 'success') {
      return response.data;
    }
    
    // Pour les réponses avec des métadonnées importantes (totalCount, pagination, etc.)
    if (response.data && typeof response.data === 'object') {
      // Si la réponse a déjà une propriété data et d'autres métadonnées
      if (response.data.data && (
          response.data.totalCount !== undefined || 
          response.data.pagination !== undefined ||
          response.data.meta !== undefined
      )) {
        // Retourner la structure complète
        return {
          status: 'success',
          data: response.data.data,
          totalCount: response.data.totalCount,
          pagination: response.data.pagination,
          meta: response.data.meta
        };
      }
      
      // Si c'est un tableau ou un objet simple sans structure particulière
      return {
        status: 'success',
        data: response.data
      };
    }
    
    // Fallback pour les autres types de réponses
    return {
      status: 'success',
      data: response.data
    };
  },
  async (error: AxiosError) => {
    const notificationStore = useNotificationStore();
    const authStore = useAuthStore();
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: number };
    
    // Cas où il n'y a pas de réponse (erreur réseau)
    if (!error.response) {
      notificationStore.error(
        'Erreur de connexion',
        'Problème de connexion réseau. Veuillez vérifier votre connexion Internet.'
      );
      return Promise.reject(new ApiError('Problème de connexion réseau'));
    }

    const status = error.response.status;
    const errorData = error.response.data as ApiErrorResponse | string;
    
    // Extraction du message d'erreur
    const errorMessage = typeof errorData === 'string' 
      ? errorData 
      : errorData.error || 'Une erreur est survenue';
    
    // Gestion des erreurs 401 (non authentifié)
    if (status === 401) {
      // Ne pas afficher de notification si on est déjà sur la page de login
      if (router.currentRoute.value.path !== '/login') {
        notificationStore.error(
          'Session expirée', 
          'Votre session a expiré. Veuillez vous reconnecter.'
        );
      }
      
      // Déconnecter l'utilisateur et rediriger vers la page de login
      await authStore.logout(false); // false = ne pas appeler l'API logout
      
      // Rediriger sauf si on est déjà sur login
      if (router.currentRoute.value.path !== '/login') {
        router.push({ 
          path: '/login', 
          query: { session: 'expired', redirect: router.currentRoute.value.fullPath }
        });
      }
      
      return Promise.reject(new ApiError(errorMessage, status));
    }
    
    // Gestion des erreurs 403 (accès interdit)
    if (status === 403) {
      notificationStore.error(
        'Accès refusé',
        'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.'
      );
      
      // Si l'erreur concerne un abonnement requis, rediriger vers la page d'abonnement
      if (errorMessage.toLowerCase().includes('abonnement') || 
          errorMessage.toLowerCase().includes('premium')) {
        router.push('/subscription');
      }
      
      return Promise.reject(new ApiError(errorMessage, status));
    }
    
    // Gestion des erreurs 404 (ressource non trouvée)
    if (status === 404) {
      // Vérifier si c'est un cas où on ne veut pas afficher de notification
      // Par exemple, l'absence de menu actif
      const url = originalRequest.url || '';
      const skipNotification = url.includes('/active-weekly-menu');
      
      if (!skipNotification) {
        notificationStore.error(
          'Ressource introuvable',
          errorMessage
        );
      }
      
      return Promise.reject(new ApiError(errorMessage, status));
    }
    
    // Gestion des erreurs 409 (conflit)
    if (status === 409) {
      notificationStore.error(
        'Conflit',
        errorMessage
      );
      return Promise.reject(new ApiError(errorMessage, status));
    }
    
    // Gestion des erreurs 422 (validation)
    if (status === 422) {
      // Extraire les erreurs de validation
      const validationErrors = typeof errorData === 'object' && errorData.errors 
        ? errorData.errors 
        : {};
      
      notificationStore.error(
        'Erreur de validation',
        Object.values(validationErrors).join(', ') || errorMessage
      );
      
      return Promise.reject(new ApiError(
        errorMessage, 
        status, 
        validationErrors
      ));
    }
    
    // Gestion générique des erreurs serveur (5xx)
    if (status >= 500) {
      notificationStore.error(
        'Erreur serveur',
        'Une erreur est survenue sur notre serveur. Veuillez réessayer ultérieurement.'
      );
      
      // Tentative de retry pour les erreurs serveur
      if (!originalRequest._retry) {
        originalRequest._retry = 1;
        
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(api(originalRequest));
          }, RETRY_DELAY);
        });
      } else if (originalRequest._retry < MAX_RETRIES) {
        originalRequest._retry++;
        
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(api(originalRequest));
          }, RETRY_DELAY * originalRequest._retry);
        });
      }
      
      return Promise.reject(new ApiError(errorMessage, status));
    }
    
    // Autres erreurs non traitées
    notificationStore.error(
      'Erreur',
      errorMessage
    );
    
    return Promise.reject(new ApiError(errorMessage, status));
  }
);

// Méthodes utilitaires génériques avec typage fort
export const apiService = {
  get: async <T>(url: string, params?: unknown): Promise<T> => {
    console.log(`API Service - GET ${url} avec params:`, params)
    const response = await api.get<ApiSuccessResponse<T>>(url, { params })
    console.log(`API Service - Réponse GET ${url}:`, response)
    return (response as unknown as ApiSuccessResponse<T>).data
  },
  
  // Namespace pour l'authentification
  auth: {
    signup: async (data: SignupData): Promise<AuthResponse> => {
      console.log(`API Service - Inscription avec données:`, { ...data, password: '[MASQUÉ]' })
      const response = await api.post<ApiSuccessResponse<AuthResponse>>('/signup', data)
      console.log(`API Service - Réponse inscription:`, response)
      return (response as unknown as ApiSuccessResponse<AuthResponse>).data
    },
    
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      console.log(`API Service - Connexion avec email:`, credentials.email)
      const response = await api.post<ApiSuccessResponse<AuthResponse>>('/login', credentials)
      console.log(`API Service - Réponse connexion:`, response)
      return (response as unknown as ApiSuccessResponse<AuthResponse>).data
    },
    
    logout: async (): Promise<void> => {
      console.log(`API Service - Déconnexion`)
      await api.post('/logout')
      console.log(`API Service - Déconnexion réussie`)
    },
    
    verifyToken: async (): Promise<{ user: any }> => {
      console.log(`API Service - Vérification du token`)
      const response = await api.post<ApiSuccessResponse<{ user: any }>>('/verify-token')
      console.log(`API Service - Réponse vérification du token:`, response)
      return (response as unknown as ApiSuccessResponse<{ user: any }>).data
    }
  },
  
  // Namespace pour les opérations liées aux recettes
  recipes: {
    getAll: async (params?: any) => {
      return apiService.get('/recipes', params);
    },
    
    getById: async (id: number) => {
      return apiService.get(`/recipes/${id}`);
    },
    
    create: async (recipeData: any) => {
      return apiService.post('/recipes', recipeData);
    },
    
    update: async (id: number, recipeData: any) => {
      return apiService.put(`/recipes/${id}`, recipeData);
    },
    
    delete: async (id: number) => {
      return apiService.delete(`/recipes/${id}`);
    }
  },
  
  // Namespace pour les opérations liées aux menus
  menus: {
    getAll: async () => {
      return apiService.get('/weekly-menus')
    },
    
    getById: async (id: number) => {
      return apiService.get(`/weekly-menus/${id}`)
    },
    
    getActive: async () => {
      try {
        return await apiService.get('/active-weekly-menu')
      } catch (error: any) {
        // Gérer explicitement l'erreur 404 comme un cas normal
        if (error.status === 404) {
          console.log('Aucun menu actif disponible')
          return null
        }
        throw error
      }
    },
    
    create: async (menuData: any) => {
      return apiService.post('/weekly-menus', menuData)
    },
    
    update: async (id: number, menuData: any) => {
      return apiService.put(`/weekly-menus/${id}`, menuData)
    },
    
    delete: async (id: number) => {
      return apiService.delete(`/weekly-menus/${id}`)
    },
    
    generateMenu: async (params: any) => {
      console.log('API Service - Envoi de requête generateMenu avec params:', params)
      try {
        const response = await api.post('/weekly-menus/generate', params)
        console.log('API Service - Réponse generateMenu brute:', response)
        
        // Vérification supplémentaire pour s'assurer qu'on a bien les données
        if (response && response.data) {
          console.log('API Service - Menu généré avec succès, données:', response.data)
          return response.data
        } 
        else if (response && response.status === 'success' && response.data) {
          console.log('API Service - Menu généré avec succès (format 2):', response.data)
          return response.data
        }
        else {
          console.warn('API Service - Format de réponse inattendu:', response)
          throw new Error('Format de réponse inattendu du serveur')
        }
      } catch (error) {
        console.error('API Service - Erreur lors de la génération du menu:', error)
        throw error
      }
    }
  },
  
  // Namespace pour les opérations liées aux favoris
  favorites: {
    getAll: async () => {
      return apiService.get('/favorites');
    },
    
    check: async (recipeId: number) => {
      return apiService.get(`/favorites/${recipeId}/check`);
    },
    
    add: async (data: { recipe_id: number }) => {
      return apiService.post('/favorites', data);
    },
    
    remove: async (recipeId: number) => {
      return apiService.delete(`/favorites/${recipeId}`);
    }
  },
  
  post: async <T>(url: string, data?: unknown): Promise<T> => {
    console.log(`API Service - POST ${url} avec données:`, data)
    const response = await api.post<ApiSuccessResponse<T>>(url, data)
    console.log(`API Service - Réponse POST ${url}:`, response)
    
    // Gestion plus robuste des différents formats de réponse possibles
    if (response && typeof response === 'object') {
      // Cas 1: La réponse est déjà au format attendu
      if ('data' in response) {
        return response.data
      }
      
      // Cas 2: La réponse est déjà les données que nous voulons
      if ('id' in response) {
        return response as unknown as T
      }
    }
    
    // Par défaut, retourner la réponse telle quelle
    return response as unknown as T
  },
  
  put: async <T>(url: string, data?: unknown): Promise<T> => {
    console.log(`API Service - PUT ${url} avec données:`, data)
    const response = await api.put<ApiSuccessResponse<T>>(url, data)
    console.log(`API Service - Réponse PUT ${url}:`, response)
    
    // Même logique de déballage que pour post
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data
    }
    return response as unknown as T
  },
  
  patch: async <T>(url: string, data?: unknown): Promise<T> => {
    const cleanUrl = url.startsWith('/api/v1') ? url.replace('/api/v1', '') : url;
    
    console.log(`API Service - PATCH ${cleanUrl} avec données:`, data)
    const response = await api.patch<ApiSuccessResponse<T>>(cleanUrl, data)
    console.log(`API Service - Réponse PATCH ${cleanUrl}:`, response)
    
    // Même logique de déballage que pour post
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data
    }
    return response as unknown as T
  },
  
  delete: async <T>(url: string): Promise<T> => {
    console.log(`API Service - DELETE ${url}`)
    const response = await api.delete<ApiSuccessResponse<T>>(url)
    console.log(`API Service - Réponse DELETE ${url}:`, response)
    
    // Même logique de déballage que pour post
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data
    }
    return response as unknown as T
  }
}

export default api