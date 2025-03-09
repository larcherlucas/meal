<script setup lang="ts">
import { ref, computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XMarkIcon, ClockIcon, UserIcon, ChartBarIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useRecipeStore } from '@/stores/recipeStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const favoriteStore = useFavoriteStore()
const recipeStore = useRecipeStore()
const router = useRouter()

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
  _fromCache?: boolean
  status?: string
  created_at?: string
  updated_at?: string
}

const props = defineProps<{
  isOpen: boolean
  recipe: Recipe | null
  isAdmin?: boolean
}>()

const emit = defineEmits<{
  'close': []
  'refresh': [recipeId: number]
  'edit': [event: MouseEvent]
  'delete': [event: MouseEvent]
  'duplicate': [event: MouseEvent]
}>()

const servings = ref(4)
const availableServings = [2, 4, 6, 8]
const showAdminInfo = ref(false)

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
  
  // Format spécifique JSONB de l'API PostgreSQL
  if (typeof ingredients === 'object' && ingredients.ingredients && Array.isArray(ingredients.ingredients)) {
    return [{
      category: 'Ingrédients',
      items: ingredients.ingredients
    }]
  }
  
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
  
  const steps = props.recipe.steps || props.recipe.instructions
  
  if (!steps) return [{
    category: 'Préparation',
    instructions: []
  }]
  
  // Format spécifique JSONB de l'API PostgreSQL
  if (typeof steps === 'object' && steps.steps && Array.isArray(steps.steps)) {
    return [{
      category: 'Préparation',
      instructions: steps.steps
    }]
  }
  
  if (Array.isArray(steps)) {
    // Si c'est un tableau simple de strings
    if (typeof steps[0] === 'string') {
      return [{
        category: 'Préparation',
        instructions: steps
      }]
    }
    
    // Si c'est un tableau d'objets
    if (typeof steps[0] === 'object') {
      if (steps[0].description) {
        return [{
          category: 'Préparation',
          instructions: steps.sort((a, b) => a.order - b.order).map(step => step.description)
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

// Fonction pour rafraîchir les données de la recette depuis l'API
const refreshRecipeData = async () => {
  if (!props.recipe?.id) return
  
  try {
    console.log(`Rafraîchissement forcé de la recette #${props.recipe.id} depuis l'API...`)
    const refreshedRecipe = await recipeStore.refreshRecipe(props.recipe.id)
    emit('refresh', props.recipe.id)
    emit('close')
  } catch (error) {
    console.error('Erreur lors du rafraîchissement des données de la recette:', error)
  }
}

// Fonctions d'administration
const handleEdit = (event) => {
  emit('edit', event)
  emit('close')
}

const handleDelete = (event) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer la recette "${props.recipe?.title}" ?`)) {
    emit('delete', event)
    emit('close')
  }
}

const handleDuplicate = async (event) => {
  if (!props.recipe) return
  
  try {
    // Copier la recette en changeant son titre
    const duplicatedRecipe = { 
      ...props.recipe,
      title: `Copie de ${props.recipe.title}`,
      id: undefined // Supprimer l'ID pour que le backend en attribue un nouveau
    }
    
    const newRecipe = await recipeStore.createRecipe(duplicatedRecipe)
    emit('close')
    
    // Rediriger vers la page d'édition de la nouvelle recette
    router.push(`/recipes/${newRecipe.id}/edit`)
  } catch (error) {
    console.error('Erreur lors de la duplication de la recette:', error)
  }
}

// Formatter les dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
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
              <!-- Barre d'actions administratives (admin uniquement) -->
              <div v-if="isAdmin" class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 px-4 flex justify-between items-center">
                <div class="flex items-center">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ID: {{ recipe.id }}
                  </span>
                  <button
                    @click="showAdminInfo = !showAdminInfo"
                    class="ml-3 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full"
                    :class="{ 'bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400': showAdminInfo }"
                  >
                    <InformationCircleIcon class="h-5 w-5" />
                  </button>
                </div>
                
                <div class="flex space-x-2">
                  <button
                    @click="handleEdit($event)"
                    class="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    <PencilIcon class="h-4 w-4 mr-1" />
                    Modifier
                  </button>
                  
                  <button
                    @click="handleDuplicate($event)"
                    class="inline-flex items-center px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    <DocumentDuplicateIcon class="h-4 w-4 mr-1" />
                    Dupliquer
                  </button>
                  
                  <button
                    @click="handleDelete($event)"
                    class="inline-flex items-center px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    <TrashIcon class="h-4 w-4 mr-1" />
                    Supprimer
                  </button>
                </div>
              </div>
              
              <!-- Informations administratives détaillées -->
              <div v-if="isAdmin && showAdminInfo" class="bg-blue-50 dark:bg-blue-900/20 p-4 text-sm border-b border-blue-100 dark:border-blue-800">
                <h4 class="font-semibold text-blue-800 dark:text-blue-200 mb-2">Informations administratives</h4>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <p class="text-gray-600 dark:text-gray-400">ID: <span class="font-medium text-gray-800 dark:text-gray-200">{{ recipe.id }}</span></p>
                    <p class="text-gray-600 dark:text-gray-400">Statut: 
                      <span class="font-medium px-2 py-0.5 rounded-full text-xs" 
                        :class="{
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200': recipe.status === 'published',
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200': recipe.status === 'draft',
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200': recipe.status === 'review'
                        }">
                        {{ recipe.status === 'published' ? 'Publié' : 
                           recipe.status === 'draft' ? 'Brouillon' : 
                           recipe.status === 'review' ? 'En révision' : 
                           recipe.status || 'Publié' }}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p class="text-gray-600 dark:text-gray-400">Créé le: <span class="font-medium text-gray-800 dark:text-gray-200">{{ formatDate(recipe.created_at) }}</span></p>
                    <p class="text-gray-600 dark:text-gray-400">Modifié le: <span class="font-medium text-gray-800 dark:text-gray-200">{{ formatDate(recipe.updated_at) }}</span></p>
                  </div>
                </div>
              </div>
              
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
                
                <!-- Badge "Depuis le cache" -->
                <div 
                  v-if="recipe._fromCache" 
                  class="absolute top-4 right-28 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  Depuis le cache
                </div>
                
                <!-- Bouton de rafraîchissement -->
                <button
                  v-if="recipe._fromCache"
                  type="button"
                  class="absolute top-4 right-44 rounded-full p-2 bg-green-500/90 hover:bg-green-600/90 text-white transition-colors"
                  @click.stop="refreshRecipeData"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
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
                
                <!-- Actions administratives en bas de modal -->
                <div v-if="isAdmin" class="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    @click="handleEdit($event)"
                    class="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded"
                  >
                    <PencilIcon class="h-5 w-5 inline-block mr-1" />
                    Modifier
                  </button>
                  
                  <button 
                    @click="handleDuplicate($event)"
                    class="px-4 py-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30 rounded"
                  >
                    <DocumentDuplicateIcon class="h-5 w-5 inline-block mr-1" />
                    Dupliquer
                  </button>
                  
                  <button 
                    @click="handleDelete($event)"
                    class="px-4 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded"
                  >
                    <TrashIcon class="h-5 w-5 inline-block mr-1" />
                    Supprimer
                  </button>
                </div>
                
                <!-- Section de débogage temporaire -->
                <div v-if="recipe._fromCache" class="bg-yellow-50 p-4 mt-4 text-mocha-800">
                  <h3 class="font-bold mb-2">Informations de cache</h3>
                  <p>Cette recette est chargée depuis le cache local.</p>
                  <button 
                    @click="refreshRecipeData" 
                    class="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors">
                    Rafraîchir depuis l'API
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>