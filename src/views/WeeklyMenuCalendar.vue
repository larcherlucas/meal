<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menuStore'
import { useRecipeStore } from '@/stores/recipeStore'
import { useNotificationStore } from '@/stores/NotificationStore'
import { useUserPreferencesStore } from '@/stores/userPreferences'
import { 
  CalendarIcon, 
  PencilIcon, 
  ArrowPathIcon,
  PlusCircleIcon,
  TrashIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  UsersIcon
} from '@heroicons/vue/24/outline'
import RecipeSelector from '@/components/recipe/RecipeFilters.vue'
import RecipeModal from '@/components/recipe/RecipeModal.vue'
import type { Menu, MenuRecipe } from '@/stores/menuStore'
import type { Recipe } from '@/stores/recipeStore'

// Stores
const menuStore = useMenuStore()
const recipeStore = useRecipeStore()
const notificationStore = useNotificationStore()
const userPreferencesStore = useUserPreferencesStore()
const route = useRoute()
const router = useRouter()

// États locaux
const isLoading = ref(true)
const currentMenu = ref<Menu | null>(null)
const editMode = ref(false)
const menuId = computed(() => Number(route.params.id))
const selectedDayMealForEdit = ref<{day: number, mealType: string} | null>(null)
const showRecipeSelector = ref(false)
const selectedRecipe = ref<Recipe | null>(null)
const showRecipeModal = ref(false)
const servingsCount = ref(4)

// Récupération des préférences à partir des query params
const userPreferences = computed(() => {
  return {
    servingsCount: Number(route.query.servings) || 4,
    dietaryRestrictions: route.query.restrictions ? String(route.query.restrictions).split(',') : [],
    excludedIngredients: route.query.excluded ? String(route.query.excluded).split(',') : []
  }
})

// Jours de la semaine
const daysOfWeek = [
  { id: 1, name: 'Lundi', shortName: 'Lun' },
  { id: 2, name: 'Mardi', shortName: 'Mar' },
  { id: 3, name: 'Mercredi', shortName: 'Mer' },
  { id: 4, name: 'Jeudi', shortName: 'Jeu' },
  { id: 5, name: 'Vendredi', shortName: 'Ven' },
  { id: 6, name: 'Samedi', shortName: 'Sam' },
  { id: 0, name: 'Dimanche', shortName: 'Dim' }
]

// Types de repas
const mealTypes = [
  { id: 'breakfast', name: 'Petit-déjeuner', icon: '☕', time: 'Matin' },
  { id: 'lunch', name: 'Déjeuner', icon: '🍽️', time: 'Midi' },
  { id: 'snack', name: 'Collation', icon: '🍎', time: 'Après-midi' },
  { id: 'dinner', name: 'Dîner', icon: '🍲', time: 'Soir' }
]

// Structure des données pour faciliter l'affichage
const organizedMenu = computed(() => {
  if (!currentMenu.value) return null
  
  // Créer une structure par jour et par type de repas
  const result: Record<number, Record<string, MenuRecipe | null>> = {}
  
  // Initialiser la structure avec des valeurs null
  daysOfWeek.forEach(day => {
    result[day.id] = {}
    mealTypes.forEach(mealType => {
      result[day.id][mealType.id] = null
    })
  })
  
  // Remplir avec les recettes du menu
  currentMenu.value.menuRecipes.forEach(menuRecipe => {
    if (menuRecipe.dayOfWeek >= 0 && menuRecipe.dayOfWeek <= 6) {
      result[menuRecipe.dayOfWeek][menuRecipe.mealType] = menuRecipe
    }
  })
  
  return result
})

// Récupérer le nom des restrictions alimentaires pour l'affichage
const dietaryRestrictionsLabels = computed(() => {
  const restrictions = userPreferences.value.dietaryRestrictions || []
  const labels = {
    'vegetarian': 'Végétarien',
    'vegan': 'Végétalien',
    'gluten-free': 'Sans gluten',
    'lactose-free': 'Sans lactose',
    'nut-free': 'Sans noix'
  }
  
  return restrictions.map(r => labels[r as keyof typeof labels] || r)
})

