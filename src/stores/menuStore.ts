export interface Menu {
    id: number
    name: string
    startDate: string
    endDate: string
    recipes: number[]
  }
  
  export const useMenuStore = defineStore('menu', () => {
    const menus = ref<Menu[]>([])
    const activeMenu = ref<Menu | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)
  
    async function fetchMenus() {
      try {
        isLoading.value = true
        const response = await apiService.menus.getAll()
        menus.value = response.data
      } catch (err) {
        error.value = 'Erreur lors du chargement des menus'
      } finally {
        isLoading.value = false
      }
    }
  
    async function fetchActiveMenu() {
      try {
        isLoading.value = true
        const response = await apiService.menus.getActive()
        activeMenu.value = response.data
      } catch (err) {
        error.value = 'Erreur lors du chargement du menu actif'
      } finally {
        isLoading.value = false
      }
    }
  
    async function createMenu(menuData: Omit<Menu, 'id'>) {
      try {
        isLoading.value = true
        const response = await apiService.menus.create(menuData)
        menus.value.push(response.data)
        return response.data
      } catch (err) {
        error.value = 'Erreur lors de la création du menu'
        return null
      } finally {
        isLoading.value = false
      }
    }
  
    async function updateMenu(id: number, menuData: Partial<Menu>) {
      try {
        isLoading.value = true
        const response = await apiService.menus.update(id, menuData)
        const index = menus.value.findIndex(menu => menu.id === id)
        if (index !== -1) {
          menus.value[index] = response.data
        }
        return response.data
      } catch (err) {
        error.value = 'Erreur lors de la mise à jour du menu'
        return null
      } finally {
        isLoading.value = false
      }
    }
  
    return {
      menus,
      activeMenu,
      isLoading,
      error,
      fetchMenus,
      fetchActiveMenu,
      createMenu,
      updateMenu
    }
  })
  