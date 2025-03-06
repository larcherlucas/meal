<template>
    <div>
      <!-- Grille de recettes -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- État de chargement -->
        <div v-if="isLoading" class="text-center py-10 col-span-full">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-mocha-500"></div>
          <p class="mt-2 text-mocha-600">Chargement des recettes...</p>
        </div>
        
        <!-- Affichage des recettes -->
        <template v-else>
          <!-- Carte de recette (intégrée directement) -->
          <div
            v-for="recipe in visibleRecipes"
            :key="recipe.id"
            class="bento-card group hover:shadow-xl transition-shadow cursor-pointer relative"
            @click="openRecipeModal(recipe)"
          >
            <div class="relative aspect-video rounded-lg overflow-hidden mb-4">
              <img
                :src="getImageUrl(recipe.image_url)"
                :alt="recipe.title"
                class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
              <div
                v-if="recipe.is_premium && !authStore.hasActiveSubscription"
                class="absolute inset-0 bg-black/50 flex items-center justify-center"
              >
                <router-link
                  to="/subscription"
                  class="px-4 py-2 bg-mocha-600 text-white rounded-lg hover:bg-mocha-700 transition-colors"
                  @click.stop
                >
                  Débloquer
                </router-link>
              </div>
              <!-- Badge Premium -->
              <div 
                v-if="recipe.is_premium" 
                class="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full"
              >
                Premium
              </div>
              <!-- Badge Cache (pour débogage) -->
              <div 
                v-if="recipe._fromCache" 
                class="absolute top-2 right-12 bg-blue-500 text-white text-xs px-2 py-1 rounded-full"
              >
                Cache
              </div>
              <!-- Bouton favori -->
              <button
                @click="toggleFavorite(recipe.id, $event)"
                class="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
              >
                <HeartSolidIcon
                  v-if="isFavorite(recipe.id)"
                  class="h-6 w-6 text-red-500"
                />
                <HeartIcon
                  v-else
                  class="h-6 w-6 text-gray-500"
                />
              </button>
            </div>
  
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-2 line-clamp-2">{{ recipe.title }}</h3>
              
              <div class="flex items-center text-sm font-semibold space-x-4 text-mocha-500">
                <span>{{ getDifficultyText(recipe.difficulty_level) }}</span>
                <span>{{ getTotalTime(recipe) }} min</span>
                <span>{{ getCategoryText(recipe) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Message si aucune recette -->
          <div v-if="visibleRecipes.length === 0" class="text-center py-10 col-span-full">
            <p class="text-mocha-600">Aucune recette disponible pour cette catégorie.</p>
            <p v-if="error" class="mt-2 text-red-500">{{ error }}</p>
          </div>
        </template>
      </div>
      
      <!-- Bouton Charger plus -->
      <div v-if="hasMoreRecipes" class="text-center mt-8">
        <button 
          @click="loadMoreRecipes" 
          :disabled="isLoading"
          class="px-6 py-2 bg-mocha-600 text-white rounded-lg hover:bg-mocha-700 transition-colors"
        >
          {{ isLoading ? 'Chargement...' : 'Voir plus de recettes' }}
        </button>
      </div>
      
      <!-- Statistiques du cache -->
      <div v-if="showCacheStats" class="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
        <h3 class="font-medium mb-2">Statistiques du cache</h3>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <span class="text-blue-700">Hit ratio:</span>
            <span class="font-medium">{{ (cacheStats.hitRatio * 100).toFixed(1) }}%</span>
          </div>
          <div>
            <span class="text-blue-700">Recettes en cache:</span>
            <span class="font-medium">{{ cacheStats.keys }}</span>
          </div>
          <div>
            <span class="text-blue-700">Hits:</span>
            <span class="font-medium">{{ cacheStats.hits }}</span>
          </div>
          <div>
            <span class="text-blue-700">Misses:</span>
            <span class="font-medium">{{ cacheStats.misses }}</span>
          </div>
        </div>
      </div>
      
      <!-- Modal de recette -->
      <RecipeModal
        :is-open="isModalOpen"
        :recipe="selectedRecipe"
        @close="closeModal"
        @refresh="handleRecipeRefresh"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { useRecipeStore } from '@/stores/recipeStore';
  import { useSubscriptionStore } from '@/stores/subscription';
  import { useFavoriteStore } from '@/stores/favoriteStore';
  import RecipeModal from '@/components/recipe/RecipeModal.vue';
  import { HeartIcon } from '@heroicons/vue/24/outline';
  import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid';
  
  interface RecipeFilters {
    category?: string | null;
    meal_type?: string | null;
    difficulty_level?: string | null;
    maxPrepTime?: number | null;
    premiumOnly?: boolean;
  }
  
  const props = defineProps({
    category: {
      type: String,
      default: 'all'
    },
    useCache: {
      type: Boolean,
      default: true
    },
    showCacheStats: {
      type: Boolean,
      default: false
    },
    filters: {
      type: Object as () => RecipeFilters,
      default: () => ({})
    }
  });
  
  const emit = defineEmits(['cacheStatsUpdate']);
  
  // Stores
  const authStore = useAuthStore();
  const recipeStore = useRecipeStore();
  const subscriptionStore = useSubscriptionStore();
  const favoriteStore = useFavoriteStore();
  
  // États
  const visibleRecipes = ref([]);
  const pageSize = 12;
  const currentPage = ref(1);
  const isLoading = ref(false);
  const hasMoreToLoad = ref(true);
  const error = ref('');
  
  // Modal
  const isModalOpen = ref(false);
  const selectedRecipe = ref(null);
  
  // Statistiques du cache
  const cacheStats = ref({
    hits: 0,
    misses: 0,
    keys: 0,
    hitRatio: 0
  });
  
  const hasMoreRecipes = computed(() => {
    return hasMoreToLoad.value;
  });
  
  // Observer les changements de la prop useCache
  watch(() => props.useCache, (newValue) => {
    console.log(`Cache ${newValue ? 'activé' : 'désactivé'} dans RecipeLoader`);
  });
  
  // Observer les changements des filtres
  watch(() => props.filters, () => {
    refreshAllRecipes();
  }, { deep: true });
  
  const loadMoreRecipes = async () => {
    if (isLoading.value) return;
    
    isLoading.value = true;
    error.value = '';
    
    try {
      // Préparer les paramètres de filtre
      const requestParams = {
        page: currentPage.value,
        limit: pageSize,
        ...props.filters
      };
      
      // Si category est 'all', utiliser null pour ne pas filtrer
      if (props.category !== 'all') {
        requestParams.category = props.category;
      }
      
      const result = await recipeStore.fetchAllRecipes(!props.useCache, requestParams);
      
      // Marquer les recettes qui viennent du cache
      if (props.useCache) {
        result.forEach(recipe => {
          if (recipeStore.isFromCache(recipe.id)) {
            recipe._fromCache = true;
          }
        });
      }
      
      // Ajouter uniquement les nouvelles recettes
      if (result.length < pageSize) {
        hasMoreToLoad.value = false;
      }
      
      visibleRecipes.value = [...visibleRecipes.value, ...result];
      currentPage.value++;
      
      // Mettre à jour les statistiques du cache
      updateCacheStats();
    } catch (err) {
      console.error('Erreur lors du chargement des recettes:', err);
      error.value = err.message || 'Erreur lors du chargement des recettes';
    } finally {
      isLoading.value = false;
    }
  };
  
  const toggleFavorite = async (recipeId, event) => {
    // Empêcher la propagation pour éviter l'ouverture de la modal
    if (event) {
      event.stopPropagation();
    }
    
    if (!authStore.isAuthenticated) {
      // Rediriger vers la page de connexion
      return;
    }
    
    try {
      await favoriteStore.toggleFavorite(recipeId);
    } catch (error) {
      console.error('Erreur lors de la modification des favoris:', error);
    }
  };
  
  const isFavorite = (recipeId) => {
    return favoriteStore.isFavorite(recipeId);
  };
  
  const openRecipeModal = async (recipe) => {
    // Assurer la synchronisation des données d'abonnement avant d'ouvrir la modal
    if (authStore.isAuthenticated && subscriptionStore.getCurrentPlan?.value === undefined) {
      console.log("Synchronizing subscription data...");
      await authStore.syncSubscriptionData();
      await subscriptionStore.fetchCurrentPlan();
    }
    
    // Charger les détails complets de la recette si nécessaire
    isLoading.value = true;
    try {
      const fullRecipe = await recipeStore.fetchRecipeById(recipe.id, !props.useCache);
      if (fullRecipe) {
        // Marquer la recette comme provenant du cache si c'est le cas
        if (props.useCache && recipeStore.isFromCache(recipe.id)) {
          fullRecipe._fromCache = true;
        }
        selectedRecipe.value = fullRecipe;
        isModalOpen.value = true;
      }
    } catch (err) {
      console.error('Erreur lors du chargement des détails de la recette:', err);
      error.value = err.message || 'Erreur lors du chargement des détails de la recette';
    } finally {
      isLoading.value = false;
    }
  };
  
  const closeModal = () => {
    isModalOpen.value = false;
    selectedRecipe.value = null;
  };
  
  const handleRecipeRefresh = (recipeId) => {
    // Rafraîchir la liste des recettes visibles
    const index = visibleRecipes.value.findIndex(r => r.id === recipeId);
    if (index !== -1) {
      // Recharger toutes les recettes (ou juste celle qui a été mise à jour)
      refreshAllRecipes();
    }
  };
  
  const updateCacheStats = () => {
    const stats = recipeStore.getCacheStats();
    cacheStats.value = stats;
    emit('cacheStatsUpdate', stats);
  };
  
  const refreshAllRecipes = async () => {
    visibleRecipes.value = [];
    currentPage.value = 1;
    hasMoreToLoad.value = true;
    await loadMoreRecipes();
  };
  
  const clearCache = () => {
    recipeStore.clearCache();
    refreshAllRecipes();
  };
  
  // Fonctions d'affichage utilitaires
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/images/default-recipe.jpg';
    
    // Vérifier si l'URL est relative ou absolue
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Pour les images stockées localement
    return '/images/default-recipe.jpg';
  };
  
  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Facile';
      case 'medium': return 'Moyen';
      case 'hard': return 'Difficile';
      default: return 'Moyen';
    }
  };
  
  const getTotalTime = (recipe) => {
    return (recipe.prep_time || 0) + (recipe.cook_time || 0);
  };
  
  const getCategoryText = (recipe) => {
    if (recipe.category) return recipe.category;
    
    switch (recipe.meal_type) {
      case 'breakfast': return 'Petit-déjeuner';
      case 'lunch': return 'Déjeuner';
      case 'dinner': return 'Dîner';
      case 'snack': return 'En-cas';
      case 'dessert': return 'Dessert';
      default: return 'Autre';
    }
  };
  
  onMounted(async () => {
    // Initialiser les favoris si l'utilisateur est connecté
    if (authStore.isAuthenticated) {
      favoriteStore.initialize();
    }
    
    await loadMoreRecipes();
  });
  
  // Exposer les méthodes pour le composant parent
  defineExpose({
    refreshAllRecipes,
    clearCache,
    updateCacheStats
  });
  </script>