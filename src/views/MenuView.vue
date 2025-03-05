<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRecipeStore } from '@/stores/recipeStore'
import { useSubscriptionStore } from '@/stores/subscription'
import { useFavoriteStore } from '@/stores/favoriteStore'
import RecipeModal from '@/components/recipe/RecipeModal.vue'
import { HeartIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'

const authStore = useAuthStore()
const recipeStore = useRecipeStore()
const subscriptionStore = useSubscriptionStore()
const favoriteStore = useFavoriteStore()

// État local
const selectedCategory = ref('Toutes')
const selectedRecipe = ref(null)
const isModalOpen = ref(false)

// Catégories pour le filtre
const categories = computed(() => ['Toutes', 'Petit-déjeuner', 'Déjeuner', 'Dîner', 'Dessert', 'En-cas'])

// Mapping entre les catégories d'affichage et les meal_types API
const categoryToMealType = {
  'Toutes': null,
  'Petit-déjeuner': 'breakfast',
  'Déjeuner': 'lunch',
  'Dîner': 'dinner',
  'Dessert': 'dessert',
  'En-cas': 'snack'
}

// Récupération des recettes filtrées
const filteredRecipes = computed(() => {
  let recipes = [...recipeStore.recipes]

  // Filtrer par abonnement
  if (!authStore.hasActiveSubscription) {
    recipes = recipes.filter(recipe => !recipe.is_premium)
  }

  // Filtrer par catégorie
  if (selectedCategory.value !== 'Toutes') {
    const mealType = categoryToMealType[selectedCategory.value]
    if (mealType) {
      recipes = recipes.filter(recipe => recipe.meal_type === mealType)
    }
  }

  return recipes
})

// Observer les changements de catégorie et filtrer les recettes
watch(selectedCategory, (newCategory) => {
  const mealType = categoryToMealType[newCategory]
  recipeStore.filterByMealType(mealType)
})

// Gérer les favoris
const toggleFavorite = async (recipeId, event) => {
  event.stopPropagation()
  if (!authStore.isAuthenticated) {
    // Rediriger vers la page de connexion
    return
  }
  
  try {
    await favoriteStore.toggleFavorite(recipeId)
  } catch (error) {
    console.error('Erreur lors de la modification des favoris:', error)
  }
}

const isFavorite = (recipeId) => {
  return favoriteStore.isFavorite(recipeId)
}

// Ouvrir la modal de recette
const openRecipeModal = async (recipe) => {
  selectedRecipe.value = recipe
  isModalOpen.value = true
  
  // Optionnel: charger les détails complets si nécessaire
  try {
    const fullRecipe = await recipeStore.fetchRecipeById(recipe.id)
    if (fullRecipe) {
      selectedRecipe.value = fullRecipe
    }
  } catch (error) {
    console.error('Erreur lors du chargement des détails de la recette:', error)
  }
}

// Fonction utilitaire pour obtenir une URL d'image valide
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '/images/default-recipe.jpg'
  
  // Vérifier si l'URL est relative ou absolue
  if (imageUrl.startsWith('http')) {
    return imageUrl
  }
  
  // Pour les images stockées localement
  return '/images/default-recipe.jpg'
}

// Charger les données au montage du composant
onMounted(async () => {
  console.log("Component mounted")
  
  // Initialiser les données d'abonnement
  if (authStore.isAuthenticated) {
    await subscriptionStore.fetchCurrentPlan()
  }
  
  // Charger les recettes
  await recipeStore.fetchAllRecipes()
  
  // Initialiser les favoris si l'utilisateur est connecté
  if (authStore.isAuthenticated) {
    favoriteStore.initialize()
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Filtres -->
    <div class="bento-card">
      <div class="flex space-x-4 overflow-x-auto pb-2">
        <button
          v-for="category in categories"
          :key="category"
          @click="selectedCategory = category"
          class="px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          :class="selectedCategory === category ? 
            'bg-mocha-100 text-mocha-700 dark:bg-mocha-900 dark:text-mocha-100' : 
            'hover:bg-gray-100 dark:hover:bg-gray-700'"
        >
          {{ category }}
        </button>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="recipeStore.isLoading" class="text-center py-10">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-mocha-500"></div>
      <p class="mt-2 text-mocha-600">Chargement des recettes...</p>
    </div>

    <!-- Message si aucune recette -->
    <div v-else-if="filteredRecipes.length === 0" class="text-center py-10">
      <p class="text-mocha-600">Aucune recette disponible pour cette catégorie.</p>
      <p v-if="recipeStore.error" class="mt-2 text-red-500">{{ recipeStore.error }}</p>
    </div>

    <!-- Liste des recettes -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        class="bento-card group hover:shadow-xl transition-shadow cursor-pointer relative"
        @click="openRecipeModal(recipe)"
      >
        <div class="relative aspect-video rounded-lg overflow-hidden mb-4">
          <img
            :src="getImageUrl(recipe.image_url)"
            :alt="recipe.title"
            class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          <div
            v-if="recipe.is_premium && !authStore.hasActiveSubscription"
            class="absolute inset-0 bg-black/50 flex items-center justify-center"
          >
            <router-link
              to="/subscription"
              class="px-4 py-2 bg-mocha-600 text-white rounded-lg hover:bg-mocha-700 transition-colors"
              @click.stop
            >
              Débloquer
            </router-link>
          </div>
          <!-- Bouton favori -->
          <button
            @click="toggleFavorite(recipe.id, $event)"
            class="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
          >
            <HeartSolidIcon
              v-if="isFavorite(recipe.id)"
              class="h-6 w-6 text-red-500"
            />
            <HeartIcon
              v-else
              class="h-6 w-6 text-gray-500"
            />
          </button>
        </div>

        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2 line-clamp-2">{{ recipe.title }}</h3>
          
          <div class="flex items-center text-sm font-semibold space-x-4 text-mocha-500">
            <span>{{ recipe.difficulty_level === 'easy' ? 'Facile' : 
                    recipe.difficulty_level === 'medium' ? 'Moyen' : 'Difficile' }}</span>
            <span>{{ recipe.prep_time + (recipe.cook_time || 0) }} min</span>
            <span>{{ recipe.category || (recipe.meal_type === 'breakfast' ? 'Petit-déjeuner' : 
                   recipe.meal_type === 'lunch' ? 'Déjeuner' :
                   recipe.meal_type === 'dinner' ? 'Dîner' :
                   recipe.meal_type === 'snack' ? 'En-cas' :
                   recipe.meal_type === 'dessert' ? 'Dessert' : 'Autre') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de recette -->
    <RecipeModal
      :is-open="isModalOpen"
      :recipe="selectedRecipe"
      @close="isModalOpen = false"
    />

    <!-- CTA Abonnement -->
    <div
      v-if="!authStore.hasActiveSubscription"
      class="bento-card bg-gradient-to-r text-white text-center"
      style="background-color: rgba(86, 122, 94, 1);"
    >
      <h2 class="text-2xl font-bold mb-4"
      style="color: #fff;">Débloquez toutes les recettes !</h2>
      <p class="mb-6"
      style="color: #fff;"
      >Accédez à notre collection complète de recettes et au générateur de menus.</p>
      <router-link
        to="/subscription"
        class="inline-block px-6 py-3 bg-white text-mocha-700 rounded-lg hover:bg-mocha-50 transition-colors"
      >
        Voir les abonnements
      </router-link>
    </div>
  </div>
</template>