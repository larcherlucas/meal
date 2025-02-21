import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '../api/config'
import { useAuthStore } from './authStore'

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

export const useSeasonalItemsStore = defineStore('seasonalItems', () => {
  const items = ref<SeasonalItem[]>([])
  const currentItem = ref<SeasonalItem | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()

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
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function createItem(itemData: Omit<SeasonalItem, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!isAdmin.value) {
      error.value = "Vous n'avez pas les droits pour créer un produit saisonnier"
      throw new Error("Accès non autorisé")
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.post('/seasonal-items', itemData)
      await fetchAll()
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la création du produit saisonnier'
      console.error('Erreur lors de la création du produit saisonnier:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateItem(id: number, itemData: Partial<Omit<SeasonalItem, 'id' | 'createdAt' | 'updatedAt'>>) {
    if (!isAdmin.value) {
      error.value = "Vous n'avez pas les droits pour modifier un produit saisonnier"
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
      
      return response.data
    } catch (err: any) {
      error.value = err.message || `Erreur lors de la mise à jour du produit #${id}`
      console.error(`Erreur lors de la mise à jour du produit #${id}:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteItem(id: number) {
    if (!isAdmin.value) {
      error.value = "Vous n'avez pas les droits pour supprimer un produit saisonnier"
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
      
      return true
    } catch (err: any) {
      error.value = err.message || `Erreur lors de la suppression du produit #${id}`
      console.error(`Erreur lors de la suppression du produit #${id}:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Initialiser le store lors de sa création
  fetchAll()

  return {
    items,
    currentItem,
    isLoading,
    error,
    currentSeasonItems,
    itemsByType,
    isAdmin,
    fetchAll,
    fetchById,
    fetchByType,
    createItem,
    updateItem,
    deleteItem
  }
})