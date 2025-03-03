<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-mocha px-4">
      <div class="w-full max-w-md">
        <!-- Logo et Titre -->
        <div class="text-center mb-8">
          <div class="inline-block p-4 rounded-full bg-white/90 dark:bg-mocha-800/90 shadow-bento mb-4 backdrop-blur-glass">
            <div class="w-12 h-12 text-mocha-600 dark:text-mocha-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
          </div>
          <h1 class="heading-2">Réinitialisation du mot de passe</h1>
          <p class="text-body mt-2">
            Nous vous enverrons un lien de réinitialisation
          </p>
        </div>
  
        <!-- Formulaire -->
        <div class="bento-card">
          <div v-if="!requestSent" class="space-y-6">
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- Email avec icône de statut -->
              <div>
                <label for="email" class="block text-body-sm font-medium text-mocha-700 dark:text-mocha-200">
                  Email
                </label>
                <div class="mt-1 relative">
                  <input
                    id="email"
                    v-model="email"
                    type="email"
                    autocomplete="email"
                    required
                    class="input-mocha w-full pl-10 pr-10 transition-all duration-200"
                    :class="{ 
                      'border-red-500 focus:border-red-500 focus:ring-red-500': emailError,
                      'border-green-500 focus:border-green-500 focus:ring-green-500': email && isValidEmail(email) && !emailError
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
                      v-if="emailError"
                      class="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                    <CheckCircleIcon
                      v-else-if="email && isValidEmail(email)"
                      class="h-5 w-5 text-green-500"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <p v-if="emailError" class="mt-2 text-caption text-red-600 flex items-center">
                  <ExclamationTriangleIcon class="h-4 w-4 mr-1" />
                  {{ emailError }}
                </p>
                <p v-else class="mt-2 text-caption text-mocha-500 dark:text-mocha-400">
                  Veuillez entrer l'adresse email associée à votre compte
                </p>
              </div>
  
              <!-- Bouton de soumission avec états -->
              <button
                type="submit"
                :disabled="isLoading || !isValidEmail(email)"
                class="btn-primary w-full relative transition-all duration-200"
                :class="{ 'opacity-75 cursor-not-allowed': !isValidEmail(email) && !isLoading }"
              >
                <span :class="{ 'opacity-0': isLoading }">
                  Envoyer le lien de réinitialisation
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
  
            <div class="mt-6 flex items-center justify-center">
              <div class="text-sm">
                <router-link 
                  to="/login" 
                  class="font-medium text-mocha-600 hover:text-mocha-500 dark:text-mocha-300 dark:hover:text-mocha-200 transition-all duration-200"
                >
                  Retour à la connexion
                </router-link>
              </div>
            </div>
          </div>
  
          <!-- Vue de confirmation -->
          <div v-else class="animate-fade-in">
            <div class="text-center py-4">
              <div class="inline-flex rounded-full bg-green-100 p-3 mb-4">
                <CheckCircleIcon class="h-8 w-8 text-green-600" />
              </div>
              <h2 class="heading-3">Email envoyé !</h2>
              <p class="mt-2 text-body">
                Si un compte existe avec l'adresse
                <span class="font-medium">{{ email }}</span>,
                vous recevrez un email contenant les instructions pour réinitialiser votre mot de passe.
              </p>
              <p class="mt-4 text-caption text-mocha-500 dark:text-mocha-400">
                N'oubliez pas de vérifier votre dossier de courrier indésirable.
              </p>
              <div class="mt-6 space-y-4">
                <button 
                  @click="resendEmail"
                  :disabled="isResendLoading" 
                  class="btn-secondary w-full relative"
                >
                  <span :class="{ 'opacity-0': isResendLoading }">
                    Renvoyer l'email
                  </span>
                  <div
                    v-if="isResendLoading"
                    class="absolute inset-0 flex items-center justify-center"
                  >
                    <svg class="animate-spin h-5 w-5 text-mocha-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </button>
                <router-link to="/login" class="btn-outline w-full block text-center">
                  Retour à la connexion
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
  import { ref, reactive, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { apiService } from '@/api/config'
  import { useNotificationStore } from '@/stores/NotificationStore'
  import { 
    EnvelopeIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XMarkIcon,
    InformationCircleIcon
  } from '@heroicons/vue/24/outline'
  
  const router = useRouter()
  const route = useRoute()
  const notificationStore = useNotificationStore()
  
  // États
  const email = ref('')
  const emailError = ref('')
  const isLoading = ref(false)
  const isResendLoading = ref(false)
  const requestSent = ref(false)
  
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
  
  // Précharger l'email depuis les paramètres de la requête
  onMounted(() => {
    if (route.query.email) {
      email.value = route.query.email as string
    }
  })
  
  // Valider format email
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
  
  // Réinitialiser les erreurs
  const clearEmailError = () => {
    emailError.value = ''
  }
  
  // Soumettre le formulaire
  const handleSubmit = async () => {
    if (!isValidEmail(email.value)) {
      emailError.value = 'Veuillez entrer une adresse email valide'
      return
    }
  
    isLoading.value = true
    
    try {
      // Appel API
      await apiService.post('/forgot-password', { email: email.value })
      
      // Afficher la confirmation même si l'email n'existe pas
      // (pour des raisons de sécurité)
      requestSent.value = true
      
    } catch (error) {
      // Ne pas révéler si l'email existe ou non
      // Afficher quand même la vue de confirmation
      requestSent.value = true
    } finally {
      isLoading.value = false
    }
  }
  
  // Renvoyer l'email
  const resendEmail = async () => {
    if (!isValidEmail(email.value)) {
      return
    }
  
    isResendLoading.value = true
    
    try {
      await apiService.post('/forgot-password', { email: email.value })
      notification.value = {
        type: 'success',
        title: 'Email renvoyé',
        message: 'Nous avons renvoyé un email de réinitialisation',
        timeout: 5000
      }
      
      // Mettre automatiquement à jour le timeout
      setTimeout(() => {
        closeNotification()
      }, 5000)
      
    } catch (error) {
      // Ne pas révéler d'informations sur l'existence de l'email
      notification.value = {
        type: 'success',
        title: 'Email renvoyé',
        message: 'Si votre adresse est dans notre base de données, vous recevrez un email',
        timeout: 5000
      }
      
      // Mettre automatiquement à jour le timeout
      setTimeout(() => {
        closeNotification()
      }, 5000)
    } finally {
      isResendLoading.value = false
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