<template>
  <div>
    <!-- En-tête de la page -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-mocha-800 dark:text-mocha-100">Gestion des recettes</h1>
        <p class="text-sm text-mocha-600 dark:text-mocha-300">
          {{ totalRecettes }} recettes disponibles
        </p>
      </div>
      
      <div class="flex items-center gap-2">
        <!-- Bouton pour ajouter une recette -->
        <router-link
          :to="{ name: 'admin-recipe-create' }"
          class="px-4 py-2 bg-mocha-600 text-white rounded-lg hover:bg-mocha-700 transition flex items-center space-x-2"
        >
          <PlusIcon class="h-5 w-5" />
          <span>Ajouter une recette</span>
        </router-link>
        
        <!-- Bouton pour extraire une recette depuis une URL -->
        <button
          @click="showExtractModal = true"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
        >
          <ArrowDownTrayIcon class="h-5 w-5" />
          <span>Extraire</span>
        </button>
      </div>
    </div>
    
    <!-- Filtres et recherche -->
    <div class="mb-6 bg-white dark:bg-mocha-900 rounded-lg shadow p-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Recherche -->
        <div class="flex-1 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="h-5 w-5 text-mocha-400" />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher une recette..."
            class="pl-10 pr-4 py-2 w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
            @keyup.enter="applyFilters"
          />
        </div>
        
        <!-- Filtres -->
        <div class="flex flex-wrap sm:flex-nowrap gap-2">
          <!-- Filtre par statut -->
          <select
            v-model="filters.status"
            @change="applyFilters"
            class="rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
          >
            <option value="">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
            <option value="review">En révision</option>
            <option value="archived">Archivés</option>
          </select>
          
          <!-- Filtre par type -->
          <select
            v-model="filters.meal_type"
            @change="applyFilters"
            class="rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
          >
            <option value="">Tous les types</option>
            <option value="breakfast">Petit-déjeuner</option>
            <option value="lunch">Déjeuner</option>
            <option value="dinner">Dîner</option>
            <option value="dessert">Dessert</option>
            <option value="snack">En-cas</option>
          </select>
          
          <!-- Filtre par premium -->
          <select
            v-model="filters.is_premium"
            @change="applyFilters"
            class="rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
          >
            <option :value="null">Premium/Standard</option>
            <option :value="true">Premium uniquement</option>
            <option :value="false">Standard uniquement</option>
          </select>
          
          <!-- Réinitialiser les filtres -->
          <button
            @click="resetFilters"
            class="px-3 py-2 bg-mocha-100 text-mocha-700 rounded-md hover:bg-mocha-200 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600 transition"
          >
            <ArrowPathIcon class="h-5 w-5" />
          </button>
          
          <!-- Toggle filtres avancés -->
          <button
            @click="showAdvancedFilters = !showAdvancedFilters"
            class="px-3 py-2 bg-mocha-100 text-mocha-700 rounded-md hover:bg-mocha-200 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600 transition"
          >
            <AdjustmentsHorizontalIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <!-- Filtres additionnels - Affichés si les filtres avancés sont ouverts -->
      <div v-if="showAdvancedFilters" class="mt-4 pt-4 border-t border-mocha-200 dark:border-mocha-700">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Filtre par difficulté -->
          <div class="flex-1">
            <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">Difficulté</label>
            <div class="flex gap-2">
              <button
                v-for="difficulty in difficultyOptions" 
                :key="difficulty.value"
                @click="setDifficulty(difficulty.value)"
                class="px-3 py-1 text-sm rounded-full"
                :class="[
                  filters.difficulty_level === difficulty.value
                    ? 'bg-mocha-600 text-white dark:bg-mocha-500' 
                    : 'bg-mocha-100 text-mocha-700 hover:bg-mocha-200 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600'
                ]"
              >
                {{ difficulty.label }}
              </button>
            </div>
          </div>
          
          <!-- Filtre par temps de préparation -->
          <div class="flex-1">
            <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">Temps de préparation</label>
            <select
              v-model="filters.maxPrepTime"
              @change="applyFilters"
              class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
            >
              <option :value="null">Tous les temps</option>
              <option :value="15">< 15 min</option>
              <option :value="30">< 30 min</option>
              <option :value="60">< 60 min</option>
              <option :value="120">< 2 heures</option>
            </select>
          </div>
          
          <!-- Tri -->
          <div class="flex-1">
            <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">Trier par</label>
            <div class="flex">
              <select
                v-model="filters.sort_by"
                @change="applyFilters"
                class="flex-1 rounded-l-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
              >
                <option value="updated_at">Date de modification</option>
                <option value="created_at">Date de création</option>
                <option value="title">Titre</option>
                <option value="prep_time">Temps de préparation</option>
                <option value="view_count">Popularité</option>
              </select>
              <button
                @click="toggleSortDirection"
                class="px-3 py-2 bg-mocha-100 text-mocha-700 rounded-r-md hover:bg-mocha-200 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600 transition"
              >
                <ArrowsUpDownIcon v-if="filters.sort_direction === 'asc'" class="h-5 w-5" />
                <ArrowDownIcon v-else class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Actions en lot - Visible uniquement si des recettes sont sélectionnées -->
    <div v-if="adminRecipeStore.hasSelection" class="mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow p-4">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center text-blue-700 dark:text-blue-300">
          <CheckCircleIcon class="h-5 w-5 mr-2" />
          <span>{{ adminRecipeStore.selectedRecipes.length }} recette(s) sélectionnée(s)</span>
        </div>
        
        <div class="flex gap-2">
          <button
            @click="confirmBulkAction('publish')"
            class="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            <CheckIcon class="h-4 w-4 inline-block mr-1" />
            Publier
          </button>
          
          <button
            @click="confirmBulkAction('archive')"
            class="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            <ArchiveBoxIcon class="h-4 w-4 inline-block mr-1" />
            Archiver
          </button>
          
          <button
            @click="confirmBulkAction('makeStandard')"
            class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <CursorArrowRippleIcon class="h-4 w-4 inline-block mr-1" />
            Standard
          </button>
          
          <button
            @click="confirmBulkAction('makePremium')"
            class="px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            <StarIcon class="h-4 w-4 inline-block mr-1" />
            Premium
          </button>
          
          <button
            @click="confirmBulkAction('delete')"
            class="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            <TrashIcon class="h-4 w-4 inline-block mr-1" />
            Supprimer
          </button>
          
          <button
            @click="adminRecipeStore.clearSelection()"
            class="px-3 py-1.5 text-sm bg-mocha-100 text-mocha-700 rounded hover:bg-mocha-200 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600"
          >
            <XMarkIcon class="h-4 w-4 inline-block" />
          </button>
        </div>
      </div>
    </div>
    
    <!-- Liste des recettes -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <svg class="animate-spin h-8 w-8 text-mocha-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    
    <div v-else-if="adminRecipeStore.recipes.length === 0" class="text-center py-12">
      <DocumentIcon class="mx-auto h-12 w-12 text-mocha-400" />
      <h3 class="mt-2 text-sm font-medium text-mocha-700 dark:text-mocha-300">Aucune recette trouvée</h3>
      <p class="mt-1 text-sm text-mocha-500 dark:text-mocha-400">
        Ajoutez une recette ou modifiez vos filtres pour voir des résultats
      </p>
      <div class="mt-6">
        <router-link
          :to="{ name: 'admin-recipe-create' }"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-mocha-600 hover:bg-mocha-700"
        >
          <PlusIcon class="h-5 w-5 mr-2" />
          Ajouter une recette
        </router-link>
      </div>
    </div>
    
    <div v-else>
      <!-- Tableau des recettes -->
      <div class="overflow-x-auto bg-white dark:bg-mocha-900 rounded-lg shadow">
        <table class="min-w-full divide-y divide-mocha-200 dark:divide-mocha-700">
          <thead>
            <tr>
              <th class="px-4 py-3.5 text-left">
                <div class="flex items-center">
                  <input
                    id="select-all"
                    type="checkbox"
                    :checked="allSelected"
                    :indeterminate="someSelected && !allSelected"
                    @change="toggleSelectAll"
                    class="h-4 w-4 rounded border-mocha-300 text-mocha-600 focus:ring-mocha-500 dark:border-mocha-600 dark:bg-mocha-800"
                  />
                </div>
              </th>
              <th class="px-4 py-3.5 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">
                Recette
              </th>
              <th class="px-4 py-3.5 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">
                Type
              </th>
              <th class="px-4 py-3.5 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-4 py-3.5 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">
                Premium
              </th>
              <th class="px-4 py-3.5 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">
                Dernière modif.
              </th>
              <th class="px-4 py-3.5 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-mocha-200 dark:divide-mocha-700">
            <tr v-for="recipe in adminRecipeStore.recipes" :key="recipe.id" class="hover:bg-mocha-50 dark:hover:bg-mocha-800/50">
              <td class="px-4 py-3.5 whitespace-nowrap">
                <input
                  :id="`select-recipe-${recipe.id}`"
                  type="checkbox"
                  :checked="isSelected(recipe.id)"
                  @change="toggleSelection(recipe.id)"
                  class="h-4 w-4 rounded border-mocha-300 text-mocha-600 focus:ring-mocha-500 dark:border-mocha-600 dark:bg-mocha-800"
                />
              </td>
              <td class="px-4 py-3.5">
                <div class="flex items-center">
                  <div class="h-10 w-10 flex-shrink-0 bg-mocha-200 dark:bg-mocha-700 rounded-md overflow-hidden">
                    <img v-if="recipe.image_url" :src="recipe.image_url" alt="" class="h-10 w-10 object-cover" />
                    <div v-else class="h-10 w-10 flex items-center justify-center">
                      <PhotoIcon class="h-6 w-6 text-mocha-400" />
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="font-medium text-mocha-700 dark:text-mocha-300">{{ recipe.title }}</div>
                    <div class="text-xs text-mocha-500 dark:text-mocha-400">
                      ID: {{ recipe.id }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap text-mocha-600 dark:text-mocha-400">
                {{ recipe.meal_type === 'breakfast' ? 'Petit-déjeuner' : 
                   recipe.meal_type === 'lunch' ? 'Déjeuner' :
                   recipe.meal_type === 'dinner' ? 'Dîner' :
                   recipe.meal_type === 'snack' ? 'En-cas' : 
                   recipe.meal_type === 'dessert' ? 'Dessert' : 'Autre' }}
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap">
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
              <td class="px-4 py-3.5 whitespace-nowrap">
                <CheckIcon v-if="recipe.is_premium" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <MinusIcon v-else class="h-5 w-5 text-mocha-400" />
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap text-mocha-600 dark:text-mocha-400">
                {{ formatDate(recipe.updated_at) }}
              </td>
              <td class="px-4 py-3.5 whitespace-nowrap">
                <div class="flex items-center space-x-2">
                  <!-- Bouton de modification avec nouveau handler explicite -->
                  <button
                    @click="editRecipe(recipe.id)"
                    class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Modifier"
                  >
                    <PencilSquareIcon class="h-5 w-5" />
                  </button>
                  
                  <button
                    @click="confirmDeleteRecipe(recipe)"
                    class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Supprimer"
                  >
                    <TrashIcon class="h-5 w-5" />
                  </button>
                  
                  <div class="relative" ref="menuRefs[recipe.id]">
                    <button
                      @click="openMenu(recipe.id)"
                      class="text-mocha-600 hover:text-mocha-800 dark:text-mocha-400 dark:hover:text-mocha-300"
                      title="Plus d'actions"
                    >
                      <EllipsisVerticalIcon class="h-5 w-5" />
                    </button>
                    
                    <!-- Menu déroulant -->
                    <div 
                      v-if="activeMenu === recipe.id"
                      class="absolute z-10 right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-mocha-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                      <div class="py-1">
                        <button
                          @click="toggleRecipeStatus(recipe)"
                          class="w-full text-left block px-4 py-2 text-sm text-mocha-700 hover:bg-mocha-100 dark:text-mocha-300 dark:hover:bg-mocha-700"
                        >
                          <span v-if="recipe.status === 'published'">
                            <ArchiveBoxArrowDownIcon class="h-4 w-4 inline-block mr-1" />
                            Archiver
                          </span>
                          <span v-else-if="recipe.status === 'archived'">
                            <ArrowUturnLeftIcon class="h-4 w-4 inline-block mr-1" />
                            Restaurer
                          </span>
                          <span v-else-if="recipe.status === 'draft'">
                            <CheckCircleIcon class="h-4 w-4 inline-block mr-1" />
                            Publier
                          </span>
                          <span v-else>
                            <CheckCircleIcon class="h-4 w-4 inline-block mr-1" />
                            Publier
                          </span>
                        </button>
                        
                        <button
                          @click="togglePremiumStatus(recipe)"
                          class="w-full text-left block px-4 py-2 text-sm text-mocha-700 hover:bg-mocha-100 dark:text-mocha-300 dark:hover:bg-mocha-700"
                        >
                          <span v-if="recipe.is_premium">
                            <NoSymbolIcon class="h-4 w-4 inline-block mr-1" />
                            Retirer Premium
                          </span>
                          <span v-else>
                            <StarIcon class="h-4 w-4 inline-block mr-1" />
                            Marquer Premium
                          </span>
                        </button>
                        
                        <!-- Button modifié pour utiliser le handler explicite -->
                        <button
                          @click="editRecipe(recipe.id)"
                          class="w-full text-left block px-4 py-2 text-sm text-mocha-700 hover:bg-mocha-100 dark:text-mocha-300 dark:hover:bg-mocha-700"
                        >
                          <PencilSquareIcon class="h-4 w-4 inline-block mr-1" />
                          Modifier
                        </button>
                        
                        <button
                          @click="duplicateRecipe(recipe)"
                          class="w-full text-left block px-4 py-2 text-sm text-mocha-700 hover:bg-mocha-100 dark:text-mocha-300 dark:hover:bg-mocha-700"
                        >
                          <DocumentDuplicateIcon class="h-4 w-4 inline-block mr-1" />
                          Dupliquer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="flex items-center justify-between mt-6">
        <div class="flex items-center">
          <span class="text-sm text-mocha-600 dark:text-mocha-300">
            Affichage de <span class="font-medium">{{ startIndex + 1 }}</span> à <span class="font-medium">{{ endIndex }}</span> sur 
            <span class="font-medium">{{ totalRecettes }}</span> recettes
          </span>
        </div>
        <div class="flex items-center space-x-2">
          <button 
            @click="previousPage" 
            :disabled="adminRecipeStore.pagination.page === 1"
            class="px-3 py-1 rounded-md text-sm font-medium"
            :class="[
              adminRecipeStore.pagination.page === 1
                ? 'bg-mocha-100 text-mocha-400 cursor-not-allowed dark:bg-mocha-800 dark:text-mocha-600'
                : 'bg-mocha-200 text-mocha-700 hover:bg-mocha-300 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600'
            ]"
          >
            Précédent
          </button>
          
          <div class="flex">
            <button
              v-for="page in paginationPages"
              :key="page"
              @click="goToPage(page)"
              class="px-3 py-1 rounded-md text-sm font-medium mx-0.5"
              :class="[
                adminRecipeStore.pagination.page === page
                  ? 'bg-mocha-600 text-white dark:bg-mocha-500'
                  : 'bg-mocha-200 text-mocha-700 hover:bg-mocha-300 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600'
              ]"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="nextPage" 
            :disabled="adminRecipeStore.pagination.page >= adminRecipeStore.totalPages"
            class="px-3 py-1 rounded-md text-sm font-medium"
            :class="[
              adminRecipeStore.pagination.page >= adminRecipeStore.totalPages
                ? 'bg-mocha-100 text-mocha-400 cursor-not-allowed dark:bg-mocha-800 dark:text-mocha-600'
                : 'bg-mocha-200 text-mocha-700 hover:bg-mocha-300 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600'
            ]"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal pour l'extraction de recette -->
    <RecipeExtractModal
      :is-open="showExtractModal"
      @close="showExtractModal = false"
      @extract-success="handleExtractSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminRecipeStore } from '@/stores/adminRecipeStore'
