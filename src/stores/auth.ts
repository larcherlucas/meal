import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/api/config'
import { User, LoginCredentials, SignupData, AuthResponse } from '@/types/index'
import { useNotificationStore } from '@/stores/NotificationStore'
import router from '@/router'

// Clés pour le stockage local
const TOKEN_KEY = 'auth_token'
const USER_KEY = 'user_data'
const TOKEN_EXPIRY_KEY = 'token_expiry'

// Durée par défaut du token (2 heures)
const TOKEN_DURATION = 7200000 // 2 heures en millisecondes

export const useAuthStore = defineStore('auth', () => {
  // États réactifs
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const tokenExpiry = ref<number | null>(
    localStorage.getItem(TOKEN_EXPIRY_KEY) 
      ? Number(localStorage.getItem(TOKEN_EXPIRY_KEY)) 
      : null
  )
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isVerified = ref(false)

  // Initialisation du store
  const initializeUser = () => {
    const savedUser = localStorage.getItem(USER_KEY)
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (e) {
        console.error('Erreur lors du parsing des données utilisateur')
        resetAuthState()
      }
    }
    
    // Vérifier si le token est expiré côté client
    if (tokenExpiry.value && Date.now() > tokenExpiry.value) {
      resetAuthState()
    }
  }

  // Computed properties
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const hasActiveSubscription = computed(() => 
    !!user.value?.subscription?.isActive
  )
  
  const userPreferences = computed(() => 
    user.value?.preferences || { language: 'fr', theme: 'light' }
  )

  // Méthode pour réinitialiser l'état d'authentification
  const resetAuthState = () => {
    token.value = null
    user.value = null
    tokenExpiry.value = null
    isVerified.value = false
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
  }

  // Méthode pour sauvegarder l'état d'authentification
  const saveAuthState = (authData: { token: string; user: User; expiresIn?: number }) => {
    token.value = authData.token
    user.value = authData.user
    
    // Calculer l'expiration du token (par défaut 2 heures si non spécifié)
    const expiresIn = authData.expiresIn || TOKEN_DURATION
    tokenExpiry.value = Date.now() + expiresIn
    
    // Sauvegarder dans le localStorage
    localStorage.setItem(TOKEN_KEY, authData.token)
    localStorage.setItem(USER_KEY, JSON.stringify(authData.user))
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(tokenExpiry.value))
    
    isVerified.value = true
  }

  // Login
  async function login(credentials: LoginCredentials) {
    const notificationStore = useNotificationStore()
    isLoading.value = true
    error.value = null

    try {
      // Vérifier si le login a été mémorisé
      if (credentials.rememberMe) {
        localStorage.setItem('remembered_email', credentials.email)
      } else {
        localStorage.removeItem('remembered_email')
      }
      
      const response = await apiService.post<AuthResponse>('/login', credentials)
      
      // Vérification des données requises
      if (!response.token || !response.user) {
        throw new Error('Réponse du serveur invalide')
      }
      
      // Sauvegarder l'état d'authentification
      saveAuthState(response)
      
      notificationStore.success('Connexion réussie', 'Bienvenue ' + response.user.username)
      
      // Redirection
      const redirectUrl = router.currentRoute.value.query.redirect as string || '/home'
      await router.push(redirectUrl)
      
      return true
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur de connexion'
      error.value = errorMessage
      
      // Pas besoin de notification ici car elle est déjà gérée par l'intercepteur API
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // Inscription
  async function signup(data: SignupData) {
    const notificationStore = useNotificationStore()
    isLoading.value = true
    error.value = null

    try {
      // S'assurer que les mots de passe correspondent
      if (data.password !== data.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas')
      }
      
      // Préparer le payload selon l'attente du backend
      const signupPayload = {
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        household_members: data.householdMembers,
        preferences: data.preferences
      }
      
      const response = await apiService.post<AuthResponse>('/signup', signupPayload)
      
      // Vérification des données requises
      if (!response.token || !response.user) {
        throw new Error('Réponse du serveur invalide')
      }
      
      // Sauvegarder l'état d'authentification
      saveAuthState(response)
      
      notificationStore.success(
        'Inscription réussie', 
        'Bienvenue sur notre plateforme de menus familiaux !'
      )
      
      // Redirection vers la page d'accueil
      await router.push('/home')
      return true
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de l\'inscription'
      error.value = errorMessage
      
      // Pas besoin de notification ici car elle est déjà gérée par l'intercepteur API
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Déconnexion
  async function logout(callApi = true) {
    const notificationStore = useNotificationStore()
    
    try {
      // Appel API de déconnexion seulement si demandé
      if (callApi && token.value) {
        await apiService.post('/logout')
      }
      
      // Réinitialiser l'état d'authentification
      resetAuthState()
      
      notificationStore.success('Déconnexion réussie', 'À bientôt !')
      
      // Redirection vers la page de login
      if (router.currentRoute.value.meta.requiresAuth) {
        await router.push('/login')
      }
      
      return true
    } catch (err) {
      // Même en cas d'erreur, réinitialiser l'état d'authentification
      resetAuthState()
      
      notificationStore.error(
        'Erreur lors de la déconnexion', 
        'Votre session a été fermée localement'
      )
      
      // Redirection vers la page de login
      if (router.currentRoute.value.meta.requiresAuth) {
        await router.push('/login')
      }
      
      return false
    }
  }

  // Vérification du token
  async function verifyToken() {
    if (!token.value) return false

    try {
      isLoading.value = true
      const response = await apiService.post<{ user: User }>('/verify-token')
      
      // Mettre à jour les informations utilisateur
      if (response.user) {
        user.value = response.user
        localStorage.setItem(USER_KEY, JSON.stringify(response.user))
        isVerified.value = true
      } else {
        throw new Error('Données utilisateur non disponibles')
      }
      
      return true
    } catch (err) {
      // Token invalide, déconnecter
      await logout(false) // false = ne pas appeler l'API logout
      return false
    } finally {
      isLoading.value = false
    }
  }
// Méthode pour synchroniser manuellement les données d'abonnement
function syncSubscriptionData() {
  // Vérifiez que l'utilisateur existe et a un abonnement
  if (user.value?.subscription) {
    // Vous pouvez ajouter une logique spécifique ici si nécessaire
    // Par exemple, vérifier la date d'expiration, le statut, etc.
    console.log('Synchronisation des données d\'abonnement', user.value.subscription)
    
    // Mise à jour potentielle des informations d'abonnement
    // Par exemple, vérifier si l'abonnement est toujours actif
    const isStillActive = checkSubscriptionValidity(user.value.subscription)
    
    // Mettre à jour le statut si nécessaire
    if (user.value.subscription.isActive !== isStillActive) {
      user.value.subscription.isActive = isStillActive
      
      // Sauvegarder dans le localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(user.value))
    }
  }
}

// Fonction utilitaire pour vérifier la validité de l'abonnement
function checkSubscriptionValidity(subscription: any): boolean {
  // Logique personnalisée pour vérifier la validité de l'abonnement
  // Par exemple :
  if (!subscription) return false
  
  // Vérifier la date d'expiration si présente
  if (subscription.expirationDate) {
    return new Date(subscription.expirationDate) > new Date()
  }
  
  // Vérifier le statut
  return subscription.status === 'active'
}
  // Mise à jour du profil
  async function updateProfile(profileData: Partial<User>) {
    const notificationStore = useNotificationStore()
    isLoading.value = true
    
    try {
      const updatedUser = await apiService.patch<User>('/profile', profileData)
      
      // Mettre à jour l'utilisateur
      if (updatedUser) {
        user.value = updatedUser
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
        notificationStore.success('Profil mis à jour', 'Vos informations ont été enregistrées')
        return true
      } else {
        throw new Error('Données utilisateur non disponibles')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la mise à jour du profil'
      error.value = errorMessage
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // Mise à jour des préférences
  async function updatePreferences(preferences: Record<string, any>) {
    if (!user.value) return false
    
    return updateProfile({ preferences })
  }
  
  // Mise à jour de la composition du foyer
  async function updateHouseholdMembers(householdMembers: Record<string, number>) {
    if (!user.value) return false
    
    return updateProfile({ household_members: householdMembers })
  }

  // Initialiser au chargement du store
  initializeUser()

  return {
    // États
    user,
    token,
    tokenExpiry,
    isLoading,
    error,
    isVerified,  
    syncSubscriptionData,

    // Computed
    isAuthenticated,
    isAdmin,
    hasActiveSubscription,
    userPreferences,

    // Actions
    login,
    signup,
    logout,
    verifyToken,
    updateProfile,
    updatePreferences,
    updateHouseholdMembers
  }
})