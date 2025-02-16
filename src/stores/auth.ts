import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'user'
  household?: {
    adults: number
    childrenOver3: number
    childrenUnder3: number
    babies: number
  }
  subscription?: {
    isActive: boolean
    plan: string
    expiresAt: string
  }
}

// Compte administrateur par défaut
const defaultAdmin = {
  email: 'larcher.lucas@hotmail.fr',
  password: 'MotdepasseL987!',
  firstName: 'Lucas',
  lastName: 'Larcher',
  role: 'admin',
  subscription: {
    isActive: true,
    plan: 'Premium',
    expiresAt: '2025-12-31' // Exemple de date d'expiration
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const hasActiveSubscription = computed(() => user.value?.subscription?.isActive ?? false)

  async function login(credentials: { email: string; password: string }) {
    try {
      // Simulation de l'authentification pour le compte admin
      if (credentials.email === defaultAdmin.email && credentials.password === defaultAdmin.password) {
        const mockToken = 'admin-token'
        setToken(mockToken)
        user.value = defaultAdmin as User
        return true
      }

      const response = await axios.post('/api/auth/login', credentials)
      setToken(response.data.token)
      await fetchUser()
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  async function register(userData: any) {
    try {
      const response = await axios.post('/api/auth/register', userData)
      setToken(response.data.token)
      await fetchUser()
      return true
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    }
  }

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }

  async function fetchUser() {
    try {
      const response = await axios.get('/api/user/profile')
      user.value = response.data
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }

  async function updateProfile(profileData: Partial<User>) {
    try {
      const response = await axios.put('/api/user/profile', profileData)
      user.value = response.data
      return true
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }

  // Initialize
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    fetchUser()
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    hasActiveSubscription,
    login,
    register,
    logout,
    fetchUser,
    updateProfile
  }
})
