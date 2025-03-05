import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from './NotificationStore'
import { useAuthStore } from './auth'
import { useSubscriptionStore } from './subscription'
import api, { apiService } from '@/api/config'

export interface Recipe {
  id: number
  title: string
  description: string
  ingredients: any
  steps: any
  prep_time: number
  cook_time: number
  servings: number
  difficulty_level: 'easy' | 'medium' | 'hard'
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert'
  image_url?: string
  is_premium?: boolean
  category?: string
  origin?: string
  season?: string
  rating?: number
  author_id?: number
  author_email?: string
  favorite_count?: string
  average_rating?: string
}

export const useRecipeStore = defineStore('recipe', () => {
  // Dépendances
  const router = useRouter()
  const notificationStore = useNotificationStore()
  const authStore = useAuthStore()
  const subscriptionStore = useSubscriptionStore()
  
  // États
  const recipes = ref<Recipe[]>([])
  const filteredRecipes = ref<Recipe[]>([])
  const currentRecipe = ref<Recipe | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const itemsPerPage = ref(20)
  const totalItems = ref(0)
  const searchQuery = ref('')
  const filterOptions = ref({
    difficulty_level: null as 'easy' | 'medium' | 'hard' | null,
    maxPrepTime: null as number | null,
    meal_type: null as 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | null
  })

  // Computed properties
  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
  
  const accessibleRecipes = computed(() => {
    return recipes.value.filter(recipe => 
      !recipe.is_premium || subscriptionStore.getCurrentPlan?.value?.id !== 'free'
    )
  })

  const recipesByCategory = computed(() => {
    const categories: Record<string, Recipe[]> = {
      'breakfast': [],
      'lunch': [],
      'dinner': [],
      'snack': [],
      'dessert': []
    }
    
    recipes.value.forEach(recipe => {
      if (recipe.meal_type && categories[recipe.meal_type]) {
        categories[recipe.meal_type].push(recipe)
      }
    })
    
    return categories
  })

  // Actions
  async function fetchAllRecipes() {
    try {
      isLoading.value = true;
      error.value = null;
      
      console.log("Fetching recipes...");
      
      // Préparer les paramètres de requête
      const params: Record<string, any> = {};
      
      // Ajouter les filtres si présents
      if (searchQuery.value) params.search = searchQuery.value;
      if (filterOptions.value.difficulty_level) params.difficulty = filterOptions.value.difficulty_level;
      if (filterOptions.value.maxPrepTime) params.maxPrepTime = filterOptions.value.maxPrepTime;
      if (filterOptions.value.meal_type) params.type = filterOptions.value.meal_type;
      
      // Utiliser le namespace recipes de apiService
      const response = await apiService.recipes.getAll(params);
      
      // Afficher la structure complète de la réponse pour déboguer
      console.log("API response structure:", JSON.stringify(response, null, 2));
      
      // Adapter le traitement selon la structure réelle de la réponse
      // Si la réponse est directement un tableau de recettes
      if (Array.isArray(response)) {
        recipes.value = response;
        totalItems.value = response.length;
      } 
      // Si la réponse a une structure avec un champ 'data'
      else if (response && response.data) {
        // Si data est un tableau
        if (Array.isArray(response.data)) {
          recipes.value = response.data;
        } else {
          // Si data est un objet qui contient les recettes
          recipes.value = response.data.recipes || [];
        }
        
        totalItems.value = response.totalCount || recipes.value.length;
      } 
      // Autre format de réponse possible
      else {
        recipes.value = [];
        totalItems.value = 0;
        throw new Error("Format de réponse API non reconnu");
      }
      
      // Ajouter la catégorie pour compatibilité avec l'UI
      recipes.value = recipes.value.map(recipe => ({
        ...recipe,
        category: getCategoryFromMealType(recipe.meal_type)
      }));
      
      console.log("Recipes loaded:", recipes.value.length);
      return recipes.value;
    } catch (err: any) {
      handleError(err, 'Erreur lors du chargement des recettes');
      return [];
    } finally {
      isLoading.value = false;
    }
  }
  // Fonction utilitaire pour convertir meal_type en category
  function getCategoryFromMealType(mealType: string): string {
    switch (mealType) {
      case 'breakfast': return 'Petit-déjeuner';
      case 'lunch': return 'Déjeuner';
      case 'dinner': return 'Dîner';
      case 'snack': return 'En-cas';
      case 'dessert': return 'Dessert';
      default: return 'Autre';
    }
  }

  async function fetchRecipeById(id: number) {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await api.get(`/api/v1/recipes/${id}`);
      
      if (response && response.data) {
        // Déterminer si la réponse est déjà l'objet recette ou contient un champ data
        const recipeData = response.data.data || response.data;
        
        // Adapter la recette pour l'affichage
        currentRecipe.value = {
          ...recipeData,
          category: getCategoryFromMealType(recipeData.meal_type)
        };
        
        return currentRecipe.value;
      }
      
      throw new Error("Recette non trouvée");
    } catch (err: any) {
      handleError(err, `Erreur lors du chargement de la recette #${id}`);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function searchRecipes(query: string) {
    searchQuery.value = query;
    currentPage.value = 1;
    await fetchAllRecipes();
  }

  async function filterByMealType(mealType: string | null) {
    filterOptions.value.meal_type = mealType as any;
    currentPage.value = 1;
    await fetchAllRecipes();
  }

  function setPage(page: number) {
    currentPage.value = page;
    fetchAllRecipes();
  }

  function clearError() {
    error.value = null;
  }

  function handleError(err: any, defaultMessage: string) {
    console.error(defaultMessage, err);
    
    // Vérifier si l'erreur a une réponse API
    if (err.response?.data?.error) {
      error.value = err.response.data.error;
    } else if (err.message) {
      error.value = err.message;
    } else {
      error.value = defaultMessage;
    }
    
    notificationStore.error(error.value || defaultMessage);
  }

  // Initialisation - Charger les recettes au démarrage du store
  function initialize() {
    console.log("Initializing recipe store...");
    fetchAllRecipes();
  }

  return {
    // États
    recipes,
    filteredRecipes,
    currentRecipe,
    isLoading,
    error,
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    searchQuery,
    filterOptions,
    
    // Computed
    accessibleRecipes,
    recipesByCategory,
    
    // Actions
    fetchAllRecipes,
    fetchRecipeById,
    searchRecipes,
    filterByMealType,
    setPage,
    clearError,
    initialize
  }
})