<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, AlertCircle, PenTool } from 'lucide-vue-next';
import { useSignupStore } from '@/stores/signup';
import { useNotificationStore } from '@/stores/NotificationStore';
import { useRouter } from 'vue-router';
import { debounce } from 'lodash'; // Ajout d'un debounce pour les validations

const router = useRouter();
const signupStore = useSignupStore();
const notificationStore = useNotificationStore();

// Configuration avancée du schéma de validation
const schema = yup.object({
  username: yup.string()
    .required('Le nom d\'utilisateur est requis')
    .min(3, '3 caractères minimum')
    .max(30, '30 caractères maximum')
    .matches(/^[a-zA-Z0-9_\-]+$/, 'Lettres, chiffres, tirets ou underscores uniquement')
    .test('is-unique', 'Ce nom d\'utilisateur est déjà utilisé', 
      () => !signupStore.fieldErrors.username),
  
  email: yup.string()
    .required('L\'email est requis')
    .email('Format d\'email invalide (exemple: nom@domaine.com)')
    .max(255, 'Email trop long (255 caractères maximum)')
    .test('is-unique', 'Cet email est déjà utilisé', 
      () => !signupStore.fieldErrors.email)
});

// Configuration du formulaire avec Vee-validate
const { handleSubmit, errors, values, setFieldValue, setFieldError, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    username: '',
    email: ''
  }
});

// État local pour le mot de passe avec validation avancée
const password = ref('');
const confirmPassword = ref('');
const passwordErrors = ref<string[]>([]);
const confirmPasswordErrors = ref<string[]>([]);
const submissionAttempted = ref(false);
const formTouched = ref(false);
const userScrolled = ref(false);

// Options d'affichage du mot de passe
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Évaluation enrichie de la force du mot de passe
const passwordStrength = computed(() => {
  const pass = password.value;
  if (!pass) return { value: 0, label: 'Non défini', class: 'bg-gray-200' };
  
  let score = 0;
  let details = [];
  
  // Critères de base
  if (pass.length >= 8) { 
    score += 1;
    details.push('longueur');
  }
  if (/[A-Z]/.test(pass)) {
    score += 1;
    details.push('majuscule');
  }
  if (/[0-9]/.test(pass)) {
    score += 1;
    details.push('chiffre');
  }
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) {
    score += 1;
    details.push('caractère spécial');
  }
  
  // Bonus pour les mots de passe très longs
  if (pass.length >= 12) {
    score += 0.5;
  }
  
  // Pénalité pour les séquences de caractères
  if (/123|abc|qwerty|azerty|password|motdepasse/i.test(pass)) {
    score -= 1;
  }
  
  // Normalisez le score entre 0 et 100
  const normalizedScore = Math.max(0, Math.min(100, score * 25));
  
  if (score <= 0) return { value: 0, label: 'Très faible', class: 'bg-gray-400' };
  if (score <= 1) return { value: 25, label: 'Faible', class: 'bg-spice-red' };
  if (score <= 2) return { value: 50, label: 'Moyen', class: 'bg-spice-yellow' };
  if (score <= 3) return { value: 75, label: 'Bon', class: 'bg-spice-green/70' };
  return { value: 100, label: 'Excellent', class: 'bg-spice-green' };
});

// Validation avancée du mot de passe avec suggestions
const validatePassword = () => {
  const pass = password.value;
  passwordErrors.value = [];
  formTouched.value = true;

  if (!pass) {
    passwordErrors.value.push('Le mot de passe est requis');
    return;
  }
  
  const checks = [
    { condition: pass.length < 8, message: '8 caractères minimum' },
    { condition: !/[A-Z]/.test(pass), message: 'Au moins une lettre majuscule' },
    { condition: !/[0-9]/.test(pass), message: 'Au moins un chiffre' },
    { condition: !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass), 
      message: 'Au moins un caractère spécial (!@#$%^&*()_+-=[]{};\':"|,.<>/?)' }
  ];
  
  checks.forEach(check => {
    if (check.condition) {
      passwordErrors.value.push(check.message);
    }
  });
  
  // Ajout de suggestions en cas de mot de passe faible
  if (passwordErrors.value.length > 0 && pass.length > 0) {
    const suggestion = `Conseil: un bon mot de passe pourrait combiner une phrase mémorable avec des chiffres et symboles.`;
    console.info(suggestion);
  }
  
  validateConfirmPassword();
};

