<script setup lang="ts">
import { ref, computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XMarkIcon, ClockIcon, UserIcon, ChartBarIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useFavoriteStore } from '@/stores/favoriteStore'

const authStore = useAuthStore()
const favoriteStore = useFavoriteStore()

interface NutritionalInfo {
  calories: string
  proteins: string
  carbs: string
  fats: string
  saturatedFats?: string
  fiber?: string
  sodium?: string
}

interface Recipe {
  id: number
  title: string
  image_url?: string
  category?: string
  difficulty_level?: 'easy' | 'medium' | 'hard'
  difficulty?: string
  prep_time?: number
  cook_time?: number
  prepTime?: string
  totalTime?: string
  servings?: number
  ingredients?: any[]
  nutritionalInfo?: NutritionalInfo
  steps?: any[]
  instructions?: any[]
  description?: string
  is_premium?: boolean
}

const props = defineProps<{
  isOpen: boolean
  recipe: Recipe | null
}>()

const emit = defineEmits<{
  'close': []
}>()

const servings = ref(4)
const availableServings = [2, 4, 6, 8]

// Calculer le temps total de préparation
const totalTime = computed(() => {
  if (!props.recipe) return 0
  return (props.recipe.prep_time || 0) + (props.recipe.cook_time || 0)
})

// Formatter les ingrédients
const formattedIngredients = computed(() => {
  if (!props.recipe) return []
  
  // Si la recette a déjà des ingrédients au bon format
  if (props.recipe.ingredients && 
      Array.isArray(props.recipe.ingredients) && 
      props.recipe.ingredients[0] && 
      props.recipe.ingredients[0].category) {
    return props.recipe.ingredients
  }
  
  // Adapter différents formats
  const ingredients = props.recipe.ingredients
  
  if (!ingredients) return [{
    category: 'Ingrédients',
    items: []
  }]
  
  if (Array.isArray(ingredients)) {
    // Si c'est un tableau simple de strings
    if (typeof ingredients[0] === 'string') {
      return [{
        category: 'Ingrédients',
        items: ingredients.map(name => ({ name, quantity: '', unit: '' }))
      }]
    }
    
    // Si c'est un tableau d'objets avec name/quantity/unit
    if (typeof ingredients[0] === 'object' && ingredients[0].name) {
      return [{
        category: 'Ingrédients',
        items: ingredients
      }]
    }
    
    // Si c'est un JSONB structuré
    if (ingredients.ingredients && Array.isArray(ingredients.ingredients)) {
      return [{
        category: 'Ingrédients',
        items: ingredients.ingredients
      }]
    }
  }
  
  // Format par défaut
  return [{
    category: 'Ingrédients',
    items: []
  }]
})

// Formatter les instructions
const formattedInstructions = computed(() => {
  if (!props.recipe) return []
  
  // Si la recette a déjà des étapes au bon format
  if (props.recipe.steps && 
      Array.isArray(props.recipe.steps) && 
      props.recipe.steps[0] && 
      Array.isArray(props.recipe.steps[0].instructions)) {
    return props.recipe.steps
  }
  
  const instructions = props.recipe.steps || props.recipe.instructions
  
  if (!instructions) return [{
    category: 'Préparation',
    instructions: []
  }]
  
  if (Array.isArray(instructions)) {
    // Si c'est un tableau simple de strings
    if (typeof instructions[0] === 'string') {
      return [{
        category: 'Préparation',
        instructions: instructions
      }]
    }
    
    // Si c'est un tableau d'objets
    if (typeof instructions[0] === 'object') {
      if (instructions[0].description) {
        return [{
          category: 'Préparation',
          instructions: instructions.sort((a, b) => a.order - b.order).map(step => step.description)
        }]
      }
    }
  }
  
  // Format par défaut
  return [{
    category: 'Préparation',
    instructions: []
  }]
})

// Récupérer les informations nutritionnelles
const nutritionalInfo = computed(() => {
  if (!props.recipe) return null
  return props.recipe.nutritionalInfo || null
})

// Mise à l'échelle des quantités selon le nombre de portions
const getScaledQuantity = (quantity: number) => {
  if (!props.recipe || !props.recipe.servings) return quantity
  const scale = servings.value / props.recipe.servings
  return Math.round((quantity * scale) * 10) / 10
}

// Fonctions pour gérer les favoris
const toggleFavorite = async () => {
  if (!props.recipe) return
  
  try {
    await favoriteStore.toggleFavorite(props.recipe.id)
  } catch (error) {
    console.error('Erreur lors de la modification des favoris:', error)
  }
}