// Fonction pour charger les détails du menu
async function loadMenu() {
  isLoading.value = true
  try {
    const menu = await menuStore.fetchMenuById(menuId.value)
    if (menu) {
      currentMenu.value = menu
      
      // Initialiser le nombre de portions à partir des préférences ou du menu
      servingsCount.value = userPreferences.value.servingsCount || menu.servingsCount || 4
      
      // Charger les détails des recettes pour chaque menu-recette
      await Promise.all(
        menu.menuRecipes.map(async (menuRecipe) => {
          if (menuRecipe.recipeId && !menuRecipe.recipe) {
            try {
              const recipe = await recipeStore.fetchRecipeById(menuRecipe.recipeId)
              if (recipe) {
                menuRecipe.recipe = recipe
              }
            } catch (error) {
              console.error(`Erreur lors du chargement de la recette ${menuRecipe.recipeId}:`, error)
            }
          }
        })
      )
    } else {
      notificationStore.show({
        type: 'error',
        message: 'Menu introuvable'
      })
      router.push('/menu/generator')
    }
  } catch (error) {
    console.error('Erreur lors du chargement du menu:', error)
    notificationStore.show({
      type: 'error',
      message: 'Erreur lors du chargement du menu'
    })
  } finally {
    isLoading.value = false
  }
}

// Fonction pour visualiser les détails d'une recette
function viewRecipeDetails(recipe: Recipe) {
  selectedRecipe.value = recipe
  showRecipeModal.value = true
}

// Fonction pour éditer un repas spécifique
function editMeal(day: number, mealType: string) {
  selectedDayMealForEdit.value = { day, mealType }
  showRecipeSelector.value = true
}

