import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '../api/config'

interface DietaryRestriction {
  type: string
  name: string
  description: string
  icon?: string
}

export const useDietaryRestrictionsStore = defineStore('dietaryRestrictions', () => {
  const restrictions = ref<DietaryRestriction[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getRestrictionByType = (type: string) => {
    return computed(() => 
      restrictions.value.find(restriction => restriction.type === type)
    )
  }

  const getRestrictionsByTypes = (types: string[]) => {
    return computed(() => 
      restrictions.value.filter(restriction => types.includes(restriction.type))
    )
  }

  async function fetchAll() {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.get('/dietary-restrictions')
      restrictions.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des restrictions alimentaires'
      console.error('Erreur lors du chargement des restrictions alimentaires:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function createRestriction(restrictionData: Omit<DietaryRestriction, 'id'>) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.post('/dietary-restrictions', restrictionData)
      await fetchAll()
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la création de la restriction alimentaire'
      console.error('Erreur lors de la création de la restriction alimentaire:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateRestriction(type: string, restrictionData: Partial<DietaryRestriction>) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.put(`/dietary-restrictions/${type}`, restrictionData)
      await fetchAll()
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la mise à jour de la restriction alimentaire'
      console.error('Erreur lors de la mise à jour de la restriction alimentaire:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteRestriction(type: string) {
    isLoading.value = true
    error.value = null
    
    try {
      await apiService.delete(`/dietary-restrictions/${type}`)
      restrictions.value = restrictions.value.filter(r => r.type !== type)
      return true
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la suppression de la restriction alimentaire'
      console.error('Erreur lors de la suppression de la restriction alimentaire:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteAll() {
    isLoading.value = true
    error.value = null
    
    try {
      await apiService.delete('/dietary-restrictions')
      restrictions.value = []
      return true
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la suppression de toutes les restrictions alimentaires'
      console.error('Erreur lors de la suppression de toutes les restrictions alimentaires:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Initialiser le store lors de sa création
  fetchAll()

  return {
    restrictions,
    isLoading,
    error,
    getRestrictionByType,
    getRestrictionsByTypes,
    fetchAll,
    createRestriction,
    updateRestriction,
    deleteRestriction,
    deleteAll
  }
})