const isFavorite = computed(() => {
  if (!props.recipe) return false
  return favoriteStore.isFavorite(props.recipe.id)
})
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="emit('close')">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-mocha-900/50" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel 
              v-if="recipe" 
              class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-mocha-800 shadow-xl transition-all"
            >
              <!-- Image de couverture -->
              <div class="relative aspect-video">
                <img 
                  :src="recipe.image_url || '/images/default-recipe.jpg'" 
                  :alt="recipe.title"
                  class="object-cover w-full h-full"
                />
                <button
                  type="button"
                  class="absolute top-4 right-4 rounded-full p-2 bg-mocha-100/90 hover:bg-mocha-200/90 text-mocha-800 transition-colors"
                  @click="emit('close')"
                >
                  <XMarkIcon class="h-6 w-6" />
                </button>
                
                <!-- Bouton favori -->
                <button
                  v-if="authStore.isAuthenticated"
                  type="button"
                  class="absolute top-4 right-16 rounded-full p-2 bg-mocha-100/90 hover:bg-mocha-200/90 transition-colors"
                  :class="isFavorite ? 'text-red-500' : 'text-mocha-800'"
                  @click.stop="toggleFavorite"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                </button>
              </div>

              <div class="p-6 space-y-8">
                <!-- En-tête -->
                <div>
                  <h2 class="text-2xl font-bold text-mocha-800 dark:text-mocha-50 mb-4">
                    {{ recipe.title }}
                  </h2>
                  <div class="flex flex-wrap gap-4 text-sm text-mocha-700 dark:text-mocha-300">
                    <div class="flex items-center">
                      <ClockIcon class="h-5 w-5 mr-1" />
                      <span>Préparation : {{ recipe.prepTime || `${recipe.prep_time} min` }}</span>
                    </div>
                    <div class="flex items-center">
                      <ClockIcon class="h-5 w-5 mr-1" />
                      <span>Total : {{ recipe.totalTime || `${totalTime} min` }}</span>
                    </div>
                    <div class="flex items-center">
                      <UserIcon class="h-5 w-5 mr-1" />
                      <select 
                        v-model="servings"
                        class="ml-2 rounded-lg border-mocha-200 dark:border-mocha-600 
                               text-mocha-700 dark:text-mocha-200 bg-white dark:bg-mocha-700 
                               focus:ring-mocha-500 focus:border-mocha-500"
                      >
                        <option 
                          v-for="count in availableServings"
                          :key="count"
                          :value="count"
                        >
                          {{ count }} personnes
                        </option>
                      </select>
                    </div>
                    <div class="flex items-center">
                      <span class="px-2 py-1 rounded bg-mocha-100 dark:bg-mocha-700 text-mocha-700 dark:text-mocha-300">
                        {{ recipe.difficulty || 
                           (recipe.difficulty_level === 'easy' ? 'Facile' : 
                            recipe.difficulty_level === 'medium' ? 'Moyen' : 'Difficile') }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- Description -->
                <div v-if="recipe.description">
                  <h3 class="text-lg font-semibold text-mocha-800 dark:text-mocha-50 mb-3 flex items-center">
                    Description
                  </h3>
                  <p class="text-mocha-700 dark:text-mocha-300">{{ recipe.description }}</p>
                </div>

                <!-- Informations nutritionnelles -->
                <div v-if="nutritionalInfo" class="bg-mocha-50 dark:bg-mocha-700/50 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-mocha-800 dark:text-mocha-50 mb-3 flex items-center">
                    <ChartBarIcon class="h-5 w-5 mr-2" />
                    Informations nutritionnelles
                    <span class="text-sm font-normal ml-2 text-mocha-600 dark:text-mocha-300">(par portion)</span>
                  </h3>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p class="text-sm text-mocha-600 dark:text-mocha-300">Calories</p>
                      <p class="font-medium text-mocha-800 dark:text-mocha-50">{{ nutritionalInfo.calories }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-mocha-600 dark:text-mocha-300">Protéines</p>
                      <p class="font-medium text-mocha-800 dark:text-mocha-50">{{ nutritionalInfo.proteins }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-mocha-600 dark:text-mocha-300">Glucides</p>
                      <p class="font-medium text-mocha-800 dark:text-mocha-50">{{ nutritionalInfo.carbs }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-mocha-600 dark:text-mocha-300">Lipides</p>
                      <p class="font-medium text-mocha-800 dark:text-mocha-50">{{ nutritionalInfo.fats }}</p>
                    </div>
                  </div>
                </div>

                <!-- Ingrédients -->
                <div>
                  <h3 class="text-xl font-semibold text-mocha-800 dark:text-mocha-50 mb-4">
                    Ingrédients
                  </h3>
                  <div class="grid md:grid-cols-2 gap-6">
                    <div
                      v-for="section in formattedIngredients"
                      :key="section.category"
                      class="space-y-3"
                    >
                      <h4 class="font-medium text-mocha-700 dark:text-mocha-200">
                        {{ section.category }}
                      </h4>
                      <ul class="space-y-2">
                        <li
                          v-for="ingredient in section.items"
                          :key="ingredient.name"
                          class="flex justify-between text-mocha-600 dark:text-mocha-300"
                        >
                          <span>{{ ingredient.name }}</span>
                          <span v-if="ingredient.quantity">{{ getScaledQuantity(ingredient.quantity) }} {{ ingredient.unit }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <!-- Préparation -->
                <div>
                  <h3 class="text-xl font-semibold text-mocha-800 dark:text-mocha-50 mb-4">
                    Préparation
                  </h3>
                  <div class="space-y-6">
                    <div
                      v-for="(section, index) in formattedInstructions"
                      :key="index"
                    >
                      <h4 
                        v-if="section.category && section.category !== 'Préparation'"
                        class="font-medium text-mocha-700 dark:text-mocha-200 mb-3"
                      >
                        {{ section.category }}
                      </h4>
                      <ol class="space-y-4">
                        <li
                          v-for="(instruction, idx) in section.instructions"
                          :key="idx"
                          class="flex"
                        >
                          <span class="flex-none w-8 h-8 rounded-full bg-mocha-100 dark:bg-mocha-700 
                                     text-mocha-700 dark:text-mocha-200 flex items-center justify-center 
                                     font-medium mr-4">
                            {{ idx + 1 }}
                          </span>
                          <p class="text-mocha-700 dark:text-mocha-300">{{ instruction }}</p>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>