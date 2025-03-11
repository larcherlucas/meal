<template>
    <div class="space-y-6">
      <!-- Titre et introduction -->
      <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-mocha-800 dark:text-mocha-100 mb-2">Analyse d'extraction de recette</h2>
        <p class="text-mocha-600 dark:text-mocha-300 mb-4">
          Cet outil permet d'analyser le contenu extrait d'une recette avant son importation finale dans la base de données.
        </p>
        
        <!-- État d'extraction -->
        <div v-if="extractionStatus" :class="[
          'p-3 rounded-md mb-4',
          extractionStatus.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 
          extractionStatus.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' : 
          'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        ]">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <CheckCircleIcon v-if="extractionStatus.type === 'success'" class="h-5 w-5" />
              <ExclamationCircleIcon v-else-if="extractionStatus.type === 'warning'" class="h-5 w-5" />
              <XCircleIcon v-else class="h-5 w-5" />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium">{{ extractionStatus.title }}</h3>
              <div class="mt-1 text-sm">
                <p>{{ extractionStatus.message }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Formulaire d'analyse -->
        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="sm:col-span-2">
              <label for="recipeUrl" class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                URL de la recette
              </label>
              <input
                id="recipeUrl"
                v-model="recipeUrl"
                type="url"
                placeholder="https://example.com/recipe"
                class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
                :disabled="isAnalyzing"
              />
            </div>
            
            <div class="self-end">
              <button
                @click="analyzeUrl"
                class="w-full flex items-center justify-center px-4 py-2 bg-mocha-600 text-white rounded-md hover:bg-mocha-700 transition"
                :disabled="isAnalyzing || !recipeUrl"
              >
                <div v-if="isAnalyzing" class="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                <MagnifyingGlassIcon v-else class="h-5 w-5 mr-2" />
                <span>{{ isAnalyzing ? 'Analyse en cours...' : 'Analyser' }}</span>
              </button>
            </div>
          </div>
          
          <!-- Sites compatibles -->
          <div class="text-sm text-mocha-500 dark:text-mocha-400">
            <span class="font-medium">Sites compatibles:</span> Marmiton, 750g, CuisineAZ, AllRecipes, et tout site utilisant Schema.org/Recipe ou JSON-LD
          </div>
        </div>
      </div>
      
      <!-- Résultats d'analyse -->
      <div v-if="analyzedData" class="bg-white dark:bg-mocha-900 rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-mocha-700 flex justify-between items-center">
          <h3 class="text-lg font-semibold text-mocha-800 dark:text-mocha-100">Résultats d'analyse</h3>
          <div class="flex items-center space-x-2">
            <button
              @click="exportJsonData"
              class="px-3 py-1.5 bg-mocha-100 text-mocha-700 text-sm rounded-md hover:bg-mocha-200 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600 transition flex items-center"
            >
              <DocumentArrowDownIcon class="h-4 w-4 mr-1.5" />
              Exporter JSON
            </button>
            
            <button
              @click="prepareForImport"
              class="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition flex items-center"
            >
              <CheckIcon class="h-4 w-4 mr-1.5" />
              Importer
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Informations détectées -->
            <div>
              <h4 class="text-md font-medium text-mocha-800 dark:text-mocha-100 mb-4">Informations détectées</h4>
              
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-medium text-mocha-700 dark:text-mocha-300">Titre</span>
                    <span class="text-xs text-mocha-500 dark:text-mocha-400">Confiance: {{ formatConfidence(analyzedData.confidence.title) }}</span>
                  </div>
                  <div class="mt-1 p-2 bg-mocha-50 dark:bg-mocha-800 rounded-md text-mocha-700 dark:text-mocha-300">
                    {{ analyzedData.title }}
                  </div>
                </div>
                
                <div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-medium text-mocha-700 dark:text-mocha-300">Description</span>
                    <span class="text-xs text-mocha-500 dark:text-mocha-400">Confiance: {{ formatConfidence(analyzedData.confidence.description) }}</span>
                  </div>
                  <div class="mt-1 p-2 bg-mocha-50 dark:bg-mocha-800 rounded-md text-mocha-700 dark:text-mocha-300 line-clamp-3">
                    {{ analyzedData.description || 'Aucune description détectée' }}
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm font-medium text-mocha-700 dark:text-mocha-300">Temps de préparation</span>
                      <span class="text-xs text-mocha-500 dark:text-mocha-400">Confiance: {{ formatConfidence(analyzedData.confidence.prep_time) }}</span>
                    </div>
                    <div class="mt-1 p-2 bg-mocha-50 dark:bg-mocha-800 rounded-md text-mocha-700 dark:text-mocha-300">
                      {{ analyzedData.prep_time || '?' }} min
                    </div>
                  </div>
                  
                  <div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm font-medium text-mocha-700 dark:text-mocha-300">Temps de cuisson</span>
                      <span class="text-xs text-mocha-500 dark:text-mocha-400">Confiance: {{ formatConfidence(analyzedData.confidence.cook_time) }}</span>
                    </div>
                    <div class="mt-1 p-2 bg-mocha-50 dark:bg-mocha-800 rounded-md text-mocha-700 dark:text-mocha-300">
                      {{ analyzedData.cook_time || '?' }} min
                    </div>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm font-medium text-mocha-700 dark:text-mocha-300">Portions</span>
                      <span class="text-xs text-mocha-500 dark:text-mocha-400">Confiance: {{ formatConfidence(analyzedData.confidence.servings) }}</span>
                    </div>
                    <div class="mt-1 p-2 bg-mocha-50 dark:bg-mocha-800 rounded-md text-mocha-700 dark:text-mocha-300">
                      {{ analyzedData.servings || '?' }} personnes
                    </div>
                  </div>
                  
                  <div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm font-medium text-mocha-700 dark:text-mocha-300">Type de repas</span>
                      <span class="text-xs text-mocha-500 dark:text-mocha-400">Confiance: {{ formatConfidence(analyzedData.confidence.meal_type) }}</span>
                    </div>
                    <div class="mt-1 p-2 bg-mocha-50 dark:bg-mocha-800 rounded-md text-mocha-700 dark:text-mocha-300">
                      {{ getMealTypeLabel(analyzedData.meal_type) || 'Non détecté' }}
                    </div>
                  </div>
                </div>
                
                <!-- Aperçu de l'image -->
                <div v-if="analyzedData.image_url">
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-medium text-mocha-700 dark:text-mocha-300">Image</span>
                    <span class="text-xs text-mocha-500 dark:text-mocha-400">Confiance: {{ formatConfidence(analyzedData.confidence.image_url) }}</span>
                  </div>
                  <div class="mt-1 p-2 bg-mocha-50 dark:bg-mocha-800 rounded-md">
                    <div class="aspect-video overflow-hidden rounded">
                      <img :src="analyzedData.image_url" alt="Aperçu de la recette" class="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Ingrédients et étapes -->
            <div class="space-y-6">
              <!-- Ingrédients -->
              <div>
                <div class="flex justify-between items-center mb-2">
                  <h4 class="text-md font-medium text-mocha-800 dark:text-mocha-100">Ingrédients</h4>
                  <span class="text-xs text-mocha-500 dark:text-mocha-400">{{ analyzedData.ingredients?.length || 0 }} ingrédients détectés</span>
                </div>
                
                <div class="space-y-2 max-h-60 overflow-y-auto pr-2">
                  <div v-for="(ingredient, index) in analyzedData.ingredients" :key="index" class="p-2 bg-mocha-50 dark:bg-mocha-800 rounded-md text-mocha-700 dark:text-mocha-300 flex items-center justify-between">
                    <span>
                      <template v-if="ingredient.quantity">{{ ingredient.quantity }} {{ ingredient.unit }}</template>
                      {{ ingredient.name }}
                    </span>
                    <div class="flex items-center">
                      <span class="text-xs text-mocha-500 dark:text-mocha-400 ml-2">
                        {{ formatConfidence(ingredient.confidence || 0.7) }}
                      </span>
                    </div>
                  </div>
                  
                  <div v-if="!analyzedData.ingredients || analyzedData.ingredients.length === 0" class="p-2 bg-mocha-50 dark:bg-mocha-800 rounded-md text-mocha-500 dark:text-mocha-400 text-center italic">
                    Aucun ingrédient détecté
                  </div>
                </div>
              </div>
              
              <!-- Étapes -->
              <div>
                <div class="flex justify-between items-center mb-2">
                  <h4 class="text-md font-medium text-mocha-800 dark:text-mocha-100">Étapes de préparation</h4>
                  <span class="text-xs text-mocha-500 dark:text-mocha-400">{{ analyzedData.steps?.length || 0 }} étapes détectées</span>
                </div>
                
                <div class="space-y-2 max-h-60 overflow-y-auto pr-2">
                  <div v-for="(step, index) in analyzedData.steps" :key="index" class="p-2 bg-mocha-50 dark:bg-mocha-800 rounded-md text-mocha-700 dark:text-mocha-300">
                    <div class="flex items-start">
                      <div class="mr-2 mt-0.5 flex-shrink-0 w-6 h-6 bg-mocha-200 dark:bg-mocha-700 rounded-full flex items-center justify-center text-sm font-medium text-mocha-700 dark:text-mocha-300">
                        {{ index + 1 }}
                      </div>
                      <div class="flex-1">
                        <p>{{ step.description }}</p>
                        <div class="flex justify-end">
                          <span class="text-xs text-mocha-500 dark:text-mocha-400">
                            {{ formatConfidence(step.confidence || 0.7) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="!analyzedData.steps || analyzedData.steps.length === 0" class="p-2 bg-mocha-50 dark:bg-mocha-800 rounded-md text-mocha-500 dark:text-mocha-400 text-center italic">
                    Aucune étape détectée
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Problèmes et avertissements -->
          <div v-if="analyzedData.issues && analyzedData.issues.length > 0" class="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md">
            <h4 class="text-md font-medium text-amber-700 dark:text-amber-300 mb-2">Problèmes potentiels</h4>
            <ul class="list-disc pl-5 space-y-1">
              <li v-for="(issue, index) in analyzedData.issues" :key="index" class="text-amber-700 dark:text-amber-300">
                {{ issue }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Historique des analyses récentes -->
      <div class="bg-white dark:bg-mocha-900 rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-mocha-700">
          <h3 class="text-lg font-semibold text-mocha-800 dark:text-mocha-100">Historique d'analyse</h3>
        </div>
        
        <div class="p-6">
          <table class="min-w-full divide-y divide-mocha-200 dark:divide-mocha-700">
            <thead>
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">URL</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">Titre</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">Statut</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-mocha-500 dark:text-mocha-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-mocha-200 dark:divide-mocha-700">
              <tr v-for="(entry, index) in recentAnalyses" :key="index" class="hover:bg-mocha-50 dark:hover:bg-mocha-800/50">
                <td class="px-4 py-3 whitespace-nowrap text-mocha-600 dark:text-mocha-400">
                  <div class="flex items-center">
                    <GlobeAltIcon class="h-4 w-4 mr-1.5 text-mocha-500 dark:text-mocha-400" />
                    <span class="truncate max-w-xs" :title="entry.url">{{ entry.url }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-mocha-700 dark:text-mocha-300 font-medium">
                  {{ entry.title }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-mocha-600 dark:text-mocha-400">
                  {{ formatDate(entry.date) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300': entry.status === 'success',
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300': entry.status === 'warning',
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': entry.status === 'error'
                    }"
                  >
                    {{ entry.status === 'success' ? 'Succès' : 
                       entry.status === 'warning' ? 'Avertissement' : 'Erreur' }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <button
                    @click="reanalyzeUrl(entry.url)"
                    class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Analyser à nouveau"
                  >
                    <ArrowPathIcon class="h-5 w-5" />
                  </button>
                </td>
              </tr>
              
              <tr v-if="recentAnalyses.length === 0">
                <td colspan="5" class="px-4 py-6 text-center text-mocha-500 dark:text-mocha-400">
                  Aucune analyse récente
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Modal de confirmation d'importation -->
      <TransitionRoot appear :show="showImportModal" as="template">
        <Dialog as="div" class="relative z-50" @close="showImportModal = false">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <div class="fixed inset-0 bg-mocha-900/50" />
          </TransitionChild>
  
          <div class="fixed inset-0 overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4">
              <TransitionChild
                as="template"
                enter="duration-300 ease-out"
                enter-from="opacity-0 scale-95"
                enter-to="opacity-100 scale-100"
                leave="duration-200 ease-in"
                leave-from="opacity-100 scale-100"
                leave-to="opacity-0 scale-95"
              >
                <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-mocha-800 shadow-xl transition-all">
                  <div class="p-6">
                    <div class="text-center">
                      <DocumentCheckIcon class="mx-auto h-12 w-12 text-green-600 dark:text-green-400" />
                      <h3 class="mt-2 text-lg font-medium text-mocha-800 dark:text-mocha-100">Importer la recette</h3>
                      <div class="mt-2">
                        <p class="text-sm text-mocha-600 dark:text-mocha-300">
                          Êtes-vous sûr de vouloir importer cette recette dans la base de données ?
                        </p>
                      </div>
                    </div>
                    
                    <div class="mt-4 flex justify-end space-x-3">
                      <button
                        @click="showImportModal = false"
                        class="px-4 py-2 bg-mocha-200 text-mocha-700 rounded-md hover:bg-mocha-300 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600 transition"
                      >
                        Annuler
                      </button>
                      
                      <button
                        @click="importRecipe"
                        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center"
                        :disabled="isImporting"
                      >
                        <span v-if="isImporting" class="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                        {{ isImporting ? 'Importation...' : 'Confirmer' }}
                      </button>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>
    </div>
  </template>
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAdminRecipeStore } from '@/stores/adminRecipeStore'
  import { useNotificationStore } from '@/stores/NotificationStore'
  import { 
    MagnifyingGlassIcon, 
    DocumentArrowDownIcon, 
    CheckIcon, 
    ArrowPathIcon, 
    CheckCircleIcon, 
    ExclamationCircleIcon, 
    XCircleIcon,
    GlobeAltIcon,
    DocumentCheckIcon
  } from '@heroicons/vue/24/outline'
  import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
  
  // Router et stores
  const router = useRouter()
  const adminRecipeStore = useAdminRecipeStore()
  const notificationStore = useNotificationStore()
  
  // État local
  const recipeUrl = ref('')
  const isAnalyzing = ref(false)
  const isImporting = ref(false)
  const showImportModal = ref(false)
  const analyzedData = ref(null)
  const extractionStatus = ref(null)
  const recentAnalyses = ref([
    // Données d'exemple pour l'historique
    {
      url: 'https://www.marmiton.org/recettes/recette_tarte-aux-pommes_18588.aspx',
      title: 'Tarte aux pommes classique',
      date: new Date(Date.now() - 3600000), // Il y a 1 heure
      status: 'success'
    },
    {
      url: 'https://www.750g.com/gratin-dauphinois-r3492.htm',
      title: 'Gratin dauphinois',
      date: new Date(Date.now() - 86400000), // Il y a 1 jour
      status: 'warning'
    }
  ])
  
  // Méthodes
  const analyzeUrl = async () => {
    if (!recipeUrl.value) {
      notificationStore.error('Veuillez entrer une URL de recette')
      return
    }
    
    isAnalyzing.value = true
    extractionStatus.value = null
    analyzedData.value = null
    
    try {
      // Extraire la recette depuis le store
      const extractedRecipe = await adminRecipeStore.extractRecipeFromUrl(recipeUrl.value)
      
      if (extractedRecipe) {
        // Simuler des données de confiance pour l'exemple
        analyzedData.value = {
          ...extractedRecipe,
          confidence: {
            title: 0.95,
            description: 0.85,
            prep_time: 0.9,
            cook_time: 0.85,
            servings: 0.9,
            meal_type: 0.75,
            image_url: 0.8
          },
          issues: []
        }
        
        // Détecter les problèmes potentiels
        if (!extractedRecipe.title || extractedRecipe.title.length < 5) {
          analyzedData.value.issues.push('Le titre de la recette semble incomplet ou manquant')
        }
        
        if (!extractedRecipe.ingredients || extractedRecipe.ingredients.length < 2) {
          analyzedData.value.issues.push('Liste des ingrédients incomplète ou manquante')
        }
        
        if (!extractedRecipe.steps || extractedRecipe.steps.length < 2) {
          analyzedData.value.issues.push('Instructions de préparation incomplètes ou manquantes')
        }
        
        if (!extractedRecipe.image_url) {
          analyzedData.value.issues.push('Aucune image détectée pour cette recette')
        }
        
        // Définir le statut d'extraction
        if (analyzedData.value.issues.length === 0) {
          extractionStatus.value = {
            type: 'success',
            title: 'Extraction réussie',
            message: 'Tous les éléments de la recette ont été extraits avec succès'
          }
        } else if (analyzedData.value.issues.length <= 2) {
          extractionStatus.value = {
            type: 'warning',
            title: 'Extraction partiellement réussie',
            message: `${analyzedData.value.issues.length} problème(s) détecté(s). Vérifiez les données avant l'importation.`
          }
        } else {
          extractionStatus.value = {
            type: 'error',
            title: 'Extraction problématique',
            message: `${analyzedData.value.issues.length} problèmes détectés. Une correction manuelle pourrait être nécessaire.`
          }
        }
        
        // Ajouter à l'historique
        addToHistory(extractedRecipe)
      } else {
        extractionStatus.value = {
          type: 'error',
          title: 'Échec de l\'extraction',
          message: 'Impossible d\'extraire les données de recette depuis cette URL.'
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse de la recette:', error)
      extractionStatus.value = {
        type: 'error',
        title: 'Erreur d\'extraction',
        message: error.message || 'Une erreur s\'est produite lors de l\'extraction de la recette'
      }
    } finally {
      isAnalyzing.value = false
    }
  }
  
  // Ajouter une entrée à l'historique
  const addToHistory = (recipe) => {
    // Ne pas dupliquer les entrées avec la même URL
    const existingIndex = recentAnalyses.value.findIndex(a => a.url === recipeUrl.value)
    
    const historyEntry = {
      url: recipeUrl.value,
      title: recipe.title,
      date: new Date(),
      status: extractionStatus.value?.type || 'success'
    }
    
    if (existingIndex !== -1) {
      // Mettre à jour l'entrée existante
      recentAnalyses.value[existingIndex] = historyEntry
    } else {
      // Ajouter une nouvelle entrée en tête de liste
      recentAnalyses.value.unshift(historyEntry)
      
      // Limiter la taille de l'historique
      if (recentAnalyses.value.length > 10) {
        recentAnalyses.value = recentAnalyses.value.slice(0, 10)
      }
    }
  }
  
  // Réanalyser une URL depuis l'historique
  const reanalyzeUrl = (url) => {
    recipeUrl.value = url
    analyzeUrl()
  }
  
  // Préparer pour l'importation
  const prepareForImport = () => {
    showImportModal.value = true
  }
  
  // Importer la recette
  const importRecipe = async () => {
    if (!analyzedData.value) return
    
    isImporting.value = true
    
    try {
      // Préparer les données à enregistrer
      const recipeData = {
        title: analyzedData.value.title,
        description: analyzedData.value.description,
        prep_time: parseInt(analyzedData.value.prep_time) || 0,
        cook_time: parseInt(analyzedData.value.cook_time) || 0,
        servings: parseInt(analyzedData.value.servings) || 4,
        meal_type: analyzedData.value.meal_type || 'dinner',
        difficulty_level: analyzedData.value.difficulty_level || 'medium',
        image_url: analyzedData.value.image_url,
        status: 'draft',
        is_premium: false,
        ingredients: analyzedData.value.ingredients || [],
        steps: analyzedData.value.steps || []
      }
      
      // Créer la recette
      const newRecipe = await adminRecipeStore.createRecipe(recipeData)
      
      if (newRecipe) {
        notificationStore.success('Recette importée avec succès')
        showImportModal.value = false
        
        // Rediriger vers l'édition de la recette
        router.push(`/admin/recipes/${newRecipe.id}/edit`)
      } else {
        throw new Error('Erreur lors de l\'importation de la recette')
      }
    } catch (error) {
      console.error('Erreur lors de l\'importation de la recette:', error)
      notificationStore.error('Erreur lors de l\'importation de la recette')
    } finally {
      isImporting.value = false
    }
  }
  
  // Exporter les données au format JSON
  const exportJsonData = () => {
    if (!analyzedData.value) return
    
    // Créer un objet Blob avec les données formatées
    const dataStr = JSON.stringify(analyzedData.value, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    
    // Créer une URL pour le Blob
    const url = URL.createObjectURL(blob)
    
    // Créer un lien temporaire et déclencher le téléchargement
    const link = document.createElement('a')
    link.href = url
    link.download = `recette-${analyzedData.value.title.replace(/\s+/g, '-').toLowerCase()}.json`
    document.body.appendChild(link)
    link.click()
    
    // Nettoyer
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  
  // Formater le niveau de confiance
  const formatConfidence = (value) => {
    return `${Math.round(value * 100)}%`
  }
  
  // Obtenir le libellé du type de repas
  const getMealTypeLabel = (mealType) => {
    const types = {
      'breakfast': 'Petit-déjeuner',
      'lunch': 'Déjeuner',
      'dinner': 'Dîner',
      'dessert': 'Dessert',
      'snack': 'En-cas'
    }
    
    return types[mealType] || mealType
  }
  
  // Formater une date
  const formatDate = (date) => {
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  </script>