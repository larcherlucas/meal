<template>
  <div class="bento-card space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-mocha-800 dark:text-mocha-50">Filtres</h2>
      <button
        @click="resetFilters"
        class="text-sm text-mocha-600 hover:text-mocha-800 dark:text-mocha-300 dark:hover:text-mocha-100 transition-colors"
      >
        Réinitialiser
      </button>
    </div>

    <!-- Type de repas -->
    <div>
      <h3 class="text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-3">Type de repas</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="type in mealTypes"
          :key="type.id"
          @click="filters.mealType = type.id; updateFilters()"
          class="flex items-center px-3 py-1.5 rounded-full text-sm transition-colors"
          :class="[
            filters.mealType === type.id
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
          @click="filters.prepTime = time.id; updateFilters()"
          class="px-3 py-1.5 rounded-full text-sm transition-colors"
          :class="[
            filters.prepTime === time.id
              ? 'bg-mocha-600 text-mocha-50 dark:bg-mocha-500'
              : 'bg-mocha-100 text-mocha-700 hover:bg-mocha-200 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600'
          ]"
        >
          {{ time.name }}
        </button>
      </div>
    </div>

    <!-- Origine -->
    <div>
      <h3 class="text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-3">
        <div class="flex items-center">
          <GlobeAsiaAustraliaIcon class="h-4 w-4 mr-1.5" />
          Origine
        </div>
      </h3>
      <select
        v-model="filters.origin"
        @change="updateFilters"
        class="w-full rounded-lg border-mocha-200 dark:border-mocha-600 
               text-mocha-700 dark:text-mocha-300 bg-white dark:bg-mocha-700 
               focus:ring-mocha-500 focus:border-mocha-500"
      >
        <option
          v-for="origin in origins"
          :key="origin.id"
          :value="origin.id"
        >
          {{ origin.name }}
        </option>
      </select>
    </div>

    <!-- Difficulté -->
    <div>
      <h3 class="text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-3">Niveau de difficulté</h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="difficulty in difficulties"
          :key="difficulty.id"
          @click="filters.difficulty = difficulty.id; updateFilters()"
          class="px-3 py-1.5 rounded-full text-sm transition-colors"
          :class="[
            filters.difficulty === difficulty.id
              ? 'bg-mocha-600 text-mocha-50 dark:bg-mocha-500'
              : 'bg-mocha-100 text-mocha-700 hover:bg-mocha-200 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600'
          ]"
        >
          {{ difficulty.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  FunnelIcon,
  ClockIcon,
  GlobeAsiaAustraliaIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/vue/24/outline'

const emit = defineEmits<{
  'update:filters': [filters: typeof defaultFilters]
}>()

const defaultFilters = {
  prepTime: 'all',
  mealType: 'all',
  origin: 'all',
  difficulty: 'all'
}

const filters = ref({ ...defaultFilters })

const prepTimes = [
  { id: 'all', name: 'Tous les temps' },
  { id: 'quick', name: '< 30 min' },
  { id: 'medium', name: '30-60 min' },
  { id: 'long', name: '> 60 min' }
]

const mealTypes = [
  { id: 'all', name: 'Tous les repas', icon: FunnelIcon },
  { id: 'lunch', name: 'Déjeuner', icon: SunIcon },
  { id: 'dinner', name: 'Dîner', icon: MoonIcon }
]

const origins = [
  { id: 'all', name: 'Toutes les origines' },
  { id: 'french', name: 'France' },
  { id: 'italian', name: 'Italie' },
  { id: 'japanese', name: 'Japon' },
  { id: 'chinese', name: 'Chine' },
  { id: 'indian', name: 'Inde' },
  { id: 'thai', name: 'Thaïlande' },
  { id: 'mexican', name: 'Mexique' },
  { id: 'reunion', name: 'Réunion' }
]

const difficulties = [
  { id: 'all', name: 'Toutes les difficultés' },
  { id: 'easy', name: 'Facile' },
  { id: 'medium', name: 'Moyen' },
  { id: 'hard', name: 'Difficile' }
]

const updateFilters = () => {
  emit('update:filters', filters.value)
}

const resetFilters = () => {
  filters.value = { ...defaultFilters }
  updateFilters()
}
</script>