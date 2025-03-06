<template>
  <div class="bento-card space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-mocha-800 dark:text-mocha-50">Filtres</h2>
      <div class="flex space-x-2">
        <button
          @click="resetFilters"
          class="text-sm text-mocha-600 hover:text-mocha-800 dark:text-mocha-300 dark:hover:text-mocha-100 transition-colors"
        >
          Réinitialiser
        </button>
        
        <!-- Toggle du cache (nouveau) -->
        <button
          @click="toggleCache"
          class="text-sm px-2 py-0.5 rounded-full transition-colors"
          :class="useCache ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'"
        >
          {{ useCache ? 'Cache activé' : 'Cache désactivé' }}
        </button>
      </div>
    </div>

    <!-- Type de repas -->
    <div>
      <h3 class="text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-3">Type de repas</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="type in mealTypes"
          :key="type.id"
          @click="filters.meal_type = type.id; updateFilters()"
          class="flex items-center px-3 py-1.5 rounded-full text-sm transition-colors"
          :class="[
            filters.meal_type === type.id
              ? 'bg-mocha-600 text-mocha-50 dark:bg-mocha-500'
              : 'bg-mocha-100 text-mocha-700 hover:bg-mocha-200 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600'
          ]"
        >
          <component :is="type.icon" class="h-4 w-4 mr-1.5" />
          {{ type.name }}
        </button>
      </div>
    </div>

    <!-- Temps de préparation -->
    <div>
      <h3 class="text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-3">
        <div class="flex items-center">
          <ClockIcon class="h-4 w-4 mr-1.5" />
          Temps de préparation
        </div>
      </h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="time in prepTimes"
          :key="time.id"
          @click="filters.maxPrepTime = time.id; updateFilters()"
          class="px-3 py-1.5 rounded-full text-sm transition-colors"
          :class="[
            filters.maxPrepTime === time.id
              ? 'bg-mocha-600 text-mocha-50 dark:bg-mocha-500'
              : 'bg-mocha-100 text-mocha-700 hover:bg-mocha-200 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600'
          ]"
        >
          {{ time.name }}
        </button>
      </div>
    </div>

    <!-- Difficulté -->
    <div>
      <h3 class="text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-3">Niveau de difficulté</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="difficulty in difficulties"
          :key="difficulty.id"
          @click="filters.difficulty_level = difficulty.id; updateFilters()"
          class="px-3 py-1.5 rounded-full text-sm transition-colors"
          :class="[
            filters.difficulty_level === difficulty.id
              ? 'bg-mocha-600 text-mocha-50 dark:bg-mocha-500'
              : 'bg-mocha-100 text-mocha-700 hover:bg-mocha-200 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600'
          ]"
        >
          {{ difficulty.name }}
        </button>
      </div>
    </div>

    <!-- Catégorie -->
    <div>
      <h3 class="text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-3">
        <div class="flex items-center">
          <FolderIcon class="h-4 w-4 mr-1.5" />
          Catégorie
        </div>
      </h3>
      <select
        v-model="filters.category"
        @change="updateFilters"
        class="w-full rounded-lg border-mocha-200 dark:border-mocha-600 
               text-mocha-700 dark:text-mocha-300 bg-white dark:bg-mocha-700 
               focus:ring-mocha-500 focus:border-mocha-500"
      >
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>
    </div>

    <!-- Premium uniquement -->
    <div class="flex items-center">
      <input
        id="premium-only"
        v-model="filters.premiumOnly"
        type="checkbox"
        @change="updateFilters"
        class="h-4 w-4 rounded border-mocha-300 dark:border-mocha-600 
               text-mocha-600 focus:ring-mocha-500"
      />
      <label for="premium-only" class="ml-2 text-sm text-mocha-700 dark:text-mocha-300">
        Recettes premium uniquement
      </label>
    </div>
    
    <!-- Statistiques du cache (nouveau) -->
    <div v-if="showCacheStats" class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs">
      <h3 class="font-medium text-blue-700 dark:text-blue-300 mb-1">Cache Stats</h3>
      <div class="space-y-1 text-blue-600 dark:text-blue-400">
        <p>Hit ratio: {{ cacheStats.hitRatio.toFixed(2) * 100 }}%</p>
        <p>Hits: {{ cacheStats.hits }}</p>
        <p>Misses: {{ cacheStats.misses }}</p>
        <p>Keys in cache: {{ cacheStats.keys }}</p>
      </div>
      <button 
        @click="clearCache" 
        class="mt-2 w-full text-center text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-xs transition-colors">
        Clear Cache
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  FunnelIcon,
  ClockIcon,
  FolderIcon,
  SunIcon,
  MoonIcon,
  CakeIcon,
  CoffeeIcon,
  GlobeAsiaAustraliaIcon
} from '@heroicons/vue/24/outline'

const emit = defineEmits<{
  'update:filters': [filters: any]
  'update:useCache': [value: boolean]
  'clearCache': []
}>()

const defaultFilters = {
  maxPrepTime: null,
  meal_type: null,
  category: null,
  difficulty_level: null,
  premiumOnly: false
}

const filters = reactive({ ...defaultFilters })
const useCache = ref(true)
const showCacheStats = ref(false)

// Statistiques du cache (nouvelles)
const cacheStats = reactive({
  hits: 0,
  misses: 0,
  keys: 0,
  hitRatio: 0
})

// Fonction pour mettre à jour les statistiques du cache
const updateCacheStats = (stats) => {
  Object.assign(cacheStats, stats)
}

// Propriété calculée pour le texte du bouton de cache
const cacheButtonText = computed(() => {
  return useCache.value ? 'Cache activé' : 'Cache désactivé'
})

const prepTimes = [
  { id: null, name: 'Tous les temps' },
  { id: 30, name: '< 30 min' },
  { id: 60, name: '< 60 min' },
  { id: 120, name: '< 2 heures' }
]

const mealTypes = [
  { id: null, name: 'Tous les repas', icon: FunnelIcon },
  { id: 'breakfast', name: 'Petit-déjeuner', icon: CoffeeIcon },
  { id: 'lunch', name: 'Déjeuner', icon: SunIcon },
  { id: 'dinner', name: 'Dîner', icon: MoonIcon },
  { id: 'dessert', name: 'Dessert', icon: CakeIcon },
  { id: 'snack', name: 'En-cas', icon: FunnelIcon }
]

const categories = [
  { id: null, name: 'Toutes les catégories' },
  { id: 'french', name: 'Française' },
  { id: 'italian', name: 'Italienne' },
  { id: 'asian', name: 'Asiatique' },
  { id: 'vegetarian', name: 'Végétarienne' },
  { id: 'vegan', name: 'Vegan' }
]

const difficulties = [
  { id: null, name: 'Toutes les difficultés' },
  { id: 'easy', name: 'Facile' },
  { id: 'medium', name: 'Moyen' },
  { id: 'hard', name: 'Difficile' }
]

const updateFilters = () => {
  emit('update:filters', { ...filters })
}

const resetFilters = () => {
  Object.assign(filters, defaultFilters)
  updateFilters()
}

// Fonction pour basculer l'utilisation du cache
const toggleCache = () => {
  useCache.value = !useCache.value
  emit('update:useCache', useCache.value)
}

// Fonction pour effacer le cache
const clearCache = () => {
  emit('clearCache')
  // Réinitialiser les statistiques également
  cacheStats.hits = 0
  cacheStats.misses = 0
  cacheStats.hitRatio = 0
}

// Exposer les méthodes et propriétés pour le parent
defineExpose({
  updateCacheStats,
  showCacheStats
})
</script>