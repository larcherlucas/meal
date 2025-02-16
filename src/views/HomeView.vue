<script setup lang="ts">
import { ref } from 'vue'
import WeeklyMenuSlider from '@/components/home/WeeklyMenuSlider.vue'
import SeasonalProducts from '@/components/home/SeasonalProducts.vue'

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
      <WeeklyMenuSlider />
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