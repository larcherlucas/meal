<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserPreferencesStore } from '@/stores/userPreferences'
import { useFavoriteStore } from '@/stores/favoriteStore' 
import { useThemeStore } from '@/stores/theme'
import { useMenuStore } from '@/stores/menuStore' // Ajout du store de menu
import { useNotificationStore } from '@/stores/NotificationStore'
import { useVuelidate } from '@vuelidate/core'
import { required, numeric, minValue } from '@vuelidate/validators'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { 
  HeartIcon,
  UserIcon,
  UserGroupIcon,
  UsersIcon,
  FaceSmileIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon, // Icône pour synchronisation
  CheckCircleIcon, // Icône pour succès
  XCircleIcon // Icône pour erreur
} from '@heroicons/vue/24/solid'

// Router
const router = useRouter()

// Stores
const authStore = useAuthStore()
const userPreferencesStore = useUserPreferencesStore()
const favoriteStore = useFavoriteStore()
const themeStore = useThemeStore()
const menuStore = useMenuStore()
const notificationStore = useNotificationStore()

// Données réactives
const formData = ref({
  username: '',
  household: {
    adults: 1,
    childrenOver3: 0,
    childrenUnder3: 0,
    babies: 0
  },
  foodPreferences: {
    liked: [] as string[],
    disliked: [] as string[]
  },
  dietaryRestrictions: {
    pork: false,
    meat: false,
    halal: false,
    noSugar: false,
    noPeanuts: false,
    noNuts: false,
    noEggs: false,
    noSoy: false, 
    noShellfish: false,
    allergies: [] as string[]
  },
  language: 'fr'
})

// Variables pour le suivi des changements
const initialFormData = ref({})
const hasUnsavedChanges = ref(false)

const isPreferencesModalOpen = ref(false)
const isConfirmModalOpen = ref(false) // Modal de confirmation pour la sauvegarde
const allergyInput = ref<HTMLInputElement | null>(null)
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Informations d'abonnement
const subscriptionPlan = computed(() => {
  return authStore.user?.subscription?.plan || 'Gratuit'
})

const hasActiveSubscription = computed(() => {
  return !!authStore.user?.subscription?.isActive
})

const subscriptionStartDate = computed(() => {
  return authStore.user?.subscription?.startDate || ''
})

const subscriptionExpiryDate = computed(() => {
  return authStore.user?.subscription?.expiresAt || ''
})

// Options de préférences alimentaires
const availableFoods = computed(() => userPreferencesStore.availableFoods)

const availableLanguages = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' }
]

// Options de restrictions alimentaires
const dietaryOptions = [
  { key: 'meat', label: 'Végétarien 🌱', description: 'Exclut la viande et le poisson' },
  { key: 'halal', label: 'Halal 🐖', description: 'Suit les règles alimentaires islamiques' },
  { key: 'noSugar', label: 'Sans sucre 🍬', description: 'Exclut les sucres ajoutés' },
  { key: 'noPeanuts', label: 'Sans arachides 🥜', description: 'Pour éviter les allergies aux cacahuètes' },
  { key: 'noNuts', label: 'Sans fruits à coque 🌰', description: 'Exclut les amandes, noix, noisettes, etc.' },
  { key: 'noEggs', label: 'Sans œufs 🥚', description: 'Exclut les œufs et produits dérivés' },
  { key: 'noSoy', label: 'Sans soja 🌱', description: 'Exclut le soja et ses dérivés' },
  { key: 'noShellfish', label: 'Sans crustacés 🦐', description: 'Pour éviter les allergies aux fruits de mer' }
]

// Règles de validation
const rules = {
  username: { required },
  household: {
    adults: { required, numeric, minValue: minValue(1) },
    childrenOver3: { required, numeric, minValue: minValue(0) },
    childrenUnder3: { required, numeric, minValue: minValue(0) },
    babies: { required, numeric, minValue: minValue(0) }
  }
}

const v$ = useVuelidate(rules, formData)

