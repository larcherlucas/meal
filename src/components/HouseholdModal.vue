<script setup lang="ts">
import { ref } from 'vue';

interface HouseholdComposition {
  adults: number;
  children_over_3: number;
  children_under_3: number;
  babies: number;
}

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', household: HouseholdComposition): void;
}>();

const household = ref<HouseholdComposition>({
  adults: 1,
  children_over_3: 0,
  children_under_3: 0,
  babies: 0
});

const handleSubmit = () => {
  emit('submit', {
    ...household.value,
    preferences: {
      language: 'fr',
      theme: 'dark'
    }
  });
};
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black/50" @click="emit('close')" />
      <div class="relative bg-white dark:bg-mocha-800 rounded-bento-lg p-8 max-w-md w-full mx-4">
        <h2 class="text-2xl font-bold text-mocha-800 dark:text-mocha-100 mb-6">
          Composition du foyer
        </h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="space-y-4">
            <div class="space-y-2">
              <label for="adults" class="block text-sm font-medium text-mocha-700 dark:text-mocha-200">
                Adultes
              </label>
              <input
                id="adults"
                v-model="household.adults"
                type="number"
                min="0"
                class="input-mocha"
              />
            </div>
            
            <div class="space-y-2">
              <label for="children_over_3" class="block text-sm font-medium text-mocha-700 dark:text-mocha-200">
                Enfants (plus de 3 ans)
              </label>
              <input
                id="children_over_3"
                v-model="household.children_over_3"
                type="number"
                min="0"
                class="input-mocha"
              />
            </div>

            <div class="space-y-2">
              <label for="children_under_3" class="block text-sm font-medium text-mocha-700 dark:text-mocha-200">
                Enfants (moins de 3 ans)
              </label>
              <input
                id="children_under_3"
                v-model="household.children_under_3"
                type="number"
                min="0"
                class="input-mocha"
              />
            </div>

            <div class="space-y-2">
              <label for="babies" class="block text-sm font-medium text-mocha-700 dark:text-mocha-200">
                Bébés
              </label>
              <input
                id="babies"
                v-model="household.babies"
                type="number"
                min="0"
                class="input-mocha"
              />
            </div>
          </div>

          <div class="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2 text-mocha-600 hover:text-mocha-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="px-6 py-2 bg-gradient-mocha-accent text-white rounded-bento
                     hover:-translate-y-1 transition-all duration-200"
            >
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>