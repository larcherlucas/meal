<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menuStore'
import { useAuthStore } from '@/stores/auth'
import { useUserPreferencesStore } from '@/stores/userPreferences'
import { useSubscriptionStore } from '@/stores/subscription'
import WeeklyMenuSlider from '@/components/home/WeeklyMenuSlider.vue'
import SeasonalProducts from '@/components/home/SeasonalProducts.vue'
import { Menu, Recipe } from '@/types'
import QuickMenuCreation from '@/components/QuickMenuCreation.vue'


// Stores
const menuStore = useMenuStore()
const authStore = useAuthStore()
const userPreferencesStore = useUserPreferencesStore()
const subscriptionStore = useSubscriptionStore()
const router = useRouter()

// États réactifs
const isLoading = ref(false)
const isError = ref(false)
const errorMessage = ref('')
const currentMenu = ref<Menu | null>(null)
const suggestedRecipes = ref<Recipe[]>([])

// Computed properties
const hasActiveMenu = computed(() => !!currentMenu.value)
const householdMembersCount = computed(() => 
  userPreferencesStore.totalHouseholdMembers || 1
)

// Méthodes de navigation
const goToMenuCreation = () => {
  router.push('/menu/create')
}

const goToMenuGenerator = () => {
  router.push('/menu/generator')
}

// Chargement des données initiales
const loadInitialData = async () => {
  try {
    isLoading.value = true
    isError.value = false
    errorMessage.value = ''

    // Vérifier l'authentification
    if (!authStore.isAuthenticated) {
      router.push('/login')
      return
    }
  // Log avant l'appel
  console.log('Stores avant chargement:', {
      menuStore: menuStore,
      authStore: authStore
    })
    // Charger le profil utilisateur
    await userPreferencesStore.fetchUserProfile()

    // Récupérer le menu actif
    try {
      const activeMenu = await menuStore.fetchActiveMenu()
      currentMenu.value = activeMenu
      if (!activeMenu) {
        console.log('Aucun menu actif trouvé, ceci est normal pour un nouvel utilisateur')
      }
    } catch (menuError) {
      // On ne considère pas l'erreur 404 comme une erreur critique
      if (menuError.status === 404) {
        console.log('Aucun menu actif trouvé (404), proposer à l\'utilisateur d\'en créer un')
      } else {
        console.error('Erreur lors du chargement du menu actif:', menuError)
        isError.value = true
        errorMessage.value = 'Impossible de charger le menu actif'
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
    isError.value = true
    errorMessage.value = 'Une erreur est survenue lors du chargement des données'
  } finally {
    isLoading.value = false
  }
}

// Charger les données au montage du composant
onMounted(loadInitialData)
</script>

<template>
  <div class="space-y-8">
    <!-- Gestion des états de chargement et d'erreur -->
    <div v-if="isLoading" class="text-center py-8">
      <p>Chargement de vos données...</p>
      <!-- Ajouter un spinner ou un skeleton loader -->
    </div>

    <div v-else-if="isError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Erreur : </strong>
      <span class="block sm:inline">{{ errorMessage }}</span>
      <button 
        @click="loadInitialData" 
        class="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
      >
        Réessayer
      </button>
    </div>

    <!-- Contenu principal -->
    <template v-else>
      <!-- Menu de la semaine -->
      <section>
        <h2 class="text-2xl font-bold mb-4" style="color: rgba(89, 1, 1, 1)">
          Menu de la semaine
        </h2>
        
        <!-- Affichage conditionnel selon la présence d'un menu -->
        <div v-if="hasActiveMenu && currentMenu">
          <WeeklyMenuSlider :menu="currentMenu" />
        </div>
        <div v-else>
          <!-- Remplacer cette div par le composant QuickMenuCreation -->
          <QuickMenuCreation />
        </div>
      </section>
      
      <!-- Produits de saison et Suggestions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SeasonalProducts />
        
        <!-- Suggestions de recettes -->
        <div 
          v-if="suggestedRecipes.length" 
          class="bento-card p-6 rounded-lg shadow-md" 
          style="border: 1px solid rgba(242, 182, 4, 1)"
        >
          <h2 class="text-xl font-semibold mb-4" style="color: rgba(89, 1, 1, 1)">
            Suggestions de recettes
          </h2>
          <div class="space-y-4">
            <div
              v-for="recipe in suggestedRecipes"
              :key="recipe.id"
              class="flex items-center space-x-4 p-3 rounded-lg transition-all duration-300 hover:shadow-md"
              :class="{'hover-effect': true}"
            >
              <img
                v-if="recipe.imageUrl"
                :src="recipe.imageUrl"
                :alt="recipe.name"
                class="w-20 h-20 object-cover rounded-lg"
              />
              <div>
                <h3 class="font-medium" style="color: rgba(216, 121, 4, 1)">
                  {{ recipe.name }}
                </h3>
                <div 
                  class="flex items-center space-x-2 text-sm" 
                  style="color: rgba(144, 165, 69, 1)"
                >
                  <span>{{ recipe.difficulty }}</span>
                  <span>•</span>
                  <span>{{ recipe.preparationTime }} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
button {
  transition: all 0.3s ease;
}

.bento-card {
  transition: all 0.3s ease;
  background-color: white;
}

.hover-effect {
  background-color: white;
  border: 1px solid rgba(144, 165, 69, 0.3);
  transition: all 0.3s ease;
}

.hover-effect:hover {
  transform: translateX(5px);
  background-color: rgba(242, 182, 4, 0.1);
}
button {
  transition: all 0.3s ease;
}

.bento-card {
  transition: all 0.3s ease;
  background-color: white;
}

.hover-effect {
  background-color: white;
  border: 1px solid rgba(144, 165, 69, 0.3);
  transition: all 0.3s ease;
}

.hover-effect:hover {
  transform: translateX(5px);
  background-color: rgba(242, 182, 4, 0.1);
}
</style>