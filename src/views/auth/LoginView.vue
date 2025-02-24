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
          <!-- Email -->
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
                class="input-mocha w-full pr-10"
                :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': v$.email.$error || emailError }"
              />
              <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                <ExclamationCircleIcon
                  v-if="v$.email.$error || emailError"
                  class="h-5 w-5 text-red-500"
                  aria-hidden="true"
                />
              </div>
            </div>
            <p v-if="emailError" class="mt-2 text-caption text-red-600">
              {{ emailError }}
            </p>
            <p v-else-if="v$.email.$error" class="mt-2 text-caption text-red-600">
              {{ v$.email.email.$message || 'Email invalide' }}
            </p>
          </div>

          <!-- Mot de passe -->
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
                class="input-mocha w-full pr-10"
                :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': v$.password.$error || passwordError }"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-mocha-400 hover:text-mocha-500 transition-all duration-200"
                @click="showPassword = !showPassword"
              >
                <EyeIcon v-if="showPassword" class="h-5 w-5" aria-hidden="true" />
                <EyeSlashIcon v-else class="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div class="flex items-center justify-between mt-2">
              <p v-if="passwordError" class="text-caption text-red-600">
                {{ passwordError }}
              </p>
              <p v-else-if="v$.password.$error" class="text-caption text-red-600">
                {{ v$.password.required.$message || 'Mot de passe requis' }}
              </p>
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

          <button
            type="submit"
            :disabled="isLoading"
            class="btn-primary w-full relative"
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

    <!-- Notifications -->
    <AuthNotification
      :show="!!notification"
      :type="notification?.type || 'error'"
      :title="notification?.title || ''"
      :message="notification?.message || ''"
      @close="notification = null"
    />

    <!-- Pop-up de vérification du compte -->
    <div v-if="showAccountVerification" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-glass animate-fade-in">
      <div class="bento-card p-6 max-w-md w-full animate-scale-up">
        <h3 class="heading-3 mb-4">
          Est-ce vraiment votre compte ?
        </h3>
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
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import { ExclamationCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import AuthNotification from '@/components/auth/AuthNotification.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

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

const notification = ref<{
  type: 'success' | 'error'
  title: string
  message: string
} | null>(null)

const handleSubmit = async () => {
  try {
    emailError.value = ''
    passwordError.value = ''
    notification.value = null
    
    const isValid = await v$.value.$validate()
    if (!isValid) return

    // Vérifier les tentatives de connexion
    const currentTime = Date.now()
    if (currentTime - lastAttemptTime.value < 15000) {
      loginAttempts.value++
      if (loginAttempts.value >= 5) {
        showAccountVerification.value = true
        loginAttempts.value = 0
        return
      }
    } else {
      loginAttempts.value = 1
    }
    lastAttemptTime.value = currentTime

    isLoading.value = true

    const success = await authStore.login({
      email: formData.value.email,
      password: formData.value.password
    })

    if (success) {
      notification.value = {
        type: 'success',
        title: 'Connexion réussie',
        message: 'Vous allez être redirigé...'
      }

      // Gestion du "Se souvenir de moi" 
      if (rememberMe.value) {
        localStorage.setItem('rememberedEmail', formData.value.email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }

      setTimeout(() => {
        const redirectPath = route.query.redirect?.toString() || '/'
        router.push(redirectPath)
      }, 1500)
    }
  } catch (error: any) {
    console.error('Login error:', error)
    
    // Gestion des erreurs spécifiques en fonction de votre store
    const errorMessage = error.message || 'Une erreur est survenue'
    
    if (errorMessage.includes('Email ou mot de passe incorrect')) {
      passwordError.value = 'Mot de passe incorrect'
    } else if (errorMessage.includes('Email') || errorMessage.toLowerCase().includes('mail')) {
      emailError.value = 'Mail inconnu'
    } else if (errorMessage.includes('désactivé')) {
      notification.value = {
        type: 'error',
        title: 'Compte désactivé',
        message: 'Votre compte a été désactivé. Veuillez contacter le support.'
      }
    } else {
      notification.value = {
        type: 'error',
        title: 'Erreur',
        message: errorMessage
      }
    }
  } finally {
    isLoading.value = false
  }
}

const handleForgotPassword = () => {
  router.push('/auth/forgot-password')
}

// Charger l'email mémorisé si "Se souvenir de moi" était activé
const initRememberedEmail = () => {
  const rememberedEmail = localStorage.getItem('rememberedEmail')
  if (rememberedEmail) {
    formData.value.email = rememberedEmail
    rememberMe.value = true
  }
}

// Exécuter au montage du composant
initRememberedEmail()
</script>