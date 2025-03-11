<!-- src/components/admin/RecipeStatsDashboard.vue -->
<template>
    <div class="space-y-6">
      <!-- Titre et période -->
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-mocha-800 dark:text-mocha-100">Statistiques des recettes</h2>
        <div class="flex items-center space-x-2">
          <select 
            v-model="period" 
            @change="loadStats"
            class="rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200 text-sm"
          >
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="quarter">3 derniers mois</option>
            <option value="year">12 derniers mois</option>
          </select>
          <button
            @click="loadStats"
            class="p-2 rounded-md bg-mocha-100 text-mocha-700 hover:bg-mocha-200 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600 transition"
          >
            <ArrowPathIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <!-- Indicateurs principaux -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-mocha-500 dark:text-mocha-400">Vues totales</p>
              <p class="text-3xl font-bold text-mocha-800 dark:text-mocha-100">{{ formatNumber(stats.totalViews) }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-full text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <EyeIcon class="h-6 w-6" />
            </div>
          </div>
          <div class="mt-4 text-sm">
            <span :class="[
              stats.viewsTrend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            ]">
              {{ stats.viewsTrend > 0 ? '+' : '' }}{{ stats.viewsTrend }}%
            </span>
            <span class="text-mocha-500 dark:text-mocha-400 ml-1">depuis la période précédente</span>
          </div>
        </div>
        
        <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-mocha-500 dark:text-mocha-400">Favoris ajoutés</p>
              <p class="text-3xl font-bold text-mocha-800 dark:text-mocha-100">{{ formatNumber(stats.totalFavorites) }}</p>
            </div>
            <div class="p-3 bg-red-100 rounded-full text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <HeartIcon class="h-6 w-6" />
            </div>
          </div>
          <div class="mt-4 text-sm">
            <span :class="[
              stats.favoritesTrend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            ]">
              {{ stats.favoritesTrend > 0 ? '+' : '' }}{{ stats.favoritesTrend }}%
            </span>
            <span class="text-mocha-500 dark:text-mocha-400 ml-1">depuis la période précédente</span>
          </div>
        </div>
        
        <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-mocha-500 dark:text-mocha-400">Recettes générées</p>
              <p class="text-3xl font-bold text-mocha-800 dark:text-mocha-100">{{ formatNumber(stats.generatedRecipes) }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-full text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <RocketLaunchIcon class="h-6 w-6" />
            </div>
          </div>
          <div class="mt-4 text-sm">
            <span :class="[
              stats.generatedTrend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            ]">
              {{ stats.generatedTrend > 0 ? '+' : '' }}{{ stats.generatedTrend }}%
            </span>
            <span class="text-mocha-500 dark:text-mocha-400 ml-1">depuis la période précédente</span>
          </div>
        </div>
        
        <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-mocha-500 dark:text-mocha-400">Score moyen</p>
              <p class="text-3xl font-bold text-mocha-800 dark:text-mocha-100">{{ stats.averageRating }} / 5</p>
            </div>
            <div class="p-3 bg-yellow-100 rounded-full text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
              <StarIcon class="h-6 w-6" />
            </div>
          </div>
          <div class="mt-4 text-sm">
            <span :class="[
              stats.ratingTrend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            ]">
              {{ stats.ratingTrend > 0 ? '+' : '' }}{{ stats.ratingTrend }}%
            </span>
            <span class="text-mocha-500 dark:text-mocha-400 ml-1">depuis la période précédente</span>
          </div>
        </div>
      </div>
      
      <!-- Graphiques de tendances -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-mocha-800 dark:text-mocha-100 mb-4">Vues par jour</h3>
          <div class="h-64">
            <!-- Chart placeholder -->
            <div v-if="isLoading" class="h-full flex items-center justify-center">
              <div class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
            </div>
            <div v-else class="h-full w-full bg-mocha-50 dark:bg-mocha-800 rounded-lg flex items-center justify-center">
              <p class="text-mocha-500 dark:text-mocha-400">Graphique des vues quotidiennes</p>
              <!-- En production, remplacer par un vrai graphique avec chart.js ou autre -->
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-mocha-800 dark:text-mocha-100 mb-4">Favoris ajoutés par jour</h3>
          <div class="h-64">
            <!-- Chart placeholder -->
            <div v-if="isLoading" class="h-full flex items-center justify-center">
              <div class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
            </div>
            <div v-else class="h-full w-full bg-mocha-50 dark:bg-mocha-800 rounded-lg flex items-center justify-center">
              <p class="text-mocha-500 dark:text-mocha-400">Graphique des favoris ajoutés quotidiennement</p>
              <!-- En production, remplacer par un vrai graphique avec chart.js ou autre -->
            </div>
          </div>
        </div>
      </div>
      
      <!-- Répartition des types et des catégories -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-mocha-800 dark:text-mocha-100 mb-4">Répartition par type de repas</h3>
          <div class="h-64">
            <!-- Pie chart placeholder -->
            <div v-if="isLoading" class="h-full flex items-center justify-center">
              <div class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
            </div>
            <div v-else class="grid grid-cols-5 h-full items-center">
              <div v-for="(count, type) in stats.mealTypeDistribution" :key="type" class="flex flex-col items-center p-2">
                <div class="w-full aspect-square rounded-full mb-2" :style="{ backgroundColor: getMealTypeColor(type) }"></div>
                <span class="text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">{{ getMealTypeName(type) }}</span>
                <span class="text-xs text-mocha-500 dark:text-mocha-400">{{ count }}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-mocha-800 dark:text-mocha-100 mb-4">Répartition par niveau de difficulté</h3>
          <div class="h-64">
            <!-- Bar chart placeholder -->
            <div v-if="isLoading" class="h-full flex items-center justify-center">
              <div class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
            </div>
            <div v-else class="flex h-full items-end justify-around p-6">
              <div v-for="(count, difficulty) in stats.difficultyDistribution" :key="difficulty" class="flex flex-col items-center">
                <div class="w-16 bg-mocha-500 dark:bg-mocha-400 rounded-t-md" :style="{ height: `${count}%` }"></div>
                <span class="mt-2 text-sm font-medium text-mocha-700 dark:text-mocha-300">{{ getDifficultyName(difficulty) }}</span>
                <span class="text-xs text-mocha-500 dark:text-mocha-400">{{ count }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Recettes les plus populaires -->
      <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-mocha-800 dark:text-mocha-100 mb-4">Top 10 des recettes les plus consultées</h3>
        
        <div v-if="isLoading" class="flex justify-center py-8">
          <div class="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-mocha-200 dark:divide-mocha-700">
            <thead>
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">#</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">Recette</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">Type</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">Vues</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">Favoris</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">Note</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-mocha-200 dark:divide-mocha-700">
              <tr v-for="(recipe, index) in stats.topRecipes" :key="recipe.id" class="hover:bg-mocha-50 dark:hover:bg-mocha-800/50">
                <td class="px-4 py-3 whitespace-nowrap font-medium text-mocha-700 dark:text-mocha-300">{{ index + 1 }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-mocha-200 dark:bg-mocha-700">
                      <img v-if="recipe.image_url" :src="recipe.image_url" :alt="recipe.title" class="h-10 w-10 object-cover">
                      <div v-else class="h-10 w-10 flex items-center justify-center">
                        <PhotoIcon class="h-5 w-5 text-mocha-400" />
                      </div>
                    </div>
                    <div class="ml-3">
                      <div class="font-medium text-mocha-700 dark:text-mocha-300">{{ recipe.title }}</div>
                      <div v-if="recipe.is_premium" class="text-xs text-amber-600 dark:text-amber-400">Premium</div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-mocha-600 dark:text-mocha-400">
                  {{ getMealTypeName(recipe.meal_type) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-mocha-600 dark:text-mocha-400">
                  {{ formatNumber(recipe.view_count) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-mocha-600 dark:text-mocha-400">
                  {{ formatNumber(recipe.favorite_count) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex items-center text-mocha-600 dark:text-mocha-400">
                    <StarIcon class="h-4 w-4 text-yellow-500 mr-1" />
                    {{ recipe.average_rating.toFixed(1) }}
                  </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <router-link 
                    :to="`/admin/recipes/${recipe.id}/edit`"
                    class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <PencilSquareIcon class="h-5 w-5" />
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { 
    ArrowPathIcon, 
    EyeIcon, 
    HeartIcon, 
    StarIcon, 
    RocketLaunchIcon,
    PencilSquareIcon,
    PhotoIcon
  } from '@heroicons/vue/24/outline'
  
  // État local
  const isLoading = ref(false)
  const period = ref('month')
  
  // Statistiques simulées (à remplacer par des appels API réels)
  const stats = ref({
    totalViews: 54762,
    viewsTrend: 8.3,
    totalFavorites: 2145,
    favoritesTrend: 12.7,
    generatedRecipes: 856,
    generatedTrend: -2.1,
    averageRating: 4.2,
    ratingTrend: 0.5,
    
    // Distributions (pourcentages)
    mealTypeDistribution: {
      breakfast: 15,
      lunch: 25,
      dinner: 35,
      dessert: 20,
      snack: 5
    },
    difficultyDistribution: {
      easy: 45,
      medium: 40,
      hard: 15
    },
    
    // Top recettes
    topRecipes: [
      {
        id: 1,
        title: "Poulet rôti aux herbes",
        meal_type: "dinner",
        view_count: 4589,
        favorite_count: 345,
        average_rating: 4.8,
        is_premium: true,
        image_url: "https://example.com/poulet.jpg"
      },
      {
        id: 2,
        title: "Lasagnes à la bolognaise",
        meal_type: "dinner",
        view_count: 3982,
        favorite_count: 287,
        average_rating: 4.7,
        is_premium: false,
        image_url: "https://example.com/lasagnes.jpg"
      },
      {
        id: 3,
        title: "Gâteau au chocolat",
        meal_type: "dessert",
        view_count: 3756,
        favorite_count: 298,
        average_rating: 4.6,
        is_premium: false,
        image_url: "https://example.com/gateau.jpg"
      },
      {
        id: 4,
        title: "Salade César",
        meal_type: "lunch",
        view_count: 3254,
        favorite_count: 187,
        average_rating: 4.5,
        is_premium: false,
        image_url: "https://example.com/salade.jpg"
      },
      {
        id: 5,
        title: "Pancakes aux myrtilles",
        meal_type: "breakfast",
        view_count: 2987,
        favorite_count: 245,
        average_rating: 4.9,
        is_premium: true,
        image_url: "https://example.com/pancakes.jpg"
      },
      {
        id: 6,
        title: "Soupe à l'oignon",
        meal_type: "dinner",
        view_count: 2654,
        favorite_count: 156,
        average_rating: 4.4,
        is_premium: false,
        image_url: "https://example.com/soupe.jpg"
      },
      {
        id: 7,
        title: "Tarte aux pommes",
        meal_type: "dessert",
        view_count: 2543,
        favorite_count: 201,
        average_rating: 4.7,
        is_premium: false,
        image_url: "https://example.com/tarte.jpg"
      },
      {
        id: 8,
        title: "Curry de légumes",
        meal_type: "dinner",
        view_count: 2321,
        favorite_count: 143,
        average_rating: 4.3,
        is_premium: false,
        image_url: "https://example.com/curry.jpg"
      },
      {
        id: 9,
        title: "Smoothie fruits rouges",
        meal_type: "breakfast",
        view_count: 2154,
        favorite_count: 124,
        average_rating: 4.5,
        is_premium: false,
        image_url: "https://example.com/smoothie.jpg"
      },
      {
        id: 10,
        title: "Ratatouille",
        meal_type: "dinner",
        view_count: 2087,
        favorite_count: 118,
        average_rating: 4.4,
        is_premium: false,
        image_url: "https://example.com/ratatouille.jpg"
      }
    ]
  })
  
  // Méthodes 
  const loadStats = async () => {
    isLoading.value = true
    
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Dans une implémentation réelle, on chargerait les statistiques depuis l'API
      // const response = await apiService.get(`/admin/statistics?period=${period.value}`)
      // stats.value = response.data
      
      // Ici, on modifie légèrement les données pour simuler un changement
      stats.value = {
        ...stats.value,
        viewsTrend: parseFloat((Math.random() * 20 - 5).toFixed(1)),
        favoritesTrend: parseFloat((Math.random() * 20 - 5).toFixed(1)),
        generatedTrend: parseFloat((Math.random() * 20 - 5).toFixed(1)),
        ratingTrend: parseFloat((Math.random() * 2 - 0.5).toFixed(1))
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  // Formatage des nombres
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num)
  }
  
  // Récupérer les noms lisibles pour les types de repas
  const getMealTypeName = (type) => {
    const types = {
      'breakfast': 'Petit-déjeuner',
      'lunch': 'Déjeuner',
      'dinner': 'Dîner',
      'dessert': 'Dessert',
      'snack': 'En-cas'
    }
    
    return types[type] || type
  }
  
  // Récupérer les noms lisibles pour les niveaux de difficulté
  const getDifficultyName = (difficulty) => {
    const difficulties = {
      'easy': 'Facile',
      'medium': 'Moyen',
      'hard': 'Difficile'
    }
    
    return difficulties[difficulty] || difficulty
  }
  
  // Obtenir une couleur pour chaque type de repas
  const getMealTypeColor = (type) => {
    const colors = {
      'breakfast': '#FCD34D', // amber-300
      'lunch': '#60A5FA', // blue-400
      'dinner': '#F87171', // red-400
      'dessert': '#C084FC', // purple-400
      'snack': '#34D399' // emerald-400
    }
    
    return colors[type] || '#9CA3AF' // gray-400
  }
  
  // Chargement initial des données
  onMounted(() => {
    loadStats()
  })
  </script>