import { useNotificationStore } from '@/stores/NotificationStore'
import RecipeExtractModal from '@/views/admin/recipes/RecipeExtractModal.vue'
import { 
  PlusIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  ArrowsUpDownIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  XMarkIcon,
  TrashIcon,
  ArchiveBoxIcon,
  StarIcon,
  CursorArrowRippleIcon,
  EllipsisVerticalIcon,
  CheckIcon,
  MinusIcon,
  PencilSquareIcon,
  DocumentIcon,
  PhotoIcon,
  DocumentDuplicateIcon,
  ArchiveBoxArrowDownIcon,
  ArrowUturnLeftIcon,
  NoSymbolIcon
} from '@heroicons/vue/24/outline'

// Indiquer au composant parent le titre de la page
const emit = defineEmits(['update:page-title'])
onMounted(() => {
  emit('update:page-title', 'Gestion des recettes')
})

// Stores
const adminRecipeStore = useAdminRecipeStore()
const notificationStore = useNotificationStore()
const router = useRouter()

// État local
const isLoading = ref(false)
const searchQuery = ref('')
const showAdvancedFilters = ref(false)
const showExtractModal = ref(false)
const activeMenu = ref(null)
const menuRefs = ref({})

// Options pour les filtres
const difficultyOptions = [
  { value: null, label: 'Toutes' },
  { value: 'easy', label: 'Facile' },
  { value: 'medium', label: 'Moyen' },
  { value: 'hard', label: 'Difficile' }
]