// Validation de la confirmation avec meilleure UX
const validateConfirmPassword = () => {
  confirmPasswordErrors.value = [];
  
  if (!confirmPassword.value && password.value) {
    confirmPasswordErrors.value.push('La confirmation du mot de passe est requise');
    return;
  }
  
  if (confirmPassword.value && confirmPassword.value !== password.value) {
    confirmPasswordErrors.value.push('Les mots de passe ne correspondent pas');
  }
};

// Toggle l'affichage du mot de passe avec animation
const togglePassword = (field: 'password' | 'confirm') => {
  if (field === 'password') {
    showPassword.value = !showPassword.value;
  } else {
    showConfirmPassword.value = !showConfirmPassword.value;
  }
};

// Validation en temps réel de l'email avec debounce pour réduire les requêtes
const validateEmail = debounce((email: string) => {
  formTouched.value = true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Effacer les erreurs d'API sur changement
  if (signupStore.fieldErrors.email) {
    signupStore.fieldErrors.email = '';
  }
  
  if (!email) {
    setFieldError('email', 'L\'email est requis');
    return;
  }
  
  if (!emailRegex.test(email)) {
    setFieldError('email', 'Format d\'email invalide (exemple: nom@domaine.com)');
    return;
  }
  
  // Effacer l'erreur si tout est valide
  setFieldError('email', '');
}, 300);

// Validation en temps réel du nom d'utilisateur avec debounce
const validateUsername = debounce((username: string) => {
  formTouched.value = true;
  // Effacer les erreurs d'API sur changement
  if (signupStore.fieldErrors.username) {
    signupStore.fieldErrors.username = '';
  }
  
  const usernameRegex = /^[a-zA-Z0-9_\-]+$/;
  
  if (!username) {
    setFieldError('username', 'Le nom d\'utilisateur est requis');
    return;
  }
  
  if (username.length < 3) {
    setFieldError('username', '3 caractères minimum');
    return;
  }
  
  if (username.length > 30) {
    setFieldError('username', '30 caractères maximum');
    return;
  }
  
  if (!usernameRegex.test(username)) {
    setFieldError('username', 'Lettres, chiffres, tirets ou underscores uniquement');
    return;
  }
  
  // Effacer l'erreur si tout est valide
  setFieldError('username', '');
}, 300);

