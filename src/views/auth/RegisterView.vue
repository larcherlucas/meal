<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-vue-next'

// Interfaces
interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
  household?: {
    adults: number;
    childrenOver3: number;
    childrenUnder3: number;
    babies: number;
  };
  subscription?: {
    isActive: boolean;
    plan: string;
    expiresAt: string;
  };
}

// Form validation schema
const schema = yup.object({
  username: yup.string().required('Le nom d\'utilisateur est requis').min(3, '3 caractères minimum'),
  email: yup.string().required('L\'email est requis').email('Email invalide'),
})

// Form setup with initial values
const { handleSubmit, errors, values, setFieldValue } = useForm({
  validationSchema: schema,
  initialValues: {
    username: '',
    email: ''
  }
})

// Password validation
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
  if ((pass.match(/[0-9]/g) || []).length < 3) {
    passwordErrors.value.push('3 chiffres minimum')
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) {
    passwordErrors.value.push('1 caractère spécial minimum')
  }
}

const validateConfirmPassword = () => {
  confirmPasswordErrors.value = []
  if (confirmPassword.value !== password.value) {
    confirmPasswordErrors.value.push('Les mots de passe ne correspondent pas')
  }
}

// Password visibility toggles
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const togglePassword = (field: 'password' | 'confirm') => {
  if (field === 'password') {
    showPassword.value = !showPassword.value
  } else {
    showConfirmPassword.value = !showConfirmPassword.value
  }
}

// Form submission
const onSubmit = handleSubmit(async (formValues) => {
  submissionAttempted.value = true
  validatePassword()
  validateConfirmPassword()
  
  if (passwordErrors.value.length || confirmPasswordErrors.value.length) return

  const userData = {
    ...formValues,
    password: password.value
  }
  
  console.log('Form submitted:', userData)
  // Ici, vous pouvez appeler votre store pour l'inscription
})
</script>

<template>
  <div class="min-h-screen bg-gradient-mocha flex flex-col lg:flex-row">
    <!-- Form Section - Now Primary Focus -->
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
                    v-model="values.username"
                    type="text"
                    class="input-mocha"
                    :class="{ 'border-red-500': errors.username && submissionAttempted }"
                    placeholder="Votre nom d'utilisateur"
                  />
                </div>
                <p v-if="errors.username && submissionAttempted" class="text-red-500 text-sm">Requis</p>
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
                    v-model="values.email"
                    type="email"
                    class="input-mocha"
                    :class="{ 'border-red-500': errors.email && submissionAttempted }"
                    placeholder="Votre email"
                  />
                </div>
                <p v-if="errors.email && submissionAttempted" class="text-red-500 text-sm">Requis</p>
              </div>

              <!-- Password field -->
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
                    :class="{ 'border-red-500': passwordErrors.length > 0 }"
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
                <div v-if="passwordErrors.length" class="space-y-1">
                  <p v-for="error in passwordErrors" :key="error"
                     class="text-red-500 text-sm">{{ error }}</p>
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
                    :class="{ 'border-red-500': confirmPasswordErrors.length > 0 }"
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
                <div v-if="confirmPasswordErrors.length" class="space-y-1">
                  <p v-for="error in confirmPasswordErrors" :key="error"
                     class="text-red-500 text-sm">{{ error }}</p>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="w-full mt-8 px-6 py-4 text-white bg-gradient-mocha-accent rounded-bento
                     transform hover:-translate-y-1 hover:shadow-bento-hover active:translate-y-0
                     transition-all duration-400 ease-bounce-soft focus:outline-none focus:ring-2
                     focus:ring-mocha-500 focus:ring-offset-2 dark:focus:ring-offset-mocha-800
                     text-lg font-medium"
            >
              Créer mon compte
            </button>

            <!-- Login Link -->
            <p class="text-center mt-6 text-mocha-600 dark:text-mocha-300">
              Déjà inscrit ?
              <a href="#" class="text-mocha-800 dark:text-mocha-200
                                hover:text-mocha-600 dark:hover:text-mocha-300
                                font-medium ml-2">
                Connectez-vous
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>

    <!-- Features/Testimonials Section -->
    <div class="w-full lg:w-1/3 bg-gradient-to-br from-mocha-600/90 to-mocha-800/90
                p-6 lg:p-12 flex items-center order-1 lg:order-2">
      <div class="w-full space-y-8 h-full flex flex-col justify-between">
        <div class="text-center lg:text-left">
          <h2 class="text-2xl font-bold text-white mb-4">
            {{ showFeatures ? 'Pourquoi choisir Menu Planner ?' : 'Témoignages' }}
          </h2>
        </div>

        <!-- Transition between Features and Testimonials -->
        <transition name="fade" mode="out-in">
          <div v-if="showFeatures" key="features" class="flex-grow flex items-center">
            <!-- Features Grid -->
            <div class="grid grid-cols-1 gap-6 w-full">
              <div v-for="(feature, index) in features" :key="feature.title"
                   class="group p-6 rounded-bento bg-white/10 backdrop-blur-glass
                          hover:bg-white/20 transition-all duration-500
                          transform hover:-translate-y-1 flex-grow"
                   :style="{ animationDelay: `${index * 100}ms` }">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <component :is="feature.icon"
                              class="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 class="text-lg font-medium text-white">{{ feature.title }}</h3>
                    <p class="text-mocha-200 mt-1">{{ feature.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else key="testimonials" class="flex-grow flex items-center">
            <!-- Testimonials Grid -->
            <div class="grid grid-cols-1 gap-6 w-full">
              <div v-for="testimonial in testimonials" :key="testimonial.name"
                   class="group p-6 rounded-bento bg-white/10 backdrop-blur-glass
                          hover:bg-white/20 transition-all duration-500
                          transform hover:-translate-y-1 flex-grow">
                <div class="flex items-center space-x-4">
                  <img :src="testimonial.image" alt="Testimonial Image" class="w-12 h-12 rounded-full">
                  <div>
                    <h3 class="text-lg font-medium text-white">{{ testimonial.name }}</h3>
                    <p class="text-mocha-200 mt-1">{{ testimonial.role }}</p>
                    <p class="text-mocha-200 mt-1">{{ testimonial.text }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

/* Transition styles */
.fade-enter-active, .fade-leave-active {
  transition: opacity 1s ease-in-out;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
