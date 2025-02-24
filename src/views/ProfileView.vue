<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useVuelidate } from '@vuelidate/core'
import { required, numeric, minValue } from '@vuelidate/validators'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { 
  HeartIcon,
  UserIcon,
  UserGroupIcon,
  UsersIcon,
  FaceSmileIcon,
} from '@heroicons/vue/24/solid'

const authStore = useAuthStore()
const themeStore = useThemeStore()

const formData = ref({
  username: authStore.user?.username || '',
  household: {
    adults: authStore.user?.household?.adults || 1,
    childrenOver3: authStore.user?.household?.childrenOver3 || 0,
    childrenUnder3: authStore.user?.household?.childrenUnder3 || 0,
    babies: authStore.user?.household?.babies || 0
  },
  foodPreferences: {
    liked: authStore.user?.foodPreferences?.liked || ['Tomates', 'Poulet', 'Riz'],
    disliked: authStore.user?.foodPreferences?.disliked || ['Aubergine', 'Foie', 'Chou-fleur']
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

// Format date for subscription display
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('fr-FR');
}

// Calculate renewal date (1 year after start date)
const calculateRenewalDate = (startDateString: string) => {
  if (!startDateString) return '';
  const startDate = new Date(startDateString);
  const renewalDate = new Date(startDate);
  renewalDate.setFullYear(startDate.getFullYear() + 1);
  return formatDate(renewalDate.toISOString());
}

const favoriteRecipes = ref([
  {
    id: 1,
    title: 'Cuisses de dinde à la moutarde',
    image: '/images/dinde-moutarde.jpg',
    difficulty: 'Facile',
    time: '1h15'
  },
  // Vous pouvez ajouter d'autres recettes ici...
])
const isPreferencesModalOpen = ref(false)
const availableFoods = ref([
  'Tomates', 'Carottes', 'Poivrons', 'Courgettes', 'Aubergine', 'Chou-fleur',
  'Brocoli', 'Épinards', 'Laitue', 'Concombre', 'Pommes de terre', 'Champignons',
  'Poulet', 'Bœuf', 'Porc', 'Agneau', 'Dinde', 'Canard', 'Poisson', 'Fruits de mer',
  'Riz', 'Pâtes', 'Quinoa', 'Lentilles', 'Pois chiches', 'Haricots',
  'Fromage', 'Yaourt', 'Lait', 'Beurre', 'Crème', 'Oeufs', 'Foie'
])

const availableLanguages = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' }
]

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

const successMessage = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

// Restricted diet options with icons
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

const handleSubmit = async () => {
  const isValid = await v$.value.$validate()
  if (!isValid) {
    errorMessage.value = 'Veuillez corriger les erreurs dans le formulaire'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await authStore.updateProfile(formData.value)
    successMessage.value = 'Profil mis à jour avec succès'
  } catch (error) {
    errorMessage.value = 'Erreur lors de la mise à jour du profil'
  } finally {
    isLoading.value = false
  }
}

// Fonction utilitaire pour gérer les classes d'erreur (compatible avec les champs imbriqués)
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

const removeFavorite = (recipeId: number) => {
  favoriteRecipes.value = favoriteRecipes.value.filter(recipe => recipe.id !== recipeId)
}

const addAllergy = (event: KeyboardEvent) => {
  event.preventDefault()
  const input = event.target as HTMLInputElement
  const value = input.value.trim()
  if (value && !formData.value.dietaryRestrictions.allergies.includes(value)) {
    formData.value.dietaryRestrictions.allergies.push(value)
    input.value = ''
  }
}
const openPreferencesModal = () => {
  isPreferencesModalOpen.value = true
}

const toggleFoodPreference = (food: string, preference: 'liked' | 'disliked') => {
  // Si déjà dans la liste opposée, le retirer
  if (preference === 'liked' && formData.value.foodPreferences.disliked.includes(food)) {
    formData.value.foodPreferences.disliked = formData.value.foodPreferences.disliked.filter(item => item !== food)
  } else if (preference === 'disliked' && formData.value.foodPreferences.liked.includes(food)) {
    formData.value.foodPreferences.liked = formData.value.foodPreferences.liked.filter(item => item !== food)
  }
  
  // Vérifier si l'aliment est déjà dans la liste sélectionnée
  const list = formData.value.foodPreferences[preference]
  const index = list.indexOf(food)
  
  // Si déjà dans la liste, le retirer, sinon l'ajouter
  if (index !== -1) {
    list.splice(index, 1)
  } else {
    list.push(food)
  }
}

const getPreferenceStatus = (food: string): 'liked' | 'disliked' | null => {
  if (formData.value.foodPreferences.liked.includes(food)) return 'liked'
  if (formData.value.foodPreferences.disliked.includes(food)) return 'disliked'
  return null
}
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Card Profil -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Mon Profil</h2>
        <form @submit.prevent="handleSubmit" class="space-y-6">
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
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-mocha-600 to-mocha-700 hover:from-mocha-700 hover:to-mocha-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mocha-500 disabled:opacity-50 transition-all duration-300"
          >
            {{ isLoading ? 'Mise à jour...' : 'Mettre à jour le profil' }}
          </button>
          <div class="text-center">
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
            {{ authStore.user?.subscription?.plan || 'Gratuit' }}
          </p>
          
          <!-- Affichage des informations d'abonnement payant -->
          <div v-if="authStore.user?.subscription?.plan && authStore.user.subscription.plan !== 'Gratuit'" class="mt-3 space-y-2">
            <p class="text-sm text-mocha-600 dark:text-gray-300 flex justify-between">
              <span>Date de début:</span>
              <span class="font-medium">{{ formatDate(authStore.user.subscription.startDate) }}</span>
            </p>
            <p class="text-sm text-mocha-600 dark:text-gray-300 flex justify-between">
              <span>Prochain renouvellement:</span>
              <span class="font-medium">{{ calculateRenewalDate(authStore.user.subscription.startDate) }}</span>
            </p>
            <p v-if="authStore.user.subscription.expiresAt" class="text-sm text-mocha-600 dark:text-gray-300 flex justify-between">
              <span>Expire le:</span>
              <span class="font-medium">{{ formatDate(authStore.user.subscription.expiresAt) }}</span>
            </p>
          </div>
          
          <router-link
            to="/subscription"
            class="mt-4 inline-block px-6 py-2 bg-mocha-600 text-white rounded-xl hover:bg-mocha-700 transition-colors duration-300"
          >
            {{
              authStore.user?.subscription?.plan && authStore.user.subscription.plan !== 'Gratuit'
                ? 'Gérer mon abonnement'
                : 'Découvrir nos abonnements'
            }}
          </router-link>
        </div>
      </div>

      <!-- Le reste du composant reste inchangé -->
      <!-- Card Composition du foyer -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <!-- Contenu inchangé -->
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
                  @click="formData.dietaryRestrictions.allergies = formData.dietaryRestrictions.allergies.filter(a => a !== allergy)"
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
      <!-- <div>
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
      </div> -->
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
      
      <!-- Nouvelle section préférences alimentaires -->
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

      <!-- Card Recettes favorites -->
      <div class="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Mes recettes favorites</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="recipe in favoriteRecipes"
            :key="recipe.id"
            class="flex items-center space-x-4 p-3 rounded-xl hover:bg-mocha-50 dark:hover:bg-gray-700 transition-colors duration-300"
          >
            <img
              :src="recipe.image"
              :alt="recipe.title"
              class="w-24 h-24 object-cover rounded-xl"
            />
            <div class="flex-1">
              <h4 class="font-medium text-gray-900 dark:text-white">{{ recipe.title }}</h4>
              <div class="flex items-center text-sm text-gray-600 dark:text-gray-300 space-x-2 mt-1">
                <span>{{ recipe.difficulty }}</span>
                <span>•</span>
                <span>{{ recipe.time }}</span>
              </div>
            </div>
            <button
              @click="removeFavorite(recipe.id)"
              class="p-2 text-mocha-600 hover:text-mocha-800 dark:text-gray-400 dark:hover:text-red-500"
            >
              <HeartIcon class="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>