<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useVuelidate } from '@vuelidate/core'
import { required, numeric, minValue } from '@vuelidate/validators'
import { HeartIcon } from '@heroicons/vue/24/solid'

const authStore = useAuthStore()
const themeStore = useThemeStore()

const formData = ref({
  firstName: authStore.user?.firstName || '',
  lastName: authStore.user?.lastName || '',
  household: {
    adults: authStore.user?.household?.adults || 1,
    childrenOver3: authStore.user?.household?.childrenOver3 || 0,
    childrenUnder3: authStore.user?.household?.childrenUnder3 || 0,
    babies: authStore.user?.household?.babies || 0
  },
  dietaryRestrictions: {
    pork: false,
    meat: false,
    allergies: [] as string[]
  },
  language: 'fr'
})

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

const availableLanguages = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' }
]

const rules = {
  firstName: { required },
  lastName: { required },
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
</script>

<template>
  <div class="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Card Profil -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Mon Profil</h2>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Prénom
              </label>
              <input
                id="firstName"
                v-model="formData.firstName"
                type="text"
                class="mt-1 block w-full rounded-xl shadow-sm"
                :class="inputError('firstName')"
              />
              <p v-if="v$.firstName.$error" class="mt-1 text-sm text-red-500">
                Le prénom est requis
              </p>
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom
              </label>
              <input
                id="lastName"
                v-model="formData.lastName"
                type="text"
                class="mt-1 block w-full rounded-xl shadow-sm"
                :class="inputError('lastName')"
              />
              <p v-if="v$.lastName.$error" class="mt-1 text-sm text-red-500">
                Le nom est requis
              </p>
            </div>
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
          <p
            v-if="authStore.user?.subscription?.expiresAt"
            class="text-sm text-mocha-600 dark:text-gray-300 mt-2"
          >
            Expire le {{ new Date(authStore.user.subscription.expiresAt).toLocaleDateString() }}
          </p>
          <router-link
            to="/subscription"
            class="mt-4 inline-block px-6 py-2 bg-mocha-600 text-white rounded-xl hover:bg-mocha-700 transition-colors duration-300"
          >
            {{
              authStore.user?.subscription?.plan
                ? 'Gérer mon abonnement'
                : 'Découvrir nos abonnements'
            }}
          </router-link>
        </div>
      </div>

      <!-- Card Composition du foyer -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Composition du foyer</h3>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="(value, key) in formData.household" :key="key">
            <label :for="key" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{
                key === 'adults'
                  ? 'Adultes'
                  : key === 'childrenOver3'
                  ? 'Enfants > 3 ans'
                  : key === 'childrenUnder3'
                  ? 'Enfants < 3 ans'
                  : 'Bébés'
              }}
            </label>
            <input
              :id="key"
              v-model.number="formData.household[key]"
              type="number"
              :min="key === 'adults' ? 1 : 0"
              class="mt-1 block w-full rounded-xl shadow-sm"
              :class="inputError(`household.${key}`)"
            />
          </div>
        </div>
      </div>

      <!-- Card Restrictions alimentaires -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Restrictions alimentaires</h3>
        <div class="space-y-4">
          <div class="flex items-center space-x-6">
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="formData.dietaryRestrictions.pork"
                class="rounded-lg text-mocha-600 focus:ring-mocha-500"
              />
              <span class="ml-2 text-gray-700 dark:text-gray-300">Pas de porc</span>
            </label>
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="formData.dietaryRestrictions.meat"
                class="rounded-lg text-mocha-600 focus:ring-mocha-500"
              />
              <span class="ml-2 text-gray-700 dark:text-gray-300">Végétarien</span>
            </label>
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
        </div>
      </div>

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
