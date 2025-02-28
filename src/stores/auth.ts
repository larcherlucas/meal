// auth.ts (Store optimisé)
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '@/router'
import { apiService } from '@/api/config'
import { navigateTo } from '@/utils/router-helpers'

interface User {
  id: string;
  email: string;
  role?: string;
  subscription?: {
    isActive: boolean;
  };
}

interface LoginCredentials {
  email: string;
  password: string;
}

// Clé pour localStorage
const TOKEN_KEY = 'auth_token'
let isInitializing = false;
let isLoggingOut = false;

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)
  const isVerified = ref(false)
  
  const hasActiveSubscription = computed(() => user.value?.subscription?.isActive || false)
  
  // Simplifié et plus logique
  const isAuthenticated = computed(() => !!token.value && isVerified.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Fonction unique d'initialisation
  const initialize = async () => {
    if (isInitializing) return;
    isInitializing = true;
    
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY)
      
      if (!savedToken) {
        isInitialized.value = true
        isInitializing = false
        return
      }
      
      token.value = savedToken
      
      try {
        // Vérifier la validité du token
        await apiService.account.verifyToken()
        isVerified.value = true
        
        // Récupérer les données utilisateur
        await fetchUser()
      } catch (err) {
        console.error('Token invalide ou erreur lors de la vérification:', err)
        await clearAuthData()
      }
    } finally {
      isInitialized.value = true
      isInitializing = false
    }
  }

  const clearAuthData = async () => {
    user.value = null
    token.value = null
    isVerified.value = false
    localStorage.removeItem(TOKEN_KEY)
  }

  const fetchUser = async () => {
    if (!token.value || !isVerified.value) return
    
    try {
      // Utiliser l'endpoint du profil utilisateur au lieu de getAll
      const response = await apiService.account.getOne  // Endpoint /account/me
      // OU si apiService n'a pas cette méthode:
      // const response = await api.get('/account/me')
      user.value = response.data
    } catch (err) {
      console.error('Erreur lors de la récupération du profil:', err)
      error.value = 'Erreur lors de la récupération du profil'
    }
  }
  const setSession = (authToken: string, userData: User) => {
    token.value = authToken;
    user.value = userData;
    localStorage.setItem(TOKEN_KEY, authToken);
    isVerified.value = true;
    return true;
  };
  const signup = async (userData: any) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.auth.signup(userData)
      
      // Extraction sécurisée du token
      const responseData = response.data
      const responseToken = responseData.token || (responseData.data && responseData.data.token)
      
      if (!responseToken) {
        throw new Error('Token non trouvé dans la réponse')
      }
      
      // Enregistrement du token
      token.value = responseToken
      localStorage.setItem(TOKEN_KEY, responseToken)
      isVerified.value = true
      
      // Vérification du stockage et récupération du profil
      await fetchUser()
      return true
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'inscription'
      error.value = errorMessage
      console.error('Erreur d\'inscription:', err, errorMessage)
      return false
    } finally {
      loading.value = false
    }
  }

  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    error.value = null
  
    try {
      const response = await apiService.auth.login(credentials)
      
      // Extraction sécurisée du token avec structure plus robuste
      const responseData = response.data
      const responseToken = responseData.token || (responseData.data && responseData.data.token)
      
      if (!responseToken) {
        console.error("Structure de réponse inattendue:", responseData)
        throw new Error('Token non trouvé dans la réponse')
      }
      
      // Stockage du token
      token.value = responseToken
      localStorage.setItem(TOKEN_KEY, responseToken)
      isVerified.value = true
      
      // Récupération du profil utilisateur
      await fetchUser()
      return true
    } catch (err: any) {
      // Gestion des erreurs améliorée
      let errorMessage = 'Erreur de connexion'
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Email ou mot de passe incorrect'
        } else if (err.response.status === 403) {
          errorMessage = 'Compte désactivé ou non vérifié'
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message
        }
      }
      
      error.value = errorMessage
      console.error('Erreur de connexion:', err, errorMessage)
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    if (isLoggingOut) return;
    isLoggingOut = true;
    
    try {
      // Appel API de déconnexion seulement si on a un token valide
      if (token.value && isVerified.value) {
        try {
          await apiService.auth.logout()
        } catch (err) {
          console.warn('Erreur lors de la déconnexion API:', err)
          // On continue la déconnexion côté client même si l'API échoue
        }
      }
    } finally {
      // Nettoyage local toujours exécuté
      await clearAuthData()
      isLoggingOut = false
    }
    
    // Redirection après le nettoyage
    await navigateTo('/login')
  }

  // Alias pour rétrocompatibilité
  const initializeAuth = initialize
  const verifyToken = async () => {
    if (!token.value) return false
    try {
      await apiService.account.verifyToken()
      isVerified.value = true
      return true
    } catch (err) {
      console.error('Erreur de vérification du token:', err)
      isVerified.value = false
      await clearAuthData()
      return false
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isInitialized,
    isVerified,
    isAuthenticated,
    isAdmin,
    hasActiveSubscription,
    initialize,
    initializeAuth,
    verifyToken,
    fetchUser,
    signup,
    login,
    setSession,
    logout
  }
})