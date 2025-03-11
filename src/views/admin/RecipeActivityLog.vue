<!-- src/components/admin/RecipeActivityLog.vue -->
<template>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-mocha-800 dark:text-mocha-100">Historique des modifications</h2>
        <div class="flex space-x-2">
          <button
            @click="refreshLogs"
            class="p-2 rounded-md bg-mocha-100 text-mocha-700 hover:bg-mocha-200 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600 transition"
            :disabled="isLoading"
          >
            <ArrowPathIcon v-if="!isLoading" class="h-5 w-5" />
            <div v-else class="h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
          </button>
          
          <select
            v-model="filter"
            @change="filterLogs"
            class="rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200 text-sm"
          >
            <option value="all">Toutes les actions</option>
            <option value="create">Créations</option>
            <option value="update">Modifications</option>
            <option value="delete">Suppressions</option>
            <option value="publish">Publications</option>
            <option value="archive">Archivages</option>
          </select>
        </div>
      </div>
      
      <!-- Timeline des activités -->
      <div class="relative">
        <!-- Ligne verticale -->
        <div class="absolute left-7 top-0 bottom-0 w-px bg-mocha-200 dark:bg-mocha-700"></div>
        
        <div class="space-y-6">
          <div v-if="isLoading" class="flex justify-center items-center py-12">
            <div class="h-8 w-8 animate-spin rounded-full border-2 border-solid border-current border-r-transparent text-mocha-600"></div>
          </div>
          
          <div v-else-if="filteredLogs.length === 0" class="flex flex-col items-center justify-center py-12 text-mocha-500 dark:text-mocha-400">
            <ClipboardDocumentCheckIcon class="h-12 w-12 mb-2" />
            <p>Aucune activité à afficher</p>
          </div>
          
          <div v-else v-for="(log, index) in filteredLogs" :key="index" class="relative pl-14">
            <!-- Icône d'action -->
            <div 
              class="absolute left-0 w-14 flex justify-center" 
              :class="{ '-top-1': log.action !== 'update' || !log.details, 'top-3': log.action === 'update' && log.details }"
            >
              <div class="w-6 h-6 rounded-full flex items-center justify-center z-10" :class="getActionColor(log.action)">
                <component :is="getActionIcon(log.action)" class="h-3.5 w-3.5 text-white" />
              </div>
            </div>
            
            <!-- Contenu de l'action -->
            <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 class="font-medium text-mocha-800 dark:text-mocha-100">
                    {{ getActionTitle(log.action, log.recipeName) }}
                  </h3>
                  <div class="text-sm text-mocha-600 dark:text-mocha-400 flex items-center mt-1">
                    <UserCircleIcon class="h-4 w-4 mr-1.5" />
                    {{ log.user }}
                    <span class="mx-2">•</span>
                    <ClockIcon class="h-4 w-4 mr-1.5" />
                    {{ formatDate(log.timestamp) }}
                  </div>
                </div>
                
                <div v-if="log.action === 'update'" class="self-start">
                  <button
                    @click="log.showDetails = !log.showDetails"
                    class="text-xs px-2 py-1 bg-mocha-100 text-mocha-700 hover:bg-mocha-200 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600 rounded transition flex items-center"
                  >
                    <span v-if="log.showDetails">Masquer les détails</span>
                    <span v-else>Voir les détails</span>
                    <ChevronDownIcon 
                      class="h-4 w-4 ml-1 transition-transform" 
                      :class="{ 'rotate-180': log.showDetails }"
                    />
                  </button>
                </div>
              </div>
              
              <!-- Détails des modifications -->
              <div v-if="log.action === 'update' && log.showDetails" class="mt-4 pt-4 border-t border-mocha-200 dark:border-mocha-700">
                <h4 class="text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-2">Modifications</h4>
                
                <div class="space-y-2 text-sm">
                  <div v-for="(change, field) in log.details" :key="field" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div class="bg-red-50 dark:bg-red-900/10 p-2 rounded-md">
                      <div class="text-xs text-red-700 dark:text-red-400 mb-1 uppercase font-medium">Ancienne valeur</div>
                      <div class="text-mocha-700 dark:text-mocha-300">{{ formatChangedValue(change.old) }}</div>
                    </div>
                    
                    <div class="bg-green-50 dark:bg-green-900/10 p-2 rounded-md">
                      <div class="text-xs text-green-700 dark:text-green-400 mb-1 uppercase font-medium">Nouvelle valeur</div>
                      <div class="text-mocha-700 dark:text-mocha-300">{{ formatChangedValue(change.new) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center mt-6">
        <nav class="flex items-center space-x-1">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="p-2 rounded-md"
            :class="currentPage === 1 
              ? 'text-mocha-400 cursor-not-allowed' 
              : 'text-mocha-700 hover:bg-mocha-100 dark:text-mocha-300 dark:hover:bg-mocha-800'"
          >
            <ChevronLeftIcon class="h-5 w-5" />
          </button>
          
          <div v-for="page in visiblePages" :key="page" class="flex">
            <button
              v-if="page !== '...'"
              @click="goToPage(page)"
              class="px-3 py-1 rounded-md text-sm font-medium"
              :class="currentPage === page 
                ? 'bg-mocha-600 text-white dark:bg-mocha-500' 
                : 'text-mocha-700 hover:bg-mocha-100 dark:text-mocha-300 dark:hover:bg-mocha-800'"
            >
              {{ page }}
            </button>
            
            <span v-else class="px-3 py-1 text-mocha-500 dark:text-mocha-400">...</span>
          </div>
          
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="p-2 rounded-md"
            :class="currentPage === totalPages 
              ? 'text-mocha-400 cursor-not-allowed' 
              : 'text-mocha-700 hover:bg-mocha-100 dark:text-mocha-300 dark:hover:bg-mocha-800'"
          >
            <ChevronRightIcon class="h-5 w-5" />
          </button>
        </nav>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { 
    ArrowPathIcon,
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    ClockIcon,
    UserCircleIcon,
    CheckCircleIcon,
    ArchiveBoxIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClipboardDocumentCheckIcon
  } from '@heroicons/vue/24/outline'
  
  const props = defineProps({
    recipeId: {
      type: [Number, String],
      default: null
    }
  })
  
  // États
  const isLoading = ref(false)
  const activityLogs = ref([])
  const filter = ref('all')
  const currentPage = ref(1)
  const logsPerPage = ref(10)
  const totalLogs = ref(0)
  
  // Pagination calculée
  const totalPages = computed(() => Math.ceil(totalLogs.value / logsPerPage.value))
  
  // Pages visibles dans la pagination
  const visiblePages = computed(() => {
    const pages = []
    const current = currentPage.value
    const total = totalPages.value
    
    if (total <= 7) {
      // Si moins de 7 pages, on les affiche toutes
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // Sinon, on affiche un sous-ensemble avec des ellipses
      pages.push(1)
      
      if (current > 3) {
        pages.push('...')
      }
      
      const start = Math.max(2, current - 1)
      const end = Math.min(total - 1, current + 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (current < total - 2) {
        pages.push('...')
      }
      
      pages.push(total)
    }
    
    return pages
  })
  
  // Filtrer les logs selon le type d'action sélectionné
  const filteredLogs = computed(() => {
    if (filter.value === 'all') {
      return activityLogs.value
    }
    
    return activityLogs.value.filter(log => log.action === filter.value)
  })
  
  // Méthodes
  const refreshLogs = async () => {
    isLoading.value = true
    
    try {
      // Dans une implémentation réelle, on chargerait les logs depuis l'API
      // const params = { page: currentPage.value, limit: logsPerPage.value }
      // if (props.recipeId) params.recipeId = props.recipeId
      // if (filter.value !== 'all') params.action = filter.value
      // const response = await apiService.get('/admin/activity-logs', params)
      // activityLogs.value = response.data.logs
      // totalLogs.value = response.data.total
      
      // Pour la démo, on utilise des données simulées
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Générer des logs simulés
      activityLogs.value = generateMockLogs()
      totalLogs.value = 45 // Nombre total simulé pour la pagination
    } catch (error) {
      console.error('Erreur lors du chargement des logs d\'activité:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  const filterLogs = () => {
    currentPage.value = 1
    refreshLogs()
  }
  
  // Navigation de pagination
  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
      refreshLogs()
    }
  }
  
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
      refreshLogs()
    }
  }
  
  const goToPage = (page) => {
    currentPage.value = page
    refreshLogs()
  }
  
  // Récupérer l'icône correspondant à l'action
  const getActionIcon = (action) => {
    switch (action) {
      case 'create': return PlusIcon
      case 'update': return PencilSquareIcon
      case 'delete': return TrashIcon
      case 'publish': return CheckCircleIcon
      case 'archive': return ArchiveBoxIcon
      default: return ClockIcon
    }
  }
  
  // Récupérer la classe de couleur pour le badge d'action
  const getActionColor = (action) => {
    switch (action) {
      case 'create': return 'bg-green-600'
      case 'update': return 'bg-blue-600'
      case 'delete': return 'bg-red-600'
      case 'publish': return 'bg-purple-600'
      case 'archive': return 'bg-gray-600'
      default: return 'bg-mocha-600'
    }
  }
  
  // Récupérer le titre pour une action
  const getActionTitle = (action, recipeName) => {
    switch (action) {
      case 'create': return `Création de "${recipeName}"`
      case 'update': return `Modification de "${recipeName}"`
      case 'delete': return `Suppression de "${recipeName}"`
      case 'publish': return `Publication de "${recipeName}"`
      case 'archive': return `Archivage de "${recipeName}"`
      default: return `Action sur "${recipeName}"`
    }
  }
  
  // Formater une date
  const formatDate = (date) => {
    const d = new Date(date)
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Formater une valeur modifiée
  const formatChangedValue = (value) => {
    if (value === null || value === undefined) {
      return '<Vide>'
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Oui' : 'Non'
    }
    
    return value.toString()
  }
  
  // Générer des logs simulés pour la démo
  const generateMockLogs = () => {
    const logs = []
    const actions = ['create', 'update', 'publish', 'archive', 'delete']
    const users = ['admin@example.com', 'editor@example.com', 'john.doe@example.com']
    const recipes = [
      'Poulet rôti aux herbes',
      'Lasagnes à la bolognaise',
      'Gâteau au chocolat',
      'Salade César',
      'Pancakes aux myrtilles'
    ]
    
    const now = new Date()
    
    for (let i = 0; i < 10; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)]
      const recipe = recipes[Math.floor(Math.random() * recipes.length)]
      const user = users[Math.floor(Math.random() * users.length)]
      
      // Date dans les 30 derniers jours, plus récente pour les premiers éléments
      const date = new Date(now.getTime() - (i * 24 * 3600 * 1000) - Math.random() * 10 * 3600 * 1000)
      
      const log = {
        action,
        recipeName: recipe,
        user,
        timestamp: date.toISOString(),
        showDetails: false
      }
      
      // Ajouter des détails pour les actions de modification
      if (action === 'update') {
        log.details = {
          title: {
            old: recipe,
            new: `${recipe} (Modifié)`
          }
        }
        
        // Ajouter d'autres modifications aléatoires
        const fields = ['description', 'prep_time', 'is_premium', 'difficulty_level']
        const randomField = fields[Math.floor(Math.random() * fields.length)]
        
        if (randomField === 'prep_time') {
          log.details[randomField] = {
            old: 30,
            new: 45
          }
        } else if (randomField === 'is_premium') {
          log.details[randomField] = {
            old: false,
            new: true
          }
        } else if (randomField === 'difficulty_level') {
          log.details[randomField] = {
            old: 'easy',
            new: 'medium'
          }
        } else {
          log.details[randomField] = {
            old: 'Ancienne description...',
            new: 'Nouvelle description plus détaillée et complète...'
          }
        }
      }
      
      logs.push(log)
    }
    
    return logs
  }
  
  // Chargement initial
  onMounted(() => {
    refreshLogs()
  })
  </script>