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
  servingsCount?: number
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
  
  // Ajoutez cette méthode de débogage
  function debugStoreState() {
    console.log('Store state:', {
      activeMenu: activeMenu.value,
      menus: menus.value,
      isLoading: isLoading.value,
      error: error.value
    })
  }
  
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
    console.log('Début de fetchActiveMenu')
    debugStoreState()
  
    if (isLoading.value) {
      console.warn('Chargement déjà en cours')
      return null
    }
  
    try {
      isLoading.value = true
      error.value = null
      
      // Utiliser la méthode spéciale qui gère déjà les 404 correctement
      const response = await apiService.menus.getActive()
      
      activeMenu.value = response
      console.log('Menu actif défini:', activeMenu.value)
      
      return response
    } catch (err: any) {
      console.error('Erreur détaillée fetchActiveMenu:', err)
      
      // Si ce n'est pas un 404 (déjà géré par apiService.menus.getActive)
      if (err.status !== 404) {
        error.value = 'Erreur lors du chargement du menu actif'
      }
      
      return null
    } finally {
      isLoading.value = false
      debugStoreState()
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
      
      // Calculer les dates de validité du menu
      const now = new Date()
      const validFrom = now.toISOString()
      
      // Calculer valid_to en fonction du type de menu (hebdo ou mensuel)
      let validTo
      if (params.type === 'week') {
        const endDate = new Date(now)
        endDate.setDate(now.getDate() + 7) // 7 jours pour un menu hebdomadaire
        validTo = endDate.toISOString()
      } else {
        const endDate = new Date(now)
        endDate.setDate(now.getDate() + 30) // 30 jours pour un menu mensuel
        validTo = endDate.toISOString()
      }
      
      // Structure basique de meal_schedule - exactement comme attendu par le backend
      const mealSchedule = {
        day_1: {
          breakfast: null,
          lunch: null,
          dinner: null,
          snack: null
        },
        day_2: {
          breakfast: null,
          lunch: null,
          dinner: null,
          snack: null
        },
        day_3: {
          breakfast: null,
          lunch: null,
          dinner: null,
          snack: null
        },
        day_4: {
          breakfast: null,
          lunch: null,
          dinner: null,
          snack: null
        },
        day_5: {
          breakfast: null,
          lunch: null,
          dinner: null,
          snack: null
        },
        day_6: {
          breakfast: null,
          lunch: null,
          dinner: null,
          snack: null
        },
        day_7: {
          breakfast: null,
          lunch: null,
          dinner: null,
          snack: null
        }
      }
      
      // ATTENTION: Strictement limité aux champs validés par le schéma Joi
      // weeklyMenuSchema = Joi.object({
      //   type: Joi.string().valid('weekly', 'monthly').required(),
      //   meal_schedule: Joi.object().required(),
      //   status: Joi.string().valid('active', 'archived', 'draft').default('active'),
      //   is_customized: Joi.boolean().default(false),
      //   valid_from: Joi.date().iso().required(),
      //   valid_to: Joi.date().iso().greater(Joi.ref('valid_from')).required()
      // }).required();
      const apiParams = {
        type: params.type === 'week' ? 'weekly' : 'monthly',
        meal_schedule: mealSchedule,
        valid_from: validFrom,
        valid_to: validTo
        // Les champs status et is_customized ont des valeurs par défaut dans le schéma
      }
      
      console.log('Paramètres API convertis:', apiParams)
      
      const response = await apiService.menus.generateMenu(apiParams)
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