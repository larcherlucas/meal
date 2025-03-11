<!-- src/views/admin/CacheManagement.vue -->
<template>
    <div>
      <h1 class="text-2xl font-bold text-mocha-800 dark:text-mocha-100 mb-6">Gestion du cache</h1>
      
      <!-- Statistiques du cache -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-mocha-500 dark:text-mocha-400">Ratio de hits</p>
              <p class="text-3xl font-bold text-mocha-800 dark:text-mocha-100">{{ cacheStats.hitRatio }}%</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-full text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <ChartBarIcon class="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-mocha-500 dark:text-mocha-400">Cache Hits</p>
              <p class="text-3xl font-bold text-mocha-800 dark:text-mocha-100">{{ cacheStats.hits }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-full text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircleIcon class="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-mocha-500 dark:text-mocha-400">Cache Misses</p>
              <p class="text-3xl font-bold text-mocha-800 dark:text-mocha-100">{{ cacheStats.misses }}</p>
            </div>
            <div class="p-3 bg-red-100 rounded-full text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <XCircleIcon class="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-mocha-500 dark:text-mocha-400">Clés en cache</p>
              <p class="text-3xl font-bold text-mocha-800 dark:text-mocha-100">{{ cacheStats.keys }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-full text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <KeyIcon class="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6 mb-8">
        <h2 class="text-lg font-semibold text-mocha-800 dark:text-mocha-100 mb-4">Actions de cache</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            @click="clearAllCache"
            class="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            :disabled="isLoading"
          >
            <TrashIcon class="h-5 w-5 mr-2" />
            Vider tout le cache
          </button>
          
          <button 
            @click="clearRecipeCache"
            class="flex items-center justify-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition"
            :disabled="isLoading"
          >
            <DocumentIcon class="h-5 w-5 mr-2" />
            Vider cache recettes
          </button>
          
          <button 
            @click="refreshCacheStats"
            class="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            :disabled="isLoading"
          >
            <ArrowPathIcon class="h-5 w-5 mr-2" />
            Rafraîchir statistiques
          </button>
        </div>
      </div>
      
      <!-- Configuration du cache -->
      <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6 mb-8">
        <h2 class="text-lg font-semibold text-mocha-800 dark:text-mocha-100 mb-4">Configuration du cache</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="cacheDuration" class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
              Durée de vie du cache (minutes)
            </label>
            <div class="flex gap-2">
              <input
                id="cacheDuration"
                v-model.number="cacheDuration"
                type="number"
                min="1"
                class="flex-1 rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
              />
              <button
                @click="updateCacheDuration"
                class="px-4 py-2 bg-mocha-600 text-white rounded-md hover:bg-mocha-700 transition"
                :disabled="isLoading"
              >
                Mettre à jour
              </button>
            </div>
          </div>
          
          <div>
            <label for="cacheToggle" class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
              Activation du cache
            </label>
            <div class="flex items-center mt-2">
              <div class="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  id="cacheToggle"
                  v-model="cacheEnabled"
                  type="checkbox"
                  class="sr-only"
                  @change="toggleCache"
                />
                <div class="block h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-12"></div>
                <div
                  class="dot absolute left-1 top-1 h-4 w-4 rounded-full transition-transform duration-300"
                  :class="{
                    'bg-mocha-600 transform translate-x-6': cacheEnabled,
                    'bg-white': !cacheEnabled
                  }"
                ></div>
              </div>
              <span class="text-mocha-700 dark:text-mocha-300">
                {{ cacheEnabled ? 'Activé' : 'Désactivé' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Liste des clés en cache -->
      <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-mocha-800 dark:text-mocha-100">Contenu du cache</h2>
          <div class="flex items-center">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher dans le cache"
              class="rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200 text-sm"
            />
          </div>
        </div>
        
        <div v-if="isLoading" class="flex justify-center items-center py-12">
          <svg class="animate-spin h-8 w-8 text-mocha-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        
        <div v-else-if="filteredCacheEntries.length === 0" class="text-center py-12">
          <p class="text-mocha-500 dark:text-mocha-400">
            {{ cacheEntries.length === 0 ? 'Aucune entrée dans le cache' : 'Aucun résultat pour votre recherche' }}
          </p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-mocha-200 dark:divide-mocha-700">
            <thead>
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">
                  Clé
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">
                  Date expiration
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-mocha-200 dark:divide-mocha-700">
              <tr v-for="entry in filteredCacheEntries" :key="entry.key" class="hover:bg-mocha-50 dark:hover:bg-mocha-800/50">
                <td class="px-4 py-3 whitespace-nowrap text-mocha-700 dark:text-mocha-300">
                  <div class="truncate max-w-xs" :title="entry.key">{{ entry.key }}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-mocha-600 dark:text-mocha-400">
                  {{ entry.type }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-mocha-600 dark:text-mocha-400">
                  {{ formatDate(entry.expiration) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <button
                    @click="removeCacheEntry(entry.key)"
                    class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Supprimer du cache"
                  >
                    <TrashIcon class="h-5 w-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRecipeStore } from '@/stores/recipeStore'
  import { useNotificationStore } from '@/stores/NotificationStore'
  import {
    ChartBarIcon,
    CheckCircleIcon,
    XCircleIcon,
    KeyIcon,
    TrashIcon,
    DocumentIcon,
    ArrowPathIcon
  } from '@heroicons/vue/24/outline'
  
  // Indiquer au composant parent le titre de la page
  const emit = defineEmits(['update:page-title'])
  onMounted(() => {
    emit('update:page-title', 'Gestion du cache')
  })
  
  // Stores
  const recipeStore = useRecipeStore()
  const notificationStore = useNotificationStore()
  
  // États
  const isLoading = ref(false)
  const cacheStats = ref({
    hitRatio: 0,
    hits: 0,
    misses: 0,
    keys: 0
  })
  const cacheEntries = ref([])
  const searchQuery = ref('')
  const cacheDuration = ref(15)
  const cacheEnabled = ref(true)
  
  // Computed
  const filteredCacheEntries = computed(() => {
    if (!searchQuery.value) return cacheEntries.value
    
    const query = searchQuery.value.toLowerCase()
    return cacheEntries.value.filter(entry => 
      entry.key.toLowerCase().includes(query) || 
      entry.type.toLowerCase().includes(query)
    )
  })
  
  // Méthodes
  const fetchCacheStats = async () => {
    isLoading.value = true
    
    try {
      const stats = await recipeStore.getCacheStats()
      cacheStats.value = {
        hitRatio: Math.round(stats.hitRatio * 100),
        hits: stats.hits,
        misses: stats.misses,
        keys: stats.keys
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques du cache:', error)
      notificationStore.error('Erreur lors de la récupération des statistiques du cache')
    } finally {
      isLoading.value = false
    }
  }
  
  const fetchCacheEntries = async () => {
    isLoading.value = true
    
    try {
      // Simuler les entrées du cache pour l'exemple
      // Dans une implémentation réelle, cela proviendrait de l'API
      const now = new Date()
      const mockEntries = [
        {
          key: 'recipe_1',
          type: 'Recette',
          expiration: new Date(now.getTime() + 15 * 60 * 1000)
        },
        {
          key: 'recipe_list_all',
          type: 'Liste',
          expiration: new Date(now.getTime() + 10 * 60 * 1000)
        },
        {
          key: 'recipe_categories',
          type: 'Configuration',
          expiration: new Date(now.getTime() + 30 * 60 * 1000)
        }
      ]
      
      cacheEntries.value = mockEntries
    } catch (error) {
      console.error('Erreur lors de la récupération des entrées du cache:', error)
      notificationStore.error('Erreur lors de la récupération des entrées du cache')
    } finally {
      isLoading.value = false
    }
  }
  
  const refreshCacheStats = async () => {
    await fetchCacheStats()
    await fetchCacheEntries()
    notificationStore.success('Statistiques du cache rafraîchies')
  }
  
  const clearAllCache = async () => {
    isLoading.value = true
    
    try {
      await recipeStore.clearCache()
      await refreshCacheStats()
      notificationStore.success('Cache entièrement vidé')
    } catch (error) {
      console.error('Erreur lors du vidage du cache:', error)
      notificationStore.error('Erreur lors du vidage du cache')
    } finally {
      isLoading.value = false
    }
  }
  
  const clearRecipeCache = async () => {
    isLoading.value = true
    
    try {
      await recipeStore.clearCache('recipe')
      await refreshCacheStats()
      notificationStore.success('Cache des recettes vidé')
    } catch (error) {
      console.error('Erreur lors du vidage du cache des recettes:', error)
      notificationStore.error('Erreur lors du vidage du cache des recettes')
    } finally {
      isLoading.value = false
    }
  }
  
  const removeCacheEntry = async (key: string) => {
    isLoading.value = true
    
    try {
      // Dans une implémentation réelle, cela appellerait une méthode du store
      cacheEntries.value = cacheEntries.value.filter(entry => entry.key !== key)
      notificationStore.success(`Entrée "${key}" supprimée du cache`)
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'entrée "${key}" du cache:`, error)
      notificationStore.error(`Erreur lors de la suppression de l'entrée du cache`)
    } finally {
      isLoading.value = false
    }
  }
  
  const updateCacheDuration = async () => {
    isLoading.value = true
    
    try {
      // Dans une implémentation réelle, cela appellerait une méthode du store
      notificationStore.success(`Durée du cache mise à jour à ${cacheDuration.value} minutes`)
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la durée du cache:', error)
      notificationStore.error('Erreur lors de la mise à jour de la durée du cache')
    } finally {
      isLoading.value = false
    }
  }
  
  const toggleCache = async () => {
    isLoading.value = true
    
    try {
      // Dans une implémentation réelle, cela appellerait une méthode du store
      notificationStore.success(`Cache ${cacheEnabled.value ? 'activé' : 'désactivé'}`)
    } catch (error) {
      console.error(`Erreur lors du ${cacheEnabled.value ? 'l\'activation' : 'la désactivation'} du cache:`, error)
      notificationStore.error(`Erreur lors du ${cacheEnabled.value ? 'l\'activation' : 'la désactivation'} du cache`)
      // Restaurer l'état précédent
      cacheEnabled.value = !cacheEnabled.value
    } finally {
      isLoading.value = false
    }
  }
  
  const formatDate = (date: Date) => {
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Charger les données au montage du composant
  onMounted(async () => {
    await fetchCacheStats()
    await fetchCacheEntries()
  })
  </script>
  
  <style scoped>
  /* Styles pour le toggle */
  input[type="checkbox"] + .dot {
    transition: all 0.3s ease;
  }
  </style>