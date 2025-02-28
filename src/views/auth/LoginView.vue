<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-mocha px-4">
    <div class="w-full max-w-md">
      <!-- Logo et Titre -->
      <div class="text-center mb-8">
        <div class="inline-block p-4 rounded-full bg-white/90 dark:bg-mocha-800/90 shadow-bento mb-4 backdrop-blur-glass">
          <div class="w-12 h-12 text-mocha-600 dark:text-mocha-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
        </div>
        <h1 class="heading-2">Bienvenue</h1>
        <p class="text-body mt-2">Connectez-vous à votre compte</p>
      </div>

      <!-- Formulaire -->
      <div class="bento-card">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Email avec icône de statut améliorée -->
          <div>
            <label for="email" class="block text-body-sm font-medium text-mocha-700 dark:text-mocha-200">
              Email
            </label>
            <div class="mt-1 relative">
              <input
                id="email"
                v-model="formData.email"
                type="email"
                autocomplete="email"
                required
                class="input-mocha w-full pl-10 pr-10 transition-all duration-200"
                :class="{ 
                  'border-red-500 focus:border-red-500 focus:ring-red-500': v$.email.$error || emailError,
                  'border-green-500 focus:border-green-500 focus:ring-green-500': formData.email && !v$.email.$error && !emailError
                }"
                @input="clearEmailError"
              />
              <!-- Icône à gauche (type d'entrée) -->
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 text-mocha-400">
                <EnvelopeIcon class="h-5 w-5" aria-hidden="true" />
              </div>
              <!-- Icône à droite (validation) -->
              <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                <ExclamationCircleIcon
                  v-if="v$.email.$error || emailError"
                  class="h-5 w-5 text-red-500"
                  aria-hidden="true"
                />
                <CheckCircleIcon
                  v-else-if="formData.email && isValidEmail(formData.email)"
                  class="h-5 w-5 text-green-500"
                  aria-hidden="true"
                />
              </div>
            </div>
            <p v-if="emailError" class="mt-2 text-caption text-red-600 flex items-center">
              <ExclamationTriangleIcon class="h-4 w-4 mr-1" />
              {{ emailError }}
            </p>
            <p v-else-if="v$.email.$error" class="mt-2 text-caption text-red-600 flex items-center">
              <ExclamationTriangleIcon class="h-4 w-4 mr-1" />
              {{ v$.email.email.$message || 'Email invalide' }}
            </p>
          </div>

          <!-- Mot de passe avec icônes améliorées -->
          <div>
            <label for="password" class="block text-body-sm font-medium text-mocha-700 dark:text-mocha-200">
              Mot de passe
            </label>
            <div class="mt-1 relative">
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="input-mocha w-full pl-10 pr-10 transition-all duration-200"
                :class="{ 
                  'border-red-500 focus:border-red-500 focus:ring-red-500': v$.password.$error || passwordError,
                  'border-green-500 focus:border-green-500 focus:ring-green-500': formData.password && !v$.password.$error && !passwordError
                }"
                @input="clearPasswordError"
              />
              <!-- Icône à gauche (type d'entrée) -->
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 text-mocha-400">
                <LockClosedIcon class="h-5 w-5" aria-hidden="true" />
              </div>
              <!-- Icône à droite (afficher/masquer + validation) -->
              <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                  type="button"
                  class="text-mocha-400 hover:text-mocha-500 focus:outline-none transition-all duration-200"
                  @click="showPassword = !showPassword"
                >
                  <EyeIcon v-if="showPassword" class="h-5 w-5" aria-hidden="true" />
                  <EyeSlashIcon v-else class="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div class="flex items-center justify-between mt-2">
              <div>
                <p v-if="passwordError" class="text-caption text-red-600 flex items-center">
                  <ExclamationTriangleIcon class="h-4 w-4 mr-1" />
                  {{ passwordError }}
                </p>
                <p v-else-if="v$.password.$error" class="text-caption text-red-600 flex items-center">
                  <ExclamationTriangleIcon class="h-4 w-4 mr-1" />
                  {{ v$.password.required.$message || 'Mot de passe requis' }}
                </p>
              </div>
              <button
                type="button"
                class="text-caption font-medium text-mocha-600 hover:text-mocha-500 dark:text-mocha-300 dark:hover:text-mocha-200 transition-all duration-200"
                @click="handleForgotPassword"
              >
                Mot de passe oublié ?
              </button>
            </div>
          </div>

          <!-- Se souvenir de moi -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="rememberMe"
                type="checkbox"
                class="h-4 w-4 rounded border-mocha-300 text-mocha-600 focus:ring-mocha-500 transition-all duration-200"
              />
              <label for="remember-me" class="ml-2 block text-body-sm text-mocha-700 dark:text-mocha-200">
                Se souvenir de moi
              </label>
            </div>
          </div>

          <!-- Bouton de connexion avec états améliorés -->
          <button
            type="submit"
            :disabled="isLoading || isSubmitDisabled"
            class="btn-primary w-full relative transition-all duration-200"
            :class="{ 'opacity-75 cursor-not-allowed': isSubmitDisabled && !isLoading }"
          >
            <span :class="{ 'opacity-0': isLoading }">
              Se connecter
            </span>
            <div
              v-if="isLoading"
              class="absolute inset-0 flex items-center justify-center"
            >
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </button>

          <p class="text-center text-body-sm text-mocha-600 dark:text-mocha-300">
            Pas encore de compte ?
            <router-link 
              to="/signup" 
              class="font-medium text-mocha-600 hover:text-mocha-500 dark:text-mocha-300 dark:hover:text-mocha-200 transition-all duration-200"
            >
              S'inscrire
            </router-link>
          </p>
        </form>
      </div>
    </div>

    <!-- Notifications avec icônes améliorées -->
    <transition name="fade" mode="out-in">
      <div 
        v-if="!!notification"
        class="fixed top-4 right-4 max-w-md z-50 transform transition-all duration-300"
      >
        <div 
          class="bento-card p-4 border-l-4 shadow-lg transition-all"
          :class="{
            'border-green-500 bg-green-50 dark:bg-green-900/20': notification?.type === 'success',
            'border-red-500 bg-red-50 dark:bg-red-900/20': notification?.type === 'error',
            'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20': notification?.type === 'warn',
            'border-blue-500 bg-blue-50 dark:bg-blue-900/20': notification?.type === 'info'
          }"
        >
          <div class="flex items-start">
            <!-- Icône basée sur le type -->
            <div class="flex-shrink-0">
              <CheckCircleIcon v-if="notification?.type === 'success'" class="h-5 w-5 text-green-500" />
              <ExclamationCircleIcon v-if="notification?.type === 'error'" class="h-5 w-5 text-red-500" />
              <InformationCircleIcon v-if="notification?.type === 'info'" class="h-5 w-5 text-blue-500" />
              <ExclamationTriangleIcon v-if="notification?.type === 'warn'" class="h-5 w-5 text-yellow-500" />
            </div>
            <!-- Contenu -->
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium text-mocha-900 dark:text-mocha-100">
                {{ notification?.title }}
              </p>
              <p class="mt-1 text-sm text-mocha-600 dark:text-mocha-300">
                {{ notification?.message }}
              </p>
            </div>
            <!-- Bouton fermer -->
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="closeNotification"
                class="inline-flex text-mocha-400 focus:outline-none focus:text-mocha-500 hover:text-mocha-500 transition-all"
              >
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Pop-up de vérification du compte -->
    <transition name="fade">
      <div v-if="showAccountVerification" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-glass animate-fade-in z-50">
        <div class="bento-card p-6 max-w-md w-full animate-scale-up">
          <div class="mb-4 flex items-center">
            <ShieldExclamationIcon class="h-6 w-6 text-yellow-500 mr-2" />
            <h3 class="heading-3">
              Est-ce vraiment votre compte ?
            </h3>
          </div>
          
          <p class="text-body mb-6">
            Nous avons détecté plusieurs tentatives de connexion échouées. Si vous avez oublié vos identifiants, vous pouvez utiliser la fonction "Mot de passe oublié".
          </p>
          <div class="flex justify-end space-x-4">
            <button
              @click="showAccountVerification = false"
              class="btn-secondary"
            >
              Fermer
            </button>
            <button
              @click="handleForgotPassword"
              class="btn-primary"
            >
              Réinitialiser le mot de passe
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import { 
  ExclamationCircleIcon, 
  ExclamationTriangleIcon,
  EyeIcon, 
  EyeSlashIcon, 
  XMarkIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ShieldExclamationIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Initialisation avec valeurs par défaut
const formData = ref({
  email: '',
  password: ''
})

const rules = {
  email: { required, email },
  password: { required }
}

const v$ = useVuelidate(rules, formData)

const isLoading = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)
const emailError = ref('')
const passwordError = ref('')
const loginAttempts = ref(0)
const lastAttemptTime = ref(Date.now())
const showAccountVerification = ref(false)
const isNavigating = ref(false)

