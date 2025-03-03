<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMenuStore } from '@/stores/menuStore'
import { useSubscriptionStore } from '@/stores/subscription'
import { useNotificationStore } from '@/stores/NotificationStore'
import { useAuthStore } from '@/stores/auth'
import { useUserPreferencesStore } from '@/stores/userPreferences'
import { 
  CheckIcon, 
  XMarkIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserIcon
} from '@heroicons/vue/24/outline'
import type { GenerateMenuParams } from '@/stores/menuStore'

// Stores
const menuStore = useMenuStore()
const subscriptionStore = useSubscriptionStore()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const userPreferencesStore = useUserPreferencesStore()
const router = useRouter()
const route = useRoute()

// États locaux
const menuType = ref<'week' | 'month'>('week')
const excludedIngredients = ref<string[]>([])
const dietaryRestrictions = ref<string[]>([])
const selectedMealTypes = ref<('breakfast' | 'lunch' | 'dinner' | 'snack')[]>([
  'breakfast', 'lunch', 'dinner'
])
const servingsCount = ref<number>(4)
const newIngredient = ref('')
const formSubmitted = ref(false)
const isLoading = ref(true)

// Options pour les restrictions alimentaires
const availableDietaryRestrictions = [
  { id: 'vegetarian', label: 'Végétarien' },
  { id: 'vegan', label: 'Végétalien' },
  { id: 'gluten-free', label: 'Sans gluten' },
  { id: 'lactose-free', label: 'Sans lactose' },
  { id: 'nut-free', label: 'Sans noix' }
]

// Options pour les types de repas
const mealTypeOptions = [
  { id: 'breakfast', label: 'Petit-déjeuner' },
  { id: 'lunch', label: 'Déjeuner' },
  { id: 'dinner', label: 'Dîner' },
  { id: 'snack', label: 'Collation' }
]

// Computed properties
const isGenerating = computed(() => menuStore.isGenerating)
const isDev = import.meta.env.DEV

// Double vérification de l'abonnement actif
const hasSubscription = computed(() => {
  // Vérification principale via le store d'abonnement
  const plan = subscriptionStore.getCurrentPlan
  const hasPlanSubscription = plan && plan.id !== 'free'
  
  // Vérification secondaire via l'authStore (comme backup)
  const hasAuthSubscription = authStore.hasActiveSubscription
  
  console.log('Vérification d\'abonnement:', {
    'Plan d\'abonnement actuel': plan,
    'Plan non gratuit': hasPlanSubscription,
    'Auth hasActiveSubscription': hasAuthSubscription
  })
  
  // Retourne true si l'une des vérifications confirme un abonnement actif
  return hasPlanSubscription || hasAuthSubscription
})

const menuTypeLabel = computed(() => 
  menuType.value === 'week' ? 'hebdomadaire' : 'mensuel'
)

const formIsValid = computed(() => {
  return selectedMealTypes.value.length > 0 && servingsCount.value > 0
})

// Fonction pour vérifier si on est en mode régénération
const isRegenerateMode = computed(() => {
  return route.query.regenerate === 'true'
})

// Méthodes
function addExcludedIngredient() {
  if (newIngredient.value.trim() && !excludedIngredients.value.includes(newIngredient.value.trim())) {
    excludedIngredients.value.push(newIngredient.value.trim())
    newIngredient.value = ''
  }
}

function removeExcludedIngredient(ingredient: string) {
  excludedIngredients.value = excludedIngredients.value.filter(i => i !== ingredient)
}

function toggleMealType(mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') {
  if (selectedMealTypes.value.includes(mealType)) {
    selectedMealTypes.value = selectedMealTypes.value.filter(t => t !== mealType)
  } else {
    selectedMealTypes.value.push(mealType)
  }
}

function toggleDietaryRestriction(restriction: string) {
  if (dietaryRestrictions.value.includes(restriction)) {
    dietaryRestrictions.value = dietaryRestrictions.value.filter(r => r !== restriction)
  } else {
    dietaryRestrictions.value.push(restriction)
  }
}

