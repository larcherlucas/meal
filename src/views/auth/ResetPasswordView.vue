<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-mocha px-4">
      <div class="w-full max-w-md">
        <!-- Logo et Titre -->
        <div class="text-center mb-8">
          <div class="inline-block p-4 rounded-full bg-white/90 dark:bg-mocha-800/90 shadow-bento mb-4 backdrop-blur-glass">
            <div class="w-12 h-12 text-mocha-600 dark:text-mocha-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
          </div>
          <h1 class="heading-2">Nouveau mot de passe</h1>
          <p class="text-body mt-2">
            Créez un nouveau mot de passe sécurisé
          </p>
        </div>
  
        <!-- Formulaire -->
        <div class="bento-card">
          <div v-if="!resetSuccess && !tokenExpired">
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- Mot de passe -->
              <div>
                <label for="password" class="block text-body-sm font-medium text-mocha-700 dark:text-mocha-200">
                  Nouveau mot de passe
                </label>
                <div class="mt-1 relative">
                  <input
                    id="password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    required
                    class="input-mocha w-full pl-10 pr-10 transition-all duration-200"
                    :class="{ 
                      'border-red-500 focus:border-red-500 focus:ring-red-500': passwordError,
                      'border-green-500 focus:border-green-500 focus:ring-green-500': password && isValidPassword() && !passwordError
                    }"
                    @input="clearPasswordError"
                  />
                  <!-- Icône à gauche -->
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 text-mocha-400">
                    <LockClosedIcon class="h-5 w-5" aria-hidden="true" />
                  </div>
                  <!-- Icône à droite (afficher/masquer) -->
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
                <p v-if="passwordError" class="mt-2 text-caption text-red-600 flex items-center">
                  <ExclamationTriangleIcon class="h-4 w-4 mr-1" />
                  {{ passwordError }}
                </p>
                <div v-else class="mt-2">
                  <div class="text-caption text-mocha-500 dark:text-mocha-400">
                    Votre mot de passe doit contenir :
                  </div>
                  <ul class="mt-1 grid grid-cols-2 gap-x-2 gap-y-1 text-caption">
                    <li class="flex items-center" :class="hasMinLength ? 'text-green-600' : 'text-mocha-500 dark:text-mocha-400'">
                      <CheckCircleIcon v-if="hasMinLength" class="h-4 w-4 mr-1" />
                      <XCircleIcon v-else class="h-4 w-4 mr-1" />
                      8 caractères minimum
                    </li>
                    <li class="flex items-center" :class="hasUppercase ? 'text-green-600' : 'text-mocha-500 dark:text-mocha-400'">
                      <CheckCircleIcon v-if="hasUppercase" class="h-4 w-4 mr-1" />
                      <XCircleIcon v-else class="h-4 w-4 mr-1" />
                      Une majuscule
                    </li>
                    <li class="flex items-center" :class="hasLowercase ? 'text-green-600' : 'text-mocha-500 dark:text-mocha-400'">
                      <CheckCircleIcon v-if="hasLowercase" class="h-4 w-4 mr-1" />
                      <XCircleIcon v-else class="h-4 w-4 mr-1" />
                      Une minuscule
                    </li>
                    <li class="flex items-center" :class="hasDigit ? 'text-green-600' : 'text-mocha-500 dark:text-mocha-400'">
                      <CheckCircleIcon v-if="hasDigit" class="h-4 w-4 mr-1" />
                      <XCircleIcon v-else class="h-4 w-4 mr-1" />
                      Un chiffre
                    </li>
                  </ul>
                </div>
              </div>
  
              <!-- Confirmation du mot de passe -->
              <div>
                <label for="confirm-password" class="block text-body-sm font-medium text-mocha-700 dark:text-mocha-200">
                  Confirmez le mot de passe
                </label>
                <div class="mt-1 relative">
                  <input
                    id="confirm-password"
                    v-model="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    autocomplete="new-password"
                    required
                    class="input-mocha w-full pl-10 pr-10 transition-all duration-200"
                    :class="{ 
                      'border-red-500 focus:border-red-500 focus:ring-red-500': confirmPasswordError,
                      'border-green-500 focus:border-green-500 focus:ring-green-500': confirmPassword && passwordsMatch() && !confirmPasswordError
                    }"
                    @input="clearConfirmPasswordError"
                  />
                  <!-- Icône à gauche -->
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 text-mocha-400">
                    <LockClosedIcon class="h-5 w-5" aria-hidden="true" />
                  </div>
                  <!-- Icône à droite (afficher/masquer) -->
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      class="text-mocha-400 hover:text-mocha-500 focus:outline-none transition-all duration-200"
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <EyeIcon v-if="showConfirmPassword" class="h-5 w-5" aria-hidden="true" />
                      <EyeSlashIcon v-else class="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <p v-if="confirmPasswordError" class="mt-2 text-caption text-red-600 flex items-center">
                  <ExclamationTriangleIcon class="h-4 w-4 mr-1" />
                  {{ confirmPasswordError }}
                </p>
                <p v-else-if="confirmPassword && !passwordsMatch()" class="mt-2 text-caption text-red-600 flex items-center">
                  <ExclamationTriangleIcon class="h-4 w-4 mr-1" />
                  Les mots de passe ne correspondent pas
                </p>
              </div>
  
              <!-- Bouton de soumission avec états -->
              <button
                type="submit"
                :disabled="isLoading || !canSubmit"
                class="btn-primary w-full relative transition-all duration-200"
                :class="{ 'opacity-75 cursor-not-allowed': !canSubmit && !isLoading }"
              >
                <span :class="{ 'opacity-0': isLoading }">
                  Réinitialiser le mot de passe
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
            </form>
          </div>
  
          <!-- Vue de succès -->
          <div v-else-if="resetSuccess" class="animate-fade-in py-6">
            <div class="text-center">
              <div class="inline-flex rounded-full bg-green-100 p-3 mb-4">
                <CheckCircleIcon class="h-8 w-8 text-green-600" />
              </div>
              <h2 class="heading-3">Mot de passe réinitialisé !</h2>
              <p class="mt-2 text-body">
                Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <div class="mt-6">
                <router-link to="/login" class="btn-primary w-full block text-center">
                  Se connecter
                </router-link>
              </div>
            </div>
          </div>
  
          <!-- Vue de token expiré ou invalide -->
          <div v-else-if="tokenExpired" class="animate-fade-in py-6">
            <div class="text-center">
              <div class="inline-flex rounded-full bg-red-100 p-3 mb-4">
                <ExclamationCircleIcon class="h-8 w-8 text-red-600" />
              </div>
              <h2 class="heading-3">Lien expiré ou invalide</h2>
              <p class="mt-2 text-body">
                Le lien de réinitialisation a expiré ou n'est plus valide. Veuillez demander un nouveau lien de réinitialisation.
              </p>
              <div class="mt-6">
                <router-link to="/forgot-password" class="btn-primary w-full block text-center">
                  Demander un nouveau lien
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Notifications avec icônes -->
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
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { apiService } from '@/api/config'
  import { useNotificationStore } from '@/stores/NotificationStore'
  import { 
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    XMarkIcon,
    XCircleIcon
  } from '@heroicons/vue/24/outline'
  
  const router = useRouter()
  const route = useRoute()
  const notificationStore = useNotificationStore()
  
  // États
  const password = ref('')
  const confirmPassword = ref('')
  const passwordError = ref('')
  const confirmPasswordError = ref('')
  const isLoading = ref(false)
  const showPassword = ref(false)
  const showConfirmPassword = ref(false)
  const resetSuccess = ref(false)
  const tokenExpired = ref(false)
  const tokenValue = ref('')
  
  // Notification
  const notification = ref<{
    type: 'success' | 'error' | 'info' | 'warn'
    title: string
    message: string
    timeout?: number
  } | null>(null)
  
  // Fermer la notification
  const closeNotification = () => {
    notification.value = null
  }
  
  // Valider la complexité du mot de passe
  const hasMinLength = computed(() => password.value.length >= 8)
  const hasUppercase = computed(() => /[A-Z]/.test(password.value))
  const hasLowercase = computed(() => /[a-z]/.test(password.value))
  const hasDigit = computed(() => /\d/.test(password.value))
  
  // Vérifier si le mot de passe est valide
  const isValidPassword = () => {
    return hasMinLength.value && hasUppercase.value && hasLowercase.value && hasDigit.value
  }
  
  // Vérifier si les mots de passe correspondent
  const passwordsMatch = () => {
    return password.value === confirmPassword.value && password.value !== ''
  }
  
  // Vérifier si le formulaire peut être soumis
  const canSubmit = computed(() => {
    return isValidPassword() && passwordsMatch() && !isLoading.value
  })
  
  // Réinitialiser les erreurs
  const clearPasswordError = () => {
    passwordError.value = ''
  }
  
  const clearConfirmPasswordError = () => {
    confirmPasswordError.value = ''
  }
  
  // Récupérer et vérifier le token dès le chargement
  onMounted(async () => {
    tokenValue.value = route.params.token as string
    
    if (!tokenValue.value) {
      tokenExpired.value = true
      return
    }
    
    // Vérifier la validité du token
    try {
      isLoading.value = true
      await apiService.post('/verify-reset-token', { token: tokenValue.value })
      isLoading.value = false
    } catch (error) {
      isLoading.value = false
      tokenExpired.value = true
    }
  })
  
  // Soumettre le formulaire
  const handleSubmit = async () => {
    // Valider le mot de passe
    if (!isValidPassword()) {
      passwordError.value = 'Le mot de passe ne respecte pas les critères de sécurité'
      return
    }
    
    // Valider la correspondance des mots de passe
    if (!passwordsMatch()) {
      confirmPasswordError.value = 'Les mots de passe ne correspondent pas'
      return
    }
    
    isLoading.value = true
    
    try {
      // Appel API pour réinitialiser le mot de passe
      await apiService.post('/reset-password', {
        token: tokenValue.value,
        password: password.value,
        confirmPassword: confirmPassword.value
      })
      
      // Afficher la confirmation
      resetSuccess.value = true
      
    } catch (error: any) {
      const errorMessage = error.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe'
      
      if (errorMessage.toLowerCase().includes('expiré') || errorMessage.toLowerCase().includes('invalide')) {
        tokenExpired.value = true
      } else {
        notification.value = {
          type: 'error',
          title: 'Erreur',
          message: errorMessage,
          timeout: 5000
        }
        
        // Mettre automatiquement à jour le timeout
        setTimeout(() => {
          closeNotification()
        }, 5000)
      }
      
    } finally {
      isLoading.value = false
    }
  }
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
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  </style>