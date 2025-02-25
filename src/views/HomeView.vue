<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import WeeklyMenuSlider from '@/components/home/WeeklyMenuSlider.vue'
import SeasonalProducts from '@/components/home/SeasonalProducts.vue'

const router = useRouter()

// Palette de couleurs en RGB
const colors = {
  green: 'rgb(96, 140, 2)',      // #618C03
  yellow: 'rgb(242, 182, 4)',    // #F2B705
  orange: 'rgb(216, 121, 4)',    // #D97904
  brightRed: 'rgb(216, 43, 4)',  // #D92B04
  deepRed: 'rgb(140, 14, 2)',    // #8C0E03
  lightGreen: 'rgb(215, 235, 182)', // Version claire du vert pour les fonds
  lightYellow: 'rgb(252, 235, 180)', // Version claire du jaune pour les fonds
}

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
      <h2 class="text-2xl font-bold mb-4" :style="{ color: colors.deepRed }">Menu de la semaine</h2>
      
      <!-- Affichage conditionnel selon la présence d'un menu -->
      <div v-if="hasWeeklyMenu">
        <WeeklyMenuSlider />
      </div>
      <div v-else class="p-6 rounded-lg" :style="{ backgroundColor: colors.lightYellow }">
        <h3 class="text-lg font-medium mb-3" :style="{ color: colors.orange }">Vous n'avez pas encore de menu pour cette semaine</h3>
        <div class="flex flex-col sm:flex-row gap-4">
          <button 
            @click="goToMenuCreation" 
            class="px-4 py-2 text-white rounded-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
            :style="{ backgroundColor: colors.green }"
          >
            Préparer votre menu seul
          </button>
          <button 
            @click="goToMenuGenerator" 
            class="px-4 py-2 text-white rounded-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
            :style="{ backgroundColor: colors.brightRed }"
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
      <div class="bento-card p-6 rounded-lg shadow-md" :style="{ border: `1px solid ${colors.yellow}` }">
        <h2 class="text-xl font-semibold mb-4" :style="{ color: colors.deepRed }">Suggestions de desserts</h2>
        <div class="space-y-4">
          <div
            v-for="dessert in dessertSuggestions"
            :key="dessert.id"
            class="flex items-center space-x-4 p-3 rounded-lg transition-all duration-300 hover:shadow-md"
            :style="{ 
              backgroundColor: 'white', 
              border: `1px solid ${colors.lightGreen}`,
              '&:hover': { backgroundColor: colors.lightYellow }
            }"
          >
            <img
              :src="dessert.image"
              :alt="dessert.name"
              class="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <h3 class="font-medium" :style="{ color: colors.orange }">{{ dessert.name }}</h3>
              <div class="flex items-center space-x-2 text-sm" :style="{ color: colors.green }">
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

<style scoped>
/* Styles spécifiques pour améliorer l'interactivité */
button {
  transition: all 0.3s ease;
}

.bento-card {
  transition: all 0.3s ease;
  background-color: white;
}

/* Effet de hover pour les suggestions de desserts */
.bento-card > div > div:hover {
  transform: translateX(5px);
}
</style>