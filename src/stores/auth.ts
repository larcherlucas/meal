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
  // autres propriétés utilisateur
}

interface LoginCredentials {
  email: string;
  password: string;
}

// Variable pour suivre si une initialisation est en cours
let isInitializing = false;

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)
  const isVerified = ref(false)
  
  const hasActiveSubscription = computed(() => user.value?.subscription?.isActive || false)
  const isAuthenticated = computed(() => {
    const hasToken = !!token.value
    const hasVerification = isVerified.value
    
    console.log("État d'authentification:", { hasToken, hasUser: !!user.value, hasVerification })
    
    return hasToken && hasVerification
  })
  
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Nouvelle fonction qui combine initializeAuth, verifyToken et fetchUser
  const initialize = async () => {
    if (isInitializing) return;
    isInitializing = true;
    
    try {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        token.value = savedToken
        const isValid = await verifyToken()
        if (isValid) {
          await fetchUser()
        }
      }
    } catch (err) {
      console.error('Erreur d\'initialisation:', err)
    } finally {
      isInitialized.value = true
      isInitializing = false
    }
  }

  const initializeAuth = async () => {
    return initialize()
  }

  const verifyToken = async () => {
    if (!token.value) return false
    try {
      await apiService.account.verifyToken()
      isVerified.value = true
      return true
    } catch (err) {
      console.error('Erreur de vérification du token:', err)
      isVerified.value = false
      token.value = null
      localStorage.removeItem('token')
      return false
    }
  }

  const fetchUser = async () => {
    if (!token.value) return

    try {
      const response = await apiService.account.getOne('me')
      user.value = response.data
    } catch (err) {
      console.error('Erreur lors de la récupération du profil:', err)
      error.value = 'Erreur lors de la récupération du profil'
    }
  }

  const signup = async (userData: any) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.auth.signup(userData)
      
      // S'assurer que le token est dans la bonne structure
      const responseToken = response.data.token || response.data.data?.token
      
      if (!responseToken) {
        throw new Error('Token non trouvé dans la réponse')
      }
      
      token.value = responseToken
      localStorage.setItem('token', responseToken)
      
      // Vérifiez immédiatement que le token a bien été stocké
      const storedToken = localStorage.getItem('token')
      console.log("Token stocké dans localStorage:", storedToken ? "Oui" : "Non", storedToken?.substr(0, 10) + "...")
      
      isVerified.value = true
      await fetchUser()
      return true
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'inscription'
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
      
      // Vérifier la structure de la réponse et récupérer le token
      const responseToken = response.data.token || response.data.data?.token
      
      if (!responseToken) {
        console.error("Structure de réponse inattendue:", response.data)
        throw new Error('Token non trouvé dans la réponse')
      }
      
      // Ces lignes sont critiques - assurez-vous qu'elles s'exécutent correctement
      token.value = responseToken
      localStorage.setItem('token', responseToken)
      isVerified.value = true
      
      // Vérifiez immédiatement que le token est bien défini
      console.log("Token après login:", token.value ? "Défini" : "Non défini", token.value?.substr(0, 10) + "...")
      
      await fetchUser()
      return true
    } catch (err: any) {
      console.error('Erreur complète de connexion:', err)
      error.value = err.response?.data?.message || 'Erreur de connexion'
      return false
    } finally {
      loading.value = false
    }
  }

  // Variable pour suivre si une déconnexion est en cours
  let isLoggingOut = false;

  const logout = async () => {
    if (isLoggingOut) return;
    isLoggingOut = true;
    
    try {
      // Seulement appeler l'API de déconnexion si on a un token valide
      if (token.value && isVerified.value) {
        await apiService.auth.logout()
      }
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err)
    } finally {
      // Toujours nettoyer les données locales
      user.value = null
      token.value = null
      isVerified.value = false
      localStorage.removeItem('token')
      isLoggingOut = false
    }
    
    // Effectuer la redirection après le nettoyage et en dehors du bloc finally
    await navigateTo('/login')
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
    logout
  }
})