// Désactiver le bouton si formulaire invalide
const isSubmitDisabled = computed(() => {
  return !formData.value.email || !formData.value.password
})

// Notification améliorée avec système de file d'attente et timeout
const notificationQueue = ref<Array<{
  type: 'success' | 'error' | 'info' | 'warn'
  title: string
  message: string
  timeout?: number
}>>([])

const notification = ref<{
  type: 'success' | 'error' | 'info' | 'warn'
  title: string
  message: string
  timeout?: number
} | null>(null)

let notificationTimer: number | null = null

// Examen des paramètres d'URL pour les messages
onMounted(() => {
  // Vérifier si on a été redirigé avec un message
  if (route.query.session === 'expired') {
    showNotification({
      type: 'warn',
      title: 'Session expirée',
      message: 'Votre session a expiré. Veuillez vous reconnecter.',
      timeout: 6000
    })
  }
  
  // Vérifier si l'utilisateur est déjà connecté
  if (authStore.isAuthenticated) {
    router.push('/home')
    return
  }
  
  // Charger email mémorisé
  initRememberedEmail()
  
  // Focus sur le premier champ vide
  nextTick(() => {
    if (!formData.value.email) {
      document.getElementById('email')?.focus()
    } else if (!formData.value.password) {
      document.getElementById('password')?.focus()
    }
  })
})

