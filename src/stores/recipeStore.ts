import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from './NotificationStore'
import { useAuthStore } from './auth'
import { useSubscriptionStore } from './subscription'
import api, { apiService } from '@/api/config'

export interface Recipe {
  id: number
  title: string
  description: string
  ingredients: any
  steps: any
  prep_time: number
  cook_time: number
  servings: number
  difficulty_level: 'easy' | 'medium' | 'hard'
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert'
  image_url?: string
  is_premium?: boolean
  category?: string
  origin?: string
  age_category?: string
  season?: string
  rating?: number
  author_id?: number
  author_email?: string
  favorite_count?: string
  average_rating?: string
  status?: string
  created_at?: string
  updated_at?: string
  _fromCache?: boolean
}

export type FilterParams = {
  meal_type?: string | null
  origin?: string | null
  age_category?: string | null
  difficulty_level?: string | null
  maxPrepTime?: number | null
  search?: string | null
  [key: string]: any
}

export const useRecipeStore = defineStore('recipe', () => {
  // Dépendances
  const router = useRouter()
  const notificationStore = useNotificationStore()
  const authStore = useAuthStore()
  const subscriptionStore = useSubscriptionStore()
  
  // États
  const recipes = ref<Recipe[]>([])
  const filteredRecipes = ref<Recipe[]>([])
  const currentRecipe = ref<Recipe | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const itemsPerPage = ref(20)
  const totalItems = ref(0)
  const searchQuery = ref('')
  const activeFilters = ref<FilterParams>({})

  // États pour le cache
  const recipeCache = ref<Record<number, Recipe>>({})
  const listCache = ref<Record<string, Recipe[]>>({})
  const lastFetchTime = ref<Record<string, number>>({})
  const cacheDuration = ref(15 * 60 * 1000) // 15 minutes en millisecondes

  // Computed properties
  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
  
  const accessibleRecipes = computed(() => {
    return recipes.value.filter(recipe => 
      !recipe.is_premium || subscriptionStore.getCurrentPlan?.value?.id !== 'free'
    )
  })

  const recipesByCategory = computed(() => {
    const categories: Record<string, Recipe[]> = {
      'breakfast': [],
      'lunch': [],
      'dinner': [],
      'snack': [],
      'dessert': []
    }
    
    recipes.value.forEach(recipe => {
      if (recipe.meal_type && categories[recipe.meal_type]) {
        categories[recipe.meal_type].push(recipe)
      }
    })
    
    return categories
  })

  // Computed pour vérifier la validité du cache
  const isCacheValid = (cacheKey: string) => {
    const lastFetch = lastFetchTime.value[cacheKey] || 0
    return Date.now() - lastFetch < cacheDuration.value
  }

  // Fonction pour générer une clé de cache basée sur les filtres
  const generateCacheKey = (filters: FilterParams) => {
    return `filters_${JSON.stringify(filters)}`
  }

  // Actions
  async function fetchAllRecipes(forceRefresh = false) {
    try {
      // Utiliser les filtres actifs pour la génération de la clé de cache
      const cacheKey = generateCacheKey(activeFilters.value)
      
      if (!forceRefresh && isCacheValid(cacheKey) && listCache.value[cacheKey]) {
        // Si le cache est valide, utiliser les données du cache
        console.log("Utilisation du cache pour les recettes:", cacheKey)
        recipes.value = listCache.value[cacheKey].map(recipe => ({
          ...recipe,
          _fromCache: true
        }))
        return recipes.value
      }
      
      isLoading.value = true
      error.value = null
      
      console.log("Chargement des recettes depuis l'API...")
      
      // Préparer les paramètres de requête basés sur tous les filtres actifs
      const params: Record<string, any> = { ...activeFilters.value }
      
      // Nettoyer les filtres nuls ou undefined
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined) {
          delete params[key]
        }
      })
      
      console.log("Paramètres de filtrage:", params)
      
      // Utiliser le namespace recipes de apiService
      const response = await apiService.recipes.getAll(params)
      
      // Adapter le traitement selon la structure réelle de la réponse
      let fetchedRecipes: Recipe[] = []
      
      // Si la réponse est directement un tableau de recettes
      if (Array.isArray(response)) {
        fetchedRecipes = response
        totalItems.value = response.length
      } 
      // Si la réponse a une structure avec un champ 'data'
      else if (response && response.data) {
        // Si data est un tableau
        if (Array.isArray(response.data)) {
          fetchedRecipes = response.data
        } else {
          // Si data est un objet qui contient les recettes
          fetchedRecipes = response.data.recipes || []
        }
        
        totalItems.value = response.totalCount || fetchedRecipes.length
      } 
      // Autre format de réponse possible
      else {
        fetchedRecipes = []
        totalItems.value = 0
        throw new Error("Format de réponse API non reconnu")
      }
      
      // Ajouter la catégorie pour compatibilité avec l'UI
      fetchedRecipes = fetchedRecipes.map(recipe => ({
        ...recipe,
        category: getCategoryFromMealType(recipe.meal_type)
      }))
      
      // Mettre à jour le cache des recettes individuelles
      fetchedRecipes.forEach(recipe => {
        recipeCache.value[recipe.id] = recipe
      })
      
      // Sauvegarder la liste filtrée dans le cache
      listCache.value[cacheKey] = fetchedRecipes
      lastFetchTime.value[cacheKey] = Date.now()
      
      recipes.value = fetchedRecipes
      console.log("Recettes chargées:", recipes.value.length)
      return recipes.value
    } catch (err: any) {
      handleError(err, 'Erreur lors du chargement des recettes')
      return []
    } finally {
      isLoading.value = false
    }
  }

  // Fonction utilitaire pour convertir meal_type en category
  function getCategoryFromMealType(mealType: string): string {
    switch (mealType) {
      case 'breakfast': return 'Petit-déjeuner'
      case 'lunch': return 'Déjeuner'
      case 'dinner': return 'Dîner'
      case 'snack': return 'En-cas'
      case 'dessert': return 'Dessert'
      default: return 'Autre'
    }
  }

  // Nouvelle méthode pour filtrer les recettes avec plusieurs critères
  async function filterRecipes(filters: FilterParams, forceRefresh = false) {
    // Mettre à jour les filtres actifs
    activeFilters.value = { ...filters }
    currentPage.value = 1
    
    // Charger les recettes avec les nouveaux filtres
    return await fetchAllRecipes(forceRefresh)
  }

  async function fetchRecipeById(id: number, forceRefresh = false) {
    try {
      // Vérifier si on peut utiliser le cache
      if (!forceRefresh && recipeCache.value[id] && (recipeCache.value[id].ingredients || !authStore.isAuthenticated)) {
        console.log(`Utilisation du cache pour la recette #${id}`)
        currentRecipe.value = {
          ...recipeCache.value[id],
          _fromCache: true
        }
        return currentRecipe.value
      }
      
      isLoading.value = true
      error.value = null
      
      console.log(`Chargement de la recette #${id} depuis l'API...`)
      
      const response = await apiService.recipes.getById(id)
      
      // Vérifier différentes structures de réponse possibles
      let recipeData
      
      if (response && response.data) {
        // Cas 1: La réponse contient un objet data qui contient lui-même un objet data
        if (response.data.data) {
          recipeData = response.data.data
        } 
        // Cas 2: La réponse contient directement un objet data
        else {
          recipeData = response.data
        }
      } 
      // Cas 3: La réponse est directement les données de recette
      else if (response) {
        recipeData = response
      }
      
      if (!recipeData) {
        throw new Error("Recette non trouvée")
      }
      
      // Vérification pour les comptes premium
      if (recipeData.is_premium) {
        const hasValidSubscription = 
          authStore.isAuthenticated && (
            authStore.user?.role === 'premium' || 
            authStore.user?.role === 'admin' ||
            authStore.hasActiveSubscription
          )
        
        if (!hasValidSubscription) {
          throw new Error("Cette recette nécessite un abonnement premium")
        }
      }
      
      // Adapter la recette pour l'affichage
      recipeData = {
        ...recipeData,
        category: getCategoryFromMealType(recipeData.meal_type)
      }
      
      // Mettre à jour le cache
      recipeCache.value[id] = recipeData
      
      currentRecipe.value = recipeData
      return currentRecipe.value
    } catch (err: any) {
      // Vérifiez si l'erreur est liée au statut premium
      if ((err.message && err.message.includes("premium")) || err.status === 403) {
        notificationStore.info(
          "Recette premium",
          "Cette recette nécessite un abonnement premium. Accédez à toutes nos recettes en vous abonnant."
        )
        
        // Rediriger vers la page d'abonnement si ce n'est pas déjà le cas
        if (router.currentRoute.value.path !== '/subscription') {
          router.push('/subscription')
        }
      } else {
        handleError(err, `Erreur lors du chargement de la recette #${id}`)
      }
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function searchRecipes(query: string) {
    // Mettre à jour les filtres actifs avec la recherche
    activeFilters.value = {
      ...activeFilters.value,
      search: query
    }
    
    return await fetchAllRecipes(true)
  }

  // Méthode de filtrage par type de repas préservée pour compatibilité
  async function filterByMealType(mealType: string | null) {
    return await filterRecipes({ 
      ...activeFilters.value,
      meal_type: mealType 
    })
  }

  function setPage(page: number) {
    currentPage.value = page
    fetchAllRecipes()
  }

  function clearError() {
    error.value = null
  }

  function handleError(err: any, defaultMessage: string) {
    console.error(defaultMessage, err)
    
    // Vérifier si l'erreur a une réponse API
    if (err.response?.data?.error) {
      error.value = err.response.data.error
    } else if (err.message) {
      error.value = err.message
    } else {
      error.value = defaultMessage
    }
    
    notificationStore.error(error.value || defaultMessage)
  }

  // Méthode pour effacer le cache
  function clearCache(type?: string, id?: number) {
    if (id) {
      // Effacer une recette spécifique
      delete recipeCache.value[id]
      console.log(`Cache effacé pour la recette #${id}`)
    } else if (type) {
      // Effacer un type spécifique
      Object.keys(listCache.value).forEach(key => {
        if (key.includes(type)) {
          delete listCache.value[key]
          delete lastFetchTime.value[key]
        }
      })
      console.log(`Cache effacé pour le type ${type}`)
    } else {
      // Effacer tout le cache
      recipeCache.value = {}
      listCache.value = {}
      lastFetchTime.value = {}
      console.log("Cache entièrement effacé")
    }
  }

  // Méthode pour rafraîchir une recette spécifique
  async function refreshRecipe(id: number) {
    return await fetchRecipeById(id, true)
  }

  // Méthode pour créer une recette (admin)
  async function createRecipe(recipeData: Partial<Recipe>) {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiService.recipes.create(recipeData)
      
      // Rafraîchir la liste des recettes après création
      await fetchAllRecipes(true)
      
      notificationStore.success("Recette créée avec succès")
      return response.data
    } catch (err) {
      handleError(err, "Erreur lors de la création de la recette")
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Méthode pour mettre à jour une recette (admin)
  async function updateRecipe(id: number, recipeData: Partial<Recipe>) {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await apiService.recipes.update(id, recipeData)
      
      // Mettre à jour le cache
      delete recipeCache.value[id]
      
      // Rafraîchir la liste des recettes
      await fetchAllRecipes(true)
      
      notificationStore.success("Recette mise à jour avec succès")
      return response.data
    } catch (err) {
      handleError(err, `Erreur lors de la mise à jour de la recette #${id}`)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Méthode pour supprimer une recette (admin)
  async function deleteRecipe(id: number) {
    try {
      isLoading.value = true
      error.value = null
      
      await apiService.recipes.delete(id)
      
      // Supprimer du cache
      delete recipeCache.value[id]
      
      // Mettre à jour la liste des recettes
      recipes.value = recipes.value.filter(recipe => recipe.id !== id)
      
      // Rafraîchir les listes en cache
      Object.keys(listCache.value).forEach(key => {
        listCache.value[key] = listCache.value[key].filter(recipe => recipe.id !== id)
      })
      
      notificationStore.success("Recette supprimée avec succès")
      return true
    } catch (err) {
      handleError(err, `Erreur lors de la suppression de la recette #${id}`)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Initialisation - Charger les recettes au démarrage du store
  function initialize() {
    console.log("Initialisation du store de recettes...")
    fetchAllRecipes()
  }

  return {
    // États
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
    activeFilters,
    
    // Computed
    accessibleRecipes,
    recipesByCategory,
    
    // Actions
    fetchAllRecipes,
    fetchRecipeById,
    searchRecipes,
    filterByMealType,
    filterRecipes,  // Nouvelle méthode
    setPage,
    clearError,
    initialize,
    clearCache,
    refreshRecipe,
    createRecipe,    // Nouvelles méthodes CRUD
    updateRecipe,
    deleteRecipe
  }
})