// Surveiller les changements dans le formulaire
watch(formData, () => {
  if (Object.keys(initialFormData.value).length > 0) {
    // Comparer avec l'état initial pour détecter les changements
    const initialJSON = JSON.stringify(initialFormData.value)
    const currentJSON = JSON.stringify(formData.value)
    hasUnsavedChanges.value = initialJSON !== currentJSON
  }
}, { deep: true })

// Sauvegarder l'état initial des données du formulaire
const saveInitialState = () => {
  initialFormData.value = JSON.parse(JSON.stringify(formData.value))
  hasUnsavedChanges.value = false
}

// Initialisation
onMounted(async () => {
  isLoading.value = true
  
  try {
    // Initialiser les stores
    await Promise.all([
      userPreferencesStore.fetchUserProfile(),
      favoriteStore.fetchFavorites(),
      menuStore.fetchActiveMenu() // Charger aussi le menu actif
    ])
    
    // Remplir le formulaire avec les données du profil
    if (userPreferencesStore.isInitialized) {
      updateFormFromStore()
    } else {
      // Fallback sur les données auth store si nécessaire
      userPreferencesStore.initFromAuthStore()
      updateFormFromStore()
    }
    
    // Sauvegarder l'état initial pour détecter les modifications futures
    saveInitialState()
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du profil:', error)
    errorMessage.value = 'Erreur lors du chargement de votre profil'
  } finally {
    isLoading.value = false
  }
})

// Gestion de la navigation - prévenir la perte de données
const confirmLeave = (e: BeforeUnloadEvent) => {
  if (hasUnsavedChanges.value) {
    e.preventDefault()
    e.returnValue = ''
    return ''
  }
}

// Ajouter un écouteur pour éviter de perdre des changements non sauvegardés
onMounted(() => {
  window.addEventListener('beforeunload', confirmLeave)
})

// Nettoyage lors de la destruction du composant
onUnmounted(() => {
  window.removeEventListener('beforeunload', confirmLeave)
})

// Copier les données du store vers le formulaire
function updateFormFromStore() {
  const profile = userPreferencesStore.userProfile
  
  formData.value = {
    username: profile.username || authStore.user?.username || '',
    household: { ...profile.household },
    foodPreferences: {
      liked: [...profile.foodPreferences.liked],
      disliked: [...profile.foodPreferences.disliked]
    },
    dietaryRestrictions: {
      ...profile.dietaryRestrictions,
      allergies: [...profile.dietaryRestrictions.allergies]
    },
    language: profile.language
  }
}

// Utilitaires
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('fr-FR');
}

const calculateRenewalDate = (startDateString: string) => {
  if (!startDateString) return '';
  const startDate = new Date(startDateString);
  const renewalDate = new Date(startDate);
  renewalDate.setFullYear(startDate.getFullYear() + 1);
  return formatDate(renewalDate.toISOString());
}

