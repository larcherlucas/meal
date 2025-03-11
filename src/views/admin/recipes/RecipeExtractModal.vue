<template>
    <TransitionRoot appear :show="isOpen" as="template">
      <Dialog as="div" class="relative z-50" @close="closeModal">
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
              <DialogPanel class="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white dark:bg-mocha-800 shadow-xl transition-all">
                <div class="px-6 pt-6 pb-4">
                  <div class="flex items-center justify-between mb-4">
                    <DialogTitle class="text-xl font-semibold text-mocha-800 dark:text-mocha-100">
                      Extraire une recette
                    </DialogTitle>
                    <button
                      type="button"
                      class="rounded-full p-2 text-mocha-500 hover:bg-mocha-100 dark:text-mocha-400 dark:hover:bg-mocha-700"
                      @click="closeModal"
                    >
                      <XMarkIcon class="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div v-if="!extractedRecipe">
                    <p class="text-mocha-600 dark:text-mocha-300 mb-4">
                      Entrez l'URL d'une recette pour l'extraire automatiquement.
                    </p>
                    
                    <div class="mb-4">
                      <label for="recipeUrl" class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                        URL de la recette
                      </label>
                      <div class="flex gap-2">
                        <input
                          id="recipeUrl"
                          v-model="recipeUrl"
                          type="url"
                          placeholder="https://example.com/recipe"
                          class="flex-1 rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
                          :disabled="isExtracting"
                        />
                        <button
                          @click="extractRecipe"
                          class="px-4 py-2 bg-mocha-600 text-white rounded-md hover:bg-mocha-700 transition flex items-center"
                          :disabled="isExtracting"
                        >
                          <ArrowDownTrayIcon v-if="!isExtracting" class="h-5 w-5 mr-2" />
                          <span v-if="isExtracting" class="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                          {{ isExtracting ? 'Extraction...' : 'Extraire' }}
                        </button>
                      </div>
                      <p v-if="errorMessage" class="mt-2 text-sm text-red-600 dark:text-red-400">
                        {{ errorMessage }}
                      </p>
                    </div>
                    
                    <div class="border-t border-mocha-200 dark:border-mocha-700 pt-4 mb-4">
                      <h3 class="text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-2">
                        Sites compatibles
                      </h3>
                      <ul class="text-sm text-mocha-600 dark:text-mocha-400 space-y-1 list-disc pl-5">
                        <li>Marmiton, 750g, CuisineAZ, AllRecipes</li>
                        <li>Tout site utilisant le format Schema.org/Recipe</li>
                        <li>Tout site utilisant le format JSON-LD</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div v-else>
                    <div class="mb-4">
                      <div class="flex justify-between items-center mb-2">
                        <h3 class="text-lg font-medium text-mocha-800 dark:text-mocha-100">
                          Aperçu de la recette extraite
                        </h3>
                        <button
                          @click="resetExtraction"
                          class="text-sm text-mocha-600 dark:text-mocha-400 hover:text-mocha-800 dark:hover:text-mocha-200"
                        >
                          Extraire une autre recette
                        </button>
                      </div>
                      
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Informations de base -->
                        <div class="space-y-4">
                          <div>
                            <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                              Titre
                            </label>
                            <input
                              v-model="extractedRecipe.title"
                              type="text"
                              class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
                            />
                          </div>
                          
                          <div>
                            <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                              Description
                            </label>
                            <textarea
                              v-model="extractedRecipe.description"
                              rows="3"
                              class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
                            ></textarea>
                          </div>
                          
                          <div class="grid grid-cols-2 gap-4">
                            <div>
                              <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                                Temps de préparation (min)
                              </label>
                              <input
                                v-model.number="extractedRecipe.prep_time"
                                type="number"
                                min="0"
                                class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
                              />
                            </div>
                            
                            <div>
                              <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                                Temps de cuisson (min)
                              </label>
                              <input
                                v-model.number="extractedRecipe.cook_time"
                                type="number"
                                min="0"
                                class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
                              />
                            </div>
                          </div>
                          
                          <div class="grid grid-cols-2 gap-4">
                            <div>
                              <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                                Portions
                              </label>
                              <input
                                v-model.number="extractedRecipe.servings"
                                type="number"
                                min="1"
                                class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
                              />
                            </div>
                            
                            <div>
                              <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                                Type de repas
                              </label>
                              <select
                                v-model="extractedRecipe.meal_type"
                                class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
                              >
                                <option value="breakfast">Petit-déjeuner</option>
                                <option value="lunch">Déjeuner</option>
                                <option value="dinner">Dîner</option>
                                <option value="dessert">Dessert</option>
                                <option value="snack">En-cas</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        
                        <!-- Image et options -->
                        <div class="space-y-4">
                          <div>
                            <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                              URL de l'image
                            </label>
                            <input
                              v-model="extractedRecipe.image_url"
                              type="url"
                              class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
                            />
                          </div>
                          
                          <div v-if="extractedRecipe.image_url" class="h-32 bg-mocha-100 dark:bg-mocha-700 rounded-md overflow-hidden">
                            <img :src="extractedRecipe.image_url" alt="Aperçu de la recette" class="w-full h-full object-cover" />
                          </div>
                          
                          <div>
                            <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                              Difficulté
                            </label>
                            <select
                              v-model="extractedRecipe.difficulty_level"
                              class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
                            >
                              <option value="easy">Facile</option>
                              <option value="medium">Moyen</option>
                              <option value="hard">Difficile</option>
                            </select>
                          </div>
                          
                          <div class="flex items-center">
                            <input
                              id="premium"
                              v-model="extractedRecipe.is_premium"
                              type="checkbox"
                              class="h-4 w-4 rounded border-mocha-300 text-mocha-600 focus:ring-mocha-500 dark:border-mocha-600 dark:bg-mocha-800"
                            />
                            <label for="premium" class="ml-2 text-sm text-mocha-700 dark:text-mocha-300">
                              Contenu premium
                            </label>
                          </div>
                          
                          <div>
                            <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                              Statut
                            </label>
                            <select
                              v-model="extractedRecipe.status"
                              class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
                            >
                              <option value="draft">Brouillon</option>
                              <option value="review">En révision</option>
                              <option value="published">Publié</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Ingrédients et étapes -->
                      <div class="mt-6 space-y-4">
                        <div>
                          <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                            Ingrédients
                          </label>
                          <textarea
                            v-model="ingredientsText"
                            rows="5"
                            class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
                            placeholder="Un ingrédient par ligne"
                          ></textarea>
                        </div>
                        
                        <div>
                          <label class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                            Étapes de préparation
                          </label>
                          <textarea
                            v-model="stepsText"
                            rows="5"
                            class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
                            placeholder="Une étape par ligne"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="bg-mocha-50 dark:bg-mocha-700/50 px-6 py-4 flex justify-end space-x-2">
                  <button
                    @click="closeModal"
                    class="px-4 py-2 text-mocha-700 bg-mocha-200 rounded-md hover:bg-mocha-300 dark:text-mocha-300 dark:bg-mocha-600 dark:hover:bg-mocha-500 transition"
                  >
                    Annuler
                  </button>
                  
                  <button
                    v-if="extractedRecipe"
                    @click="saveRecipe"
                    class="px-4 py-2 bg-mocha-600 text-white rounded-md hover:bg-mocha-700 transition flex items-center"
                    :disabled="isSaving"
                  >
                    <span v-if="isSaving" class="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                    {{ isSaving ? 'Enregistrement...' : 'Enregistrer la recette' }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
  import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
  import { useAdminRecipeStore } from '@/stores/adminRecipeStore'
  import { useNotificationStore } from '@/stores/NotificationStore'
  
  const props = defineProps<{
    isOpen: boolean
  }>()
  
  const emit = defineEmits<{
    'close': []
    'extract-success': [recipe: any]
  }>()
  
  // Stores
  const adminRecipeStore = useAdminRecipeStore()
  const notificationStore = useNotificationStore()
  
  // État local
  const recipeUrl = ref('')
  const errorMessage = ref('')
  const extractedRecipe = ref(null)
  const isExtracting = ref(false)
  const isSaving = ref(false)
  
  // Ingrédients et étapes de préparation au format texte
  const ingredientsText = ref('')
  const stepsText = ref('')
  
  // Extraire les ingrédients et les étapes de préparation du format texte
  watch(extractedRecipe, (newRecipe) => {
    if (newRecipe) {
      // Ingrédients
      if (Array.isArray(newRecipe.ingredients)) {
        ingredientsText.value = newRecipe.ingredients.map(ing => {
          if (typeof ing === 'string') return ing
          if (typeof ing === 'object' && ing.name) {
            let text = ing.name
            if (ing.quantity) text = `${ing.quantity} ${ing.unit || ''} ${ing.name}`.trim()
            return text
          }
          return ''
        }).filter(Boolean).join('\n')
      }
      
      // Étapes de préparation
      if (Array.isArray(newRecipe.steps)) {
        stepsText.value = newRecipe.steps.map(step => {
          if (typeof step === 'string') return step
          if (typeof step === 'object' && step.description) return step.description
          return ''
        }).filter(Boolean).join('\n')
      }
    } else {
      ingredientsText.value = ''
      stepsText.value = ''
    }
  })
  
  // Formater les ingrédients pour enregistrement
  const formattedIngredients = computed(() => {
    if (!ingredientsText.value) return []
    
    return ingredientsText.value.split('\n').filter(line => line.trim()).map(line => {
      // Tenter de diviser la ligne en quantité, unité et nom
      const match = line.match(/^(\d+(?:[.,]\d+)?)?\s*([a-zA-Z]+)?\s*(.+)$/)
      if (match) {
        const [, quantity, unit, name] = match
        return {
          name: name.trim(),
          quantity: quantity ? parseFloat(quantity.replace(',', '.')) : null,
          unit: unit ? unit.trim() : ''
        }
      }
      return { name: line.trim(), quantity: null, unit: '' }
    })
  })
  
  // Formater les étapes pour enregistrement
  const formattedSteps = computed(() => {
    if (!stepsText.value) return []
    
    return stepsText.value.split('\n')
      .filter(line => line.trim())
      .map((line, index) => ({
        order: index + 1,
        description: line.trim()
      }))
  })
  
  // Réinitialiser l'état
  const resetState = () => {
    recipeUrl.value = ''
    errorMessage.value = ''
    extractedRecipe.value = null
    isExtracting.value = false
    isSaving.value = false
    ingredientsText.value = ''
    stepsText.value = ''
  }
  
  // Fermer la modal
  const closeModal = () => {
    resetState()
    emit('close')
  }
  
  // Extraire la recette depuis l'URL
  const extractRecipe = async () => {
    if (!recipeUrl.value) {
      errorMessage.value = 'Veuillez entrer une URL de recette'
      return
    }
    
    errorMessage.value = ''
    isExtracting.value = true
    
    try {
      const recipe = await adminRecipeStore.extractRecipeFromUrl(recipeUrl.value)
      
      if (recipe) {
        // Ajouter des valeurs par défaut
        extractedRecipe.value = {
          ...recipe,
          status: 'draft',
          is_premium: false,
          difficulty_level: recipe.difficulty_level || 'medium',
          meal_type: recipe.meal_type || 'dinner',
          // S'assurer que les valeurs numériques sont des nombres
          prep_time: parseInt(recipe.prep_time) || 0,
          cook_time: parseInt(recipe.cook_time) || 0,
          servings: parseInt(recipe.servings) || 4
        }
      } else {
        errorMessage.value = 'Impossible d\'extraire la recette depuis cette URL'
      }
    } catch (error) {
      console.error('Erreur lors de l\'extraction de la recette:', error)
      errorMessage.value = 'Erreur lors de l\'extraction de la recette'
    } finally {
      isExtracting.value = false
    }
  }
  
  // Réinitialiser l'extraction
  const resetExtraction = () => {
    extractedRecipe.value = null
    errorMessage.value = ''
  }
  
  // Enregistrer la recette
  const saveRecipe = async () => {
    if (!extractedRecipe.value) return
    
    isSaving.value = true
    
    try {
      // Préparer les données à enregistrer
      const recipeData = {
        ...extractedRecipe.value,
        ingredients: formattedIngredients.value,
        steps: formattedSteps.value
      }
      
      // Créer la recette
      const newRecipe = await adminRecipeStore.createRecipe(recipeData)
      
      if (newRecipe) {
        notificationStore.success('Recette enregistrée avec succès')
        emit('extract-success', newRecipe)
        resetState()
      } else {
        throw new Error('Erreur lors de l\'enregistrement de la recette')
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la recette:', error)
      notificationStore.error('Erreur lors de l\'enregistrement de la recette')
    } finally {
      isSaving.value = false
    }
  }
  </script>