// Filtres
const filters = ref({
  status: '',
  meal_type: '',
  is_premium: null,
  difficulty_level: null,
  maxPrepTime: null,
  sort_by: 'updated_at',
  sort_direction: 'desc'
})

// Statistiques
const totalRecettes = computed(() => adminRecipeStore.pagination.total || 0)

// Pagination
const startIndex = computed(() => (adminRecipeStore.pagination.page - 1) * adminRecipeStore.pagination.limit)
const endIndex = computed(() => {
  const end = startIndex.value + adminRecipeStore.pagination.limit
  return end > totalRecettes.value ? totalRecettes.value : end
})

const paginationPages = computed(() => {
  const totalPages = adminRecipeStore.totalPages
  const currentPage = adminRecipeStore.pagination.page
  
  // Si moins de 6 pages, afficher toutes les pages
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  
  // Si la page courante est près du début
  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5]
  }
  
  // Si la page courante est près de la fin
  if (currentPage >= totalPages - 2) {
    return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }
  
  // Sinon, afficher la page courante et deux pages avant/après
  return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2]
})

// Sélection des recettes
const allSelected = computed(() => 
  adminRecipeStore.recipes.length > 0 && 
  adminRecipeStore.selectedRecipes.length === adminRecipeStore.recipes.length
)