// Fonction pour précharger le formulaire avec les préférences utilisateur
function loadUserPreferences() {
  // Si on est en mode régénération, charger les préférences depuis les query params
  if (isRegenerateMode.value) {
    console.log('Mode régénération détecté, chargement des paramètres depuis l\'URL')
    
    // Charger le nombre de portions
    if (route.query.servings) {
      servingsCount.value = Number(route.query.servings) || 4
    }
    
    // Charger les restrictions alimentaires
    if (route.query.restrictions) {
      const restrictions = String(route.query.restrictions).split(',')
      dietaryRestrictions.value = restrictions.filter(r => 
        availableDietaryRestrictions.some(ar => ar.id === r)
      )
    }
    
    // Charger les ingrédients exclus
    if (route.query.excluded) {
      excludedIngredients.value = String(route.query.excluded).split(',')
    }
    
    return
  }
  
  // Sinon, charger depuis le profil utilisateur
  if (userPreferencesStore.userProfile) {
    console.log('Chargement des préférences utilisateur depuis le profil')
    
    // Charger le nombre de portions préféré
    if (userPreferencesStore.userProfile.defaultServings) {
      servingsCount.value = userPreferencesStore.userProfile.defaultServings
    }
    
    // Charger les restrictions alimentaires enregistrées
    if (userPreferencesStore.userProfile.dietaryRestrictions && 
        Array.isArray(userPreferencesStore.userProfile.dietaryRestrictions)) {
      dietaryRestrictions.value = [...userPreferencesStore.userProfile.dietaryRestrictions]
    }
    
    // Charger les ingrédients exclus enregistrés
    if (userPreferencesStore.userProfile.excludedIngredients && 
        Array.isArray(userPreferencesStore.userProfile.excludedIngredients)) {
      excludedIngredients.value = [...userPreferencesStore.userProfile.excludedIngredients]
    }
  }
}

// Fonction de débogage pour vérifier l'état de l'abonnement
function debugSubscriptionStatus() {
  console.log('--- Débogage Abonnement ---')
  console.log('Auth Store:', {
    utilisateur: authStore.user,
    abonnement: authStore.user?.subscription,
    statut: authStore.user?.subscription?.status,
    actif: authStore.user?.subscription?.isActive,
    hasActiveSubscription: authStore.hasActiveSubscription
  })
  
  console.log('Subscription Store:', {
    plan: subscriptionStore.getCurrentPlan,
    hasSubscription: hasSubscription.value
  })
  
  // Tenter une synchronisation explicite
  if (authStore.user?.subscription) {
    authStore.syncSubscriptionData()
    console.log('Après synchronisation:', authStore.user.subscription)
  }
  
  return hasSubscription.value
}

async function generateMenu() {
  if (!formIsValid.value) {
    notificationStore.show({
      type: 'warning',
      message: 'Veuillez sélectionner au moins un type de repas'
    })
    return
  }

  // Vérification explicite de l'abonnement
  const hasValidSubscription = debugSubscriptionStatus()
  
  if (!hasValidSubscription) {
    notificationStore.show({
      type: 'warning',
      message: 'La génération de menu nécessite un abonnement actif'
    })
    router.push('/subscription?redirect=menu-generator')
    return
  }

  formSubmitted.value = true

  // Ici, nous utilisons toujours 'week' ou 'month', cela sera converti dans le store
  const params: GenerateMenuParams = {
    type: menuType.value,
    preferences: {
      excludedIngredients: excludedIngredients.value,
      dietaryRestrictions: dietaryRestrictions.value,
      mealTypes: selectedMealTypes.value,
      servingsCount: servingsCount.value
    }
  }

  try {
    console.log('Génération du menu avec paramètres:', params)
    const generatedMenu = await menuStore.generateMenu(params)
    
    if (generatedMenu) {
      console.log('Menu généré avec succès:', generatedMenu)
      
      // Rediriger vers la vue du menu généré avec les paramètres utilisés
      router.push({
        path: `/menus/${generatedMenu.id}`,
        query: {
          servings: servingsCount.value.toString(),
          restrictions: dietaryRestrictions.value.join(','),
          excluded: excludedIngredients.value.join(',')
        }
      })
    } else {
      console.warn('Menu généré mais aucun ID retourné')
    }
  } catch (error) {
    console.error('Erreur lors de la génération du menu:', error)
    notificationStore.show({
      type: 'error',
      message: 'Erreur lors de la génération du menu. Veuillez réessayer.'
    })
  } finally {
    formSubmitted.value = false
  }
}

