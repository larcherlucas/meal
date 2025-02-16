<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-mocha-100 to-mocha-200 dark:from-mocha-800 dark:to-mocha-900 px-4">
    <div class="w-full max-w-md">
      <!-- Logo et Titre -->
      <div class="text-center mb-8">
        <div class="inline-block p-4 rounded-full bg-white dark:bg-mocha-800 shadow-lg mb-4">
          <div class="w-12 h-12 text-mocha-600 dark:text-mocha-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
        </div>
        <h1 class="text-3xl font-bold text-mocha-800 dark:text-mocha-50">Bienvenue</h1>
        <p class="text-mocha-600 dark:text-mocha-300 mt-2">Connectez-vous à votre compte</p>
      </div>

      <!-- Formulaire -->
      <div class="bento-card p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-mocha-700 dark:text-mocha-200">
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
            <p v-if="emailError" class="mt-2 text-sm text-red-600">
              {{ emailError }}
            </p>
            <p v-else-if="v$.email.$error" class="mt-2 text-sm text-red-600">
              {{ v$.email.email.$message || 'Email invalide' }}
            </p>
          </div>

          <!-- Mot de passe -->
          <div>
            <label for="password" class="block text-sm font-medium text-mocha-700 dark:text-mocha-200">
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
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-mocha-400 hover:text-mocha-500"
                @click="showPassword = !showPassword"
              >
                <EyeIcon v-if="showPassword" class="h-5 w-5" aria-hidden="true" />
                <EyeSlashIcon v-else class="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div class="flex items-center justify-between mt-2">
              <p v-if="passwordError" class="text-sm text-red-600">
                {{ passwordError }}
              </p>
              <p v-else-if="v$.password.$error" class="text-sm text-red-600">
                {{ v$.password.required.$message || 'Mot de passe requis' }}
              </p>
              <button
                type="button"
                class="text-sm font-medium text-mocha-600 hover:text-mocha-500 dark:text-mocha-300 dark:hover:text-mocha-200"
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
                class="h-4 w-4 rounded border-mocha-300 text-mocha-600 focus:ring-mocha-500"
              />
              <label for="remember-me" class="ml-2 block text-sm text-mocha-700 dark:text-mocha-200">
                Se souvenir de moi
              </label>
            </div>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full btn-primary relative"
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

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-mocha-300 dark:border-mocha-600"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white dark:bg-mocha-800 text-mocha-500">ou</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              class="flex items-center justify-center px-4 py-2 border border-mocha-300 dark:border-mocha-600 rounded-lg text-sm font-medium text-mocha-700 dark:text-mocha-200 hover:bg-mocha-50 dark:hover:bg-mocha-700"
              @click="handleGoogleLogin"
              :disabled="isLoading"
            >
              <img src="/google.svg" alt="Google" class="h-5 w-5 mr-2" />
              Google
            </button>
            <button
              type="button"
              class="flex items-center justify-center px-4 py-2 border border-mocha-300 dark:border-mocha-600 rounded-lg text-sm font-medium text-mocha-700 dark:text-mocha-200 hover:bg-mocha-50 dark:hover:bg-mocha-700"
            >
              <img src="/apple.svg" alt="Apple" class="h-5 w-5 mr-2" />
              Apple
            </button>
          </div>

          <p class="text-center text-sm text-mocha-600 dark:text-mocha-300">
            Pas encore de compte ?
            <router-link 
              to="/auth/register" 
              class="font-medium text-mocha-600 hover:text-mocha-500 dark:text-mocha-300 dark:hover:text-mocha-200"
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
    <div v-if="showAccountVerification" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white dark:bg-mocha-800 p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 class="text-xl font-bold text-mocha-800 dark:text-mocha-50 mb-4">
          Est-ce vraiment votre compte ?
        </h2>
        <p class="text-mocha-600 dark:text-mocha-300 mb-6">
          Nous avons détecté plusieurs tentatives de connexion échouées. Si vous avez oublié vos identifiants, vous pouvez utiliser la fonction "Mot de passe oublié".
        </p>
        <div class="flex justify-end space-x-4">
          <button
            @click="showAccountVerification = false"
            class="px-4 py-2 text-mocha-600 hover:text-mocha-500"
          >
            Fermer
          </button>
          <button
            @click="handleForgotPassword"
            class="px-4 py-2 bg-mocha-600 text-white rounded-lg hover:bg-mocha-500"
          >
            Réinitialiser le mot de passe
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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

// Vérifie si l'email existe dans la base de données
const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`)
    const data = await response.json()
    return data.exists
  } catch (error) {
    console.error('Error checking email:', error)
    return false
  }
}

const handleSubmit = async () => {
  emailError.value = ''
  passwordError.value = ''
  
  const isValid = await v$.value.$validate()
  if (!isValid) return

  // Vérifier les tentatives de connexion
  const currentTime = Date.now()
  if (currentTime - lastAttemptTime.value < 15000) { // 15 secondes
    loginAttempts.value++
    if (loginAttempts.value >= 5) {
      showAccountVerification.value = true
      loginAttempts.value = 0 // Réinitialiser le compteur
      return
    }
  } else {
    loginAttempts.value = 1
  }
  lastAttemptTime.value = currentTime

  isLoading.value = true
  notification.value = null

  try {
    // Vérifier si l'email existe
    const emailExists = await checkEmailExists(formData.value.email)
    if (!emailExists) {
      emailError.value = 'Mail inconnu'
      isLoading.value = false
      return
    }

    const success = await authStore.login(formData.value)
    if (success) {
      notification.value = {
        type: 'success',
        title: 'Connexion réussie',
        message: 'Vous allez être redirigé...'
      }
      setTimeout(() => {
        const redirectPath = route.query.redirect?.toString() || '/'
        router.push(redirectPath)
      }, 1500)
    } else {
      passwordError.value = 'Mot de passe incorrect'
    }
    
  } catch (error) {
    notification.value = {
      type: 'error',
      title: 'Erreur',
      message: 'Une erreur est survenue lors de la connexion'
    }
  } finally {
    isLoading.value = false
  }
}

const handleForgotPassword = () => {
  router.push('/auth/forgot-password')
}

const handleGoogleLogin = async () => {
  isLoading.value = true
  notification.value = null

  try {
    const success = await authStore.loginWithGoogle()
    if (success) {
      notification.value = {
        type: 'success',
        title: 'Connexion réussie',
        message: 'Vous allez être redirigé...'
      }
      setTimeout(() => {
        const redirectPath = route.query.redirect?.toString() || '/'
        router.push(redirectPath)
      }, 1500)
    }
  } catch (error) {
    notification.value = {
      type: 'error',
      title: 'Erreur',
      message: 'Une erreur est survenue lors de la connexion avec Google'
    }
  } finally {
    isLoading.value = false
  }
}
</script>