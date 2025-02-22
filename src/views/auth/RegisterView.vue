<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-vue-next'
import { useSignupStore } from '../../stores/signup'
import { useRouter } from 'vue-router'

const router = useRouter()
const signupStore = useSignupStore()

const schema = yup.object({
  username: yup.string()
    .required('Le nom d\'utilisateur est requis')
    .min(3, '3 caractères minimum'),
  email: yup.string()
    .required('L\'email est requis')
    .email('Format d\'email invalide (exemple: nom@domaine.com)')
})

const { handleSubmit, errors, values, setFieldValue } = useForm({
  validationSchema: schema,
  initialValues: {
    username: '',
    email: ''
  }
})

const password = ref('')
const confirmPassword = ref('')
const passwordErrors = ref<string[]>([])
const confirmPasswordErrors = ref<string[]>([])
const submissionAttempted = ref(false)

const validatePassword = () => {
  const pass = password.value
  passwordErrors.value = []

  if (pass.length < 8) {
    passwordErrors.value.push('8 caractères minimum')
  }
  if (!/[A-Z]/.test(pass)) {
    passwordErrors.value.push('Au moins une lettre majuscule')
  }
  if (!/[0-9]/.test(pass)) {
    passwordErrors.value.push('Au moins un chiffre')
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) {
    passwordErrors.value.push('Au moins un caractère spécial (!@#$%^&*()_+-=[]{};\':"|,.<>/?)')
  }
}

const validateConfirmPassword = () => {
  confirmPasswordErrors.value = []
  if (confirmPassword.value !== password.value) {
    confirmPasswordErrors.value.push('Les mots de passe ne correspondent pas')
  }
}

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const togglePassword = (field: 'password' | 'confirm') => {
  if (field === 'password') {
    showPassword.value = !showPassword.value
  } else {
    showConfirmPassword.value = !showConfirmPassword.value
  }
}

const onSubmit = handleSubmit(async (formValues) => {
  submissionAttempted.value = true
  validatePassword()
  validateConfirmPassword()
  
  if (passwordErrors.value.length || confirmPasswordErrors.value.length) return

  const payload = {
    ...formValues,
    password: password.value
  }

  const success = await signupStore.initiateSignup(payload)
  if (success) {
    router.push('/home')
  }
})

// Validation en temps réel de l'email
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) {
    setFieldValue('email', '')
    return 'L\'email est requis'
  }
  if (!emailRegex.test(email)) {
    return 'Format d\'email invalide (exemple: nom@domaine.com)'
  }
  setFieldValue('email', email)
  return ''
}
</script>

