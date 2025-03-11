<template>
    <div>
      <h1 class="text-2xl font-bold text-mocha-800 dark:text-mocha-100 mb-6">Tableau de bord administration</h1>
      
      <!-- Cartes statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total recettes -->
        <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-mocha-500 dark:text-mocha-400">Total recettes</p>
              <p class="text-3xl font-bold text-mocha-800 dark:text-mocha-100">{{ stats.totalRecipes }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-full text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <ClipboardDocumentListIcon class="h-6 w-6" />
            </div>
          </div>
          <div class="mt-4 text-sm">
            <span :class="[
              stats.recipesTrend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            ]">
              {{ stats.recipesTrend > 0 ? '+' : '' }}{{ stats.recipesTrend }}%
            </span>
            <span class="text-mocha-500 dark:text-mocha-400 ml-1">depuis le mois dernier</span>
          </div>
        </div>
        
        <!-- Utilisateurs actifs -->
        <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-mocha-500 dark:text-mocha-400">Utilisateurs actifs</p>
              <p class="text-3xl font-bold text-mocha-800 dark:text-mocha-100">{{ stats.activeUsers }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-full text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <UsersIcon class="h-6 w-6" />
            </div>
          </div>
          <div class="mt-4 text-sm">
            <span :class="[
              stats.usersTrend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            ]">
              {{ stats.usersTrend > 0 ? '+' : '' }}{{ stats.usersTrend }}%
            </span>
            <span class="text-mocha-500 dark:text-mocha-400 ml-1">depuis le mois dernier</span>
          </div>
        </div>
        
        <!-- Abonnements -->
        <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-mocha-500 dark:text-mocha-400">Abonnements Premium</p>
              <p class="text-3xl font-bold text-mocha-800 dark:text-mocha-100">{{ stats.premiumUsers }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-full text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <CreditCardIcon class="h-6 w-6" />
            </div>
          </div>
          <div class="mt-4 text-sm">
            <span :class="[
              stats.premiumTrend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            ]">
              {{ stats.premiumTrend > 0 ? '+' : '' }}{{ stats.premiumTrend }}%
            </span>
            <span class="text-mocha-500 dark:text-mocha-400 ml-1">depuis le mois dernier</span>
          </div>
        </div>
        
        <!-- Performance cache -->
        <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-mocha-500 dark:text-mocha-400">Ratio Cache (Hits)</p>
              <p class="text-3xl font-bold text-mocha-800 dark:text-mocha-100">{{ stats.cacheRatio }}%</p>
            </div>
            <div class="p-3 bg-amber-100 rounded-full text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <ServerStackIcon class="h-6 w-6" />
            </div>
          </div>
          <div class="mt-4 text-sm">
            <span class="text-mocha-500 dark:text-mocha-400">{{ stats.cacheHits }} hits / {{ stats.cacheMisses }} misses</span>
          </div>
        </div>
      </div>
      
      <!-- Listes d'actions rapides et statistiques -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Actions rapides -->
        <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6 lg:col-span-1">
          <h2 class="text-lg font-semibold text-mocha-800 dark:text-mocha-100 mb-4">Actions rapides</h2>
          <div class="space-y-3">
            <router-link 
              to="/admin/recipes/create" 
              class="flex items-center px-4 py-3 bg-mocha-50 hover:bg-mocha-100 dark:bg-mocha-800 dark:hover:bg-mocha-700 rounded-lg transition"
            >
              <div class="p-2 mr-3 bg-mocha-200 dark:bg-mocha-600 rounded-full">
                <PlusIcon class="h-5 w-5 text-mocha-700 dark:text-mocha-300" />
              </div>
              <span class="font-medium text-mocha-700 dark:text-mocha-300">Ajouter une recette</span>
            </router-link>
            
            <router-link 
              to="/admin/cache" 
              class="flex items-center px-4 py-3 bg-mocha-50 hover:bg-mocha-100 dark:bg-mocha-800 dark:hover:bg-mocha-700 rounded-lg transition"
            >
              <div class="p-2 mr-3 bg-mocha-200 dark:bg-mocha-600 rounded-full">
                <ServerStackIcon class="h-5 w-5 text-mocha-700 dark:text-mocha-300" />
              </div>
              <span class="font-medium text-mocha-700 dark:text-mocha-300">Gérer le cache</span>
            </router-link>
            
            <button 
              @click="refreshStats"
              class="w-full flex items-center px-4 py-3 bg-mocha-50 hover:bg-mocha-100 dark:bg-mocha-800 dark:hover:bg-mocha-700 rounded-lg transition"
            >
              <div class="p-2 mr-3 bg-mocha-200 dark:bg-mocha-600 rounded-full">
                <ArrowPathIcon class="h-5 w-5 text-mocha-700 dark:text-mocha-300" />
              </div>
              <span class="font-medium text-mocha-700 dark:text-mocha-300">Rafraîchir les stats</span>
            </button>
            
            <button 
              @click="extractRecipeModalOpen = true"
              class="w-full flex items-center px-4 py-3 bg-mocha-50 hover:bg-mocha-100 dark:bg-mocha-800 dark:hover:bg-mocha-700 rounded-lg transition"
            >
              <div class="p-2 mr-3 bg-mocha-200 dark:bg-mocha-600 rounded-full">
                <ArrowDownTrayIcon class="h-5 w-5 text-mocha-700 dark:text-mocha-300" />
              </div>
              <span class="font-medium text-mocha-700 dark:text-mocha-300">Extraire une recette</span>
            </button>
          </div>
        </div>
        
        <!-- Recettes récentes -->
        <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6 lg:col-span-2">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-mocha-800 dark:text-mocha-100">Recettes récentes</h2>
            <router-link to="/admin/recipes" class="text-sm text-mocha-600 dark:text-mocha-300 hover:underline">
              Voir toutes les recettes
            </router-link>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-mocha-200 dark:divide-mocha-700">
              <thead>
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">
                    Titre
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-mocha-200 dark:divide-mocha-700">
                <tr v-for="recipe in recentRecipes" :key="recipe.id" class="hover:bg-mocha-50 dark:hover:bg-mocha-800/50">
                  <td class="px-4 py-3 whitespace-nowrap">
                    <router-link 
                      :to="`/admin/recipes/${recipe.id}/edit`"
                      class="text-mocha-700 dark:text-mocha-300 hover:text-mocha-900 dark:hover:text-mocha-100"
                    >
                      {{ recipe.title }}
                    </router-link>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-mocha-600 dark:text-mocha-400">
                    {{ recipe.meal_type === 'breakfast' ? 'Petit-déjeuner' : 
                       recipe.meal_type === 'lunch' ? 'Déjeuner' :
                       recipe.meal_type === 'dinner' ? 'Dîner' :
                       recipe.meal_type === 'snack' ? 'En-cas' : 
                       recipe.meal_type === 'dessert' ? 'Dessert' : 'Autre' }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': recipe.status === 'published',
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300': recipe.status === 'draft',
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300': recipe.status === 'review',
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300': recipe.status === 'archived'
                      }"
                    >
                      {{ recipe.status === 'published' ? 'Publié' : 
                         recipe.status === 'draft' ? 'Brouillon' : 
                         recipe.status === 'review' ? 'En révision' : 
                         recipe.status === 'archived' ? 'Archivé' : recipe.status || 'Publié' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-mocha-600 dark:text-mocha-400">
                    {{ formatDate(recipe.updated_at || recipe.created_at) }}
                  </td>
                </tr>
                <tr v-if="recentRecipes.length === 0">
                  <td colspan="4" class="px-4 py-6 text-center text-mocha-500 dark:text-mocha-400">
                    Aucune recette récente trouvée
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Statistiques et graphiques -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Répartition des types de recettes -->
        <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-mocha-800 dark:text-mocha-100 mb-4">Types de recettes</h2>
          <div class="flex justify-between items-center text-center">
            <div v-for="(count, type) in recipeTypeCounts" :key="type" class="flex flex-col">
              <span class="text-xl font-bold text-mocha-800 dark:text-mocha-100">{{ count }}</span>
              <span class="text-sm text-mocha-600 dark:text-mocha-400">
                {{ type === 'breakfast' ? 'P. déjeuner' : 
                   type === 'lunch' ? 'Déjeuner' :
                   type === 'dinner' ? 'Dîner' :
                   type === 'snack' ? 'En-cas' : 
                   type === 'dessert' ? 'Dessert' : 'Autre' }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Répartition des statuts -->
        <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-mocha-800 dark:text-mocha-100 mb-4">Statuts des recettes</h2>
          <div class="flex justify-between items-center text-center">
            <div v-for="(count, status) in recipeStatusCounts" :key="status" class="flex flex-col">
              <span class="text-xl font-bold"
                :class="{
                  'text-green-600 dark:text-green-400': status === 'published',
                  'text-yellow-600 dark:text-yellow-400': status === 'draft',
                  'text-blue-600 dark:text-blue-400': status === 'review',
                  'text-gray-600 dark:text-gray-400': status === 'archived'
                }">
                {{ count }}
              </span>
              <span class="text-sm text-mocha-600 dark:text-mocha-400">
                {{ status === 'published' ? 'Publiés' : 
                   status === 'draft' ? 'Brouillons' : 
                   status === 'review' ? 'En révision' : 
                   status === 'archived' ? 'Archivés' : 'Autre' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal pour l'extraction de recette -->
      <RecipeExtractModal
        :is-open="extractRecipeModalOpen"
        @close="extractRecipeModalOpen = false"
        @extract-success="handleExtractSuccess"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useAdminRecipeStore } from '@/stores/adminRecipeStore'
  import { 
    ClipboardDocumentListIcon, 
    UsersIcon,
    CreditCardIcon,
    ServerStackIcon, 
    PlusIcon,
    ArrowPathIcon,
    ArrowDownTrayIcon
  } from '@heroicons/vue/24/outline'
  import RecipeExtractModal from '@/views/admin/recipes/RecipeExtractModal.vue'
  
  // Indiquer au composant parent le titre de la page
  defineEmits(['update:page-title'])
  onMounted(() => {
    emit('update:page-title', 'Tableau de bord')
  })
  
  // Stores
  const adminRecipeStore = useAdminRecipeStore()
  
  // États
  const extractRecipeModalOpen = ref(false)
  
  // Statistiques
  const stats = ref({
    totalRecipes: 0,
    recipesTrend: 5.2,
    activeUsers: 0,
    usersTrend: 12.8,
    premiumUsers: 0,
    premiumTrend: 7.5,
    cacheRatio: 0,
    cacheHits: 0,
    cacheMisses: 0
  })
  
  const recentRecipes = ref([])
  const recipeTypeCounts = ref({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    dessert: 0,
    snack: 0
  })
  const recipeStatusCounts = ref({
    published: 0,
    draft: 0,
    review: 0,
    archived: 0
  })
  
  // Charger les données
  const loadDashboardData = async () => {
    try {
      // Charger les statistiques principales
      const dashboardStats = await adminRecipeStore.fetchDashboardStats()
      
      // Mettre à jour les statistiques
      if (dashboardStats) {
        stats.value = {
          ...stats.value,
          ...dashboardStats
        }
      }
      
      // Charger les recettes récentes
      recentRecipes.value = await adminRecipeStore.fetchRecentRecipes(5)
      
      // Compter les types de recettes
      const typeCounts = {}
      const statusCounts = {}
      
      adminRecipeStore.recipes.forEach(recipe => {
        // Compter par type
        const type = recipe.meal_type || 'other'
        typeCounts[type] = (typeCounts[type] || 0) + 1
        
        // Compter par statut
        const status = recipe.status || 'published'
        statusCounts[status] = (statusCounts[status] || 0) + 1
      })
      
      recipeTypeCounts.value = typeCounts
      recipeStatusCounts.value = statusCounts
      
    } catch (error) {
      console.error('Erreur lors du chargement des données du tableau de bord:', error)
    }
  }
  
  // Formater une date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  // Rafraîchir les statistiques
  const refreshStats = () => {
    loadDashboardData()
  }
  
  // Gérer le succès de l'extraction
  const handleExtractSuccess = (extractedRecipe) => {
    loadDashboardData()
  }
  
  // Charger les données au montage du composant
  onMounted(() => {
    loadDashboardData()
  })
  </script>