// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '@/router'
import api, { apiService } from '@/api/config'

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
  const isAuthenticated = computed(() => !!user.value && !!token.value && isVerified.value)
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
    // Maintient la compatibilité avec votre App.vue actuel
    return initialize()
  }

  const verifyToken = async () => {
    if (!token.value) return false
    try {
      await apiService.account.verifyToken()
      isVerified.value = true
      return true
    } catch (err) {
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
      token.value = response.data.token
      localStorage.setItem('token', token.value)
      isVerified.value = true
      await fetchUser()
      router.push('/profile') // Redirection vers le profil après inscription
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
      token.value = response.data.token
      localStorage.setItem('token', token.value)
      isVerified.value = true
      await fetchUser()
      router.push('/home') // Redirection vers home après connexion
      return true
    } catch (err: any) {
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
      router.push('/login')
      isLoggingOut = false
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
    initializeAuth, // Pour compatibilité avec votre App.vue existant
    verifyToken,
    fetchUser,
    signup,
    login,
    logout
  }
})