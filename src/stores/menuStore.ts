import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/api/config'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/NotificationStore'
import type { Recipe } from '@/types/index'

export interface MenuRecipe {
  id: number
  recipeId: number
  dayOfWeek: number // 0-6 pour dim-sam
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  recipe?: Recipe // Référence complète à la recette si chargée
}

export interface Menu {
  id: number
  name: string
  startDate: string
  endDate: string
  menuRecipes: MenuRecipe[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface GenerateMenuParams {
  type: 'week' | 'month'
  preferences: {
    excludedIngredients?: string[]
    dietaryRestrictions?: string[]
    mealTypes?: ('breakfast' | 'lunch' | 'dinner' | 'snack')[]
    servingsCount?: number
  }
}

export const useMenuStore = defineStore('menu', () => {
  const menus = ref<Menu[]>([])
  const activeMenu = ref<Menu | null>(null)
  const generatedMenu = ref<Menu | null>(null)
  const isLoading = ref(false)
  const isGenerating = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()

  // Computed property pour filtrer les menus par date
  const sortedMenus = computed(() => {
    return [...menus.value].sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )
  })
  
  // Vérifier si l'utilisateur a accès aux fonctionnalités premium
  const canAccessPremiumFeatures = computed(() => {
    return authStore.hasActiveSubscription
  })

  async function fetchMenus() {
    if (isLoading.value) return
    
    try {
      isLoading.value = true
      error.value = null
      
      // D'abord, assurez-vous que l'utilisateur est connecté
      if (!authStore.isAuthenticated) {
        throw new Error('Utilisateur non authentifié');
      }
      
      // Vérifiez l'état de l'abonnement directement depuis authStore
      if (authStore.hasActiveSubscription) {
        // L'utilisateur a un abonnement actif, charger les menus
        const response = await apiService.menus.getAll()
        menus.value = response.data
      } else {
        // L'utilisateur n'a pas d'abonnement actif
        menus.value = []
        notificationStore.show({
          type: 'info',
          message: 'Accès aux menus complets avec un abonnement premium'
        })
      }
    } catch (err: any) {
      error.value = 'Erreur lors du chargement des menus'
      console.error('Erreur fetchMenus:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMenuById(id: number) {
    if (isLoading.value) return null
    
    try {
      isLoading.value = true
      error.value = null
      const response = await apiService.menus.getById(id)
      // Si c'est le menu actif, mettre à jour la référence
      if (response.data.isActive) {
        activeMenu.value = response.data
      }
      
      // Mettre à jour le menu dans la liste si présent
      const index = menus.value.findIndex(menu => menu.id === id)
      if (index !== -1) {
        menus.value[index] = response.data
      }
      
      return response.data
    } catch (err: any) {
      error.value = `Erreur lors du chargement du menu #${id}`
      console.error('Erreur fetchMenuById:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchActiveMenu() {
    if (isLoading.value) return
    
    try {
      isLoading.value = true
      error.value = null
      const response = await apiService.menus.getActive()
      activeMenu.value = response.data
      
      // Ajouter ou mettre à jour dans la liste des menus
      const index = menus.value.findIndex(menu => menu.id === response.data.id)
      if (index !== -1) {
        menus.value[index] = response.data
      } else {
        menus.value.push(response.data)
      }
    } catch (err: any) {
      // Si erreur 404, c'est normal - pas de menu actif
      if (err.response && err.response.status === 404) {
        activeMenu.value = null
      } else {
        error.value = 'Erreur lors du chargement du menu actif'
        console.error('Erreur fetchActiveMenu:', err)
      }
    } finally {
      isLoading.value = false
    }
  }

  async function createMenu(menuData: Partial<Menu>) {
    if (isLoading.value) return null
    
    try {
      isLoading.value = true
      error.value = null
      const response = await apiService.menus.create(menuData)
      menus.value.push(response.data)
      
      notificationStore.show({
        type: 'success',
        message: 'Menu créé avec succès'
      })
      
      return response.data
    } catch (err: any) {
      error.value = 'Erreur lors de la création du menu'
      console.error('Erreur createMenu:', err)
      
      notificationStore.show({
        type: 'error',
        message: 'Impossible de créer le menu'
      })
      
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateMenu(id: number, menuData: Partial<Menu>) {
    if (isLoading.value) return null
    
    try {
      isLoading.value = true
      error.value = null
      const response = await apiService.menus.update(id, menuData)
      
      // Mettre à jour le menu dans la liste
      const index = menus.value.findIndex(menu => menu.id === id)
      if (index !== -1) {
        menus.value[index] = response.data
      }
      
      // Si c'est le menu actif, mettre à jour la référence
      if (activeMenu.value && activeMenu.value.id === id) {
        activeMenu.value = response.data
      }
      
      notificationStore.show({
        type: 'success',
        message: 'Menu mis à jour avec succès'
      })
      
      return response.data
    } catch (err: any) {
      error.value = 'Erreur lors de la mise à jour du menu'
      console.error('Erreur updateMenu:', err)
      
      notificationStore.show({
        type: 'error',
        message: 'Impossible de mettre à jour le menu'
      })
      
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function deleteMenu(id: number) {
    if (isLoading.value) return false
    
    try {
      isLoading.value = true
      error.value = null
      await apiService.menus.delete(id)
      
      // Supprimer le menu de la liste
      menus.value = menus.value.filter(menu => menu.id !== id)
      
      // Si c'est le menu actif, réinitialiser la référence
      if (activeMenu.value && activeMenu.value.id === id) {
        activeMenu.value = null
      }
      
      notificationStore.show({
        type: 'success',
        message: 'Menu supprimé avec succès'
      })
      
      return true
    } catch (err: any) {
      error.value = 'Erreur lors de la suppression du menu'
      console.error('Erreur deleteMenu:', err)
      
      notificationStore.show({
        type: 'error',
        message: 'Impossible de supprimer le menu'
      })
      
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function generateMenu(params: GenerateMenuParams) {
    // Vérifier si l'utilisateur a un abonnement actif
    if (!canAccessPremiumFeatures.value) {
      notificationStore.show({
        type: 'warning',
        message: 'La génération de menu nécessite un abonnement actif'
      })
      return null
    }
    
    if (isGenerating.value) return null
    
    try {
      isGenerating.value = true
      error.value = null
      
      // Notification pour indiquer le début de la génération
      notificationStore.show({
        type: 'info',
        message: 'Génération de votre menu en cours...'
      })
      
      const response = await apiService.menus.generateMenu(params)
      generatedMenu.value = response.data
      
      // Ajouter le menu généré à la liste des menus
      menus.value.push(response.data)
      
      notificationStore.show({
        type: 'success',
        message: 'Menu généré avec succès'
      })
      
      return response.data
    } catch (err: any) {
      error.value = 'Erreur lors de la génération du menu'
      console.error('Erreur generateMenu:', err)
      
      if (err.response && err.response.status === 403) {
        notificationStore.show({
          type: 'warning',
          message: 'Cette fonctionnalité nécessite un abonnement actif'
        })
      } else {
        notificationStore.show({
          type: 'error',
          message: 'Impossible de générer le menu'
        })
      }
      
      return null
    } finally {
      isGenerating.value = false
    }
  }

  // Réinitialiser les erreurs
  function clearError() {
    error.value = null
  }

  return {
    menus,
    activeMenu,
    generatedMenu,
    isLoading,
    isGenerating,
    error,
    sortedMenus,
    canAccessPremiumFeatures,
    fetchMenus,
    fetchMenuById,
    fetchActiveMenu,
    createMenu,
    updateMenu,
    deleteMenu,
    generateMenu,
    clearError
  }
})