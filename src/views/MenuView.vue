<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeMount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRecipeStore } from '@/stores/recipeStore'
import { useSubscriptionStore } from '@/stores/subscription'
import { useFavoriteStore } from '@/stores/favoriteStore'
import RecipeModal from '@/components/recipe/RecipeModal.vue'
import { HeartIcon, PencilIcon, TrashIcon, PlusIcon, EllipsisVerticalIcon, FunnelIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import { useRouter } from 'vue-router' // Importé pour la navigation
import { apiService } from '@/api/config' // Pour charger les catégories et origines

const authStore = useAuthStore()
const recipeStore = useRecipeStore()
const subscriptionStore = useSubscriptionStore()
const favoriteStore = useFavoriteStore()
const router = useRouter() // Pour la navigation

// État local
const selectedCategory = ref('Toutes')
const selectedOrigin = ref('Toutes')
const selectedAgeCategory = ref('Toutes')
const selectedRecipe = ref(null)
const isModalOpen = ref(false)
const useCache = ref(true) // État pour activer/désactiver le cache
const showActionMenu = ref(null) // ID de la recette pour laquelle afficher le menu d'actions
const showFilters = ref(false) // État pour afficher/masquer les filtres avancés

// Listes pour les filtres
const categories = computed(() => ['Toutes', 'Petit-déjeuner', 'Déjeuner', 'Dîner', 'Dessert', 'En-cas'])
const origins = ref(['Toutes']) // Sera chargé depuis l'API
const ageCategories = ref(['Toutes', 'toute la famille', 'bébé 6 à 9 mois', 'bébé 9 à 12 mois', 'bébé 12 à 18 mois', 'bébé 18 mois et +', 'enfant'])

// Mapping entre les catégories d'affichage et les meal_types API
const categoryToMealType = {
  'Toutes': null,
  'Petit-déjeuner': 'breakfast',
  'Déjeuner': 'lunch',
  'Dîner': 'dinner',
  'Dessert': 'dessert',
  'En-cas': 'snack'
}

// Vérifier si l'utilisateur est admin
const isAdmin = computed(() => authStore.user?.role === 'admin')

// Fonction de débogage de l'état d'authentification et d'abonnement
function checkAuthAndSubscription() {
  console.log("===== Auth & Subscription Status =====")
  console.log("isAuthenticated:", authStore.isAuthenticated)
  console.log("User:", authStore.user)
  console.log("hasActiveSubscription:", authStore.hasActiveSubscription)
  console.log("Token:", authStore.token ? authStore.token.substring(0, 20) + "..." : "No token")
  console.log("Subscription:", subscriptionStore.getCurrentPlan?.value)
  console.log("Cache enabled:", useCache.value)
  console.log("================================")
}

// Nouvelle fonction pour s'assurer que les données d'abonnement sont synchronisées
const ensureSubscriptionData = async () => {
  // Si le statut d'abonnement est undefined, forcer une synchronisation
  if (authStore.isAuthenticated && subscriptionStore.getCurrentPlan?.value === undefined) {
    console.log("Synchronizing subscription data...");
    await authStore.syncSubscriptionData();
    await subscriptionStore.fetchCurrentPlan();
  }
  
  checkAuthAndSubscription();
}

// Chargement des origines depuis l'API
// Dans votre composant Vue, modifiez la fonction loadOrigins
const loadOrigins = async () => {
  try {
    console.log('Chargement des origines...');
    const response = await apiService.get('/recipes/origins');
    
    // Vérification de la réponse
    if (response && response.data && Array.isArray(response.data)) {
      console.log('Origines récupérées:', response.data);
      
      // Correction des caractères potentiellement mal encodés
      const correctedOrigins = response.data.map(origin => {
        // Remplacer les caractères problématiques spécifiques si nécessaire
        return origin
          .replace('Ã§', 'ç')
          .replace('Ã©', 'é');
      });
      
      // Ajouter manuellement les origines manquantes pour être certain
      const allOrigins = [
        'français',
        'asiatique',
        'italien',
        'méditerranéen',
        'américain',
        'mexicain',
        'indien',
        'moyen-oriental',
        'africain',
        'autre'
      ];
      
      // Fusionner les origines récupérées avec la liste complète et dédupliquer
      const mergedOrigins = [...new Set([...correctedOrigins, ...allOrigins])];
      
      // Trier par ordre alphabétique
      const sortedOrigins = mergedOrigins.sort();
      
      // Ajouter 'Toutes' au début
      origins.value = ['Toutes', ...sortedOrigins];
      
      console.log('Liste finale des origines:', origins.value);
    } else {
      console.error('Format de réponse inattendu pour les origines:', response);
      origins.value = ['Toutes'].concat(defaultOrigins);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des origines:', error);
    
    // En cas d'erreur, utiliser une liste par défaut
    const defaultOrigins = [
      'français',
      'asiatique', 
      'italien', 
      'méditerranéen', 
      'américain', 
      'mexicain', 
      'indien', 
      'moyen-oriental', 
      'africain', 
      'autre'
    ];
    
    origins.value = ['Toutes', ...defaultOrigins];
  }
};

// Récupération des recettes filtrées
const filteredRecipes = computed(() => {
  let recipes = [...recipeStore.recipes]
  
  // Log pour débogage - statut d'abonnement
  console.log("Current subscription status:", authStore.hasActiveSubscription)
  console.log("Premium recipes count:", recipes.filter(r => r.is_premium).length)

  // Filtrer par abonnement (sauf pour les admins)
  if (!authStore.hasActiveSubscription && !isAdmin.value) {
    recipes = recipes.filter(recipe => !recipe.is_premium)
  }

  // Filtrer par catégorie
  if (selectedCategory.value !== 'Toutes') {
    const mealType = categoryToMealType[selectedCategory.value]
    if (mealType) {
      recipes = recipes.filter(recipe => recipe.meal_type === mealType)
    }
  }

  // Filtrer par origine
  if (selectedOrigin.value !== 'Toutes') {
    recipes = recipes.filter(recipe => recipe.origin === selectedOrigin.value)
  }

  // Filtrer par catégorie d'âge
  if (selectedAgeCategory.value !== 'Toutes') {
    recipes = recipes.filter(recipe => recipe.age_category === selectedAgeCategory.value)
  }

  return recipes
})

// Observer les changements de filtres et filtrer les recettes
watch([selectedCategory, selectedOrigin, selectedAgeCategory], () => {
  const mealType = categoryToMealType[selectedCategory.value]
  const params = {
    meal_type: mealType,
    origin: selectedOrigin.value !== 'Toutes' ? selectedOrigin.value : null,
    age_category: selectedAgeCategory.value !== 'Toutes' ? selectedAgeCategory.value : null
  };
  
  // Nettoyer les paramètres nuls
  Object.keys(params).forEach(key => {
    if (params[key] === null) {
      delete params[key];
    }
  });
  
  recipeStore.filterRecipes(params, !useCache.value);
})

// Gérer les favoris
const toggleFavorite = async (recipeId, event) => {
  event.stopPropagation()
  if (!authStore.isAuthenticated) {
    // Rediriger vers la page de connexion
    return
  }
  
  try {
    await favoriteStore.toggleFavorite(recipeId)
  } catch (error) {
    console.error('Erreur lors de la modification des favoris:', error)
  }
}

const isFavorite = (recipeId) => {
  return favoriteStore.isFavorite(recipeId)
}

// Ouvrir la modal de recette
const openRecipeModal = async (recipe) => {
  // Assurer la synchronisation des données d'abonnement avant d'ouvrir la modal
  await ensureSubscriptionData();
  
  selectedRecipe.value = recipe
  isModalOpen.value = true
  
  console.log("Opening recipe modal for:", recipe.id, recipe.title)
  console.log("Is premium:", recipe.is_premium)
  console.log("User role:", authStore.user?.role)
  console.log("Has active subscription:", authStore.hasActiveSubscription)
  
  // Utiliser le cache pour charger les détails de la recette si activé
  try {
    console.log("Fetching complete recipe details...")
    const fullRecipe = await recipeStore.fetchRecipeById(recipe.id, !useCache.value)
    if (fullRecipe) {
      console.log("Successfully fetched recipe details:", fullRecipe.title)
      selectedRecipe.value = fullRecipe
    } else {
      console.warn("Failed to fetch recipe details, details are null")
    }
  } catch (error) {
    console.error('Erreur lors du chargement des détails de la recette:', error)
  }
}

// Fonction utilitaire pour obtenir une URL d'image valide
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return '/images/default-recipe.jpg'
  
  // Vérifier si l'URL est relative ou absolue
  if (imageUrl.startsWith('http')) {
    return imageUrl
  }
  
  // Pour les images stockées localement
  return '/images/default-recipe.jpg'
}

// Fonction pour basculer l'affichage des filtres avancés
const toggleAdvancedFilters = () => {
  showFilters.value = !showFilters.value;
}

// Cette fonction permet de forcer la mise à jour des informations d'authentification
// et d'abonnement si nécessaire
const refreshAuthAndSubscription = async () => {
  console.log("Refreshing auth and subscription data...")
  
  if (authStore.isAuthenticated) {
    try {
      await authStore.syncSubscriptionData();
      await subscriptionStore.fetchCurrentPlan()
      console.log("Subscription refreshed:", subscriptionStore.getCurrentPlan?.value)
    } catch (err) {
      console.error("Failed to refresh subscription:", err)
    }
  } else {
    console.warn("User not authenticated, cannot refresh subscription")
  }
  
  checkAuthAndSubscription()
}

// Fonction pour rafraîchir les recettes (forcer le rechargement depuis l'API)
const refreshRecipes = async () => {
  console.log("Forcing recipe refresh from API...");
  await recipeStore.fetchAllRecipes(true);
  console.log("Recipes refreshed:", recipeStore.recipes.length);
}

// Fonction pour effacer le cache des recettes
const clearRecipeCache = () => {
  recipeStore.clearCache();
  console.log("Recipe cache cleared");
}

// Fonction pour basculer l'utilisation du cache
const toggleCache = () => {
  useCache.value = !useCache.value;
  console.log(`Cache ${useCache.value ? 'enabled' : 'disabled'}`);
}

// Nouvelles fonctions d'administration
const createRecipe = () => {
  router.push('/admin/recipes/create');
}

const editRecipe = (recipe, event) => {
  event.stopPropagation();
  router.push(`/admin/recipes/${recipe.id}/edit`);
}

const deleteRecipe = async (recipe, event) => {
  event.stopPropagation();
  if (confirm(`Êtes-vous sûr de vouloir supprimer la recette "${recipe.title}" ?`)) {
    try {
      await recipeStore.deleteRecipe(recipe.id);
      refreshRecipes();
    } catch (error) {
      console.error('Erreur lors de la suppression de la recette:', error);
    }
  }
}

// Fonction pour gérer le menu d'action (clic sur les trois points)
const toggleActionMenu = (recipeId, event) => {
  event.stopPropagation();
  showActionMenu.value = showActionMenu.value === recipeId ? null : recipeId;
}

// Fermer le menu d'action si on clique ailleurs
const closeActionMenu = () => {
  showActionMenu.value = null;
}

// Fonction pour gérer la fermeture de la modale et les actions additionnelles
const handleModalClose = () => {
  isModalOpen.value = false;
  // Si des modifications ont été apportées, refreshRecipes
  refreshRecipes();
}

// Charger les données au montage du composant
onBeforeMount(async () => {
  // Charger les origines avant le reste
  await loadOrigins();
})

onMounted(async () => {
  console.log("Component mounted")
  
  // Vérifier l'état d'authentification et d'abonnement
  checkAuthAndSubscription()
  
  // Initialiser les données d'abonnement
  if (authStore.isAuthenticated) {
    await ensureSubscriptionData();
  }
  
  // Charger les recettes (utiliser le cache si disponible)
  await recipeStore.fetchAllRecipes(!useCache.value)
  console.log("Recipes loaded:", recipeStore.recipes.length)
  
  // Initialiser les favoris si l'utilisateur est connecté
  if (authStore.isAuthenticated) {
    favoriteStore.initialize()
  }
  
  // Fermer le menu d'action au clic en dehors
  document.addEventListener('click', closeActionMenu);
  
  // Vérifier à nouveau après chargement complet
  setTimeout(() => {
    checkAuthAndSubscription()
  }, 500)
})
</script>

<template>
  <div class="space-y-6" @click="closeActionMenu">
    <!-- Debug Panel - toujours visible pour le moment -->
    <div class="bento-card bg-yellow-50 p-4">
      <h3 class="font-bold mb-2">Debug Panel</h3>
      <p>Auth: {{ authStore.isAuthenticated ? 'Connecté' : 'Non connecté' }}</p>
      <p>Subscription: {{ authStore.hasActiveSubscription ? 'Active' : 'Inactive' }}</p>
      <p>User Role: {{ authStore.user?.role || 'Non défini' }}</p>
      <p>Cache: {{ useCache ? 'Activé' : 'Désactivé' }}</p>
      <div class="flex space-x-2 mt-2">
        <button 
          @click="refreshAuthAndSubscription" 
          class="px-3 py-1 bg-blue-500 text-white rounded">
          Rafraîchir Auth
        </button>
        <button 
          @click="refreshRecipes" 
          class="px-3 py-1 bg-green-500 text-white rounded">
          Rafraîchir Recettes
        </button>
        <button 
          @click="clearRecipeCache" 
          class="px-3 py-1 bg-red-500 text-white rounded">
          Effacer Cache
        </button>
        <button 
          @click="toggleCache" 
          class="px-3 py-1" 
          :class="useCache ? 'bg-purple-500 text-white' : 'bg-gray-500 text-white'"
          >
          {{ useCache ? 'Désactiver Cache' : 'Activer Cache' }}
        </button>
      </div>
    </div>
    
    <!-- Filtres -->
    <div class="bento-card">
      <div class="flex flex-col space-y-4">
        <!-- Filtre principal par catégorie de repas -->
        <div class="flex space-x-4 overflow-x-auto pb-2">
          <button
            v-for="category in categories"
            :key="category"
            @click="selectedCategory = category"
            class="px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            :class="selectedCategory === category ? 
              'bg-mocha-100 text-mocha-700 dark:bg-mocha-900 dark:text-mocha-100' : 
              'hover:bg-gray-100 dark:hover:bg-gray-700'"
          >
            {{ category }}
          </button>
          
          <!-- Bouton pour afficher les filtres avancés -->
          <button
            @click="toggleAdvancedFilters"
            class="px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center"
            :class="showFilters ? 
              'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-100' : 
              'hover:bg-gray-100 dark:hover:bg-gray-700'"
          >
            <FunnelIcon class="h-5 w-5 mr-2" />
            Filtres avancés
          </button>
        </div>
        
        <!-- Filtres avancés (origine et âge) -->
        <div v-if="showFilters" class="px-2 pt-2 pb-2 border-t border-gray-200 dark:border-gray-700">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Filtre par origine -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Origine</label>
              <select 
                v-model="selectedOrigin" 
                class="block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option v-for="origin in origins" :key="origin" :value="origin">{{ origin }}</option>
              </select>
            </div>
            
            <!-- Filtre par âge -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Âge recommandé</label>
              <select 
                v-model="selectedAgeCategory" 
                class="block w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option v-for="age in ageCategories" :key="age" :value="age">{{ age }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="recipeStore.isLoading" class="text-center py-10">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-mocha-500"></div>
      <p class="mt-2 text-mocha-600">Chargement des recettes...</p>
    </div>

    <!-- Message si aucune recette -->
    <div v-else-if="filteredRecipes.length === 0" class="text-center py-10">
      <p class="text-mocha-600">Aucune recette disponible pour cette catégorie.</p>
      <p v-if="recipeStore.error" class="mt-2 text-red-500">{{ recipeStore.error }}</p>
    </div>

    <!-- Liste des recettes -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="recipe in filteredRecipes"
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
            v-if="recipe.is_premium && !authStore.hasActiveSubscription && !isAdmin"
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
          
          <!-- Badges -->
          <div class="absolute top-2 left-2 flex flex-wrap gap-1">
            <!-- Badge Premium -->
            <div 
              v-if="recipe.is_premium" 
              class="bg-amber-500 text-white text-xs px-2 py-1 rounded-full"
            >
              Premium
            </div>
            
            <!-- Badge Age Category -->
            <div 
              v-if="recipe.age_category && recipe.age_category !== 'toute la famille'" 
              class="bg-green-500 text-white text-xs px-2 py-1 rounded-full"
            >
              {{ recipe.age_category }}
            </div>
            
            <!-- Badge Origine -->
            <div 
              v-if="recipe.origin" 
              class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full"
            >
              {{ recipe.origin }}
            </div>
            
            <!-- Badge de statut (nouveau) -->
            <div 
              v-if="recipe.status" 
              class="text-white text-xs px-2 py-1 rounded-full"
              :class="{
                'bg-green-500': recipe.status === 'published',
                'bg-yellow-500': recipe.status === 'draft',
                'bg-blue-500': recipe.status === 'review'
              }"
            >
              {{ recipe.status === 'published' ? 'Publié' : 
                 recipe.status === 'draft' ? 'Brouillon' : 
                 recipe.status === 'review' ? 'En révision' : recipe.status }}
            </div>
            
            <!-- Badge New (si ajouté récemment) -->
            <div 
              v-if="recipe.created_at && new Date(recipe.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)" 
              class="bg-pink-500 text-white text-xs px-2 py-1 rounded-full"
            >
              Nouveau
            </div>
            
            <!-- Badge Cache (pour débogage) -->
            <div 
              v-if="recipe._fromCache" 
              class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full"
            >
              Cache
            </div>
          </div>
          
          <!-- Actions pour admin -->
          <div v-if="isAdmin" class="absolute top-2 right-2 flex space-x-1">
            <!-- Menu contextuel admin (trois points) -->
            <button
              @click="toggleActionMenu(recipe.id, $event)"
              class="p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
            >
              <EllipsisVerticalIcon class="h-5 w-5 text-gray-700" />
            </button>
            
            <!-- Menu déroulant d'actions -->
            <div 
              v-if="showActionMenu === recipe.id"
              class="absolute right-0 top-10 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden"
              @click.stop
            >
              <div class="py-1">
                <button 
                  @click="editRecipe(recipe, $event)"
                  class="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <PencilIcon class="h-4 w-4 mr-2" />
                  Modifier
                </button>
                
                <button 
                  @click="deleteRecipe(recipe, $event)"
                  class="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                >
                  <TrashIcon class="h-4 w-4 mr-2" />
                  Supprimer
                </button>
              </div>
            </div>
            
            <!-- Bouton favori (à côté du menu) -->
            <button
              @click="toggleFavorite(recipe.id, $event)"
              class="p-2 rounded-full bg-white/80 hover:bg-white transition-colors ml-1"
            >
              <HeartSolidIcon
                v-if="isFavorite(recipe.id)"
                class="h-5 w-5 text-red-500"
              />
              <HeartIcon
                v-else
                class="h-5 w-5 text-gray-500"
              />
            </button>
          </div>
          
          <!-- Bouton favori pour les non-admins -->
          <button
            v-else
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
            <span>{{ recipe.difficulty_level === 'easy' ? 'Facile' : 
                    recipe.difficulty_level === 'medium' ? 'Moyen' : 'Difficile' }}</span>
            <span>{{ recipe.prep_time + (recipe.cook_time || 0) }} min</span>
            <span>{{ recipe.category || (recipe.meal_type === 'breakfast' ? 'Petit-déjeuner' : 
                   recipe.meal_type === 'lunch' ? 'Déjeuner' :
                   recipe.meal_type === 'dinner' ? 'Dîner' :
                   recipe.meal_type === 'snack' ? 'En-cas' :
                   recipe.meal_type === 'dessert' ? 'Dessert' : 'Autre') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de recette avec passage des props admin -->
    <RecipeModal
      :is-open="isModalOpen"
      :recipe="selectedRecipe"
      :is-admin="isAdmin"
      @close="handleModalClose"
      @edit="editRecipe(selectedRecipe, $event)"
      @delete="deleteRecipe(selectedRecipe, $event)"
    />

    <!-- CTA Abonnement (ne pas afficher pour les admins) -->
    <div
      v-if="!authStore.hasActiveSubscription && !isAdmin"
      class="bento-card bg-gradient-to-r text-white text-center"
      style="background-color: rgba(86, 122, 94, 1);"
    >
      <h2 class="text-2xl font-bold mb-4"
      style="color: #fff;">Débloquez toutes les recettes !</h2>
      <p class="mb-6"
      style="color: #fff;"
      >Accédez à notre collection complète de recettes et au générateur de menus.</p>
      <router-link
        to="/subscription"
        class="inline-block px-6 py-3 bg-white text-mocha-700 rounded-lg hover:bg-mocha-50 transition-colors"
      >
        Voir les abonnements
      </router-link>
    </div>
    
    <!-- Bouton flottant "Ajouter une recette" (admin uniquement) -->
    <div v-if="isAdmin" class="fixed bottom-6 right-6 z-10">
      <button
        @click="createRecipe"
        class="w-14 h-14 rounded-full bg-mocha-600 text-white flex items-center justify-center shadow-lg hover:bg-mocha-700 transition-colors"
        title="Ajouter une recette"
      >
        <PlusIcon class="h-8 w-8" />
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Style pour les badges */
.rounded-bento {
  border-radius: 16px;
}
/* Style pour les shadow */
.shadow-bento {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Style pour les tuiles de recettes */
.bento-card {
  @apply bg-white dark:bg-gray-800 rounded-xl shadow p-4 transition-all;
}
.bento-card:hover {
  @apply shadow-lg;
}

/* Styles pour la navigation */
.nav-link {
  @apply px-3 py-2 rounded-md text-sm font-medium;
}
</style>