const someSelected = computed(() => 
  adminRecipeStore.selectedRecipes.length > 0 && 
  adminRecipeStore.selectedRecipes.length < adminRecipeStore.recipes.length
)

// Méthodes
const applyFilters = () => {
  // Ajouter la recherche aux filtres
  const searchFilters = {
    ...filters.value,
    search: searchQuery.value
  }
  
  // Réinitialiser la pagination
  adminRecipeStore.pagination.page = 1
  
  // Appliquer les filtres
  adminRecipeStore.setFilters(searchFilters)
}

const resetFilters = () => {
  // Réinitialiser tous les filtres
  filters.value = {
    status: '',
    meal_type: '',
    is_premium: null,
    difficulty_level: null,
    maxPrepTime: null,
    sort_by: 'updated_at',
    sort_direction: 'desc'
  }
  searchQuery.value = ''
  
  // Appliquer les filtres réinitialisés
  applyFilters()
}

const setDifficulty = (difficulty) => {
  filters.value.difficulty_level = difficulty
  applyFilters()
}

const toggleSortDirection = () => {
  filters.value.sort_direction = filters.value.sort_direction === 'asc' ? 'desc' : 'asc'
  applyFilters()
}

// Fonction explicite pour éditer une recette
function editRecipe(id) {
  console.log('Édition de la recette ID:', id);
  router.push({ name: 'admin-recipe-edit', params: { id } });
}