// Fonction pour sauvegarder les préférences actuelles
async function saveAsDefaultPreferences() {
  try {
    await userPreferencesStore.updateUserPreferences({
      defaultServings: servingsCount.value,
      dietaryRestrictions: dietaryRestrictions.value,
      excludedIngredients: excludedIngredients.value
    })
    
    notificationStore.show({
      type: 'success',
      message: 'Préférences enregistrées comme valeurs par défaut'
    })
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des préférences:', error)
    notificationStore.show({
      type: 'error',
      message: 'Erreur lors de l\'enregistrement des préférences'
    })
  }
}

// Fonction pour forcer la mise à jour des données d'abonnement
async function forceRefreshSubscription() {
  isLoading.value = true
  try {
    // Vérifier le token d'authentification si nécessaire
    if (authStore.token && !authStore.isVerified) {
      await authStore.verifyToken()
    }
    
    // Rafraîchir le plan d'abonnement
    await subscriptionStore.fetchCurrentPlan()
    
    // Synchroniser les données d'abonnement dans authStore
    if (authStore.user?.subscription) {
      authStore.syncSubscriptionData()
    }
    
    // Vérification du statut après rafraîchissement
    debugSubscriptionStatus()
    
    // Notification à l'utilisateur
    notificationStore.show({
      type: 'info',
      message: 'État d\'abonnement mis à jour',
      duration: 3000
    })
  } catch (error) {
    console.error('Erreur lors du rafraîchissement des données:', error)
  } finally {
    isLoading.value = false
  }
}

// Chargement initial et mise en place des watchers
onMounted(async () => {
  isLoading.value = true
  try {
    // Vérifier le token si nécessaire
    if (authStore.token && !authStore.isVerified) {
      await authStore.verifyToken()
    }
    
    // Charger le plan d'abonnement
    await subscriptionStore.fetchCurrentPlan()
    
    // Charger le profil utilisateur si c'est possible
    try {
      await userPreferencesStore.fetchUserProfile()
    } catch (error) {
      console.warn('Impossible de charger le profil utilisateur:', error)
      // Continuons sans le profil utilisateur
    }
    
    // Vérification explicite du statut d'abonnement
    if (authStore.user?.subscription) {
      authStore.syncSubscriptionData()
    }
    
    // Charger les préférences utilisateur de façon sécurisée
    try {
      loadUserPreferences()
    } catch (error) {
      console.warn('Erreur lors du chargement des préférences:', error)
      // Continuons avec les valeurs par défaut
    }
    
    // Déboguer l'état initial
    debugSubscriptionStatus()
    
    if (!hasSubscription.value) {
      notificationStore.show({
        type: 'info',
        message: 'Cette fonctionnalité nécessite un abonnement actif',
        duration: 7000
      })
    }
  } catch (error) {
    console.error('Erreur lors du chargement initial:', error)
  } finally {
    isLoading.value = false
  }
})

// Observer les changements dans les stores pour réagir aux mises à jour
watch(
  () => [authStore.user?.subscription, subscriptionStore.getCurrentPlan],
  () => {
    console.log('Changement détecté dans les données d\'abonnement')
    debugSubscriptionStatus()
  }
)
</script>

