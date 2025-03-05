<template>
  <div class="max-w-4xl mx-auto">
    <div class="bento-card space-y-8">
      <!-- Image -->
      <div class="relative aspect-video rounded-lg overflow-hidden">
        <img 
          :src="recipe.image_url || recipe.image || '/images/default-recipe.jpg'" 
          :alt="recipe.title"
          class="object-cover w-full h-full transform hover:scale-105 transition-transform duration-300"
        />
      </div>

      <!-- Titre et portions -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-mocha-800 dark:text-mocha-50">{{ recipe.title }}</h1>
        <div class="flex items-center space-x-4">
          <label class="text-sm text-mocha-700 dark:text-mocha-300">Portions :</label>
          <select 
            v-model="servings"
            class="rounded-lg border-mocha-200 dark:border-mocha-600 text-mocha-700 dark:text-mocha-200 
                   bg-white dark:bg-mocha-700 focus:ring-mocha-500 focus:border-mocha-500"
          >
            <option 
              v-for="count in availableServings"
              :key="count"
              :value="count"
            >
              {{ count }} personnes
            </option>
          </select>
        </div>
      </div>

      <!-- Ingrédients -->
      <div>
        <h2 class="text-xl font-semibold text-mocha-800 dark:text-mocha-50 mb-4">Ingrédients</h2>
        <div class="grid grid-cols-2 gap-8">
          <div 
            v-for="(ingredients, category) in ingredientsByCategory"
            :key="category"
            class="space-y-2"
          >
            <h3 class="text-lg font-medium text-mocha-700 dark:text-mocha-200">{{ category }}</h3>
            <ul class="space-y-2">
              <li 
                v-for="ing in ingredients"
                :key="ing.name"
                class="flex justify-between text-mocha-700 dark:text-mocha-300"
              >
                <span>{{ ing.name }}</span>
                <span>{{ getScaledQuantity(ing.quantity) }} {{ ing.unit }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Étapes -->
      <div>
        <h2 class="text-xl font-semibold text-mocha-800 dark:text-mocha-50 mb-4">Préparation</h2>
        <ol class="space-y-4">
          <li 
            v-for="(step, index) in formattedSteps"
            :key="index"
            class="flex"
          >
            <span class="flex-none w-8 h-8 rounded-full bg-mocha-100 dark:bg-mocha-700 
                        text-mocha-700 dark:text-mocha-200 flex items-center justify-center 
                        font-medium mr-4">
              {{ index + 1 }}
            </span>
            <p class="text-mocha-700 dark:text-mocha-300">{{ step }}</p>
          </li>
        </ol>
      </div>

      <!-- Vidéo (si disponible) -->
      <div v-if="recipe.video" class="aspect-video rounded-lg overflow-hidden">
        <iframe
          :src="recipe.video"
          class="w-full h-full"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Ingredient {
  name: string
  quantity: number
  unit: string
  category?: string
}

interface Recipe {
  id: number
  title: string
  image?: string
  image_url?: string
  servings?: number
  ingredients?: Ingredient[] | any
  steps?: string[] | any
  instructions?: any[]
  video?: string
}

const props = defineProps<{
  recipe: Recipe
}>()

const servings = ref(4)
const availableServings = [2, 4, 6, 8]

// Adapter les ingrédients au format attendu
const normalizedIngredients = computed(() => {
  if (!props.recipe.ingredients) return [];
  
  // Si la structure est déjà celle attendue
  if (Array.isArray(props.recipe.ingredients) && props.recipe.ingredients[0]?.category) {
    return props.recipe.ingredients;
  }
  
  // Si c'est un tableau d'objets sans catégorie
  if (Array.isArray(props.recipe.ingredients) && props.recipe.ingredients[0]?.name) {
    return props.recipe.ingredients.map(ing => ({
      ...ing,
      category: 'Ingrédients'
    }));
  }
  
  // Si c'est un format spécifique (par exemple du backend)
  if (typeof props.recipe.ingredients === 'object' && !Array.isArray(props.recipe.ingredients)) {
    // Essayer d'extraire des structures connues
    if (props.recipe.ingredients.ingredients && Array.isArray(props.recipe.ingredients.ingredients)) {
      return props.recipe.ingredients.ingredients.map(ing => ({
        ...ing,
        category: 'Ingrédients'
      }));
    }
  }
  
  // Format fallback
  return [];
});

const scaledIngredients = computed(() => {
  const recipeServings = props.recipe.servings || 4;
  const scale = servings.value / recipeServings;
  
  return normalizedIngredients.value.map(ing => ({
    ...ing,
    quantity: Math.round((ing.quantity * scale) * 10) / 10
  }));
});

const ingredientsByCategory = computed(() => {
  const categories: Record<string, Ingredient[]> = {};
  
  scaledIngredients.value.forEach(ing => {
    const category = ing.category || 'Ingrédients';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(ing);
  });
  
  return categories;
});

// Formater les étapes
const formattedSteps = computed(() => {
  if (!props.recipe.steps) return [];
  
  // Si c'est un tableau simple de strings
  if (Array.isArray(props.recipe.steps) && typeof props.recipe.steps[0] === 'string') {
    return props.recipe.steps;
  }
  
  // Si c'est un objet avec instructions
  if (props.recipe.steps && Array.isArray(props.recipe.steps) && props.recipe.steps[0]?.instructions) {
    // Concaténer toutes les instructions de toutes les sections
    return props.recipe.steps.flatMap(section => section.instructions);
  }
  
  // Si les instructions sont dans une autre propriété
  if (props.recipe.instructions) {
    if (Array.isArray(props.recipe.instructions)) {
      if (typeof props.recipe.instructions[0] === 'string') {
        return props.recipe.instructions;
      }
      if (props.recipe.instructions[0]?.instructions) {
        return props.recipe.instructions.flatMap(section => section.instructions);
      }
    }
  }
  
  // Format fallback
  return [];
});

// Mise à l'échelle des quantités
const getScaledQuantity = (quantity: number) => {
  const recipeServings = props.recipe.servings || 4;
  const scale = servings.value / recipeServings;
  return Math.round((quantity * scale) * 10) / 10;
};
</script>