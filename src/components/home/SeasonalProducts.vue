<template>
  <div class="bento-card">
    <h2 class="text-xl font-semibold text-mocha-800 dark:text-mocha-50 mb-4">Produits de saison</h2>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <h3 class="text-lg font-medium text-mocha-700 dark:text-mocha-200 mb-2">Fruits</h3>
        <ul class="space-y-2">
          <li 
            v-for="product in products.filter(p => p.type === 'fruit')"
            :key="product.name"
            class="flex items-center text-mocha-700 dark:text-mocha-300"
          >
            <span class="w-2 h-2 rounded-full bg-mocha-400 dark:bg-mocha-500 mr-2"></span>
            {{ product.name }}
          </li>
        </ul>
      </div>
      <div>
        <h3 class="text-lg font-medium text-mocha-700 dark:text-mocha-200 mb-2">Légumes</h3>
        <ul class="space-y-2">
          <li 
            v-for="product in products.filter(p => p.type === 'légume')"
            :key="product.name"
            class="flex items-center text-mocha-700 dark:text-mocha-300"
          >
            <span class="w-2 h-2 rounded-full bg-mocha-400 dark:bg-mocha-500 mr-2"></span>
            {{ product.name }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Product {
  name: string
  type: 'fruit' | 'légume'
  season: string
}

const products = ref<Product[]>([
  { name: 'Potimarron', type: 'légume', season: 'Hiver' },
  { name: 'Clémentine', type: 'fruit', season: 'Hiver' },
  { name: 'Poireau', type: 'légume', season: 'Hiver' },
  { name: 'Kiwi', type: 'fruit', season: 'Hiver' }
])
</script>