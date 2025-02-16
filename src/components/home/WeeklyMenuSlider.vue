<template>
  <div class="relative">
    <button 
      @click="scroll('left')"
      class="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full 
             bg-mocha-100 hover:bg-mocha-200 dark:bg-mocha-700 dark:hover:bg-mocha-600 
             transition-colors"
    >
      <ChevronLeftIcon class="h-6 w-6 text-mocha-700 dark:text-mocha-200" />
    </button>

    <div 
      ref="sliderRef"
      class="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 py-4 px-12"
    >
      <div 
        v-for="item in weeklyMenu" 
        :key="item.day"
        class="flex-none w-80 snap-center"
      >
        <div class="bento-card h-full">
          <div class="text-center mb-4">
            <h3 class="text-lg font-semibold text-mocha-800 dark:text-mocha-50">{{ item.day }}</h3>
            <p class="text-sm text-mocha-600 dark:text-mocha-300">{{ item.date }}</p>
          </div>
          <div class="space-y-4">
            <div>
              <h4 class="text-sm font-medium text-mocha-600 dark:text-mocha-300">Déjeuner</h4>
              <p class="text-mocha-700 dark:text-mocha-200">{{ item.meals.lunch }}</p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-mocha-600 dark:text-mocha-300">Dîner</h4>
              <p class="text-mocha-700 dark:text-mocha-200">{{ item.meals.dinner }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button 
      @click="scroll('right')"
      class="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full 
             bg-mocha-100 hover:bg-mocha-200 dark:bg-mocha-700 dark:hover:bg-mocha-600 
             transition-colors"
    >
      <ChevronRightIcon class="h-6 w-6 text-mocha-700 dark:text-mocha-200" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

interface MenuItem {
  day: string
  date: string
  meals: {
    lunch: string
    dinner: string
  }
}

const weeklyMenu = ref<MenuItem[]>([
  {
    day: 'Lundi',
    date: '12 Mars',
    meals: {
      lunch: 'Salade César aux crevettes',
      dinner: 'Risotto aux champignons'
    }
  },
  {
    day: 'Mardi',
    date: '13 Mars',
    meals: {
      lunch: 'Buddha bowl quinoa',
      dinner: 'Poulet rôti aux herbes'
    }
  }
])

const sliderRef = ref<HTMLElement | null>(null)

const scroll = (direction: 'left' | 'right') => {
  if (!sliderRef.value) return
  const scrollAmount = sliderRef.value.clientWidth
  sliderRef.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  })
}
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>