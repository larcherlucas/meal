import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '../api/config'
import { useAuthStore } from './auth'
import { useNotificationStore } from './NotificationStore'

interface SeasonalItem {
  id: number
  name: string
  type: 'fruit' | 'vegetable' | 'herb' | 'other'
  seasons: ('spring' | 'summer' | 'autumn' | 'winter')[]
  description: string
  nutritionalInfo?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

// Type pour les filtres
interface SeasonalFilters {
  type?: 'fruit' | 'vegetable' | 'herb' | 'other'
  season?: 'spring' | 'summer' | 'autumn' | 'winter'
  searchTerm?: string
}

export const useSeasonalItemsStore = defineStore('seasonalItems', () => {
  const items = ref<SeasonalItem[]>([])
  const currentItem = ref<SeasonalItem | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()
  const filters = ref<SeasonalFilters>({})

  const isAdmin = computed(() => authStore.isAdmin)
  
  const currentSeasonItems = computed(() => {
    const date = new Date()
    const month = date.getMonth()
    
    let currentSeason: 'spring' | 'summer' | 'autumn' | 'winter'
    
    if (month >= 2 && month <= 4) currentSeason = 'spring'
    else if (month >= 5 && month <= 7) currentSeason = 'summer'
    else if (month >= 8 && month <= 10) currentSeason = 'autumn'
    else currentSeason = 'winter'
    
    return items.value.filter(item => item.seasons.includes(currentSeason))
  })

  const itemsByType = computed(() => {
    const result: Record<string, SeasonalItem[]> = {
      fruit: [],
      vegetable: [],
      herb: [],
      other: []
    }
    
    items.value.forEach(item => {
      if (result[item.type]) {
        result[item.type].push(item)
      }
    })
    
    return result
  })

  const filteredItems = computed(() => {
    let result = items.value
    
    if (filters.value.type) {
      result = result.filter(item => item.type === filters.value.type)
    }
    
    if (filters.value.season) {
      result = result.filter(item => item.seasons.includes(filters.value.season as any))
    }
    
    if (filters.value.searchTerm) {
      const searchLower = filters.value.searchTerm.toLowerCase()
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchLower) || 
        item.description.toLowerCase().includes(searchLower)
      )
    }
    
    return result
  })

  function setFilters(newFilters: SeasonalFilters) {
    filters.value = { ...newFilters }
  }

  function resetFilters() {
    filters.value = {}
  }

  async function fetchAll() {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.get('/seasonal-items')
      items.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des produits saisonniers'
      console.error('Erreur lors du chargement des produits saisonniers:', err)
      notificationStore.showError('Erreur lors du chargement des produits saisonniers')
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id: number) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.get(`/seasonal-items/${id}`)
      currentItem.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || `Erreur lors du chargement du produit #${id}`
      console.error(`Erreur lors du chargement du produit #${id}:`, err)
      notificationStore.showError(`Erreur lors du chargement du produit #${id}`)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchByType(type: string) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.get(`/seasonal-items/type/${type}`)
      return response.data
    } catch (err: any) {
      error.value = err.message || `Erreur lors du chargement des produits de type ${type}`
      console.error(`Erreur lors du chargement des produits de type ${type}:`, err)
      notificationStore.showError(`Erreur lors du chargement des produits de type ${type}`)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function fetchBySeason(season: 'spring' | 'summer' | 'autumn' | 'winter') {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.get(`/seasonal-items/season/${season}`)
      return response.data
    } catch (err: any) {
      error.value = err.message || `Erreur lors du chargement des produits de saison ${season}`
      console.error(`Erreur lors du chargement des produits de saison ${season}:`, err)
      notificationStore.showError(`Erreur lors du chargement des produits de saison ${season}`)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function createItem(itemData: Omit<SeasonalItem, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!isAdmin.value) {
      error.value = "Vous n'avez pas les droits pour créer un produit saisonnier"
      notificationStore.showError("Vous n'avez pas les droits pour créer un produit saisonnier")
      throw new Error("Accès non autorisé")
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.post('/seasonal-items', itemData)
      await fetchAll()
      notificationStore.showSuccess(`Produit ${itemData.name} créé avec succès`)
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la création du produit saisonnier'
      console.error('Erreur lors de la création du produit saisonnier:', err)
      notificationStore.showError('Erreur lors de la création du produit saisonnier')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateItem(id: number, itemData: Partial<Omit<SeasonalItem, 'id' | 'createdAt' | 'updatedAt'>>) {
    if (!isAdmin.value) {
      error.value = "Vous n'avez pas les droits pour modifier un produit saisonnier"
      notificationStore.showError("Vous n'avez pas les droits pour modifier un produit saisonnier")
      throw new Error("Accès non autorisé")
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.put(`/seasonal-items/${id}`, itemData)
      await fetchAll()
      
      if (currentItem.value && currentItem.value.id === id) {
        currentItem.value = response.data
      }
      
      notificationStore.showSuccess(`Produit #${id} mis à jour avec succès`)
      return response.data
    } catch (err: any) {
      error.value = err.message || `Erreur lors de la mise à jour du produit #${id}`
      console.error(`Erreur lors de la mise à jour du produit #${id}:`, err)
      notificationStore.showError(`Erreur lors de la mise à jour du produit #${id}`)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteItem(id: number) {
    if (!isAdmin.value) {
      error.value = "Vous n'avez pas les droits pour supprimer un produit saisonnier"
      notificationStore.showError("Vous n'avez pas les droits pour supprimer un produit saisonnier")
      throw new Error("Accès non autorisé")
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      await apiService.delete(`/seasonal-items/${id}`)
      items.value = items.value.filter(item => item.id !== id)
      
      if (currentItem.value && currentItem.value.id === id) {
        currentItem.value = null
      }
      
      notificationStore.showSuccess(`Produit #${id} supprimé avec succès`)
      return true
    } catch (err: any) {
      error.value = err.message || `Erreur lors de la suppression du produit #${id}`
      console.error(`Erreur lors de la suppression du produit #${id}:`, err)
      notificationStore.showError(`Erreur lors de la suppression du produit #${id}`)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function checkItemsForRecipe(ingredientNames: string[]) {
    // Vérifier quels ingrédients sont de saison
    const lowercaseNames = ingredientNames.map(name => name.toLowerCase())
    const currentSeason = getCurrentSeason()
    
    const inSeasonItems = items.value.filter(item => 
      lowercaseNames.includes(item.name.toLowerCase()) && 
      item.seasons.includes(currentSeason)
    )
    
    return {
      inSeason: inSeasonItems.map(item => item.name),
      notInSeason: ingredientNames.filter(name => 
        !inSeasonItems.map(item => item.name.toLowerCase()).includes(name.toLowerCase())
      )
    }
  }

  function getCurrentSeason() {
    const date = new Date()
    const month = date.getMonth()
    
    if (month >= 2 && month <= 4) return 'spring'
    else if (month >= 5 && month <= 7) return 'summer'
    else if (month >= 8 && month <= 10) return 'autumn'
    else return 'winter'
  }

  // Initialiser le store lors de sa création
  fetchAll()

  return {
    items,
    currentItem,
    isLoading,
    error,
    filters,
    currentSeasonItems,
    itemsByType,
    filteredItems,
    isAdmin,
    fetchAll,
    fetchById,
    fetchByType,
    fetchBySeason,
    createItem,
    updateItem,
    deleteItem,
    setFilters,
    resetFilters,
    checkItemsForRecipe,
    getCurrentSeason
  }
})