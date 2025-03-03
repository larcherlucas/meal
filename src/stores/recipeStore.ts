import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from './NotificationStore'
import { useAuthStore } from './auth'
import { useUserPreferencesStore } from './userPreferences'
import { useSubscriptionStore } from './subscription'
import apiService from '@/api/config'

export interface Recipe {
  id: number
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  prepTime: number
  cookTime: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  imageUrl?: string
  isPremium?: boolean
  createdAt?: string
  updatedAt?: string
  categoryId?: number
  userId?: number
}

export const useRecipeStore = defineStore('recipe', () => {
  // Dépendances
  const router = useRouter()
  const notificationStore = useNotificationStore()
  const authStore = useAuthStore()
  const userPreferencesStore = useUserPreferencesStore()
  const subscriptionStore = useSubscriptionStore()
  
  // États
  const recipes = ref<Recipe[]>([])
  const filteredRecipes = ref<Recipe[]>([])
  const currentRecipe = ref<Recipe | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const itemsPerPage = ref(10)
  const totalItems = ref(0)
  const searchQuery = ref('')
  const filterOptions = ref({
    difficulty: null as 'easy' | 'medium' | 'hard' | null,
    maxPrepTime: null as number | null,
    includeIngredients: [] as string[],
    excludeIngredients: [] as string[]
  })

  // Computed properties
  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
  
  const userFavoriteRecipes = computed(() => {
    return recipes.value.filter(recipe => 
      userPreferencesStore.userProfile?.favoriteRecipes?.includes(recipe.id)
    )
  })

  const accessibleRecipes = computed(() => {
    return recipes.value.filter(recipe => 
      !recipe.isPremium || subscriptionStore.hasActiveSubscription
    )
  })

  // Actions
  async function fetchAllRecipes() {
    try {
      isLoading.value = true
      const response = await apiService.recipes.getAll({
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value,
        ...filterOptions.value
      })
      recipes.value = response.data.items
      totalItems.value = response.data.total
      applyUserPreferences()
    } catch (err) {
      handleError(err, 'Erreur lors du chargement des recettes')
    } finally {
      isLoading.value = false
    }
  }

  async function fetchRecipeById(id: number) {
    try {
      if (!authStore.isAuthenticated) {
        throw new Error('Vous devez être connecté pour accéder à cette recette')
      }
      
      isLoading.value = true
      
      // Vérifier l'accès si c'est une recette premium
      if (subscriptionStore && typeof subscriptionStore.canAccessRecipe === 'function') {
        const canAccess = await subscriptionStore.canAccessRecipe(id)
        if (!canAccess) {
          throw new Error('Cette recette nécessite un abonnement premium')
        }
      }
      
      const response = await apiService.recipes.getOne(id)
      currentRecipe.value = response.data
    } catch (err) {
      handleError(err, 'Erreur lors du chargement de la recette')
      router.push('/recipes')
    } finally {
      isLoading.value = false
    }
  }

  async function createRecipe(recipe: Omit<Recipe, 'id'>) {
    try {
      if (!authStore.isAuthenticated) {
        throw new Error('Vous devez être connecté pour créer une recette')
      }
      
      isLoading.value = true
      const response = await apiService.recipes.create(recipe)
      recipes.value.push(response.data)
      notificationStore.showSuccess('Recette créée avec succès')
      return response.data
    } catch (err) {
      handleError(err, 'Erreur lors de la création de la recette')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateRecipe(id: number, recipe: Partial<Recipe>) {
    try {
      if (!authStore.isAuthenticated) {
        throw new Error('Vous devez être connecté pour modifier une recette')
      }
      
      isLoading.value = true
      const response = await apiService.recipes.update(id, recipe)
      const index = recipes.value.findIndex(r => r.id === id)
      if (index !== -1) {
        recipes.value[index] = response.data
      }
      if (currentRecipe.value?.id === id) {
        currentRecipe.value = response.data
      }
      notificationStore.showSuccess('Recette mise à jour avec succès')
      return response.data
    } catch (err) {
      handleError(err, 'Erreur lors de la mise à jour de la recette')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteRecipe(id: number) {
    try {
      if (!authStore.isAuthenticated) {
        throw new Error('Vous devez être connecté pour supprimer une recette')
      }
      
      isLoading.value = true
      await apiService.recipes.delete(id)
      recipes.value = recipes.value.filter(r => r.id !== id)
      if (currentRecipe.value?.id === id) {
        currentRecipe.value = null
      }
      notificationStore.showSuccess('Recette supprimée avec succès')
    } catch (err) {
      handleError(err, 'Erreur lors de la suppression de la recette')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function toggleFavorite(recipeId: number) {
    try {
      if (!authStore.isAuthenticated) {
        throw new Error('Vous devez être connecté pour ajouter une recette aux favoris')
      }
      
      isLoading.value = true
      
      const isFavorite = userPreferencesStore.userProfile?.favoriteRecipes?.includes(recipeId)
      
      if (isFavorite) {
        await apiService.favorites.remove(recipeId)
        notificationStore.showSuccess('Recette retirée des favoris')
      } else {
        await apiService.favorites.add(recipeId)
        notificationStore.showSuccess('Recette ajoutée aux favoris')
      }
      
      // Mettre à jour les préférences utilisateur après modification
      await userPreferencesStore.fetchUserProfile()
    } catch (err) {
      handleError(err, 'Erreur lors de la modification des favoris')
    } finally {
      isLoading.value = false
    }
  }

  async function searchRecipes(query: string) {
    searchQuery.value = query
    currentPage.value = 1
    await fetchAllRecipes()
  }

  async function applyFilters(filters: typeof filterOptions.value) {
    filterOptions.value = filters
    currentPage.value = 1
    await fetchAllRecipes()
  }

  function setPage(page: number) {
    currentPage.value = page
    fetchAllRecipes()
  }

  function clearError() {
    error.value = null
  }

  function applyUserPreferences() {
    // Appliquer les préférences utilisateur aux recettes
    if (userPreferencesStore.userProfile) {
      // Adapter les recettes affichées selon les restrictions alimentaires
      const allergies = userPreferencesStore.allDietaryRestrictions || []
      
      filteredRecipes.value = recipes.value.filter(recipe => {
        // Vérifier si la recette contient des allergènes
        const hasAllergens = recipe.ingredients.some(ingredient => 
          allergies.some(allergy => ingredient.toLowerCase().includes(allergy.toLowerCase()))
        )
        
        return !hasAllergens
      })
    } else {
      filteredRecipes.value = recipes.value
    }
  }

  function handleError(err: any, defaultMessage: string) {
    if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else if (err.message) {
      error.value = err.message
    } else {
      error.value = defaultMessage
    }
    notificationStore.showError(error.value)
  }

  return {
    recipes,
    filteredRecipes,
    currentRecipe,
    isLoading,
    error,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    searchQuery,
    filterOptions,
    userFavoriteRecipes,
    accessibleRecipes,
    fetchAllRecipes,
    fetchRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    searchRecipes,
    applyFilters,
    setPage,
    clearError
  }
})