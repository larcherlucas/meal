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
  <div class="min-h-screen bg-gradient-spice flex flex-col lg:flex-row">
    <!-- Form Section -->
    <div class="w-full lg:w-2/3 p-6 lg:p-12 flex items-center justify-center order-2 lg:order-1">
      <div class="w-full max-w-2xl">
        <div class="bento-card animate-scale-up">
          <!-- Header -->
          <div class="text-center mb-10">
            <h1 class="heading-1 mb-4 text-spice-800">
              Menu Planner
            </h1>
            <p class="text-body-lg text-spice-700">
              Créez votre compte et commencez à planifier vos repas
            </p>
          </div>

          <!-- Form -->
          <form @submit="onSubmit" class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Username field -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-spice-700 dark:text-spice-200 flex items-center gap-2">
                  <User size="16" class="text-spice-500" />
                  Nom d'utilisateur
                </label>
                <input
                  :value="values.username"
                  @input="setFieldValue('username', $event.target.value)"
                  type="text"
                  class="input-spice"
                  :class="{ 'border-spice-red': errors.username && submissionAttempted }"
                  placeholder="Votre nom d'utilisateur"
                />
                <p v-if="errors.username && submissionAttempted" 
                   class="text-spice-red text-sm mt-1">
                  {{ errors.username }}
                </p>
              </div>

              <!-- Email field -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-spice-700 dark:text-spice-200 flex items-center gap-2">
                  <Mail size="16" class="text-spice-500" />
                  Email
                </label>
                <input
                  :value="values.email"
                  @input="(e) => { 
                    const error = validateEmail(e.target.value);
                    if (!error) setFieldValue('email', e.target.value);
                  }"
                  type="email"
                  class="input-spice"
                  :class="{ 'border-spice-red': errors.email }"
                  placeholder="Votre email"
                />
                <p v-if="errors.email" 
                   class="text-spice-red text-sm mt-1">
                  {{ errors.email }}
                </p>
              </div>

              <!-- Password field avec exigences visibles -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-spice-700 dark:text-spice-200 flex items-center gap-2">
                  <Lock size="16" class="text-spice-500" />
                  Mot de passe
                </label>
                <div class="relative">
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    class="input-spice pr-10"
                    :class="{ 'border-spice-red': passwordErrors.length > 0 && submissionAttempted }"
                    placeholder="Votre mot de passe"
                    @input="validatePassword"
                  />
                  <button
                    type="button"
                    @click="togglePassword('password')"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-spice-400
                           hover:text-spice-600 transition-all duration-300 focus:outline-none"
                  >
                    <Eye v-if="!showPassword" size="20" />
                    <EyeOff v-else size="20" />
                  </button>
                </div>
                <!-- Affichage des exigences du mot de passe -->
                <div class="mt-2 space-y-1">
                  <p class="text-caption" :class="{ 
                    'text-spice-green': password.length >= 8,
                    'text-spice-red': password.length < 8 && submissionAttempted
                  }">
                    ✓ 8 caractères minimum
                  </p>
                  <p class="text-caption" :class="{ 
                    'text-spice-green': /[A-Z]/.test(password),
                    'text-spice-red': !/[A-Z]/.test(password) && submissionAttempted
                  }">
                    ✓ Au moins une majuscule
                  </p>
                  <p class="text-caption" :class="{ 
                    'text-spice-green': /[0-9]/.test(password),
                    'text-spice-red': !/[0-9]/.test(password) && submissionAttempted
                  }">
                    ✓ Au moins un chiffre
                  </p>
                  <p class="text-caption" :class="{ 
                    'text-spice-green': /[!@#$%^&*()_+\-=\[\]{};':&quot;\\|,.<>\/?]/.test(password),
                    'text-spice-red': !/[!@#$%^&*()_+\-=\[\]{};':&quot;\\|,.<>\/?]/.test(password) && submissionAttempted
                  }">
                    ✓ Au moins un caractère spécial
                  </p>
                </div>
              </div>

              <!-- Confirm Password field -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-spice-700 dark:text-spice-200 flex items-center gap-2">
                  <Lock size="16" class="text-spice-500" />
                  Confirmer le mot de passe
                </label>
                <div class="relative">
                  <input
                    v-model="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="input-spice pr-10"
                    :class="{ 'border-spice-red': confirmPasswordErrors.length > 0 && submissionAttempted }"
                    placeholder="Confirmez votre mot de passe"
                    @input="validateConfirmPassword"
                  />
                  <button
                    type="button"
                    @click="togglePassword('confirm')"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-spice-400
                           hover:text-spice-600 transition-all duration-300 focus:outline-none"
                  >
                    <Eye v-if="!showConfirmPassword" size="20" />
                    <EyeOff v-else size="20" />
                  </button>
                </div>
                <p v-if="confirmPasswordErrors.length && submissionAttempted" 
                   class="text-spice-red text-sm mt-1">
                  {{ confirmPasswordErrors[0] }}
                </p>
              </div>
            </div>

            <!-- Error message from store -->
            <div v-if="signupStore.error" class="mt-4">
              <p class="text-spice-red text-sm text-center">{{ signupStore.error }}</p>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="btn-spice w-full mt-8 py-4 text-lg font-medium transform hover:-translate-y-1 hover:shadow-bento-hover active:translate-y-0 transition-all duration-400 ease-bounce-soft"
              :disabled="signupStore.isLoading"
            >
              <span v-if="signupStore.isLoading">Création en cours...</span>
              <span v-else>Créer mon compte</span>
            </button>

            <!-- Login Link -->
            <p class="text-center mt-6 text-body-sm text-spice-700">
              Déjà inscrit ?
              <router-link 
                to="/login" 
                class="text-spice-800 dark:text-spice-200
                       hover:text-spice-600 dark:hover:text-spice-300
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
    <div class="w-full lg:w-1/3 bg-[#D97904] p-6 lg:p-12 flex items-center order-1 lg:order-2">
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
              <p class="text-spice-200">
                Organisez vos repas hebdomadaires en quelques clics
              </p>
            </div>

            <div class="group p-6 rounded-bento bg-white/10 backdrop-blur-glass
                        hover:bg-white/20 transition-all duration-500
                        transform hover:-translate-y-1">
              <h3 class="text-lg font-medium text-white mb-2">
                Recettes personnalisées
              </h3>
              <p class="text-spice-200">
                Des suggestions adaptées à vos préférences
              </p>
            </div>

            <div class="group p-6 rounded-bento bg-white/10 backdrop-blur-glass
                        hover:bg-white/20 transition-all duration-500
                        transform hover:-translate-y-1">
              <h3 class="text-lg font-medium text-white mb-2">
                Liste de courses intelligente
              </h3>
              <p class="text-spice-200">
                Générez automatiquement votre liste de courses hebdomadaire
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  /* Palette de couleurs optimisée basée sur les épices */
  --spice-green: rgb(96, 140, 2);        /* Vert d'herbes aromatiques */
  --spice-yellow: rgb(242, 182, 4);      /* Jaune de curcuma */
  --spice-orange: rgb(216, 121, 4);      /* Orange de paprika */
  --spice-red: rgb(216, 43, 4);          /* Rouge de piment */
  --spice-dark-red: rgb(140, 14, 2);     /* Rouge foncé de piment séché */
  
  /* Nuances complémentaires pour l'interface */
  --spice-100: rgb(252, 247, 230);       /* Fond très clair */
  --spice-200: rgb(245, 230, 190);       /* Texte sur fond foncé */
  --spice-300: rgb(240, 210, 150);       /* Accents clairs */
  --spice-400: rgb(230, 190, 110);       /* Icônes et détails secondaires */
  --spice-500: rgb(216, 121, 4);         /* Éléments interactifs principaux */
  --spice-600: rgb(180, 90, 4);          /* Éléments au survol */
  --spice-700: rgb(150, 60, 4);          /* Texte principal */
  --spice-800: rgb(120, 40, 4);          /* Titres et texte important */
  --spice-900: rgb(90, 20, 4);           /* Texte très foncé et accents */
}

