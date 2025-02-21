export interface Recipe {
    id: number
    title: string
    description: string
    ingredients: string[]
    instructions: string[]
    prepTime: number
    cookTime: number
    servings: number
    difficulty: 'easy' | 'medium' | 'hard'
    imageUrl?: string
  }
  
  export const useRecipeStore = defineStore('recipe', () => {
    const recipes = ref<Recipe[]>([])
    const currentRecipe = ref<Recipe | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)
  
    async function fetchAllRecipes() {
      try {
        isLoading.value = true
        const response = await apiService.recipes.getAll()
        recipes.value = response.data
      } catch (err) {
        error.value = 'Erreur lors du chargement des recettes'
      } finally {
        isLoading.value = false
      }
    }
  
    async function fetchRecipeById(id: number) {
      try {
        isLoading.value = true
        const response = await apiService.recipes.getOne(id)
        currentRecipe.value = response.data
      } catch (err) {
        error.value = 'Erreur lors du chargement de la recette'
      } finally {
        isLoading.value = false
      }
    }
  
    return {
      recipes,
      currentRecipe,
      isLoading,
      error,
      fetchAllRecipes,
      fetchRecipeById
    }
  })