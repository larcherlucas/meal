<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import WeeklyMenuSlider from '@/components/home/WeeklyMenuSlider.vue'
import SeasonalProducts from '@/components/home/SeasonalProducts.vue'

const router = useRouter()

// État pour déterminer si l'utilisateur a un menu programmé
const hasWeeklyMenu = ref(false) // À remplacer par votre logique réelle pour vérifier l'existence d'un menu

// Redirection vers les pages appropriées
const goToMenuCreation = () => {
  router.push('/menu')
}

const goToMenuGenerator = () => {
  router.push('/menu/generator')
}

const dessertSuggestions = ref([
  {
    id: 1,
    name: 'Tarte aux pommes rustique',
    image: '/images/tarte-pommes.jpg',
    difficulty: 'Facile',
    time: '45 min'
  },
  {
    id: 2,
    name: 'Crumble aux fruits rouges',
    image: '/images/crumble.jpg',
    difficulty: 'Facile',
    time: '30 min'
  },
  // ... autres suggestions
])
</script>

<template>
  <div class="space-y-8">
    <!-- Menu de la semaine -->
    <section>
      <h2 class="text-2xl font-bold text-mocha-800 mb-4">Menu de la semaine</h2>
      
      <!-- Affichage conditionnel selon la présence d'un menu -->
      <div v-if="hasWeeklyMenu">
        <WeeklyMenuSlider />
      </div>
      <div v-else class="bg-mocha-50 p-6 rounded-lg">
        <h3 class="text-lg font-medium text-mocha-800 mb-3">Vous n'avez pas encore de menu pour cette semaine</h3>
        <div class="flex flex-col sm:flex-row gap-4">
          <button 
            @click="goToMenuCreation" 
            class="px-4 py-2 bg-mocha-600 text-white rounded-lg hover:bg-mocha-700 transition-colors"
          >
            Préparer votre menu seul
          </button>
          <button 
            @click="goToMenuGenerator" 
            class="px-4 py-2 bg-mocha-500 text-white rounded-lg hover:bg-mocha-600 transition-colors"
          >
            Générer un menu en fonction de vous
          </button>
        </div>
      </div>
    </section>
    
    <!-- Produits de saison et Suggestions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SeasonalProducts />
      
      <!-- Suggestions de desserts -->
      <div class="bento-card">
        <h2 class="text-xl font-semibold text-mocha-800 mb-4">Suggestions de desserts</h2>
        <div class="space-y-4">
          <div
            v-for="dessert in dessertSuggestions"
            :key="dessert.id"
            class="flex items-center space-x-4 p-2 rounded-lg hover:bg-mocha-50 transition-colors"
          >
            <img
              :src="dessert.image"
              :alt="dessert.name"
              class="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <h3 class="font-medium text-mocha-800">{{ dessert.name }}</h3>
              <div class="flex items-center space-x-2 text-sm text-mocha-600">
                <span>{{ dessert.difficulty }}</span>
                <span>•</span>
                <span>{{ dessert.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>