const formatCookingTime = (prepTime?: number, cookTime?: number) => {
  if (!prepTime && !cookTime) return 'N/A';
  
  const totalTime = (prepTime || 0) + (cookTime || 0);
  if (totalTime < 60) {
    return `${totalTime} min`;
  }
  
  const hours = Math.floor(totalTime / 60);
  const minutes = totalTime % 60;
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h${minutes.toString().padStart(2, '0')}`;
}

// Fonction utilitaire pour gérer les classes d'erreur
const inputError = (fieldPath: string) => {
  const segments = fieldPath.split('.')
  let field: any = v$.value
  for (const seg of segments) {
    field = field[seg]
    if (!field) break
  }
  return field && field.$error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-200 focus:border-mocha-500 focus:ring-mocha-500'
}

// Gestion des préférences alimentaires
const toggleFoodPreference = (food: string, preference: 'liked' | 'disliked') => {
  // Si déjà dans la liste opposée, le retirer
  const oppositePreference = preference === 'liked' ? 'disliked' : 'liked';
  if (formData.value.foodPreferences[oppositePreference].includes(food)) {
    formData.value.foodPreferences[oppositePreference] = 
      formData.value.foodPreferences[oppositePreference].filter(item => item !== food);
  }
  
  // Vérifier si l'aliment est déjà dans la liste sélectionnée
  const list = formData.value.foodPreferences[preference];
  const index = list.indexOf(food);
  
  // Si déjà dans la liste, le retirer, sinon l'ajouter
  if (index !== -1) {
    list.splice(index, 1);
  } else {
    list.push(food);
  }
}

const getPreferenceStatus = (food: string): 'liked' | 'disliked' | null => {
  if (formData.value.foodPreferences.liked.includes(food)) return 'liked';
  if (formData.value.foodPreferences.disliked.includes(food)) return 'disliked';
  return null;
}

const openPreferencesModal = () => {
  isPreferencesModalOpen.value = true;
}

// Gestion des allergies
const addAllergy = (event: KeyboardEvent) => {
  event.preventDefault();
  const input = allergyInput.value as HTMLInputElement;
  const value = input.value.trim();
  
  if (value && !formData.value.dietaryRestrictions.allergies.includes(value)) {
    formData.value.dietaryRestrictions.allergies.push(value);
    input.value = '';
  }
}

const removeAllergy = (allergy: string) => {
  formData.value.dietaryRestrictions.allergies = 
    formData.value.dietaryRestrictions.allergies.filter(a => a !== allergy);
}

// Gestion des favoris
const removeFavoriteRecipe = async (recipeId: number) => {
  try {
    await favoriteStore.removeFromFavorites(recipeId);
  } catch (error) {
    console.error('Erreur lors de la suppression du favori:', error);
  }
}

// Ouvrir la modal de confirmation
const openConfirmationModal = async () => {
  // Valider le formulaire
  const isValid = await v$.value.$validate();
  if (!isValid) {
    errorMessage.value = 'Veuillez corriger les erreurs dans le formulaire';
    
    // Afficher une notification d'erreur
    notificationStore.error(
      'Erreurs dans le formulaire',
      'Veuillez corriger les erreurs avant de sauvegarder'
    );
    
    return;
  }
  
  // Si des modifications ont été apportées, afficher la modale de confirmation
  if (hasUnsavedChanges.value) {
    isConfirmModalOpen.value = true;
  } else {
    // Si aucune modification, notifier l'utilisateur
    notificationStore.info(
      'Aucune modification',
      'Aucune modification n\'a été détectée dans votre profil'
    );
  }
}

// Fermer la modal de confirmation
const closeConfirmationModal = () => {
  isConfirmModalOpen.value = false;
}

// Soumission du formulaire - sauvegarde globale pour toutes les sections du profil
const handleSubmit = async () => {
  closeConfirmationModal(); // Fermer la modal
  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    // 1. Mettre à jour le profil dans le store de préférences utilisateur
    userPreferencesStore.userProfile = {
      ...userPreferencesStore.userProfile,
      username: formData.value.username,
      household: { ...formData.value.household },
      foodPreferences: {
        liked: [...formData.value.foodPreferences.liked],
        disliked: [...formData.value.foodPreferences.disliked]
      },
      dietaryRestrictions: {
        ...formData.value.dietaryRestrictions,
        allergies: [...formData.value.dietaryRestrictions.allergies]
      },
      language: formData.value.language,
      theme: themeStore.isDark ? 'dark' : 'light'
    };
    
    // 2. Sauvegarder via l'API
    const success = await userPreferencesStore.saveUserProfile();
    
    if (success) {
      successMessage.value = 'Profil mis à jour avec succès';
      
      // 3. Mettre à jour le profil dans le store auth pour synchronisation
      if (authStore.user) {
        await authStore.updateProfile({
          username: formData.value.username,
          household_members: {
            adults: formData.value.household.adults,
            children_over_3: formData.value.household.childrenOver3,
            children_under_3: formData.value.household.childrenUnder3,
            babies: formData.value.household.babies
          },
          preferences: {
            language: formData.value.language,
            theme: themeStore.isDark ? 'dark' : 'light',
            food_preferences: {
              liked: formData.value.foodPreferences.liked,
              disliked: formData.value.foodPreferences.disliked
            }
          }
        });
      }
      
      // 4. Mettre à jour l'état initial après sauvegarde réussie
      saveInitialState();
      
      // 5. Synchroniser avec le store des menus pour les suggestions personnalisées
      try {
        await menuStore.fetchActiveMenu();
      } catch (menuError) {
        console.warn('Erreur lors de la synchronisation du menu:', menuError);
      }
      
      // 6. Afficher notification de succès
      notificationStore.success(
        'Modifications enregistrées',
        'Toutes vos préférences ont été mises à jour avec succès'
      );
      
      // 7. Rediriger vers la page d'accueil après une mise à jour réussie
      setTimeout(() => {
        router.push('/home');
      }, 2000);
    } else {
      errorMessage.value = 'Erreur lors de la mise à jour du profil';
      notificationStore.error(
        'Erreur de sauvegarde',
        'Une erreur est survenue lors de la mise à jour de votre profil'
      );
    }
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    errorMessage.value = error.message || 'Erreur lors de la mise à jour du profil';
    notificationStore.error(
      'Erreur',
      errorMessage.value
    );
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
    <!-- Bouton de sauvegarde global flottant -->
    <div class="fixed bottom-6 right-6 z-10">
      <button
        @click="openConfirmationModal"
        :disabled="isLoading"
        class="flex items-center justify-center py-3 px-6 rounded-full text-white shadow-lg"
        :class="[
          hasUnsavedChanges 
            ? 'bg-gradient-to-r from-mocha-600 to-mocha-700 hover:from-mocha-700 hover:to-mocha-800' 
            : 'bg-gray-400'
        ]"
      >
        <span v-if="isLoading" class="mr-2">
          <!-- Icône de chargement -->
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
        <span v-else-if="hasUnsavedChanges" class="mr-2">
          <ArrowPathIcon class="h-5 w-5" />
        </span>
        {{ isLoading ? 'Enregistrement...' : (hasUnsavedChanges ? 'Enregistrer les modifications' : 'Aucune modification') }}
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Card Profil -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Mon Profil</h2>
        <form class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nom d'utilisateur
            </label>
            <input
              id="username"
              v-model="formData.username"
              type="text"
              class="mt-1 block w-full rounded-xl shadow-sm"
              :class="inputError('username')"
            />
            <p v-if="v$.username.$error" class="mt-1 text-sm text-red-500">
              Le nom d'utilisateur est requis
            </p>
          </div>
          <!-- Afficher les messages de succès/erreur -->
          <div class="text-center" v-if="successMessage || errorMessage">
            <p v-if="successMessage" class="text-green-600 text-sm">{{ successMessage }}</p>
            <p v-if="errorMessage" class="text-red-600 text-sm">{{ errorMessage }}</p>
          </div>
        </form>
      </div>

      <!-- Card Abonnement -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Mon abonnement</h3>
        <div class="p-4 rounded-xl bg-gradient-to-br from-mocha-50 to-mocha-100 dark:from-gray-700 dark:to-gray-600">
          <p class="font-semibold text-mocha-800 dark:text-white">
            {{ subscriptionPlan }}
          </p>
          
          <!-- Affichage des informations d'abonnement payant -->
          <div v-if="hasActiveSubscription" class="mt-3 space-y-2">
            <p class="text-sm text-mocha-600 dark:text-gray-300 flex justify-between">
              <span>Date de début:</span>
              <span class="font-medium">{{ formatDate(subscriptionStartDate) }}</span>
            </p>
            <p class="text-sm text-mocha-600 dark:text-gray-300 flex justify-between">
              <span>Prochain renouvellement:</span>
              <span class="font-medium">{{ calculateRenewalDate(subscriptionStartDate) }}</span>
            </p>
            <p v-if="subscriptionExpiryDate" class="text-sm text-mocha-600 dark:text-gray-300 flex justify-between">
              <span>Expire le:</span>
              <span class="font-medium">{{ formatDate(subscriptionExpiryDate) }}</span>
            </p>
          </div>
          
          <router-link
            to="/subscription"
            class="mt-4 inline-block px-6 py-2 bg-mocha-600 text-white rounded-xl hover:bg-mocha-700 transition-colors duration-300"
          >
            {{ hasActiveSubscription ? 'Gérer mon abonnement' : 'Découvrir nos abonnements' }}
          </router-link>
        </div>
      </div>

      <!-- Card Composition du foyer -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Composition du foyer</h3>
        <div class="grid grid-cols-2 gap-4">
          <!-- Adultes -->
          <div class="col-span-2 md:col-span-1">
            <label for="adults" class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <UserGroupIcon class="w-5 h-5 mr-2 text-mocha-600 dark:text-mocha-400" />
              Adultes
            </label>
            <input
              id="adults"
              v-model.number="formData.household.adults"
              type="number"
              min="1"
              class="mt-1 block w-full rounded-xl shadow-sm"
              :class="inputError('household.adults')"
            />
          </div>
          
          <!-- Enfants > 3 ans -->
          <div class="col-span-2 md:col-span-1">
            <label for="childrenOver3" class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <UsersIcon class="w-5 h-5 mr-2 text-mocha-600 dark:text-mocha-400" />
              Enfants > 3 ans
            </label>
            <input
              id="childrenOver3"
              v-model.number="formData.household.childrenOver3"
              type="number"
              min="0"
              class="mt-1 block w-full rounded-xl shadow-sm"
              :class="inputError('household.childrenOver3')"
            />
          </div>
          
          <!-- Enfants < 3 ans -->
          <div class="col-span-2 md:col-span-1">
            <label for="childrenUnder3" class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <UserIcon class="w-5 h-5 mr-2 text-mocha-600 dark:text-mocha-400" />
              Enfants < 3 ans
            </label>
            <input
              id="childrenUnder3"
              v-model.number="formData.household.childrenUnder3"
              type="number"
              min="0"
              class="mt-1 block w-full rounded-xl shadow-sm"
              :class="inputError('household.childrenUnder3')"
            />
          </div>
          
          <!-- Bébés -->
          <div class="col-span-2 md:col-span-1">
            <label for="babies" class="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FaceSmileIcon class="w-5 h-5 mr-2 text-mocha-600 dark:text-mocha-400" />
              Bébés
            </label>
            <input
              id="babies"
              v-model.number="formData.household.babies"
              type="number"
              min="0"
              class="mt-1 block w-full rounded-xl shadow-sm"
              :class="inputError('household.babies')"
            />
          </div>
        </div>
      </div>
      
      <!-- Card Restrictions alimentaires -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Restrictions alimentaires</h3>
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div 
              v-for="option in dietaryOptions" 
              :key="option.key" 
              class="flex items-start"
            >
              <div class="flex items-center h-5">
                <input
                  :id="option.key"
                  type="checkbox"
                  v-model="formData.dietaryRestrictions[option.key]"
                  class="rounded-lg text-mocha-600 focus:ring-mocha-500"
                />
              </div>
              <div class="ml-3 text-sm">
                <label :for="option.key" class="font-medium text-gray-700 dark:text-gray-300">
                  {{ option.label }}
                </label>
                <p class="text-gray-500 dark:text-gray-400 text-xs mt-1">{{ option.description }}</p>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Allergies
            </label>
            <input
              type="text"
              placeholder="Ajouter une allergie"
              class="block w-full rounded-xl border-gray-200 shadow-sm focus:border-mocha-500 focus:ring-mocha-500 dark:bg-gray-700 dark:border-gray-600"
              ref="allergyInput"
              @keydown.enter="addAllergy"
            />
            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="allergy in formData.dietaryRestrictions.allergies"
                :key="allergy"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-mocha-100 text-mocha-800 dark:bg-gray-700 dark:text-gray-200"
              >
                {{ allergy }}
                <button
                  type="button"
                  class="ml-1.5 text-mocha-600 hover:text-mocha-800 dark:text-gray-400 dark:hover:text-gray-200"
                  @click="removeAllergy(allergy)"
                >
                  ×
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card Préférences -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Préférences</h3>
        <div class="space-y-4">
          <!-- Thème -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thème
            </label>
            <button
              type="button"
              @click="themeStore.toggleTheme"
              class="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
            >
              {{ themeStore.isDark ? 'Mode clair' : 'Mode sombre' }}
            </button>
          </div>
          
          <!-- Langue -->
          <div>
            <label for="language" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Langue
            </label>
            <select
              id="language"
              v-model="formData.language"
              class="block w-full rounded-xl border-gray-200 shadow-sm focus:border-mocha-500 focus:ring-mocha-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option
                v-for="lang in availableLanguages"
                :key="lang.code"
                :value="lang.code"
              >
                {{ lang.name }}
              </option>
            </select>
          </div>
          
          <!-- Préférences alimentaires -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Préférences alimentaires
              </label>
              <button 
                type="button"
                @click="openPreferencesModal"
                class="text-sm text-mocha-600 hover:text-mocha-800 dark:text-mocha-400 dark:hover:text-mocha-300"
              >
                Modifier
              </button>
            </div>
            
            <div class="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div>
                <h4 class="text-sm font-medium text-green-600 dark:text-green-400 mb-2">J'aime</h4>
                <ul class="space-y-1">
                  <li 
                    v-for="food in formData.foodPreferences.liked.slice(0, 3)" 
                    :key="food"
                    class="text-sm text-gray-700 dark:text-gray-300 flex items-center"
                  >
                    <span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {{ food }}
                  </li>
                  <li v-if="formData.foodPreferences.liked.length === 0" class="text-sm text-gray-500 italic">
                    Aucun aliment sélectionné
                  </li>
                </ul>
              </div>
              <div>
                <h4 class="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Je n'aime pas</h4>
                <ul class="space-y-1">
                  <li 
                    v-for="food in formData.foodPreferences.disliked.slice(0, 3)" 
                    :key="food"
                    class="text-sm text-gray-700 dark:text-gray-300 flex items-center"
                  >
                    <span class="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    {{ food }}
                  </li>
                  <li v-if="formData.foodPreferences.disliked.length === 0" class="text-sm text-gray-500 italic">
                    Aucun aliment sélectionné
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Modale de préférences alimentaires -->
      <TransitionRoot as="template" :show="isPreferencesModalOpen">
        <Dialog as="div" class="relative z-10" @close="isPreferencesModalOpen = false">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="ease-in duration-200"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </TransitionChild>

          <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <TransitionChild
                as="template"
                enter="ease-out duration-300"
                enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enter-to="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leave-from="opacity-100 translate-y-0 sm:scale-100"
                leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <DialogPanel class="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div class="absolute right-0 top-0 pr-4 pt-4">
                    <button
                      type="button"
                      class="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 focus:outline-none"
                      @click="isPreferencesModalOpen = false"
                    >
                      <span class="sr-only">Fermer</span>
                      <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div>
                    <DialogTitle as="h3" class="text-xl font-semibold leading-6 text-gray-900 dark:text-white mb-4">
                      Préférences alimentaires
                    </DialogTitle>
                    <div class="mt-2">
                      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Sélectionnez les aliments que vous aimez et ceux que vous n'aimez pas pour personnaliser vos recettes.
                      </p>
                      
                      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 max-h-96 overflow-y-auto p-2">
                        <div 
                          v-for="food in availableFoods" 
                          :key="food"
                          class="border border-gray-200 dark:border-gray-600 rounded-lg p-3 flex flex-col"
                        >
                          <span class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ food }}</span>
                          <div class="flex space-x-2 mt-auto">
                            <button
                              type="button"
                              @click="toggleFoodPreference(food, 'liked')"
                              class="flex-1 py-1 px-2 text-xs rounded-md flex items-center justify-center"
                              :class="[
                                getPreferenceStatus(food) === 'liked'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30'
                              ]"
                            >
                              J'aime
                            </button>
                            <button
                              type="button"
                              @click="toggleFoodPreference(food, 'disliked')"
                              class="flex-1 py-1 px-2 text-xs rounded-md flex items-center justify-center"
                              :class="[
                                getPreferenceStatus(food) === 'disliked'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30'
                              ]"
                            >
                              Je n'aime pas
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="mt-6 flex justify-end">
                    <button
                      type="button"
                      class="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-mocha-600 to-mocha-700 hover:from-mocha-700 hover:to-mocha-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mocha-500 transition-all duration-300"
                      @click="isPreferencesModalOpen = false"
                    >
                      Confirmer
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>

      <!-- Modal de confirmation pour la sauvegarde -->
      <TransitionRoot as="template" :show="isConfirmModalOpen">
        <Dialog as="div" class="relative z-10" @close="closeConfirmationModal">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="ease-in duration-200"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </TransitionChild>

          <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <TransitionChild
                as="template"
                enter="ease-out duration-300"
                enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enter-to="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leave-from="opacity-100 translate-y-0 sm:scale-100"
                leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <DialogPanel class="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div class="sm:flex sm:items-start">
                    <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon class="h-6 w-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    </div>
                    <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <DialogTitle as="h3" class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                        Confirmation de modification
                      </DialogTitle>
                      <div class="mt-2">
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                          Êtes-vous sûr de vouloir enregistrer toutes les modifications apportées à votre profil ?
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      class="inline-flex w-full justify-center rounded-md bg-mocha-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-mocha-700 sm:ml-3 sm:w-auto"
                      @click="handleSubmit"
                    >
                      Confirmer
                    </button>
                    <button
                      type="button"
                      class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      @click="closeConfirmationModal"
                    >
                      Annuler
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>

      <!-- Card Recettes favorites -->
      <div class="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Mes recettes favorites</h3>
          <div v-if="favoriteStore.isLoading" class="animate-spin h-5 w-5 text-mocha-600"></div>
        </div>
        
        <div v-if="favoriteStore.hasFavorites" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="favorite in favoriteStore.favoritesDetails"
            :key="favorite.recipe_id"
            class="flex items-center space-x-4 p-3 rounded-xl hover:bg-mocha-50 dark:hover:bg-gray-700 transition-colors duration-300"
          >
            <img
              :src="favorite.recipe?.image_url || '/images/placeholder-recipe.jpg'"
              :alt="favorite.recipe?.title"
              class="w-24 h-24 object-cover rounded-xl"
            />
            <div class="flex-1">
              <h4 class="font-medium text-gray-900 dark:text-white">
                {{ favorite.recipe?.title || 'Recette' }}
              </h4>
              <div class="flex items-center text-sm text-gray-600 dark:text-gray-300 space-x-2 mt-1">
                <span>{{ favorite.recipe?.difficulty_level || 'Facile' }}</span>
                <span>•</span>
                <span>{{ formatCookingTime(favorite.recipe?.prep_time, favorite.recipe?.cook_time) }}</span>
              </div>
            </div>
            <button
              @click="removeFavoriteRecipe(favorite.recipe_id)"
              class="p-2 text-mocha-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500"
            >
              <HeartIcon class="h-6 w-6" />
            </button>
          </div>
        </div>

        <!-- État vide -->
        <div v-else-if="!favoriteStore.isLoading" class="text-center py-10">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucune recette favorite</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Ajoutez des recettes à vos favoris pour les retrouver ici.
          </p>
          <div class="mt-6">
            <router-link
              to="/recipes"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-mocha-600 hover:bg-mocha-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mocha-500"
            >
              Explorer les recettes
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>