// Vérification personnalisée d'email
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Effacer les erreurs quand l'utilisateur modifie les champs
const clearEmailError = () => {
  emailError.value = ''
}

const clearPasswordError = () => {
  passwordError.value = ''
}

// Système de gestion des notifications
const showNotification = (notif: {
  type: 'success' | 'error' | 'info' | 'warn',
  title: string,
  message: string,
  timeout?: number
}) => {
  notificationQueue.value.push(notif)
  
  if (!notification.value) {
    processNextNotification()
  }
}

const processNextNotification = () => {
  if (notificationQueue.value.length === 0) {
    notification.value = null
    return
  }
  
  notification.value = notificationQueue.value.shift() || null
  
  if (notification.value && notification.value.timeout) {
    if (notificationTimer) {
      clearTimeout(notificationTimer)
    }
    notificationTimer = window.setTimeout(() => {
      closeNotification()
    }, notification.value!.timeout)
  }
}

const closeNotification = () => {
  if (notificationTimer) {
    clearTimeout(notificationTimer)
    notificationTimer = null
  }
  
  notification.value = null
  
  // Traiter la prochaine notification s'il y en a
  nextTick(() => {
    processNextNotification()
  })
}

// Soumission du formulaire avec validation améliorée
const handleSubmit = async () => {
  if (isNavigating.value || isLoading.value) return
  
  try {
    emailError.value = ''
    passwordError.value = ''
    
    // Validation du formulaire
    const isValid = await v$.value.$validate()
    if (!isValid) {
      // Ajouter du feedback visuel pour les champs invalides
      if (v$.value.email.$error) {
        emailError.value = 'Veuillez saisir une adresse email valide'
      }
      if (v$.value.password.$error) {
        passwordError.value = 'Veuillez saisir votre mot de passe'
      }
      return
    }
    
    // Protection contre les tentatives multiples rapides
    const currentTime = Date.now()
    if (currentTime - lastAttemptTime.value < 2000) {
      showNotification({
        type: 'warn',
        title: 'Tentative trop rapide',
        message: 'Veuillez patienter quelques secondes avant de réessayer',
        timeout: 3000
      })
      return
    }
    
    lastAttemptTime.value = currentTime
    isLoading.value = true
    
    // Tentative de connexion
    const success = await authStore.login({
      email: formData.value.email,
      password: formData.value.password
    })
    
    if (success) {
      loginAttempts.value = 0 // Réinitialiser le compteur d'échecs
      
      // Sauvegarder l'email si "se souvenir de moi" est coché
      if (rememberMe.value) {
        localStorage.setItem('remembered_email', formData.value.email)
      } else {
        localStorage.removeItem('remembered_email')
      }
      
      // Notification de succès
      showNotification({
        type: 'success',
        title: 'Connexion réussie',
        message: 'Vous êtes maintenant connecté',
        timeout: 2000
      })
      
      // Redirection après un court délai pour permettre à l'utilisateur de voir la notification
      isNavigating.value = true
      setTimeout(() => {
        const redirectPath = route.query.redirect as string || '/home'
        router.push(redirectPath)
      }, 500)
    } else {
      // Gestion des échecs de connexion
      loginAttempts.value++
      
      // Adapter le message d'erreur en fonction de la réponse du store
      if (authStore.error) {
        if (authStore.error.includes('mot de passe')) {
          passwordError.value = authStore.error
        } else if (authStore.error.includes('email')) {
          emailError.value = authStore.error
        } else {
          // Afficher une notification pour les autres types d'erreurs
          showNotification({
            type: 'error',
            title: 'Erreur de connexion',
            message: authStore.error,
            timeout: 5000
          })
        }
      } else {
        showNotification({
          type: 'error',
          title: 'Erreur de connexion',
          message: 'Une erreur est survenue lors de la connexion',
          timeout: 5000
        })
      }
      
      // Afficher la popup de vérification après plusieurs échecs
      if (loginAttempts.value >= 3) {
        showAccountVerification.value = true
      }
    }
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    showNotification({
      type: 'error',
      title: 'Erreur système',
      message: 'Une erreur inattendue est survenue. Veuillez réessayer.',
      timeout: 5000
    })
  } finally {
    isLoading.value = false
  }
}

