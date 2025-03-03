import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '../api/config'
import { useAuthStore } from './auth'
import { useNotificationStore } from './NotificationStore'

// Types pour les favoris
export interface FavoriteRecipe {
  id: number;
  title: string;
  description?: string;
  prep_time?: number;
  cook_time?: number;
  difficulty_level?: string;
  image_url?: string;
  is_premium?: boolean;
  meal_type?: string;
  rating?: number;
}

export interface FavoriteResponse {
  id: number;
  user_id: string;
  recipe_id: number;
  created_at: string;
  recipe?: FavoriteRecipe;
}

export interface SubscriptionInfo {
  active: boolean;
  type: string;
}

export const useFavoriteStore = defineStore('favorite', () => {
  // États
  const favorites = ref<number[]>([]) // IDs des recettes favorites
  const favoritesDetails = ref<FavoriteResponse[]>([]) // Détails complets des favoris
  const subscriptionInfo = ref<SubscriptionInfo>({
    active: false,
    type: 'none'
  })
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const error = ref<string | null>(null)

  // Récupérer les stores externes
  const getAuthStore = () => useAuthStore()
  const getNotificationStore = () => useNotificationStore()

  // Propriétés calculées
  const isFavorite = computed(() => (recipeId: number) => 
    favorites.value.includes(recipeId)
  )

  const favoritesCount = computed(() => favorites.value.length)

  const hasFavorites = computed(() => favorites.value.length > 0)
  
  const premiumFavorites = computed(() => 
    favoritesDetails.value.filter(fav => fav.recipe?.is_premium)
  )
  
  const nonPremiumFavorites = computed(() => 
    favoritesDetails.value.filter(fav => !fav.recipe?.is_premium)
  )
  
  const canAccessPremium = computed(() => 
    subscriptionInfo.value.active
  )

  // Vérifier si l'utilisateur est authentifié
  const checkAuthentication = () => {
    const authStore = getAuthStore()
    if (!authStore.isAuthenticated) {
      throw new Error("Vous devez être connecté pour gérer vos favoris")
    }
  }

  /**
   * Récupère tous les favoris de l'utilisateur depuis l'API
   */
  async function fetchFavorites() {
    if (isLoading.value) return

    error.value = null
    isLoading.value = true
    
    try {
      checkAuthentication()
      // Cette route doit correspondre au backend
      const response = await apiService.get('/favorites')
      
      // Adapter selon le format de réponse du backend
      if (response && Array.isArray(response)) {
        favoritesDetails.value = response
        favorites.value = response.map(fav => fav.recipe_id)
      } else if (response && response.data && Array.isArray(response.data)) {
        // Structure alternative si l'API retourne { status: "success", data: [...] }
        favoritesDetails.value = response.data
        favorites.value = response.data.map((fav: FavoriteResponse) => fav.recipe_id)
        
        // Mettre à jour les informations d'abonnement si présentes
        if (response.subscription) {
          subscriptionInfo.value = {
            active: !!response.subscription.active,
            type: response.subscription.type || 'none'
          }
        }
      } else {
        // Fallback pour les données temporaires pendant le développement
        favoritesDetails.value = [
          {
            id: 1,
            user_id: getAuthStore().user?.id || '',
            recipe_id: 1,
            created_at: new Date().toISOString(),
            recipe: {
              id: 1,
              title: 'Cuisses de dinde à la moutarde',
              image_url: '/images/dinde-moutarde.jpg',
              difficulty_level: 'Facile',
              prep_time: 15,
              cook_time: 60
            }
          }
        ]
        favorites.value = [1]
      }
      
      isInitialized.value = true
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des favoris'
      getNotificationStore().error(error.value)
      console.error('Erreur lors du chargement des favoris:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Ajoute ou retire une recette des favoris
   * @param recipeId ID de la recette
   * @returns true si ajouté, false si retiré
   */
  async function toggleFavorite(recipeId: number): Promise<boolean> {
    if (isLoading.value) return isFavorite.value(recipeId)

    error.value = null
    isLoading.value = true
    
    try {
      checkAuthentication()
      const isFav = isFavorite.value(recipeId)
      
      if (isFav) {
        // Retirer des favoris - adapter selon l'API
        await apiService.delete(`/favorites/${recipeId}`)
        favorites.value = favorites.value.filter(id => id !== recipeId)
        favoritesDetails.value = favoritesDetails.value.filter(fav => fav.recipe_id !== recipeId)
        getNotificationStore().success('Recette retirée des favoris')
        return false
      } else {
        // Ajouter aux favoris - adapter selon l'API
        const response = await apiService.post('/favorites', { recipe_id: recipeId })
        
        // Si l'API retourne les détails du favori
        if (response) {
          const favoriteData = response.data || response
          favorites.value.push(recipeId)
          favoritesDetails.value.push(favoriteData)
        } else {
          // Fallback si l'API retourne juste un statut de succès
          favorites.value.push(recipeId)
          // Ajouter un favori minimal sans les détails de la recette
          favoritesDetails.value.push({
            id: Date.now(), // ID temporaire
            user_id: getAuthStore().user?.id || '',
            recipe_id: recipeId,
            created_at: new Date().toISOString()
          })
        }
        
        getNotificationStore().success('Recette ajoutée aux favoris')
        return true
      }
    } catch (err: any) {
      // Gérer le cas particulier d'erreur d'abonnement
      if (err.message && (
        err.message.includes('premium') || 
        err.message.includes('abonnement')
      )) {
        getNotificationStore().error(
          'Abonnement requis', 
          'Cette recette n\'est disponible qu\'avec un abonnement premium'
        )
      } else {
        error.value = err.message || 'Erreur lors de la modification des favoris'
        getNotificationStore().error(error.value)
      }
      
      console.error('Erreur lors de la modification des favoris:', err)
      return isFavorite.value(recipeId)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Ajoute une recette aux favoris
   * @param recipeId ID de la recette
   */
  async function addToFavorites(recipeId: number): Promise<boolean> {
    if (isFavorite.value(recipeId)) return true
    return toggleFavorite(recipeId)
  }

  /**
   * Retire une recette des favoris
   * @param recipeId ID de la recette
   */
  async function removeFromFavorites(recipeId: number): Promise<boolean> {
    if (!isFavorite.value(recipeId)) return false
    return !await toggleFavorite(recipeId)
  }

  /**
   * Vérifie si une recette est en favori
   * @param recipeId ID de la recette
   */
  async function checkIsFavorite(recipeId: number): Promise<boolean> {
    if (!getAuthStore().isAuthenticated) return false
    
    try {
      const response = await apiService.get(`/favorites/check/${recipeId}`)
      return response?.isFavorite || false
    } catch (err) {
      console.error('Erreur lors de la vérification du favori:', err)
      return false
    }
  }

  /**
   * Initialise le store (à appeler après l'authentification)
   */
  function initialize() {
    if (!isInitialized.value && getAuthStore().isAuthenticated) {
      fetchFavorites()
    }
  }

  /**
   * Réinitialise le store (à appeler après la déconnexion)
   */
  function reset() {
    favorites.value = []
    favoritesDetails.value = []
    subscriptionInfo.value = {
      active: false,
      type: 'none'
    }
    error.value = null
    isInitialized.value = false
  }

  /**
   * Efface les erreurs
   */
  function clearError() {
    error.value = null
  }

  return {
    // États
    favorites,
    favoritesDetails,
    subscriptionInfo,
    isLoading,
    isInitialized,
    error,
    
    // Propriétés calculées
    isFavorite,
    favoritesCount,
    hasFavorites,
    premiumFavorites,
    nonPremiumFavorites,
    canAccessPremium,
    
    // Actions
    fetchFavorites,
    toggleFavorite,
    addToFavorites,
    removeFromFavorites,
    checkIsFavorite,
    initialize,
    reset,
    clearError
  }
})