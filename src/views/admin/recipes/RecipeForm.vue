<template>
  <div>
    <!-- En-tête du formulaire -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-mocha-800 dark:text-mocha-100">
          {{ isEditMode ? 'Modifier la recette' : 'Nouvelle recette' }}
        </h1>
        <p class="text-sm text-mocha-600 dark:text-mocha-300">
          {{ isEditMode ? `Édition de "${recipeData.title || 'recette'}"` : 'Créer une nouvelle recette' }}
        </p>
      </div>
      
      <div class="flex space-x-3">
        <!-- État de dernière sauvegarde -->
        <div v-if="lastSaved" class="flex items-center text-sm text-mocha-600 dark:text-mocha-300">
          <ClockIcon class="h-4 w-4 mr-1" />
          Auto-sauvegardé à {{ formatTime(lastSaved) }}
        </div>
        
        <!-- Boutons d'action -->
        <router-link
          to="/admin/recipes"
          class="px-4 py-2 bg-mocha-200 text-mocha-700 rounded-md hover:bg-mocha-300 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600 transition"
        >
          Annuler
        </router-link>
        
        <button
          @click="saveRecipe"
          class="px-4 py-2 bg-mocha-600 text-white rounded-md hover:bg-mocha-700 transition flex items-center"
          :disabled="isSaving || !formValid"
        >
          <span v-if="isSaving" class="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
          {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
        
        <button
          v-if="isEditMode"
          @click="publishRecipe"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center"
          :disabled="isSaving || !formValid"
        >
          <CheckIcon class="h-5 w-5 mr-1" />
          Publier
        </button>
      </div>
    </div>
    
    <!-- Formulaire principal -->
    <div class="bg-white dark:bg-mocha-900 rounded-lg shadow p-6">
      <div v-if="error" class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md">
        <p class="text-red-700 dark:text-red-300">{{ error }}</p>
      </div>
      
      <form @submit.prevent="saveRecipe" class="space-y-8">
        <!-- Informations de base -->
        <div>
          <h2 class="text-lg font-semibold text-mocha-800 dark:text-mocha-100 mb-4">Informations générales</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Titre -->
            <div class="col-span-2">
              <label for="title" class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                Titre <span class="text-red-500">*</span>
              </label>
              <input
                id="title"
                v-model="recipeData.title"
                type="text"
                required
                class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
              />
            </div>
            
            <!-- Description -->
            <div class="col-span-2">
              <label for="description" class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                v-model="recipeData.description"
                rows="3"
                class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
              ></textarea>
            </div>
            
            <!-- Type de repas -->
            <div>
              <label for="meal_type" class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                Type de repas <span class="text-red-500">*</span>
              </label>
              <select
                id="meal_type"
                v-model="recipeData.meal_type"
                required
                class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
              >
                <option value="breakfast">Petit-déjeuner</option>
                <option value="lunch">Déjeuner</option>
                <option value="dinner">Dîner</option>
                <option value="dessert">Dessert</option>
                <option value="snack">En-cas</option>
              </select>
            </div>
            
            <!-- Difficulté -->
            <div>
              <label for="difficulty" class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                Niveau de difficulté <span class="text-red-500">*</span>
              </label>
              <select
                id="difficulty"
                v-model="recipeData.difficulty_level"
                required
                class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
              >
                <option value="easy">Facile</option>
                <option value="medium">Moyen</option>
                <option value="hard">Difficile</option>
              </select>
            </div>
            
            <!-- Saison -->
            <div>
              <label for="season" class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                Saison <span class="text-red-500">*</span>
              </label>
              <select
                id="season"
                v-model="recipeData.season"
                required
                class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
              >
                <option value="spring">Printemps</option>
                <option value="summer">Été</option>
                <option value="autumn">Automne</option>
                <option value="winter">Hiver</option>
                <option value="all">Toute l'année</option>
              </select>
            </div>
            
            <!-- Temps de préparation -->
            <div>
              <label for="prep_time" class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                Temps de préparation (min) <span class="text-red-500">*</span>
              </label>
              <input
                id="prep_time"
                v-model.number="recipeData.prep_time"
                type="number"
                min="0"
                required
                class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
              />
            </div>
            
            <!-- Temps de cuisson -->
            <div>
              <label for="cook_time" class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                Temps de cuisson (min)
              </label>
              <input
                id="cook_time"
                v-model.number="recipeData.cook_time"
                type="number"
                min="0"
                class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
              />
            </div>
            
            <!-- Portions -->
            <div>
              <label for="servings" class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                Nombre de portions <span class="text-red-500">*</span>
              </label>
              <input
                id="servings"
                v-model.number="recipeData.servings"
                type="number"
                min="1"
                required
                class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
              />
            </div>
            
            <!-- Statut -->
            <div>
              <label for="status" class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                Statut <span class="text-red-500">*</span>
              </label>
              <select
                id="status"
                v-model="recipeData.status"
                required
                class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
              >
                <option value="draft">Brouillon</option>
                <option value="review">En révision</option>
                <option value="published">Publié</option>
                <option value="archived">Archivé</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Image et options -->
        <div>
          <h2 class="text-lg font-semibold text-mocha-800 dark:text-mocha-100 mb-4">Image et options</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- URL de l'image -->
            <div>
              <label for="image_url" class="block text-sm font-medium text-mocha-700 dark:text-mocha-300 mb-1">
                URL de l'image
              </label>
              <input
                id="image_url"
                v-model="recipeData.image_url"
                type="url"
                class="w-full rounded-md border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
              />
            </div>
            
            <!-- Aperçu de l'image -->
            <div v-if="recipeData.image_url" class="flex items-center">
              <div class="h-24 w-36 rounded-md overflow-hidden bg-mocha-100 dark:bg-mocha-700">
                <img
                  :src="recipeData.image_url"
                  alt="Aperçu de l'image"
                  class="h-full w-full object-cover"
                  @error="handleImageError"
                />
              </div>
              <button
                @click="recipeData.image_url = ''"
                class="ml-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                title="Supprimer l'image"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
            
            <!-- Options -->
            <div class="flex items-center space-x-4">
              <div class="flex items-center">
                <input
                  id="is_premium"
                  v-model="recipeData.is_premium"
                  type="checkbox"
                  class="h-4 w-4 rounded border-mocha-300 text-mocha-600 focus:ring-mocha-500 dark:border-mocha-600 dark:bg-mocha-800"
                />
                <label for="is_premium" class="ml-2 text-sm text-mocha-700 dark:text-mocha-300">
                  Contenu premium
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Ingrédients -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-mocha-800 dark:text-mocha-100">
              Ingrédients
            </h2>
            <button
              type="button"
              @click="addIngredient"
              class="text-sm px-3 py-1.5 bg-mocha-100 text-mocha-700 rounded-md hover:bg-mocha-200 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600 transition flex items-center"
            >
              <PlusIcon class="h-4 w-4 mr-1" />
              Ajouter un ingrédient
            </button>
          </div>
          
          <!-- Liste des ingrédients -->
          <div class="space-y-3">
            <div
              v-for="(ingredient, index) in recipeData.ingredients"
              :key="index"
              class="flex items-center gap-3 bg-mocha-50 dark:bg-mocha-800 p-3 rounded-md"
            >
              <!-- Quantité -->
              <div class="w-20">
                <input
                  v-model.number="ingredient.quantity"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="Qté"
                  class="w-full rounded-md text-sm border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
                />
              </div>
              
              <!-- Unité -->
              <div class="w-20">
                <input
                  v-model="ingredient.unit"
                  type="text"
                  placeholder="Unité"
                  class="w-full rounded-md text-sm border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
                />
              </div>
              
              <!-- Nom de l'ingrédient -->
              <div class="flex-1">
                <input
                  v-model="ingredient.name"
                  type="text"
                  placeholder="Nom de l'ingrédient"
                  required
                  class="w-full rounded-md text-sm border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
                />
              </div>
              
              <!-- Bouton de suppression -->
              <button
                type="button"
                @click="removeIngredient(index)"
                class="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                title="Supprimer l'ingrédient"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
            
            <div v-if="recipeData.ingredients.length === 0" class="text-center py-4 text-mocha-500 dark:text-mocha-400 text-sm">
              Aucun ingrédient ajouté. Cliquez sur "Ajouter un ingrédient" pour commencer.
            </div>
          </div>
        </div>
        
        <!-- Étapes de préparation -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-mocha-800 dark:text-mocha-100">
              Étapes de préparation
            </h2>
            <button
              type="button"
              @click="addStep"
              class="text-sm px-3 py-1.5 bg-mocha-100 text-mocha-700 rounded-md hover:bg-mocha-200 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600 transition flex items-center"
            >
              <PlusIcon class="h-4 w-4 mr-1" />
              Ajouter une étape
            </button>
          </div>
          
          <!-- Liste des étapes de préparation -->
          <div class="space-y-3">
            <div
              v-for="(step, index) in recipeData.steps"
              :key="index"
              class="flex items-start gap-3 bg-mocha-50 dark:bg-mocha-800 p-3 rounded-md"
            >
              <!-- Numéro d'étape -->
              <div class="w-10 h-10 flex-none rounded-full bg-mocha-200 dark:bg-mocha-700 flex items-center justify-center text-mocha-700 dark:text-mocha-300 font-medium">
                {{ index + 1 }}
              </div>
              
              <!-- Description de l'étape -->
              <div class="flex-1">
                <textarea
                  v-model="step.description"
                  rows="2"
                  placeholder="Description de l'étape"
                  required
                  class="w-full rounded-md text-sm border-mocha-300 focus:border-mocha-500 focus:ring focus:ring-mocha-500 focus:ring-opacity-50 dark:bg-mocha-800 dark:border-mocha-600 dark:text-mocha-200"
                ></textarea>
              </div>
              
              <!-- Bouton de suppression -->
              <button
                type="button"
                @click="removeStep(index)"
                class="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                title="Supprimer l'étape"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
            
            <div v-if="recipeData.steps.length === 0" class="text-center py-4 text-mocha-500 dark:text-mocha-400 text-sm">
              Aucune étape ajoutée. Cliquez sur "Ajouter une étape" pour commencer.
            </div>
          </div>
        </div>
        
        <!-- Boutons de soumission -->
        <div class="pt-6 border-t border-mocha-200 dark:border-mocha-700 flex justify-end space-x-3">
          <router-link
            to="/admin/recipes"
            class="px-4 py-2 bg-mocha-200 text-mocha-700 rounded-md hover:bg-mocha-300 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600 transition"
          >
            Annuler
          </router-link>
          
          <button
            type="submit"
            class="px-4 py-2 bg-mocha-600 text-white rounded-md hover:bg-mocha-700 transition flex items-center"
            :disabled="isSaving || !formValid"
          >
            <span v-if="isSaving" class="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
            {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
  
<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAdminRecipeStore } from '@/stores/adminRecipeStore'
import { useNotificationStore } from '@/stores/NotificationStore'
import {
  PlusIcon,
  TrashIcon,
  CheckIcon,
  ClockIcon
} from '@heroicons/vue/24/outline'

// Stores et router
const adminRecipeStore = useAdminRecipeStore()
const notificationStore = useNotificationStore()
const router = useRouter()
const route = useRoute()

// État local
const recipeData = ref({
  title: '',
  description: '',
  meal_type: 'dinner',
  difficulty_level: 'medium',
  prep_time: 15,
  cook_time: 0,
  servings: 4,
  image_url: '',
  status: 'draft',
  is_premium: false,
  season: 'all',
  nutrition_info: {}, // Ajout du champ nutrition_info
  ingredients: [] as { name: string; quantity: number | null; unit: string }[],
  steps: [] as { order: number; description: string }[]
})

const error = ref('')
const isSaving = ref(false)
const lastSaved = ref<Date | null>(null)
const autoSaveInterval = ref<number | null>(null)
const imageError = ref(false)

// Déterminer si on est en mode édition ou création
const isEditMode = computed(() => !!route.params.id)
const recipeId = computed(() => route.params.id ? parseInt(route.params.id as string) : null)

// Vérifier si le formulaire est valide
const formValid = computed(() => {
  return (
    !!recipeData.value.title &&
    !!recipeData.value.meal_type &&
    !!recipeData.value.difficulty_level &&
    recipeData.value.prep_time >= 0 &&
    recipeData.value.servings > 0 &&
    recipeData.value.ingredients.every(ing => ing.name.trim() !== '') &&
    recipeData.value.steps.every(step => step.description.trim() !== '')
  )
})

// Méthodes
async function loadRecipe() {
  if (!recipeId.value) return
  
  try {
    const recipe = await adminRecipeStore.fetchRecipeById(recipeId.value)
    
    if (recipe) {
      // Adapter les ingrédients au format attendu
      const ingredients = Array.isArray(recipe.ingredients) 
        ? recipe.ingredients.map(ing => {
            if (typeof ing === 'object' && ing.name) {
              return {
                name: ing.name,
                quantity: ing.quantity || null,
                unit: ing.unit || ''
              }
            }
            return { name: ing.toString(), quantity: null, unit: '' }
          })
        : []
      
      // Adapter les étapes au format attendu
      const steps = Array.isArray(recipe.steps)
        ? recipe.steps.map((step, index) => {
            if (typeof step === 'object' && step.description) {
              return {
                order: step.order || index + 1,
                description: step.description
              }
            }
            return { order: index + 1, description: step.toString() }
          })
        : []
      
      // Mettre à jour les données du formulaire
      recipeData.value = {
        ...recipe,
        ingredients,
        steps,
        nutrition_info: recipe.nutrition_info || {} // S'assurer que nutrition_info est défini
      }
    } else {
      notificationStore.error(`La recette #${recipeId.value} n'existe pas`)
      router.push('/admin/recipes')
    }
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement de la recette'
    notificationStore.error('Erreur lors du chargement de la recette')
    router.push('/admin/recipes')
  }
}

function addIngredient() {
  recipeData.value.ingredients.push({
    name: '',
    quantity: null,
    unit: ''
  })
}

function removeIngredient(index: number) {
  recipeData.value.ingredients.splice(index, 1)
}

function addStep() {
  recipeData.value.steps.push({
    order: recipeData.value.steps.length + 1,
    description: ''
  })
}

function removeStep(index: number) {
  recipeData.value.steps.splice(index, 1)
  
  // Réordonner les étapes restantes
  recipeData.value.steps.forEach((step, idx) => {
    step.order = idx + 1
  })
}

function handleImageError() {
  imageError.value = true
}

async function saveRecipe() {
  if (!formValid.value) {
    notificationStore.error('Veuillez remplir tous les champs obligatoires')
    return
  }
  
  isSaving.value = true
  error.value = ''
  
  try {
    // Corriger les étapes avant de les envoyer
    const correctedSteps = recipeData.value.steps.map(step => {
      return {
        order: step.order,
        description: typeof step.description === 'object' 
          ? JSON.stringify(step.description) 
          : String(step.description)
      }
    })
    
    // Structurer les ingrédients et les étapes au format attendu par la BD
    const formattedIngredients = {
      ingredients: recipeData.value.ingredients
    }
    
    const formattedSteps = {
      steps: correctedSteps
    }
    
    // S'assurer que les champs numériques sont des nombres et ajouter la saison et nutrition_info
    const recipeToSave = {
      ...recipeData.value,
      prep_time: Number(recipeData.value.prep_time),
      cook_time: Number(recipeData.value.cook_time),
      servings: Number(recipeData.value.servings),
      ingredients: formattedIngredients,
      steps: formattedSteps,
      season: recipeData.value.season || 'all', // Assurer que la saison est toujours définie
      nutrition_info: recipeData.value.nutrition_info || {} // Ajout du champ manquant
    }
    
    let result
    
    if (isEditMode.value && recipeId.value) {
      // Mode édition
      result = await adminRecipeStore.updateRecipe(recipeId.value, recipeToSave)
    } else {
      // Mode création
      result = await adminRecipeStore.createRecipe(recipeToSave)
    }
    
    if (result) {
      notificationStore.success(
        isEditMode.value
          ? 'Recette mise à jour avec succès'
          : 'Recette créée avec succès'
      )
      
      // Redirection vers la liste des recettes
      router.push('/admin/recipes')
    } else {
      throw new Error('Une erreur est survenue lors de l\'enregistrement')
    }
  } catch (err) {
    error.value = err.message || 'Erreur lors de l\'enregistrement de la recette'
    notificationStore.error('Erreur lors de l\'enregistrement de la recette')
  } finally {
    isSaving.value = false
  }
}

async function publishRecipe() {
  if (!formValid.value) {
    notificationStore.error('Veuillez remplir tous les champs obligatoires')
    return
  }
  
  // Définir le statut comme "published" et enregistrer
  recipeData.value.status = 'published'
  await saveRecipe()
}

function autoSave() {
  if (formValid.value && !isSaving.value) {
    adminRecipeStore.saveDraft(recipeData.value)
    lastSaved.value = new Date()
  }
}

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function loadDraft() {
  const draft = adminRecipeStore.loadDraft()
  
  if (draft && !isEditMode.value) {
    recipeData.value = draft
    notificationStore.info('Brouillon chargé')
    lastSaved.value = new Date(draft.savedAt)
  }
}

// Surveiller les changements pour l'auto-sauvegarde
watch(recipeData, () => {
  // Sauvegarder seulement en mode création ou si des modifications ont été apportées en mode édition
  if (!isEditMode.value || (isEditMode.value && recipeId.value)) {
    autoSave()
  }
}, { deep: true })

// Lifecycle hooks
onMounted(async () => {
  // Initialiser le store
  adminRecipeStore.initialize()
  
  // Charger la recette existante en mode édition
  if (isEditMode.value) {
    await loadRecipe()
  } else {
    // Essayer de charger un brouillon en mode création
    loadDraft()
    
    // Préremplir avec des ingrédients et étapes vides pour faciliter la création
    if (recipeData.value.ingredients.length === 0) {
      addIngredient()
      addIngredient()
      addIngredient()
    }
    
    if (recipeData.value.steps.length === 0) {
      addStep()
      addStep()
    }
  }
  
  // Configurer l'auto-sauvegarde toutes les 30 secondes
  autoSaveInterval.value = window.setInterval(() => {
    autoSave()
  }, 30000)
})

onUnmounted(() => {
  // Nettoyer l'intervalle d'auto-sauvegarde
  if (autoSaveInterval.value) {
    clearInterval(autoSaveInterval.value)
  }
})
</script>