// Vérification enrichie lors de la soumission
const onSubmit = handleSubmit(async (formValues) => {
  submissionAttempted.value = true;
  validatePassword();
  validateConfirmPassword();
  
  // Vérifier si des erreurs empêchent la soumission
  if (passwordErrors.value.length || confirmPasswordErrors.value.length) {
    notificationStore.error('Veuillez corriger les erreurs dans le formulaire', {
      duration: 5000
    });
    
    // Scroll automatique vers la première erreur si l'utilisateur n'a pas encore scrollé
    if (!userScrolled.value) {
      const firstErrorElement = document.querySelector('.text-spice-red');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    return;
  }

  // Préparer les données complètes du formulaire
  const payload = {
    ...formValues,
    password: password.value
  };

  // Tenter l'inscription avec feedback
  notificationStore.info('Création de votre compte en cours...', { 
    duration: 3000,
    id: 'signup-processing'
  });
  
  const success = await signupStore.initiateSignup(payload);
  
  // Réinitialiser le formulaire en cas de succès
  if (success) {
    resetForm();
    password.value = '';
    confirmPassword.value = '';
    submissionAttempted.value = false;
    formTouched.value = false;
  } else {
    // Scroll vers l'erreur globale
    const errorElement = document.querySelector('.bg-red-50');
    if (errorElement) {
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
});

// Observer les erreurs de l'API et les synchroniser avec vee-validate
watch(() => signupStore.fieldErrors, (newErrors) => {
  if (newErrors.email) {
    setFieldError('email', newErrors.email);
  }
  if (newErrors.username) {
    setFieldError('username', newErrors.username);
  }
}, { deep: true });

// Détecter le scroll utilisateur pour améliorer l'UX
onMounted(() => {
  window.addEventListener('scroll', () => {
    userScrolled.value = true;
  }, { once: true });
});

// Nettoyer le store lors du démontage du composant
onBeforeUnmount(() => {
  signupStore.resetState();
  window.removeEventListener('scroll', () => {
    userScrolled.value = true;
  });
});
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
          <form @submit="onSubmit" class="space-y-6" novalidate>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Username field with validation icon -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-spice-700 dark:text-spice-200 flex items-center gap-2">
                  <User size="16" class="text-spice-500" />
                  Nom d'utilisateur
                </label>
                <div class="relative">
                  <input
                    :value="values.username"
                    @input="(e) => { 
  const value = e.target.value;
  setFieldValue('username', value); // Mettre à jour la valeur AVANT la validation
  validateUsername(value);
}"
                    type="text"
                    class="input-spice pl-3 pr-10"
                    :class="{ 'border-spice-red': errors.username, 'border-spice-green': values.username && !errors.username }"
                    placeholder="Votre nom d'utilisateur"
                    autocomplete="username"
                  />
                  <!-- Validation icon -->
                  <div class="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircle v-if="values.username && !errors.username" size="20" class="text-spice-green" />
                    <AlertCircle v-if="errors.username" size="20" class="text-spice-red" />
                  </div>
                </div>
                <p v-if="errors.username" 
                   class="text-spice-red text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size="12" />
                  {{ errors.username }}
                </p>
              </div>

              <!-- Email field with validation icon -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-spice-700 dark:text-spice-200 flex items-center gap-2">
                  <Mail size="16" class="text-spice-500" />
                  Email
                </label>
                <div class="relative">
                  <input
                    :value="values.email"
@input="(e) => { 
  const value = e.target.value;
  setFieldValue('email', value); // Mettre à jour la valeur AVANT la validation
  validateEmail(value);
}"

                    type="email"
                    class="input-spice pl-3 pr-10"
                    :class="{ 'border-spice-red': errors.email, 'border-spice-green': values.email && !errors.email }"
                    placeholder="Votre email"
                    autocomplete="email"
                  />
                  <!-- Validation icon -->
                  <div class="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircle v-if="values.email && !errors.email" size="20" class="text-spice-green" />
                    <AlertCircle v-if="errors.email" size="20" class="text-spice-red" />
                  </div>
                </div>
                <p v-if="errors.email" 
                   class="text-spice-red text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size="12" />
                  {{ errors.email }}
                </p>
              </div>

              <!-- Password field with strength indicator -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-spice-700 dark:text-spice-200 flex items-center gap-2">
                  <Lock size="16" class="text-spice-500" />
                  Mot de passe
                </label>
                <div class="relative">
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    class="input-spice pl-3 pr-10"
                    :class="{ 'border-spice-red': passwordErrors.length > 0 && submissionAttempted, 
                              'border-spice-green': password && passwordErrors.length === 0 }"
                    placeholder="Votre mot de passe"
                    @input="validatePassword"
                    autocomplete="new-password"
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
                
                <!-- Indicateur de force du mot de passe -->
                <div v-if="password" class="mt-2">
                  <div class="flex items-center gap-2">
                    <div class="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        :class="passwordStrength.class" 
                        :style="`width: ${passwordStrength.value}%`" 
                        class="h-full transition-all duration-300"
                      ></div>
                    </div>
                    <span class="text-xs text-spice-600">{{ passwordStrength.label }}</span>
                  </div>
                </div>
                
                <!-- Affichage des exigences du mot de passe -->
                <div class="mt-2 space-y-1">
                  <p class="text-caption flex items-center gap-1" :class="{ 
                    'text-spice-green': password.length >= 8,
                    'text-spice-red': password.length < 8 && submissionAttempted,
                    'text-spice-600': !(password.length >= 8 || (password.length < 8 && submissionAttempted))
                  }">
                    <CheckCircle v-if="password.length >= 8" size="12" />
                    <AlertCircle v-if="password.length < 8 && submissionAttempted" size="12" />
                    8 caractères minimum
                  </p>
                  <p class="text-caption flex items-center gap-1" :class="{ 
                    'text-spice-green': /[A-Z]/.test(password),
                    'text-spice-red': !/[A-Z]/.test(password) && submissionAttempted,
                    'text-spice-600': !(/[A-Z]/.test(password) || (!/[A-Z]/.test(password) && submissionAttempted))
                  }">
                    <CheckCircle v-if="/[A-Z]/.test(password)" size="12" />
                    <AlertCircle v-if="!/[A-Z]/.test(password) && submissionAttempted" size="12" />
                    Au moins une majuscule
                  </p>
                  <p class="text-caption flex items-center gap-1" :class="{ 
                    'text-spice-green': /[0-9]/.test(password),
                    'text-spice-red': !/[0-9]/.test(password) && submissionAttempted,
                    'text-spice-600': !(/[0-9]/.test(password) || (!/[0-9]/.test(password) && submissionAttempted))
                  }">
                    <CheckCircle v-if="/[0-9]/.test(password)" size="12" />
                    <AlertCircle v-if="!/[0-9]/.test(password) && submissionAttempted" size="12" />
                    Au moins un chiffre
                  </p>
                  <p class="text-caption flex items-center gap-1" :class="{ 
                    'text-spice-green': /[!@#$%^&*()_+\-=\[\]{};':&quot;\\|,.<>\/?]/.test(password),
                    'text-spice-red': !/[!@#$%^&*()_+\-=\[\]{};':&quot;\\|,.<>\/?]/.test(password) && submissionAttempted,
                    'text-spice-600': !(/[!@#$%^&*()_+\-=\[\]{};':&quot;\\|,.<>\/?]/.test(password) || (!/[!@#$%^&*()_+\-=\[\]{};':&quot;\\|,.<>\/?]/.test(password) && submissionAttempted))
                  }">
                    <CheckCircle v-if="/[!@#$%^&*()_+\-=\[\]{};':&quot;\\|,.<>\/?]/.test(password)" size="12" />
                    <AlertCircle v-if="!/[!@#$%^&*()_+\-=\[\]{};':&quot;\\|,.<>\/?]/.test(password) && submissionAttempted" size="12" />
                    Au moins un caractère spécial
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
                    class="input-spice pl-3 pr-10"
                    :class="{ 
                      'border-spice-red': confirmPasswordErrors.length > 0 && submissionAttempted,
                      'border-spice-green': confirmPassword && confirmPassword === password && password
                    }"
                    placeholder="Confirmez votre mot de passe"
                    @input="validateConfirmPassword"
                    autocomplete="new-password"
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
                  
                  <!-- Icon de validation pour la confirmation -->
                  <div v-if="confirmPassword" class="absolute right-10 top-1/2 -translate-y-1/2">
                    <CheckCircle v-if="confirmPassword === password && password" size="20" class="text-spice-green" />
                    <AlertCircle v-else size="20" class="text-spice-red" />
                  </div>
                </div>
                <p v-if="confirmPasswordErrors.length && submissionAttempted" 
                   class="text-spice-red text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size="12" />
                  {{ confirmPasswordErrors[0] }}
                </p>
              </div>
            </div>

            <!-- Error message from store -->
            <div v-if="signupStore.error" class="p-4 bg-red-50 border border-red-200 rounded-lg mt-4">
              <p class="text-spice-red text-sm text-center flex items-center justify-center gap-2">
                <AlertCircle size="16" />
                {{ signupStore.error }}
              </p>
            </div>

            <!-- Submit Button with loading state -->
            <button
              type="submit"
              class="btn-spice w-full mt-8 py-4 text-lg font-medium transform hover:-translate-y-1 hover:shadow-bento-hover active:translate-y-0 transition-all duration-400 ease-bounce-soft"
              :disabled="signupStore.isLoading"
            >
              <span v-if="signupStore.isLoading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création en cours...
              </span>
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
                Liste de courses automatique
              </h3>
              <p class="text-spice-200">
                Générez votre liste de courses en fonction de vos menus
              </p>
            </div>
          </div>
        </div>

        <!-- App Store badges (optional) -->
        <div class="mt-auto pt-8">
          <p class="text-white text-center lg:text-left mb-4">
            Disponible sur tous vos appareils
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button class="btn-ghost-white">
              <span>Web App</span>
            </button>
            <button class="btn-ghost-white">
              <span>Mobile App</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>