// Navigation de pagination
const previousPage = () => {
  if (adminRecipeStore.pagination.page > 1) {
    adminRecipeStore.setPage(adminRecipeStore.pagination.page - 1)
  }
}

const nextPage = () => {
  if (adminRecipeStore.pagination.page < adminRecipeStore.totalPages) {
    adminRecipeStore.setPage(adminRecipeStore.pagination.page + 1)
  }
}

const goToPage = (page) => {
  adminRecipeStore.setPage(page)
}

// Formatage de la date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Manipulation des recettes
const toggleRecipeStatus = async (recipe) => {
  let newStatus = 'published'
  
  if (recipe.status === 'published') {
    newStatus = 'archived'
  } else if (recipe.status === 'archived') {
    newStatus = 'published'
  } else if (recipe.status === 'draft') {
    newStatus = 'published'
  }
  
  try {
    await adminRecipeStore.updateRecipeStatus(recipe.id, newStatus)
    notificationStore.success(`Statut de la recette mis à jour : ${newStatus}`)
    closeMenu()
  } catch (error) {
    console.error('Erreur lors de la modification du statut:', error)
    notificationStore.error('Erreur lors de la modification du statut')
  }
}

const togglePremiumStatus = async (recipe) => {
  try {
    await adminRecipeStore.updateRecipe(recipe.id, { is_premium: !recipe.is_premium })
    notificationStore.success(`Recette ${recipe.is_premium ? 'retirée des' : 'ajoutée aux'} contenus premium`)
    closeMenu()
  } catch (error) {
    console.error('Erreur lors de la modification du statut premium:', error)
    notificationStore.error('Erreur lors de la modification du statut premium')
  }
}

