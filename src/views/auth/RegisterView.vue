<script setup>
import { ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-vue-next'

// Définir les règles de validation du mot de passe
const password = ref('')
const confirmPassword = ref('')
const passwordErrors = ref([])
const confirmPasswordErrors = ref([])

// Vérifie les critères du mot de passe et affiche les erreurs correspondantes
const validatePassword = () => {
  const pass = password.value
  passwordErrors.value = []

  if (pass.length < 8) {
    passwordErrors.value.push('Password must contain at least 8 letters')
  }
  if ((pass.match(/[0-9]/g) || []).length < 3) {
    passwordErrors.value.push('Password must contain at least 3 numbers')
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) {
    passwordErrors.value.push('Password must contain at least 1 special character')
  }
}

// Valide la confirmation du mot de passe
const validateConfirmPassword = () => {
  confirmPasswordErrors.value = []
  
  if (!confirmPassword.value) {
    confirmPasswordErrors.value.push('Un confirm password est attendu')
  } else if (confirmPassword.value !== password.value) {
    confirmPasswordErrors.value.push('Mot de passe différent')
  }
}

// Form schema
const schema = yup.object({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  email: yup.string().required('Email is required').email('Must be a valid email'),
  confirmPassword: yup.string()
    .required('Un confirm password est attendu')
    .oneOf([yup.ref('password')], 'Mot de passe différent')
})

const { handleSubmit, errors, values } = useForm({
  validationSchema: schema,
  validateOnChange: false,
  validateOnBlur: false
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const formSubmitted = ref(false)

const togglePassword = (field) => {
  if (field === 'password') {
    showPassword.value = !showPassword.value
  } else {
    showConfirmPassword.value = !showConfirmPassword.value
  }
}

const onSubmit = handleSubmit(async (values) => {
  formSubmitted.value = true
  validateConfirmPassword()
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('Form submitted:', values)
  } catch (error) {
    console.error('Error:', error)
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-mocha">
    <div class="bento-card max-w-md w-full p-8 space-y-8 animate-fade-in">
      <!-- Header -->
      <div class="text-center">
        <h2 class="text-3xl font-bold text-mocha-800 dark:text-mocha-100">
          Create Account
        </h2>
        <p class="mt-2 text-mocha-600 dark:text-mocha-300">
          Join our coffee-loving community
        </p>
      </div>

      <!-- Form -->
      <form @submit="onSubmit" class="space-y-6">
        <!-- Username -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-200">
            Username
          </label>
          <div class="relative">
            <User class="absolute left-3 top-1/2 -translate-y-1/2 text-mocha-400" size="20" />
            <input
              v-model="values.username"
              type="text"
              class="input-mocha w-full pl-10"
              :class="{ 'border-red-500': formSubmitted && errors.username }"
              placeholder="Enter your username"
            />
          </div>
          <p v-if="formSubmitted && errors.username" class="text-red-500 text-sm">{{ errors.username }}</p>
        </div>

        <!-- Email -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-200">
            Email
          </label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 text-mocha-400" size="20" />
            <input
              v-model="values.email"
              type="email"
              class="input-mocha w-full pl-10"
              :class="{ 'border-red-500': formSubmitted && errors.email }"
              placeholder="Enter your email"
            />
          </div>
          <p v-if="formSubmitted && errors.email" class="text-red-500 text-sm">{{ errors.email }}</p>
        </div>

        <!-- Password -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-200">
            Password
          </label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-mocha-400" size="20" />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="input-mocha w-full pl-10 pr-10"
              :class="{ 'border-red-500': passwordErrors.length > 0 }"
              placeholder="Enter your password"
              @input="validatePassword"
            />
            <button
              type="button"
              @click="togglePassword('password')"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-mocha-400 hover:text-mocha-600"
            >
              <Eye v-if="!showPassword" size="20" />
              <EyeOff v-else size="20" />
            </button>
          </div>
          <div v-if="passwordErrors.length" class="space-y-1">
            <p v-for="error in passwordErrors" :key="error" class="text-red-500 text-sm">
              {{ error }}
            </p>
          </div>
        </div>

        <!-- Confirm Password -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-200">
            Confirm Password
          </label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-mocha-400" size="20" />
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="input-mocha w-full pl-10 pr-10"
              :class="{ 'border-red-500': confirmPasswordErrors.length > 0 }"
              placeholder="Confirm your password"
              @input="validateConfirmPassword"
            />
            <button
              type="button"
              @click="togglePassword('confirm')"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-mocha-400 hover:text-mocha-600"
            >
              <Eye v-if="!showConfirmPassword" size="20" />
              <EyeOff v-else size="20" />
            </button>
          </div>
          <div v-if="confirmPasswordErrors.length" class="space-y-1">
            <p v-for="error in confirmPasswordErrors" :key="error" class="text-red-500 text-sm">
              {{ error }}
            </p>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="btn-primary w-full"
        >
          Create Account
        </button>
      </form>

      <!-- Login Link -->
      <p class="text-center text-sm text-mocha-600 dark:text-mocha-300">
        Already have an account?
        <a href="#" class="text-mocha-800 dark:text-mocha-200 hover:underline">Sign in</a>
      </p>
    </div>
  </div>
</template>