// Gestion du mot de passe oublié
const handleForgotPassword = () => {
  showAccountVerification.value = false // Fermer la popup si ouverte
  
  if (formData.value.email && isValidEmail(formData.value.email)) {
    // Rediriger vers la page de récupération de mot de passe avec l'email pré-rempli
    router.push({
      path: '/forgot-password',
      query: { email: formData.value.email }
    })
  } else {
    // Demander à l'utilisateur de saisir son email d'abord
    emailError.value = 'Veuillez saisir votre email pour réinitialiser votre mot de passe'
    document.getElementById('email')?.focus()
    
    showNotification({
      type: 'info',
      title: 'Email requis',
      message: 'Veuillez saisir votre adresse email pour réinitialiser votre mot de passe',
      timeout: 4000
    })
  }
}

// Récupérer l'email mémorisé si disponible
const initRememberedEmail = () => {
  const savedEmail = localStorage.getItem('remembered_email')
  if (savedEmail) {
    formData.value.email = savedEmail
    rememberMe.value = true
  }
}

// Gérer les erreurs du store d'authentification
watch(() => authStore.error, (newError) => {
  if (newError) {
    if (newError.toLowerCase().includes('email')) {
      emailError.value = newError
    } else if (newError.toLowerCase().includes('mot de passe')) {
      passwordError.value = newError
    }
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

.animate-scale-up {
  animation: scaleUp 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUp {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>