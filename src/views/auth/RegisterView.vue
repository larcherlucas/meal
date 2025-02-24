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
        <div class="bento-card animate-scale-up">
          <!-- Header -->
          <div class="text-center mb-10">
            <h1 class="heading-1 mb-4">
              Menu Planner
            </h1>
            <p class="text-body-lg">
              Créez votre compte et commencez à planifier vos repas
            </p>
          </div>

          <!-- Form -->
          <form @submit="onSubmit" class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Username field -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-200 flex items-center gap-2">
                  <User size="16" class="text-mocha-500" />
                  Nom d'utilisateur
                </label>
                <input
                  :value="values.username"
                  @input="setFieldValue('username', $event.target.value)"
                  type="text"
                  class="input-mocha"
                  :class="{ 'border-red-500': errors.username && submissionAttempted }"
                  placeholder="Votre nom d'utilisateur"
                />
                <p v-if="errors.username && submissionAttempted" 
                   class="text-red-500 text-sm mt-1">
                  {{ errors.username }}
                </p>
              </div>

              <!-- Email field -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-200 flex items-center gap-2">
                  <Mail size="16" class="text-mocha-500" />
                  Email
                </label>
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
                <p v-if="errors.email" 
                   class="text-red-500 text-sm mt-1">
                  {{ errors.email }}
                </p>
              </div>

              <!-- Password field avec exigences visibles -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-200 flex items-center gap-2">
                  <Lock size="16" class="text-mocha-500" />
                  Mot de passe
                </label>
                <div class="relative">
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    class="input-mocha pr-10"
                    :class="{ 'border-red-500': passwordErrors.length > 0 && submissionAttempted }"
                    placeholder="Votre mot de passe"
                    @input="validatePassword"
                  />
                  <button
                    type="button"
                    @click="togglePassword('password')"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-mocha-400
                           hover:text-mocha-600 transition-all duration-300 focus:outline-none"
                  >
                    <Eye v-if="!showPassword" size="20" />
                    <EyeOff v-else size="20" />
                  </button>
                </div>
                <!-- Affichage des exigences du mot de passe -->
                <div class="mt-2 space-y-1">
                  <p class="text-caption" :class="{ 
                    'text-green-500': password.length >= 8,
                    'text-red-500': password.length < 8 && submissionAttempted
                  }">
                    ✓ 8 caractères minimum
                  </p>
                  <p class="text-caption" :class="{ 
                    'text-green-500': /[A-Z]/.test(password),
                    'text-red-500': !/[A-Z]/.test(password) && submissionAttempted
                  }">
                    ✓ Au moins une majuscule
                  </p>
                  <p class="text-caption" :class="{ 
                    'text-green-500': /[0-9]/.test(password),
                    'text-red-500': !/[0-9]/.test(password) && submissionAttempted
                  }">
                    ✓ Au moins un chiffre
                  </p>
                  <p class="text-caption" :class="{ 
                    'text-green-500': /[!@#$%^&*()_+\-=\[\]{};':&quot;\\|,.<>\/?]/.test(password),
                    'text-red-500': !/[!@#$%^&*()_+\-=\[\]{};':&quot;\\|,.<>\/?]/.test(password) && submissionAttempted
                  }">
                    ✓ Au moins un caractère spécial
                  </p>
                </div>
              </div>

              <!-- Confirm Password field -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-200 flex items-center gap-2">
                  <Lock size="16" class="text-mocha-500" />
                  Confirmer le mot de passe
                </label>
                <div class="relative">
                  <input
                    v-model="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="input-mocha pr-10"
                    :class="{ 'border-red-500': confirmPasswordErrors.length > 0 && submissionAttempted }"
                    placeholder="Confirmez votre mot de passe"
                    @input="validateConfirmPassword"
                  />
                  <button
                    type="button"
                    @click="togglePassword('confirm')"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-mocha-400
                           hover:text-mocha-600 transition-all duration-300 focus:outline-none"
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
              class="btn-primary w-full mt-8 py-4 text-lg font-medium transform hover:-translate-y-1 hover:shadow-bento-hover active:translate-y-0 transition-all duration-400 ease-bounce-soft"
              :disabled="signupStore.isLoading"
            >
              <span v-if="signupStore.isLoading">Création en cours...</span>
              <span v-else>Créer mon compte</span>
            </button>

            <!-- Login Link -->
            <p class="text-center mt-6 text-body-sm">
              Déjà inscrit ?
              <router-link 
                to="/login" 
                class="text-mocha-800 dark:text-mocha-200
                       hover:text-mocha-600 dark:hover:text-mocha-300
                       font-medium transition-all duration-300"
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
          <h2 class="heading-2 text-white text-center lg:text-left">
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