<template>
  <div class="min-h-screen bg-gradient-mocha flex flex-col lg:flex-row">
    <!-- Form Section -->
    <div class="w-full lg:w-2/3 p-6 lg:p-12 flex items-center justify-center order-2 lg:order-1">
      <div class="w-full max-w-2xl">
        <div class="bg-white/95 dark:bg-mocha-800/95 backdrop-blur-glass
                    shadow-glass rounded-bento-lg p-8 lg:p-12 space-y-8
                    animate-scale-up">
          <!-- Header -->
          <div class="text-center mb-10">
            <h1 class="text-4xl lg:text-5xl font-bold text-mocha-800 dark:text-mocha-100
                       tracking-tight mb-4">
              Menu Planner
            </h1>
            <p class="text-lg text-mocha-600 dark:text-mocha-300">
              Créez votre compte et commencez à planifier vos repas
            </p>
          </div>

          <!-- Form -->
          <form @submit="onSubmit" class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Username field -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-200">
                  Nom d'utilisateur
                </label>
                <div class="relative group">
                  <User class="absolute left-3 top-1/2 -translate-y-1/2 text-mocha-400
                              group-hover:text-mocha-600 transition-colors duration-200"
                        size="20" />
                  <input
                    :value="values.username"
                    @input="setFieldValue('username', $event.target.value)"
                    type="text"
                    class="input-mocha"
                    :class="{ 'border-red-500': errors.username && submissionAttempted }"
                    placeholder="Votre nom d'utilisateur"
                  />
                </div>
                <p v-if="errors.username && submissionAttempted" 
                   class="text-red-500 text-sm mt-1">
                  {{ errors.username }}
                </p>
              </div>

              <!-- Email field -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-200">
                  Email
                </label>
                <div class="relative group">
                  <Mail class="absolute left-3 top-1/2 -translate-y-1/2 text-mocha-400
                              group-hover:text-mocha-600 transition-colors duration-200"
                        size="20" />
                  <input
                    :value="values.email"
                    @input="(e) => { 
                      const error = validateEmail(e.target.value);
                      if (!error) setFieldValue('email', e.target.value);
                    }"
                    type="email"
                    class="input-mocha"
                    :class="{ 'border-red-500': errors.email }"
                    placeholder="Votre email"
                  />
                </div>
                <p v-if="errors.email" 
                   class="text-red-500 text-sm mt-1">
                  {{ errors.email }}
                </p>
              </div>

              <!-- Password field avec exigences visibles -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-200">
                  Mot de passe
                </label>
                <div class="relative group">
                  <Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-mocha-400
                              group-hover:text-mocha-600 transition-colors duration-200"
                        size="20" />
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    class="input-mocha"
                    :class="{ 'border-red-500': passwordErrors.length > 0 && submissionAttempted }"
                    placeholder="Votre mot de passe"
                    @input="validatePassword"
                  />
                  <button
                    type="button"
                    @click="togglePassword('password')"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-mocha-400
                           hover:text-mocha-600 transition-colors duration-200 focus:outline-none"
                  >
                    <Eye v-if="!showPassword" size="20" />
                    <EyeOff v-else size="20" />
                  </button>
                </div>
                <!-- Affichage des exigences du mot de passe -->
                <div class="mt-2 space-y-1">
                  <p class="text-sm" :class="{ 
                    'text-green-500': password.length >= 8,
                    'text-red-500': password.length < 8 && submissionAttempted
                  }">
                    ✓ 8 caractères minimum
                  </p>
                  <p class="text-sm" :class="{ 
                    'text-green-500': /[A-Z]/.test(password),
                    'text-red-500': !/[A-Z]/.test(password) && submissionAttempted
                  }">
                    ✓ Au moins une majuscule
                  </p>
                  <p class="text-sm" :class="{ 
                    'text-green-500': /[0-9]/.test(password),
                    'text-red-500': !/[0-9]/.test(password) && submissionAttempted
                  }">
                    ✓ Au moins un chiffre
                  </p>
                  <p class="text-sm" :class="{ 
                    'text-green-500': /[!@#$%^&*()_+\-=\[\]{};':&quot;\\|,.<>\/?]/.test(password),
                    'text-red-500': !/[!@#$%^&*()_+\-=\[\]{};':&quot;\\|,.<>\/?]/.test(password) && submissionAttempted
                  }">
                    ✓ Au moins un caractère spécial
                  </p>
                </div>
              </div>

              <!-- Confirm Password field -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-200">
                  Confirmer le mot de passe
                </label>
                <div class="relative group">
                  <Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-mocha-400
                              group-hover:text-mocha-600 transition-colors duration-200"
                        size="20" />
                  <input
                    v-model="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="input-mocha"
                    :class="{ 'border-red-500': confirmPasswordErrors.length > 0 && submissionAttempted }"
                    placeholder="Confirmez votre mot de passe"
                    @input="validateConfirmPassword"
                  />
                  <button
                    type="button"
                    @click="togglePassword('confirm')"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-mocha-400
                           hover:text-mocha-600 transition-colors duration-200 focus:outline-none"
                  >
                    <Eye v-if="!showConfirmPassword" size="20" />
                    <EyeOff v-else size="20" />
                  </button>
                </div>
                <p v-if="confirmPasswordErrors.length && submissionAttempted" 
                   class="text-red-500 text-sm mt-1">
                  {{ confirmPasswordErrors[0] }}
                </p>
              </div>
            </div>

            <!-- Error message from store -->
            <div v-if="signupStore.error" class="mt-4">
              <p class="text-red-500 text-sm text-center">{{ signupStore.error }}</p>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="w-full mt-8 px-6 py-4 text-white bg-gradient-mocha-accent rounded-bento
                     transform hover:-translate-y-1 hover:shadow-bento-hover active:translate-y-0
                     transition-all duration-400 ease-bounce-soft focus:outline-none focus:ring-2
                     focus:ring-mocha-500 focus:ring-offset-2 dark:focus:ring-offset-mocha-800
                     text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="signupStore.isLoading"
            >
              <span v-if="signupStore.isLoading">Création en cours...</span>
              <span v-else>Créer mon compte</span>
            </button>

            <!-- Login Link -->
            <p class="text-center mt-6 text-mocha-600 dark:text-mocha-300">
              Déjà inscrit ?
              <router-link 
                to="/login" 
                class="text-mocha-800 dark:text-mocha-200
                       hover:text-mocha-600 dark:hover:text-mocha-300
                       font-medium transition-colors duration-200"
              >
                Connectez-vous
              </router-link>
            </p>
          </form>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="w-full lg:w-1/3 bg-gradient-to-br from-mocha-600/90 to-mocha-800/90
                p-6 lg:p-12 flex items-center order-1 lg:order-2">
      <div class="w-full space-y-8 h-full flex flex-col justify-between">
        <div class="space-y-8">
          <h2 class="text-2xl font-bold text-white text-center lg:text-left">
            Pourquoi choisir Menu Planner ?
          </h2>

          <!-- Features List -->
          <div class="grid grid-cols-1 gap-6">
            <div class="group p-6 rounded-bento bg-white/10 backdrop-blur-glass
                        hover:bg-white/20 transition-all duration-500
                        transform hover:-translate-y-1">
              <h3 class="text-lg font-medium text-white mb-2">
                Planification simplifiée
              </h3>
              <p class="text-mocha-200">
                Organisez vos repas hebdomadaires en quelques clics
              </p>
            </div>

            <div class="group p-6 rounded-bento bg-white/10 backdrop-blur-glass
                        hover:bg-white/20 transition-all duration-500
                        transform hover:-translate-y-1">
              <h3 class="text-lg font-medium text-white mb-2">
                Recettes personnalisées
              </h3>
              <p class="text-mocha-200">
                Des suggestions adaptées à vos préférences
              </p>
            </div>

            <div class="group p-6 rounded-bento bg-white/10 backdrop-blur-glass
                        hover:bg-white/20 transition-all duration-500
                        transform hover:-translate-y-1">
              <h3 class="text-lg font-medium text-white mb-2">
                Liste de courses intelligente
              </h3>
              <p class="text-mocha-200">
                Générez automatiquement votre liste de courses hebdomadaire
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-gradient-mocha {
  @apply bg-gradient-to-br from-mocha-50 to-mocha-100 dark:from-mocha-900 dark:to-mocha-800;
}

.bg-gradient-mocha-accent {
  @apply bg-gradient-to-br from-mocha-500 to-mocha-600 hover:from-mocha-600 hover:to-mocha-700;
}

.shadow-glass {
  @apply shadow-lg shadow-mocha-800/10 dark:shadow-mocha-800/20;
}

.shadow-bento-hover {
  @apply shadow-xl shadow-mocha-800/20;
}

.rounded-bento {
  @apply rounded-2xl;
}

.rounded-bento-lg {
  @apply rounded-3xl;
}

.rounded-bento-sm {
  @apply rounded-xl;
}

.backdrop-blur-glass {
  @apply backdrop-blur-md;
}

.ease-bounce-soft {
  @apply ease-out;
}

.input-mocha {
  @apply block w-full px-10 py-3 bg-white/50 dark:bg-mocha-700/50
         border border-mocha-300 dark:border-mocha-600
         rounded-bento-sm backdrop-blur-glass
         placeholder-mocha-400 dark:placeholder-mocha-500
         text-mocha-800 dark:text-mocha-100
         transition-all duration-200
         focus:outline-none focus:ring-2 focus:ring-mocha-500 focus:border-transparent
         dark:focus:ring-mocha-400
         hover:border-mocha-400 dark:hover:border-mocha-500;
}

.input-mocha:hover + button,
.input-mocha:focus + button {
  @apply text-mocha-600 dark:text-mocha-300;
}

/* Animation d'entrée pour le formulaire */
.animate-scale-up {
  animation: scaleUp 0.5s ease-out;
}

@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Transitions features/testimonials */
.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-300;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}
</style> 