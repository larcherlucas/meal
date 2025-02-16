<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="emit('close')">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-mocha-900/50" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel 
              v-if="recipe" 
              class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-mocha-800 shadow-xl transition-all"
            >
              <!-- Image de couverture -->
              <div class="relative aspect-video">
                <img 
                  :src="recipe.image" 
                  :alt="recipe.title"
                  class="object-cover w-full h-full"
                />
                <button
                  type="button"
                  class="absolute top-4 right-4 rounded-full p-2 bg-mocha-100/90 hover:bg-mocha-200/90 text-mocha-800 transition-colors"
                  @click="emit('close')"
                >
                  <XMarkIcon class="h-6 w-6" />
                </button>
              </div>

              <div class="p-6 space-y-8">
                <!-- En-tête -->
                <div>
                  <h2 class="text-2xl font-bold text-mocha-800 dark:text-mocha-50 mb-4">
                    {{ recipe.title }}
                  </h2>
                  <div class="flex flex-wrap gap-4 text-sm text-mocha-700 dark:text-mocha-300">
                    <div class="flex items-center">
                      <ClockIcon class="h-5 w-5 mr-1" />
                      <span>Préparation : {{ recipe.prepTime }}</span>
                    </div>
                    <div class="flex items-center">
                      <ClockIcon class="h-5 w-5 mr-1" />
                      <span>Total : {{ recipe.totalTime }}</span>
                    </div>
                    <div class="flex items-center">
                      <UserIcon class="h-5 w-5 mr-1" />
                      <select 
                        v-model="servings"
                        class="ml-2 rounded-lg border-mocha-200 dark:border-mocha-600 
                               text-mocha-700 dark:text-mocha-200 bg-white dark:bg-mocha-700 
                               focus:ring-mocha-500 focus:border-mocha-500"
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
                </div>

                <!-- Informations nutritionnelles -->
                <div class="bg-mocha-50 dark:bg-mocha-700/50 rounded-lg p-4">
                  <h3 class="text-lg font-semibold text-mocha-800 dark:text-mocha-50 mb-3 flex items-center">
                    <ChartBarIcon class="h-5 w-5 mr-2" />
                    Informations nutritionnelles
                    <span class="text-sm font-normal ml-2 text-mocha-600 dark:text-mocha-300">(par portion)</span>
                  </h3>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p class="text-sm text-mocha-600 dark:text-mocha-300">Calories</p>
                      <p class="font-medium text-mocha-800 dark:text-mocha-50">{{ recipe.nutritionalInfo.calories }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-mocha-600 dark:text-mocha-300">Protéines</p>
                      <p class="font-medium text-mocha-800 dark:text-mocha-50">{{ recipe.nutritionalInfo.proteins }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-mocha-600 dark:text-mocha-300">Glucides</p>
                      <p class="font-medium text-mocha-800 dark:text-mocha-50">{{ recipe.nutritionalInfo.carbs }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-mocha-600 dark:text-mocha-300">Lipides</p>
                      <p class="font-medium text-mocha-800 dark:text-mocha-50">{{ recipe.nutritionalInfo.fats }}</p>
                    </div>
                  </div>
                </div>

                <!-- Ingrédients -->
                <div>
                  <h3 class="text-xl font-semibold text-mocha-800 dark:text-mocha-50 mb-4">
                    Ingrédients
                  </h3>
                  <div class="grid md:grid-cols-2 gap-6">
                    <div
                      v-for="section in recipe.ingredients"
                      :key="section.category"
                      class="space-y-3"
                    >
                      <h4 class="font-medium text-mocha-700 dark:text-mocha-200">
                        {{ section.category }}
                      </h4>
                      <ul class="space-y-2">
                        <li
                          v-for="ingredient in section.items"
                          :key="ingredient.name"
                          class="flex justify-between text-mocha-600 dark:text-mocha-300"
                        >
                          <span>{{ ingredient.name }}</span>
                          <span>{{ getScaledQuantity(ingredient.quantity) }} {{ ingredient.unit }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <!-- Préparation -->
                <div>
                  <h3 class="text-xl font-semibold text-mocha-800 dark:text-mocha-50 mb-4">
                    Préparation
                  </h3>
                  <div class="space-y-6">
                    <div
                      v-for="(section, index) in recipe.steps"
                      :key="index"
                    >
                      <h4 
                        v-if="section.category"
                        class="font-medium text-mocha-700 dark:text-mocha-200 mb-3"
                      >
                        {{ section.category }}
                      </h4>
                      <ol class="space-y-4">
                        <li
                          v-for="(instruction, idx) in section.instructions"
                          :key="idx"
                          class="flex"
                        >
                          <span class="flex-none w-8 h-8 rounded-full bg-mocha-100 dark:bg-mocha-700 
                                     text-mocha-700 dark:text-mocha-200 flex items-center justify-center 
                                     font-medium mr-4">
                            {{ idx + 1 }}
                          </span>
                          <p class="text-mocha-700 dark:text-mocha-300">{{ instruction }}</p>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { XMarkIcon, ClockIcon, UserIcon, ChartBarIcon } from '@heroicons/vue/24/outline'

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
}

const props = defineProps<{
  isOpen: boolean
  recipe: Recipe | null
}>()

const emit = defineEmits<{
  'close': []
}>()

const servings = ref(4)
const availableServings = [2, 4, 6, 8]

const getScaledQuantity = (quantity: number) => {
  if (!props.recipe) return 0
  const scale = servings.value / props.recipe.servings
  return Math.round((quantity * scale) * 10) / 10
}
</script>