/* Styles généraux */
.bg-gradient-spice {
  background: linear-gradient(135deg, var(--spice-100) 0%, var(--spice-200) 100%);
}

/* Composant Bento Card */
.bento-card {
  background-color: white;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(216, 121, 4, 0.1);
  transition: all 0.4s ease;
}

/* Boutons */
.btn-spice {
  background: linear-gradient(135deg, var(--spice-orange) 0%, var(--spice-red) 100%);
  color: white;
  border-radius: 0.75rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 4px 12px rgba(216, 121, 4, 0.2);
}

.btn-spice:hover {
  background: linear-gradient(135deg, var(--spice-red) 0%, var(--spice-dark-red) 100%);
  box-shadow: 0 6px 16px rgba(216, 43, 4, 0.3);
}

.btn-spice:disabled {
  background: linear-gradient(135deg, var(--spice-400) 0%, var(--spice-500) 100%);
  opacity: 0.7;
  cursor: not-allowed;
}

/* Input fields */
.input-spice {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--spice-300);
  border-radius: 0.75rem;
  background-color: white;
  transition: all 0.3s ease;
  color: var(--spice-800);
}

.input-spice:focus {
  border-color: var(--spice-orange);
  box-shadow: 0 0 0 3px rgba(216, 121, 4, 0.2);
  outline: none;
}

.input-spice::placeholder {
  color: var(--spice-400);
}

/* Typographie */
.heading-1 {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--spice-800);
}

.heading-2 {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.3;
}

.text-body-lg {
  font-size: 1.125rem;
  line-height: 1.5;
}

.text-body-sm {
  font-size: 0.875rem;
  line-height: 1.5;
}

.text-caption {
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--spice-600);
}

/* Classes utilitaires pour les arrondis */
.rounded-bento {
  border-radius: 1.25rem;
}

/* Effets d'animation */
.animate-scale-up {
  animation: scaleUp 0.5s ease forwards;
}

@keyframes scaleUp {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Styles pour le backdrop blur */
.backdrop-blur-glass {
  backdrop-filter: blur(8px);
}

/* Transition pour les effets de survol */
.transition-all {
  transition-property: all;
}

.duration-300 {
  transition-duration: 300ms;
}

.duration-400 {
  transition-duration: 400ms;
}

.duration-500 {
  transition-duration: 500ms;
}

.ease-bounce-soft {
  transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Shadow effects */
.shadow-bento-hover {
  box-shadow: 0 15px 30px rgba(216, 121, 4, 0.15);
}
</style>