const duplicateRecipe = async (recipe) => {
  try {
    // Copier la recette en changeant son titre
    const duplicatedRecipe = { 
      ...recipe,
      title: `Copie de ${recipe.title}`,
      id: undefined // Supprimer l'ID pour que le backend en attribue un nouveau
    }
    
    const newRecipe = await adminRecipeStore.createRecipe(duplicatedRecipe)
    notificationStore.success('Recette dupliquée avec succès')
    closeMenu()
    
    // Rediriger vers la page d'édition de la nouvelle recette
    router.push({ name: 'admin-recipe-edit', params: { id: newRecipe.id } })
  } catch (error) {
    console.error('Erreur lors de la duplication:', error)
    notificationStore.error('Erreur lors de la duplication de la recette')
  }
}

const confirmDeleteRecipe = (recipe) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer la recette "${recipe.title}" ?`)) {
    deleteRecipe(recipe.id)
  }
}

const deleteRecipe = async (id) => {
  try {
    await adminRecipeStore.deleteRecipe(id)
    notificationStore.success('Recette supprimée avec succès')
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    notificationStore.error('Erreur lors de la suppression de la recette')
  }
}

// Gestion de la sélection
const toggleSelectAll = () => {
  if (allSelected.value) {
    adminRecipeStore.clearSelection()
  } else {
    adminRecipeStore.selectAll()
  }
}

const toggleSelection = (id) => {
  adminRecipeStore.toggleSelection(id)
}

const isSelected = (id) => {
  return adminRecipeStore.selectedRecipes.includes(id)
}

// Actions en lot
const confirmBulkAction = (action) => {
  const count = adminRecipeStore.selectedRecipes.length
  let confirmMessage = ''
  
  switch (action) {
    case 'publish':
      confirmMessage = `Publier ${count} recette(s) ?`
      break
    case 'archive':
      confirmMessage = `Archiver ${count} recette(s) ?`
      break
    case 'makeStandard':
      confirmMessage = `Rendre ${count} recette(s) standard ?`
      break
    case 'makePremium':
      confirmMessage = `Rendre ${count} recette(s) premium ?`
      break
    case 'delete':
      confirmMessage = `Supprimer ${count} recette(s) ? Cette action est irréversible.`
      break
    default:
      confirmMessage = `Effectuer l'action ${action} sur ${count} recette(s) ?`
  }
  
  if (confirm(confirmMessage)) {
    executeBulkAction(action)
  }
}

const executeBulkAction = async (action) => {
  try {
    await adminRecipeStore.bulkAction(action)
    notificationStore.success(`Action "${action}" effectuée avec succès`)
  } catch (error) {
    console.error(`Erreur lors de l'action en masse "${action}":`, error)
    notificationStore.error(`Erreur lors de l'action "${action}"`)
  }
}

// Gestion des menus déroulants
const openMenu = (recipeId) => {
  // Fermer le menu actif s'il est différent
  if (activeMenu.value !== null && activeMenu.value !== recipeId) {
    activeMenu.value = null
  }
  
  // Ouvrir/fermer le menu sélectionné
  activeMenu.value = activeMenu.value === recipeId ? null : recipeId
}

const closeMenu = () => {
  activeMenu.value = null
}

const handleClickOutside = (event) => {
  if (activeMenu.value !== null) {
    const menuRef = menuRefs.value[activeMenu.value]
    if (menuRef && !menuRef.contains(event.target)) {
      closeMenu()
    }
  }
}

// Gestion de l'extraction de recette
const handleExtractSuccess = (extractedRecipe) => {
  showExtractModal.value = false
  adminRecipeStore.fetchRecipes()
  notificationStore.success('Recette extraite et sauvegardée avec succès')
}

// Lifecycle hooks
onMounted(async () => {
  isLoading.value = true
  await adminRecipeStore.fetchRecipes()
  isLoading.value = false
  
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>