// Fonction pour ajouter une recette à un créneau spécifique
async function addRecipeToSlot(recipe: Recipe) {
  if (!selectedDayMealForEdit.value || !currentMenu.value) return
  
  const { day, mealType } = selectedDayMealForEdit.value
  
  try {
    // Vérifier si un repas existe déjà pour ce créneau
    const existingRecipeIndex = currentMenu.value.menuRecipes.findIndex(
      mr => mr.dayOfWeek === day && mr.mealType === mealType
    )
    
    if (existingRecipeIndex !== -1) {
      // Mettre à jour la recette existante
      const updatedMenuRecipes = [...currentMenu.value.menuRecipes]
      updatedMenuRecipes[existingRecipeIndex] = {
        ...updatedMenuRecipes[existingRecipeIndex],
        recipeId: recipe.id,
        recipe: recipe
      }
      
      await menuStore.updateMenu(currentMenu.value.id, {
        ...currentMenu.value,
        menuRecipes: updatedMenuRecipes
      })
    } else {
      // Ajouter une nouvelle recette
      const newMenuRecipe: Partial<MenuRecipe> = {
        recipeId: recipe.id,
        dayOfWeek: day,
        mealType: mealType as any,
        recipe: recipe
      }
      
      await menuStore.updateMenu(currentMenu.value.id, {
        ...currentMenu.value,
        menuRecipes: [...currentMenu.value.menuRecipes, newMenuRecipe as MenuRecipe]
      })
    }
    
    // Recharger le menu après modification
    await loadMenu()
    notificationStore.show({
      type: 'success',
      message: 'Menu mis à jour avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la recette:', error)
    notificationStore.show({
      type: 'error',
      message: 'Erreur lors de la mise à jour du menu'
    })
  } finally {
    selectedDayMealForEdit.value = null
    showRecipeSelector.value = false
  }
}

// Fonction pour supprimer une recette d'un créneau
async function removeRecipeFromSlot(day: number, mealType: string) {
  if (!currentMenu.value) return
  
  try {
    // Filtrer la recette à supprimer
    const updatedMenuRecipes = currentMenu.value.menuRecipes.filter(
      mr => !(mr.dayOfWeek === day && mr.mealType === mealType)
    )
    
    await menuStore.updateMenu(currentMenu.value.id, {
      ...currentMenu.value,
      menuRecipes: updatedMenuRecipes
    })
    
    // Recharger le menu après modification
    await loadMenu()
    notificationStore.show({
      type: 'success',
      message: 'Recette supprimée du menu'
    })
  } catch (error) {
    console.error('Erreur lors de la suppression de la recette:', error)
    notificationStore.show({
      type: 'error',
      message: 'Erreur lors de la mise à jour du menu'
    })
  }
}

// Fonction pour mettre à jour le nombre de portions
async function updateServings() {
  if (!currentMenu.value) return
  
  try {
    await menuStore.updateMenu(currentMenu.value.id, {
      ...currentMenu.value,
      servingsCount: servingsCount.value
    })
    
    notificationStore.show({
      type: 'success',
      message: 'Nombre de portions mis à jour'
    })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du nombre de portions:', error)
    notificationStore.show({
      type: 'error',
      message: 'Erreur lors de la mise à jour du menu'
    })
  }
}

// Fonction pour imprimer le menu
function printMenu() {
  window.print()
}

// Fonction pour exporter le menu (PDF, etc.)
function exportMenu() {
  // Implémentation à venir
  notificationStore.show({
    type: 'info',
    message: 'Fonctionnalité d\'export en cours de développement'
  })
}

// Fonction pour générer un nouveau menu basé sur les mêmes préférences
function regenerateMenu() {
  if (!currentMenu.value) return
  
  router.push({
    path: '/menu/generator',
    query: {
      regenerate: 'true',
      servings: servingsCount.value.toString(),
      restrictions: userPreferences.value.dietaryRestrictions.join(','),
      excluded: userPreferences.value.excludedIngredients.join(',')
    }
  })
}

// Fonction appelée lors de la sélection d'une recette dans le sélecteur
function onRecipeSelected(recipe: Recipe) {
  addRecipeToSlot(recipe)
}

// Charger le menu au montage du composant
onMounted(async () => {
  await loadMenu()
  
  // Charger les préférences utilisateur si nécessaire
  if (userPreferencesStore.userProfile === null) {
    await userPreferencesStore.fetchUserProfile()
  }
})

// Observer les changements dans l'URL pour recharger le menu si nécessaire
watch(() => route.params.id, async (newId) => {
  if (newId && Number(newId) !== currentMenu.value?.id) {
    await loadMenu()
  }
})
</script>

<template>
  <div class="space-y-6 print:m-0 print:p-0">
    <!-- En-tête avec actions -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
      <div class="flex items-center space-x-2">
        <button 
          @click="router.push('/menu/generator')" 
          class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeftIcon class="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 class="text-2xl font-bold text-mocha-800 dark:text-mocha-100">
          {{ currentMenu?.name || 'Menu hebdomadaire' }}
        </h1>
        <span v-if="isLoading" class="inline-block">
          <ArrowPathIcon class="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
        </span>
      </div>
      
      <div class="flex flex-wrap items-center gap-2">
        <!-- Sélecteur de portions -->
        <div class="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5">
          <UsersIcon class="h-4 w-4 text-gray-600 dark:text-gray-300 mr-2" />
          <select 
            v-model="servingsCount" 
            @change="updateServings"
            class="bg-transparent border-none focus:ring-0 text-sm"
          >
            <option v-for="n in 12" :key="n" :value="n">{{ n }} portion{{ n > 1 ? 's' : '' }}</option>
          </select>
        </div>
        
        <button 
          @click="editMode = !editMode" 
          class="px-3 py-2 rounded-lg bg-mocha-100 text-mocha-700 dark:bg-mocha-800 dark:text-mocha-100 flex items-center"
        >
          <PencilIcon class="h-4 w-4 mr-1" />
          {{ editMode ? 'Terminer l\'édition' : 'Modifier' }}
        </button>
        
        <button 
          @click="regenerateMenu"
          class="px-3 py-2 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-100 flex items-center"
        >
          <ArrowPathIcon class="h-4 w-4 mr-1" />
          Régénérer
        </button>
        
        <button 
          @click="printMenu" 
          class="px-3 py-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100 flex items-center"
        >
          <span class="h-4 w-4 mr-1">🖨️</span>
          Imprimer
        </button>
        
        <button 
          @click="exportMenu" 
          class="px-3 py-2 rounded-lg bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100 flex items-center"
        >
          <span class="h-4 w-4 mr-1">📥</span>
          Exporter
        </button>
      </div>
    </div>
    
    <!-- Récapitulatif des préférences -->
    <div class="flex flex-col sm:flex-row gap-2 items-start print:hidden">
      <!-- Nombre de portions -->
      <div class="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm flex items-center">
        <UsersIcon class="h-4 w-4 mr-1.5 text-gray-600 dark:text-gray-300" />
        <span>{{ servingsCount }} portion{{ servingsCount > 1 ? 's' : '' }}</span>
      </div>
      
      <!-- Restrictions alimentaires -->
      <div v-if="dietaryRestrictionsLabels.length > 0" class="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300 flex items-center">
        <span class="mr-1.5">🥗</span>
        <span>{{ dietaryRestrictionsLabels.join(', ') }}</span>
      </div>
      
      <!-- Ingrédients exclus -->
      <div v-if="userPreferences.excludedIngredients.length > 0" class="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-700 dark:text-red-300 flex items-center">
        <span class="mr-1.5">❌</span>
        <span>Exclus : {{ userPreferences.excludedIngredients.join(', ') }}</span>
      </div>
    </div>
    
    <!-- Message d'information -->
    <div class="flex items-start p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg print:hidden">
      <InformationCircleIcon class="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
      <p class="text-sm text-blue-700 dark:text-blue-300">
        Voici votre menu hebdomadaire personnalisé. Vous pouvez cliquer sur une recette pour voir les détails
        {{ editMode ? ' ou utiliser le mode édition pour modifier votre planning.' : '.' }}
      </p>
    </div>
    
    <!-- En-tête pour impression -->
    <div class="hidden print:block">
      <h1 class="text-xl font-bold text-center mb-2">
        {{ currentMenu?.name || 'Menu hebdomadaire' }}
      </h1>
      <p class="text-center text-sm text-gray-500">
        {{ currentMenu?.startDate ? new Date(currentMenu.startDate).toLocaleDateString() : '' }} 
        - 
        {{ currentMenu?.endDate ? new Date(currentMenu.endDate).toLocaleDateString() : '' }}
      </p>
      <p class="text-center text-sm mt-1">
        <span class="font-medium">Portions :</span> {{ servingsCount }}
        <span v-if="dietaryRestrictionsLabels.length > 0" class="ml-4 font-medium">Régime :</span>
        {{ dietaryRestrictionsLabels.join(', ') }}
      </p>
    </div>
    
    <!-- État de chargement -->
    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <ArrowPathIcon class="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      <span class="ml-2 text-gray-600 dark:text-gray-300">Chargement du menu...</span>
    </div>
    
    <!-- Affichage du calendrier -->
    <div v-else-if="currentMenu && organizedMenu" class="grid grid-cols-1 gap-4">
      <!-- Affichage par période de la journée pour une meilleure expérience utilisateur -->
      <div v-for="mealType in mealTypes" :key="mealType.id" class="bento-card">
        <h2 class="text-lg font-medium mb-4 flex items-center">
          <span class="mr-2">{{ mealType.icon }}</span>
          <span>{{ mealType.time }} - {{ mealType.name }}</span>
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-7 gap-2">
          <div v-for="day in daysOfWeek" :key="day.id" class="border rounded-lg p-2 h-full">
            <div class="font-medium text-center bg-gray-50 dark:bg-gray-800 py-1 px-2 rounded mb-2">
              {{ day.name }}
            </div>
            
            <div 
              class="min-h-24 flex flex-col justify-center items-center p-2 rounded-lg"
              :class="organizedMenu[day.id][mealType.id] ? 'bg-mocha-50 dark:bg-mocha-900/30' : ''"
            >
              <!-- Affichage de la recette -->
              <div v-if="organizedMenu[day.id][mealType.id]?.recipe" class="w-full">
                <div 
                  @click="viewRecipeDetails(organizedMenu[day.id][mealType.id]?.recipe)"
                  class="text-center mb-2 cursor-pointer hover:text-mocha-600 dark:hover:text-mocha-300 transition-colors"
                >
                  <h3 class="font-medium">
                    {{ organizedMenu[day.id][mealType.id]?.recipe?.title }}
                  </h3>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ organizedMenu[day.id][mealType.id]?.recipe?.prepTime + organizedMenu[day.id][mealType.id]?.recipe?.cookTime }} min
                  </p>
                </div>
                
                <!-- Image si disponible -->
                <div 
                  v-if="organizedMenu[day.id][mealType.id]?.recipe?.imageUrl" 
                  class="mt-2 cursor-pointer"
                  @click="viewRecipeDetails(organizedMenu[day.id][mealType.id]?.recipe)"
                >
                  <img 
                    :src="organizedMenu[day.id][mealType.id]?.recipe?.imageUrl" 
                    :alt="organizedMenu[day.id][mealType.id]?.recipe?.title"
                    class="w-full h-16 object-cover rounded-md" 
                  />
                </div>
                
                <!-- Actions en mode édition -->
                <div v-if="editMode" class="mt-2 flex justify-center space-x-2 print:hidden">
                  <button 
                    @click="editMeal(day.id, mealType.id)"
                    class="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button 
                    @click="removeRecipeFromSlot(day.id, mealType.id)"
                    class="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                  >
                    <TrashIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <!-- Emplacement vide avec bouton d'ajout en mode édition -->
              <div v-else-if="editMode" class="flex flex-col items-center justify-center w-full h-full">
                <button 
                  @click="editMeal(day.id, mealType.id)"
                  class="p-2 text-gray-400 hover:text-mocha-600 dark:hover:text-mocha-300 rounded-full"
                >
                  <PlusCircleIcon class="h-8 w-8" />
                </button>
                <span class="text-xs text-gray-400 mt-1">Ajouter</span>
              </div>
              
              <!-- Emplacement vide en mode lecture -->
              <div v-else class="text-center text-gray-400 dark:text-gray-500">
                -
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Aucun menu trouvé -->
    <div v-else class="text-center py-8">
      <p class="text-gray-500 dark:text-gray-400">Aucun menu trouvé ou erreur de chargement</p>
      <button 
        @click="router.push('/menu/generator')"
        class="mt-4 px-4 py-2 bg-mocha-600 text-white rounded-lg"
      >
        Retour au générateur
      </button>
    </div>
    
    <!-- Utilisation du composant RecipeSelector -->
    <RecipeSelector 
      v-if="showRecipeSelector"
      :show="showRecipeSelector"
      :meal-type="selectedDayMealForEdit?.mealType as any"
      @close="showRecipeSelector = false; selectedDayMealForEdit = null"
      @select="onRecipeSelected"
    />
    
    <!-- Utilisation du composant RecipeModal -->
    <RecipeModal 
      :is-open="showRecipeModal"
      :recipe="selectedRecipe"
      @close="showRecipeModal = false"
    />
  </div>
</template>

<style scoped>
/* Styles pour l'impression */
@media print {
  .bento-card {
    @apply shadow-none border-0 p-0 m-0 mt-4;
  }
}
</style>