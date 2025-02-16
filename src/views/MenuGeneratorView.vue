<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import axios from 'axios'

const authStore = useAuthStore()
const router = useRouter()

const generationType = ref('week') // 'week' or 'month'
const preferences = ref({
  excludeIngredients: [],
  dietaryRestrictions: [],
  mealTypes: {
    breakfast: true,
    lunch: true,
    dinner: true
  }
})

const isGenerating = ref(false)
const generatedMenu = ref(null)
const errorMessage = ref('')

const handleGenerate = async () => {
  if (!authStore.hasActiveSubscription) {
    router.push('/subscription')
    return
  }

  isGenerating.value = true
  errorMessage.value = '' // Réinitialiser le message d'erreur
  try {
    // Appel API pour générer le menu
    const response = await axios.post('/api/menu/generate', {
      type: generationType.value,
      preferences: preferences.value
    })
    generatedMenu.value = response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Gérer les erreurs Axios
      if (error.response) {
        // Erreur avec une réponse du serveur
        switch (error.response.status) {
          case 404:
            errorMessage.value = 'Service de génération de menu non trouvé. Veuillez réessayer plus tard.'
            break
          case 500:
            errorMessage.value = 'Erreur serveur. Veuillez réessayer plus tard.'
            break
          default:
            errorMessage.value = `Erreur: ${error.response.statusText}`
        }
      } else if (error.request) {
        // Erreur sans réponse du serveur
        errorMessage.value = 'Aucune réponse du serveur. Veuillez vérifier votre connexion.'
      } else {
        // Erreur lors de la configuration de la requête
        errorMessage.value = `Erreur lors de la configuration de la requête: ${error.message}`
      }
    } else {
      // Gérer d'autres types d'erreurs
      errorMessage.value = 'Une erreur inattendue s\'est produite. Veuillez réessayer.'
    }
    console.error('Erreur lors de la génération du menu:', error)
  } finally {
    isGenerating.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Options de génération -->
    <div class="bento-card">
      <h2 class="text-2xl font-bold mb-6">Générateur de menus</h2>

      <div class="space-y-6">
        <!-- Type de génération -->
        <div>
          <label class="block text-sm font-medium mb-2">Période</label>
          <div class="flex space-x-4">
            <button
              @click="generationType = 'week'"
              class="px-4 py-2 rounded-lg transition-colors"
              :class="generationType === 'week' ?
                'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100' :
                'hover:bg-gray-100 dark:hover:bg-gray-700'"
            >
              Semaine
            </button>
            <button
              @click="generationType = 'month'"
              class="px-4 py-2 rounded-lg transition-colors"
              :class="generationType === 'month' ?
                'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100' :
                'hover:bg-gray-100 dark:hover:bg-gray-700'"
            >
              Mois
            </button>
          </div>
        </div>

        <!-- Repas à inclure -->
        <div>
          <label class="block text-sm font-medium mb-2">Repas à inclure</label>
          <div class="flex space-x-4">
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="preferences.mealTypes.breakfast"
                class="rounded text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2">Petit-déjeuner</span>
            </label>
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="preferences.mealTypes.lunch"
                class="rounded text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2">Déjeuner</span>
            </label>
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="preferences.mealTypes.dinner"
                class="rounded text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2">Dîner</span>
            </label>
          </div>
        </div>

        <!-- Bouton de génération -->
        <button
          @click="handleGenerate"
          :disabled="isGenerating"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          <template v-if="isGenerating">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Génération en cours...
          </template>
          <template v-else>
            Générer le menu
          </template>
        </button>

        <!-- Message d'erreur -->
        <p v-if="errorMessage" class="text-red-600 text-sm mt-4">{{ errorMessage }}</p>
      </div>
    </div>

    <!-- Menu généré -->
    <div v-if="generatedMenu" class="bento-card">
      <h3 class="text-xl font-semibold mb-4">Menu généré</h3>
      <div v-for="(day, index) in generatedMenu" :key="index" class="mb-4">
        <h4 class="text-lg font-medium mb-2">{{ day.date }}</h4>
        <div v-for="meal in day.meals" :key="meal.type" class="mb-2">
          <h5 class="font-semibold">{{ meal.type }}</h5>
          <p>{{ meal.recipe }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
