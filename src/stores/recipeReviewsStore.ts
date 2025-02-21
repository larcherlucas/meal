import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '../api/config'

interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<string, number>
}

interface Review {
  id: number
  recipeId: number
  userId: string
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
  user?: {
    firstName: string
    lastName: string
  }
}

export const useRecipeReviewsStore = defineStore('recipeReviews', () => {
  const reviews = ref<Review[]>([])
  const userReviews = ref<Review[]>([])
  const currentRecipeReviews = ref<Review[]>([])
  const reviewStats = ref<Record<number, ReviewStats>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const hasUserReviewed = (recipeId: number) => {
    return computed(() => 
      userReviews.value.some(review => review.recipeId === recipeId)
    )
  }

  const getUserReviewForRecipe = (recipeId: number) => {
    return computed(() => 
      userReviews.value.find(review => review.recipeId === recipeId)
    )
  }

  async function fetchReviewsByRecipe(recipeId: number) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.get(`/recipes/${recipeId}/reviews`)
      currentRecipeReviews.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des avis'
      console.error('Erreur lors du chargement des avis:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchReviewStats(recipeId: number) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.get(`/recipes/${recipeId}/reviews/stats`)
      reviewStats.value = {
        ...reviewStats.value,
        [recipeId]: response.data
      }
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des statistiques'
      console.error('Erreur lors du chargement des statistiques:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUserReviews() {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.get('/my/reviews')
      userReviews.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement de vos avis'
      console.error('Erreur lors du chargement de vos avis:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function createReview(recipeId: number, reviewData: Omit<Review, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.post(`/recipes/${recipeId}/reviews`, reviewData)
      await fetchUserReviews()
      await fetchReviewsByRecipe(recipeId)
      await fetchReviewStats(recipeId)
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la création de l\'avis'
      console.error('Erreur lors de la création de l\'avis:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateReview(recipeId: number, reviewData: Partial<Omit<Review, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.put(`/recipes/${recipeId}/reviews`, reviewData)
      await fetchUserReviews()
      await fetchReviewsByRecipe(recipeId)
      await fetchReviewStats(recipeId)
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la mise à jour de l\'avis'
      console.error('Erreur lors de la mise à jour de l\'avis:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteReview(recipeId: number) {
    isLoading.value = true
    error.value = null
    
    try {
      await apiService.delete(`/recipes/${recipeId}/reviews`)
      await fetchUserReviews()
      await fetchReviewsByRecipe(recipeId)
      await fetchReviewStats(recipeId)
      return true
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la suppression de l\'avis'
      console.error('Erreur lors de la suppression de l\'avis:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    reviews,
    userReviews,
    currentRecipeReviews,
    reviewStats,
    isLoading,
    error,
    hasUserReviewed,
    getUserReviewForRecipe,
    fetchReviewsByRecipe,
    fetchReviewStats,
    fetchUserReviews,
    createReview,
    updateReview,
    deleteReview
  }
})