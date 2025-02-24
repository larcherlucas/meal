<template>
  <Transition
    enter-active-class="transform transition duration-300 ease-out"
    enter-from-class="translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transform transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-2 opacity-0"
  >
    <div 
      v-if="show" 
      class="fixed bottom-4 right-4 z-50 max-w-md"
      :class="[
        type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' :
        type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
        'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
      ]"
    >
      <div class="rounded-md p-4 shadow-lg border-l-4 backdrop-blur-glass">
        <div class="flex">
          <div class="flex-shrink-0">
            <CheckCircleIcon 
              v-if="type === 'success'" 
              class="h-5 w-5 text-green-400 dark:text-green-300" 
            />
            <ExclamationCircleIcon 
              v-else-if="type === 'error'" 
              class="h-5 w-5 text-red-400 dark:text-red-300" 
            />
            <InformationCircleIcon 
              v-else 
              class="h-5 w-5 text-blue-400 dark:text-blue-300" 
            />
          </div>
          <div class="ml-3">
            <h3 
              class="text-sm font-medium"
              :class="[
                type === 'success' ? 'text-green-800 dark:text-green-200' :
                type === 'error' ? 'text-red-800 dark:text-red-200' :
                'text-blue-800 dark:text-blue-200'
              ]"
            >
              {{ title }}
            </h3>
            <div 
              class="mt-2 text-sm"
              :class="[
                type === 'success' ? 'text-green-700 dark:text-green-300' :
                type === 'error' ? 'text-red-700 dark:text-red-300' :
                'text-blue-700 dark:text-blue-300'
              ]"
            >
              <p>{{ message }}</p>
            </div>
          </div>
          <div class="ml-auto pl-3">
            <div class="-mx-1.5 -my-1.5">
              <button
                @click="$emit('close')"
                class="inline-flex rounded-md p-1.5"
                :class="[
                  type === 'success' ? 'text-green-500 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-800/20' :
                  type === 'error' ? 'text-red-500 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-800/20' :
                  'text-blue-500 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-800/20'
                ]"
              >
                <span class="sr-only">Fermer</span>
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/vue/24/outline'

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info',
    validator: (value: string) => ['success', 'error', 'info'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  }
})

defineEmits(['close'])
</script>