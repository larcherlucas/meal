export const useFavoriteStore = defineStore('favorite', () => {
    const favorites = ref<number[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)
  
    async function fetchFavorites() {
      try {
        isLoading.value = true
        const response = await apiService.favorites.getAll()
        favorites.value = response.data.map((fav: any) => fav.recipeId)
      } catch (err) {
        error.value = 'Erreur lors du chargement des favoris'
      } finally {
        isLoading.value = false
      }
    }
  
    async function toggleFavorite(recipeId: number) {
      try {
        isLoading.value = true
        const isFavorite = favorites.value.includes(recipeId)
        
        if (isFavorite) {
          await apiService.favorites.delete(recipeId)
          favorites.value = favorites.value.filter(id => id !== recipeId)
        } else {
          await apiService.favorites.create({ recipeId })
          favorites.value.push(recipeId)
        }
      } catch (err) {
        error.value = 'Erreur lors de la modification des favoris'
      } finally {
        isLoading.value = false
      }
    }
  
    return {
      favorites,
      isLoading,
      error,
      fetchFavorites,
      toggleFavorite
    }
  })