<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import RecipeModal from '@/components/recipe/RecipeModal.vue'
import { HeartIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'

const authStore = useAuthStore()

interface NutritionalInfo {
  calories: string
  proteins: string
  carbs: string
  fats: string
  saturatedFats?: string
  fiber?: string
  sodium?: string
}

interface Recipe {
  id: number
  title: string
  image: string
  category: string
  difficulty: string
  prepTime: string
  totalTime: string
  servings: number
  ingredients: {
    category: string
    items: {
      name: string
      quantity: number
      unit: string
    }[]
  }[]
  nutritionalInfo: NutritionalInfo
  steps: {
    category?: string
    instructions: string[]
  }[]
  premium: boolean
}

const recipes = ref<Recipe[]>([
  {
    id: 1,
    title: 'Cuisses de dinde à la moutarde, riz basmati aux champignons',
    image: '/images/dinde-moutarde.jpg',
    category: 'Plat principal',
    difficulty: 'Facile',
    prepTime: '10 min',
    totalTime: '1h 15 min',
    servings: 4,
    premium: false,
    ingredients: [
      {
        category: 'Cuisses de dinde à la moutarde',
        items: [
          { name: 'Oignon', quantity: 100, unit: 'g' },
          { name: 'Gousse d\'ail', quantity: 1, unit: 'pièce' },
          { name: 'Moutarde à l\'ancienne', quantity: 2, unit: 'c. à soupe' },
          { name: 'Moutarde forte', quantity: 1, unit: 'c. à café' },
          { name: 'Huile d\'olive', quantity: 60, unit: 'g' },
          { name: 'Sauce de soja', quantity: 3, unit: 'c. à soupe' },
          { name: 'Cuisses de dinde', quantity: 2, unit: 'pièces' }
        ]
      },
      {
        category: 'Riz aux champignons',
        items: [
          { name: 'Gousse d\'ail', quantity: 1, unit: 'pièce' },
          { name: 'Riz basmati', quantity: 200, unit: 'g' },
          { name: 'Eau', quantity: 1000, unit: 'g' },
          { name: 'Gros sel', quantity: 1, unit: 'c. à café' },
          { name: 'Champignons de Paris frais', quantity: 600, unit: 'g' },
          { name: 'Crème fraîche', quantity: 1, unit: 'c. à soupe' }
        ]
      }
    ],
    nutritionalInfo: {
      calories: '749 kcal',
      proteins: '30.8 g',
      carbs: '96.8 g',
      fats: '25.8 g',
      saturatedFats: '4.5 g',
      fiber: '6.3 g',
      sodium: '1940.8 mg'
    },
    steps: [
      {
        category: 'Cuisses de dinde à la moutarde',
        instructions: [
          'Préchauffer le four à 180 °C (Th. 6).',
          'Mettre l\'oignon et l\'ail dans le bol, hacher 5 sec/vitesse 5 et racler les parois.',
          'Ajouter la moutarde à l\'ancienne, la moutarde forte, l\'huile d\'olive et la sauce de soja, mélanger 10 sec/vitesse 2.',
          'Badigeonner les cuisses de dinde avec cette préparation, les disposer dans un plat et cuire 28 min à 180 °C.'
        ]
      },
      {
        category: 'Riz aux champignons',
        instructions: [
          'Hacher l\'ail 3 sec/vitesse 5, réserver.',
          'Mettre le riz dans le panier cuisson, le rincer sous un filet d\'eau froide.',
          'Dans le bol, ajouter l\'eau et le sel, réinsérer le panier et cuire avec le Varoma contenant les champignons et l\'ail pendant 20 min (Varoma/vitesse 1).',
          'Égoutter le riz et mélanger les champignons avec la crème fraîche. Servir les cuisses accompagnées du riz et des champignons.'
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Risotto aux épinards et crème au safran',
    image: '/images/risotto-epinards.jpg',
    category: 'Plat principal',
    difficulty: 'Facile',
    prepTime: '10 min',
    totalTime: '40 min',
    servings: 8,
    premium: true,
    ingredients: [
      {
        category: 'Crème au safran',
        items: [
          { name: 'Crème fraîche épaisse', quantity: 200, unit: 'g' },
          { name: 'Safran', quantity: 2, unit: 'doses' },
          { name: 'Sel', quantity: 2, unit: 'pincées' }
        ]
      },
      {
        category: 'Risotto aux épinards',
        items: [
          { name: 'Oignon', quantity: 90, unit: 'g' },
          { name: 'Huile d\'olive', quantity: 20, unit: 'g' },
          { name: 'Riz spécial risotto', quantity: 400, unit: 'g' },
          { name: 'Épinards frais', quantity: 200, unit: 'g' },
          { name: 'Eau', quantity: 850, unit: 'g' },
          { name: 'Sel', quantity: 2, unit: 'pincées' }
        ]
      }
    ],
    nutritionalInfo: {
      calories: '515 kcal',
      proteins: '18 g',
      carbs: '29 g',
      fats: '36 g'
    },
    steps: [
      {
        category: 'Crème au safran',
        instructions: [
          'Mettre la crème, le safran et le sel dans le bol, chauffer 5 min/Varoma/vitesse 1, puis réserver dans une saucière.'
        ]
      },
      {
        category: 'Risotto aux épinards',
        instructions: [
          'Hacher l\'oignon 6 sec/vitesse 5 et racler les parois.',
          'Ajouter l\'huile d\'olive et rissoler 5 min/Varoma/vitesse sans le gobelet doseur.',
          'Ajouter le riz et les épinards, cuire 3 min à 100°C/vitesse 1.',
          'Ajouter l\'eau et le sel, mettre le Varoma et cuire 22 min à 100°C/vitesse adaptée.',
          'Mouler le risotto en portions (exemple : emporte-pièce de 10 cm), napper de crème au safran et servir chaud.'
        ]
      }
    ]
  },
  {
    id: 3,
    title: 'Pâte à pancakes',
    image: '/images/pancakes.jpg',
    category: 'Dessert',
    difficulty: 'Facile',
    prepTime: '20 min',
    totalTime: '30 min',
    servings: 12,
    premium: false,
    ingredients: [
      {
        category: 'Ingrédients',
        items: [
          { name: 'Beurre doux', quantity: 50, unit: 'g' },
          { name: 'Lait', quantity: 300, unit: 'g' },
          { name: 'Œufs', quantity: 2, unit: 'pièces' },
          { name: 'Sucre en poudre', quantity: 30, unit: 'g' },
          { name: 'Farine de blé', quantity: 200, unit: 'g' },
          { name: 'Levure chimique', quantity: 10, unit: 'g' },
          { name: 'Sel', quantity: 0.5, unit: 'c. à café' }
        ]
      }
    ],
    nutritionalInfo: {
      calories: '131 kcal',
      proteins: '4 g',
      carbs: '16 g',
      fats: '6 g',
      fiber: '0.5 g'
    },
    steps: [
      {
        instructions: [
          'Faire fondre le beurre dans le bol 2 min à 70°C/vitesse 1.',
          'Ajouter le lait, les œufs, le sucre, la farine, la levure et le sel, mixer 10 sec/vitesse 5.',
          'Pour chaque pancake, verser une louche de pâte dans une poêle préalablement graissée, cuire 1-2 min jusqu\'à formation de bulles, retourner et cuire 1 min de plus. Répéter et servir chaud.'
        ]
      }
    ]
  }
])

const categories = ['Toutes', 'Entrée', 'Plat principal', 'Dessert']
const selectedCategory = ref('Toutes')
const selectedRecipe = ref<Recipe | null>(null)
const isModalOpen = ref(false)
const favorites = ref<Set<number>>(new Set())

const filteredRecipes = computed(() => {
  let filtered = recipes.value
  if (selectedCategory.value !== 'Toutes') {
    filtered = filtered.filter(recipe => recipe.category === selectedCategory.value)
  }
  if (!authStore.hasActiveSubscription) {
    filtered = filtered.filter(recipe => !recipe.premium)
  }
  return filtered
})

const toggleFavorite = (recipeId: number, event: Event) => {
  event.stopPropagation()
  if (favorites.value.has(recipeId)) {
    favorites.value.delete(recipeId)
  } else {
    favorites.value.add(recipeId)
  }
}

const openRecipeModal = (recipe: Recipe) => {
  selectedRecipe.value = recipe
  isModalOpen.value = true
}
</script>

<template>
  <div class="space-y-6">
    <!-- Filtres -->
    <div class="bento-card">
      <div class="flex space-x-4">
        <button
          v-for="category in categories"
          :key="category"
          @click="selectedCategory = category"
          class="px-4 py-2 rounded-lg transition-colors"
          :class="selectedCategory === category ? 
            'bg-mocha-100 text-mocha-700 dark:bg-mocha-900 dark:text-mocha-100' : 
            'hover:bg-gray-100 dark:hover:bg-gray-700'"
        >
          {{ category }}
        </button>
      </div>
    </div>

    <!-- Liste des recettes -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        class="bento-card group hover:shadow-xl transition-shadow cursor-pointer relative"
        @click="openRecipeModal(recipe)"
      >
        <div class="relative aspect-video rounded-lg overflow-hidden mb-4">
          <img
            :src="recipe.image"
            :alt="recipe.title"
            class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          <div
            v-if="recipe.premium && !authStore.hasActiveSubscription"
            class="absolute inset-0 bg-black/50 flex items-center justify-center"
          >
            <router-link
              to="/subscription"
              class="px-4 py-2 bg-mocha-600 text-white rounded-lg hover:bg-mocha-700 transition-colors"
              @click.stop
            >
              Débloquer
            </router-link>
          </div>
          <!-- Bouton favori -->
          <button
            @click="toggleFavorite(recipe.id, $event)"
            class="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
          >
            <HeartSolidIcon
              v-if="favorites.has(recipe.id)"
              class="h-6 w-6 text-red-500"
            />
            <HeartIcon
              v-else
              class="h-6 w-6 text-gray-500"
            />
          </button>
        </div>

        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2 line-clamp-2">{{ recipe.title }}</h3>
          
          <div class="flex items-center text-sm font-semibold space-x-4" style="color: rgba(217, 121, 4, 1);">
            <span>{{ recipe.difficulty }}</span>
            <span>{{ recipe.totalTime }}</span>
            <span>{{ recipe.category }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de recette -->
    <RecipeModal
      :is-open="isModalOpen"
      :recipe="selectedRecipe"
      @close="isModalOpen = false"
    />

    <!-- CTA Abonnement -->
    <div
      v-if="!authStore.hasActiveSubscription"
      class="bento-card bg-gradient-to-r text-white text-center"
      style="background-color: rgba(86, 122, 94, 1);"
    >
      <h2 class="text-2xl font-bold mb-4"
      style="color: #fff;">Débloquez toutes les recettes !</h2>
      <p class="mb-6"
      style="color: #fff;"
      >Accédez à notre collection complète de recettes et au générateur de menus.</p>
      <router-link
        to="/subscription"
        class="inline-block px-6 py-3 bg-white text-mocha-700 rounded-lg hover:bg-mocha-50 transition-colors"
      >
        Voir les abonnements
      </router-link>
    </div>

  </div>
</template>