<template>
  <!-- Le template reste inchangé -->
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-mocha-800 dark:text-mocha-100">
        Générer un menu {{ menuTypeLabel }}
        <span v-if="isRegenerateMode" class="ml-2 text-sm font-normal text-mocha-500 dark:text-mocha-400">
          (Régénération)
        </span>
      </h1>
      
      <!-- Indicateur de chargement -->
      <div v-if="isLoading" class="flex items-center text-blue-600 dark:text-blue-400">
        <ArrowPathIcon class="h-5 w-5 mr-2 animate-spin" />
        <span>Chargement des données...</span>
      </div>
      
      <!-- Indicateur d'abonnement -->
      <div v-else-if="!hasSubscription" 
           class="flex items-center px-4 py-2 bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-100 rounded-lg">
        <ExclamationTriangleIcon class="h-5 w-5 mr-2" />
        <span>Fonctionnalité premium</span>
        <router-link to="/subscription" 
                    class="ml-3 px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors">
          S'abonner
        </router-link>
      </div>
      
      <!-- Bouton de rafraîchissement pour le debug -->
      <button v-else
              @click="forceRefreshSubscription"
              class="flex items-center text-blue-600 dark:text-blue-400 hover:underline">
        <ArrowPathIcon class="h-5 w-5 mr-1" :class="{'animate-spin': isLoading}" />
        <span>Rafraîchir l'état</span>
      </button>
    </div>
    
    <!-- Formulaire de génération -->
    <div class="bento-card">
      <form @submit.prevent="generateMenu" class="space-y-6">
        <!-- Type de menu -->
        <div>
          <label class="block mb-2 font-medium">Type de menu</label>
          <div class="flex space-x-4">
            <button 
              type="button"
              @click="menuType = 'week'"
              class="px-4 py-2 rounded-lg transition-colors"
              :class="menuType === 'week' ? 
                'bg-mocha-100 text-mocha-700 dark:bg-mocha-900 dark:text-mocha-100' : 
                'hover:bg-gray-100 dark:hover:bg-gray-700'"
            >
              Hebdomadaire
            </button>
            <button 
              type="button"
              @click="menuType = 'month'"
              class="px-4 py-2 rounded-lg transition-colors"
              :class="menuType === 'month' ? 
                'bg-mocha-100 text-mocha-700 dark:bg-mocha-900 dark:text-mocha-100' : 
                'hover:bg-gray-100 dark:hover:bg-gray-700'"
            >
              Mensuel
            </button>
          </div>
        </div>
        
        <!-- Types de repas -->
        <div>
          <label class="block mb-2 font-medium">Types de repas à inclure</label>
          <div class="flex flex-wrap gap-3">
            <button 
              v-for="type in mealTypeOptions" 
              :key="type.id"
              type="button"
              @click="toggleMealType(type.id as any)"
              class="px-4 py-2 rounded-lg transition-colors flex items-center"
              :class="selectedMealTypes.includes(type.id as any) ? 
                'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100' : 
                'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'"
            >
              <CheckIcon v-if="selectedMealTypes.includes(type.id as any)" class="h-5 w-5 mr-2" />
              {{ type.label }}
            </button>
          </div>
          <p v-if="selectedMealTypes.length === 0 && formSubmitted" class="text-red-500 mt-1">
            Veuillez sélectionner au moins un type de repas
          </p>
        </div>
        
        <!-- Nombre de portions -->
        <div>
          <label for="servings" class="block mb-2 font-medium">Nombre de portions</label>
          <div class="flex items-center space-x-2">
            <input 
              id="servings"
              v-model="servingsCount"
              type="number"
              min="1"
              max="12"
              class="px-4 py-2 border rounded-lg w-full max-w-xs"
            />
            <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <UserIcon class="h-4 w-4 mr-1" />
              <span>personne{{ servingsCount > 1 ? 's' : '' }}</span>
            </div>
          </div>
        </div>
        
        <!-- Restrictions alimentaires -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="font-medium">Restrictions alimentaires</label>
            <button 
              v-if="dietaryRestrictions.length > 0" 
              type="button"
              @click="dietaryRestrictions = []"
              class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
          <div class="flex flex-wrap gap-3">
            <button 
              v-for="restriction in availableDietaryRestrictions" 
              :key="restriction.id"
              type="button"
              @click="toggleDietaryRestriction(restriction.id)"
              class="px-4 py-2 rounded-lg transition-colors flex items-center"
              :class="dietaryRestrictions.includes(restriction.id) ? 
                'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100' : 
                'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'"
            >
              <CheckIcon v-if="dietaryRestrictions.includes(restriction.id)" class="h-5 w-5 mr-2" />
              {{ restriction.label }}
            </button>
          </div>
        </div>
        
        <!-- Ingrédients exclus -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="font-medium">Ingrédients à exclure</label>
            <button 
              v-if="excludedIngredients.length > 0" 
              type="button"
              @click="excludedIngredients = []"
              class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              Tout effacer
            </button>
          </div>
          <div class="flex mb-2">
            <input 
              v-model="newIngredient"
              type="text"
              placeholder="Ex: champignons"
              class="px-4 py-2 border rounded-l-lg flex-grow"
              @keyup.enter="addExcludedIngredient"
            />
            <button 
              type="button"
              @click="addExcludedIngredient"
              class="px-4 py-2 bg-mocha-600 text-white rounded-r-lg hover:bg-mocha-700 transition-colors"
            >
              Ajouter
            </button>
          </div>
          
          <!-- Liste des ingrédients exclus -->
          <div v-if="excludedIngredients.length > 0" class="flex flex-wrap gap-2 mt-3">
            <div 
              v-for="ingredient in excludedIngredients" 
              :key="ingredient"
              class="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center"
            >
              <span>{{ ingredient }}</span>
              <button 
                type="button" 
                @click="removeExcludedIngredient(ingredient)"
                class="ml-2 text-gray-500 hover:text-red-500"
              >
                <XMarkIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        <!-- Boutton pour sauvegarder les préférences -->
        <div v-if="hasSubscription" class="flex justify-end">
          <button 
            type="button"
            @click="saveAsDefaultPreferences"
            class="px-4 py-2 text-sm text-mocha-600 hover:text-mocha-800 dark:text-mocha-400 dark:hover:text-mocha-200 transition-colors flex items-center"
          >
            <CheckIcon class="h-4 w-4 mr-1" />
            Enregistrer comme préférences par défaut
          </button>
        </div>
        
        <!-- Message informatif -->
        <div v-if="hasSubscription" class="flex items-start p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <InformationCircleIcon class="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
          <p class="text-sm text-blue-700 dark:text-blue-300">
            Notre algorithme va générer un menu {{ menuTypeLabel }} personnalisé selon vos préférences. 
            Vous pourrez ensuite modifier ce menu selon vos envies.
          </p>
        </div>
        
        <!-- Bouton de génération avec mise à jour du comportement -->
        <div>
          <button 
            type="submit"
            :disabled="isGenerating || !hasSubscription || isLoading"
            class="px-6 py-3 bg-mocha-600 text-white rounded-lg hover:bg-mocha-700 transition-colors flex items-center justify-center w-full"
            :class="{'opacity-50 cursor-not-allowed': isGenerating || !hasSubscription || isLoading}"
          >
            <ArrowPathIcon v-if="isGenerating || isLoading" class="h-5 w-5 mr-2 animate-spin" />
            <span v-if="isGenerating">Génération en cours...</span>
            <span v-else-if="isLoading">Chargement...</span>
            <span v-else>Générer mon menu {{ menuTypeLabel }}</span>
          </button>
        </div>

        <!-- Message d'abonnement -->
        <div v-if="!hasSubscription && !isLoading" class="flex items-start p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
          <ExclamationTriangleIcon class="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
          <div class="text-sm text-amber-700 dark:text-amber-300">
            <p class="font-medium">Fonctionnalité premium</p>
            <p class="mt-1">
              La génération automatique de menus nécessite un abonnement actif.
              <router-link to="/subscription" class="underline font-medium">
                Découvrir les avantages
              </router-link>
            </p>
          </div>
        </div>
        
        <div v-if="hasSubscription && isDev" class="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-mono overflow-auto max-h-40">
          <p class="font-bold">Informations de débogage :</p>
          <pre>{{ authStore.user?.subscription ? JSON.stringify(authStore.user.subscription, null, 2) : 'Aucune donnée d\'abonnement' }}</pre>
          <pre>{{ subscriptionStore.getCurrentPlan ? JSON.stringify(subscriptionStore.getCurrentPlan, null, 2) : 'Aucun plan actif' }}</pre>
        </div>
      </form>
    </div>
  </div>
</template>