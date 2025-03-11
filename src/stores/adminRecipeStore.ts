// src/stores/adminRecipeStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/api/config'
import { useNotificationStore } from '@/stores/NotificationStore'

export interface AdminRecipe {
  id: number
  title: string
  description: string
  status: 'draft' | 'review' | 'published' | 'archived'
  is_premium: boolean
  meal_type: string
  difficulty_level: string
  cook_time: number
  prep_time: number
  servings: number
  image_url?: string
  created_at: string
  updated_at: string
  author_id?: number
  author_email?: string
  ingredients: any[]
  steps: any[]
  view_count?: number
  favorite_count?: number
  average_rating?: number
  last_modified_by?: string
}

export interface RecipeFilters {
  status?: string
  meal_type?: string
  difficulty_level?: string
  is_premium?: boolean
  search?: string
  sort_by?: string
  sort_direction?: 'asc' | 'desc'
}

export interface PaginationOptions {
  page: number
  limit: number
  total?: number
}

export const useAdminRecipeStore = defineStore('adminRecipe', () => {
  // États
  const recipes = ref<AdminRecipe[]>([])
  const currentRecipe = ref<AdminRecipe | null>(null)
  const selectedRecipes = ref<number[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const lastSavedDraft = ref<any>(null)
  const modificationHistory = ref<any[]>([])
  
  // Pagination
  const pagination = ref<PaginationOptions>({
    page: 1,
    limit: 20,
    total: 0
  })
  
  // Filtres
  const filters = ref<RecipeFilters>({
    status: 'published',
    sort_by: 'updated_at',
    sort_direction: 'desc'
  })
  
  // Store des notifications
  const notificationStore = useNotificationStore()

  // Getters
  const totalPages = computed(() => {
    if (!pagination.value.total) return 1
    return Math.ceil(pagination.value.total / pagination.value.limit)
  })
  
  const hasSelection = computed(() => selectedRecipes.value.length > 0)
  
  const statusCounts = computed(() => {
    const counts = {
      draft: 0,
      review: 0,
      published: 0,
      archived: 0,
      total: recipes.value.length
    }
    
    recipes.value.forEach(recipe => {
      if (recipe.status && counts[recipe.status as keyof typeof counts] !== undefined) {
        counts[recipe.status as keyof typeof counts]++
      }
    })
    
    return counts
  })

  // Actions
  async function fetchRecipes() {
    isLoading.value = true
    error.value = null
    
    try {
      const params = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...filters.value
      }
      
      const response = await apiService.get('/admin/recipes', params)
      
      // La réponse est déjà traitée par l'intercepteur response
      // Donc dans ce cas, response est déjà l'objet data extrait
      recipes.value = response
      
      // On récupère totalCount en assumant qu'il existe dans la réponse originale
      // mais l'intercepteur l'a supprimé en faveur d'un format plus simple
      const originalResponse = response.__original || {}
      pagination.value.total = originalResponse.totalCount || recipes.value.length
      
      return recipes.value
    } catch (err) {
      handleError(err, 'Erreur lors du chargement des recettes')
      return []
    } finally {
      isLoading.value = false
    }
  }
  
  // Dans adminRecipeStore.ts
async function fetchRecipeById(id) {
  try {
    console.log('adminRecipeStore - Chargement de la recette ID:', id)
    isLoading.value = true
    error.value = null
    
    const response = await apiService.get(`/admin/recipes/${id}`)
    console.log('adminRecipeStore - Réponse recette:', response)
    
    if (response && response.data) {
      return response.data
    } else {
      console.warn('Format de réponse non standard pour la recette:', response)
      return response
    }
  } catch (err) {
    handleError(err, `Erreur lors du chargement de la recette #${id}`)
    return null
  } finally {
    isLoading.value = false
  }
}
  
  async function createRecipe(recipeData: Partial<AdminRecipe>) {
    isSaving.value = true
    error.value = null
    
    try {
      const response = await apiService.post('/admin/recipes', recipeData)
      
      if (response && response.data) {
        notificationStore.success('Recette créée avec succès')
        return response.data
      } else {
        throw new Error('Format de réponse API incorrect')
      }
    } catch (err: any) {
      handleError(err, 'Erreur lors de la création de la recette')
      return null
    } finally {
      isSaving.value = false
      clearDraft()
    }
  }
  
  async function updateRecipe(id: number, recipeData: Partial<AdminRecipe>) {
    isSaving.value = true
    error.value = null
    
    try {
      const response = await apiService.put(`/admin/recipes/${id}`, recipeData)
      
      if (response && response.data) {
        notificationStore.success('Recette mise à jour avec succès')
        
        // Mettre à jour la liste locale si la recette est présente
        const index = recipes.value.findIndex(r => r.id === id)
        if (index !== -1) {
          recipes.value[index] = response.data
        }
        
        return response.data
      } else {
        throw new Error('Format de réponse API incorrect')
      }
    } catch (err: any) {
      handleError(err, `Erreur lors de la mise à jour de la recette #${id}`)
      return null
    } finally {
      isSaving.value = false
      clearDraft()
    }
  }
  
  async function updateRecipeStatus(id: number, status: string) {
    try {
      return await updateRecipe(id, { status: status as any })
    } catch (err: any) {
      handleError(err, `Erreur lors du changement de statut de la recette #${id}`)
      return null
    }
  }
  
  async function deleteRecipe(id: number) {
    isLoading.value = true
    error.value = null
    
    try {
      await apiService.delete(`/admin/recipes/${id}`)
      
      // Supprimer la recette de la liste locale
      recipes.value = recipes.value.filter(r => r.id !== id)
      
      // Mettre à jour la pagination si nécessaire
      if (recipes.value.length === 0 && pagination.value.page > 1) {
        pagination.value.page--
        await fetchRecipes()
      }
      
      notificationStore.success('Recette supprimée avec succès')
      return true
    } catch (err: any) {
      handleError(err, `Erreur lors de la suppression de la recette #${id}`)
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  async function bulkAction(action: string, ids: number[] = selectedRecipes.value) {
    if (ids.length === 0) return false
    
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.post('/admin/recipes/bulk', {
        action,
        ids
      })
      
      await fetchRecipes()
      selectedRecipes.value = []
      
      notificationStore.success(`Action "${action}" effectuée sur ${ids.length} recettes`)
      return true
    } catch (err: any) {
      handleError(err, `Erreur lors de l'action en masse "${action}"`)
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  // Fonctions pour la gestion des recettes en cours d'édition
  function saveDraft(data: Partial<AdminRecipe>) {
    lastSavedDraft.value = { ...data, savedAt: new Date().toISOString() }
    localStorage.setItem('recipe_draft', JSON.stringify(lastSavedDraft.value))
  }
  
  function loadDraft() {
    const draft = localStorage.getItem('recipe_draft')
    if (draft) {
      try {
        lastSavedDraft.value = JSON.parse(draft)
        return lastSavedDraft.value
      } catch (e) {
        clearDraft()
        return null
      }
    }
    return null
  }
  
  function clearDraft() {
    lastSavedDraft.value = null
    localStorage.removeItem('recipe_draft')
  }
  
  function saveToHistory(recipe: AdminRecipe) {
    // Limiter l'historique à 10 versions
    if (modificationHistory.value.length >= 10) {
      modificationHistory.value.pop()
    }
    
    // Ajouter la nouvelle version avec un timestamp
    modificationHistory.value.unshift({
      timestamp: new Date().toISOString(),
      recipe: { ...recipe }
    })
  }
  
  // Fonctions de gestion des filtres et pagination
  function setPage(page: number) {
    pagination.value.page = page
    return fetchRecipes()
  }
  
  function setLimit(limit: number) {
    pagination.value.limit = limit
    pagination.value.page = 1
    return fetchRecipes()
  }
  
  function setFilters(newFilters: RecipeFilters) {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1
    return fetchRecipes()
  }
  
  function resetFilters() {
    filters.value = {
      status: 'published',
      sort_by: 'updated_at',
      sort_direction: 'desc'
    }
    pagination.value.page = 1
    return fetchRecipes()
  }
  
  // Gestion de la sélection
  function toggleSelection(id: number) {
    const index = selectedRecipes.value.indexOf(id)
    if (index === -1) {
      selectedRecipes.value.push(id)
    } else {
      selectedRecipes.value.splice(index, 1)
    }
  }
  
  function selectAll() {
    selectedRecipes.value = recipes.value.map(r => r.id)
  }
  
  function clearSelection() {
    selectedRecipes.value = []
  }
  
  // Gestion des erreurs
  function handleError(err: any, defaultMessage: string) {
    console.error(defaultMessage, err)
    
    if (err.response?.data?.error) {
      error.value = err.response.data.error
    } else if (err.message) {
      error.value = err.message
    } else {
      error.value = defaultMessage
    }
    
    notificationStore.error(error.value)
  }
  
  function clearError() {
    error.value = null
  }
  
  // Extraire une recette depuis une URL
  async function extractRecipeFromUrl(url: string) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.post('/extract/recipe', { url })
      
      if (response && response.data && response.data.recipe) {
        return response.data.recipe
      } else {
        throw new Error('Impossible d\'extraire la recette depuis cette URL')
      }
    } catch (err: any) {
      handleError(err, 'Erreur lors de l\'extraction de la recette')
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  // Fonctions pour le tableau de bord
  async function fetchDashboardStats() {
    try {
      const response = await apiService.get('/admin/dashboard/stats')
      return response.data
    } catch (err: any) {
      handleError(err, 'Erreur lors du chargement des statistiques')
      return null
    }
  }
  
  async function fetchRecentRecipes(limit = 5) {
    try {
      const response = await apiService.get('/admin/recipes/recent', { limit })
      return response.data
    } catch (err: any) {
      handleError(err, 'Erreur lors du chargement des recettes récentes')
      return []
    }
  }
  
  // Initialiser le store
  function initialize() {
    loadDraft()
  }
  
  return {
    // États
    recipes,
    currentRecipe,
    selectedRecipes,
    isLoading,
    isSaving,
    error,
    lastSavedDraft,
    modificationHistory,
    pagination,
    filters,
    
    // Getters
    totalPages,
    hasSelection,
    statusCounts,
    
    // Actions
    fetchRecipes,
    fetchRecipeById,
    createRecipe,
    updateRecipe,
    updateRecipeStatus,
    deleteRecipe,
    bulkAction,
    saveDraft,
    loadDraft,
    clearDraft,
    setPage,
    setLimit,
    setFilters,
    resetFilters,
    toggleSelection,
    selectAll,
    clearSelection,
    clearError,
    extractRecipeFromUrl,
    fetchDashboardStats,
    fetchRecentRecipes,
    initialize
  }
})