<template>
  <TransitionRoot appear :show="show" as="template">
    <div class="fixed top-4 right-4 z-50 flex items-center justify-center min-w-full p-4 sm:p-6">
      <TransitionChild
        as="template"
        enter="transform ease-out duration-300 transition"
        enter-from="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-300"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="bento-card p-4 w-full max-w-sm sm:max-w-md shadow-lg rounded-lg border-l-4 flex items-center"
          :class="type === 'success' ? 'bg-emerald-100 border-emerald-500 text-emerald-900 dark:bg-emerald-900/70 dark:text-emerald-100 dark:border-emerald-400' : 'bg-red-100 border-red-500 text-red-900 dark:bg-red-900/70 dark:text-red-100 dark:border-red-400'"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <CheckCircleIcon
                v-if="type === 'success'"
                class="h-6 w-6 text-emerald-400"
                aria-hidden="true"
              />
              <XCircleIcon
                v-else
                class="h-6 w-6 text-red-400"
                aria-hidden="true"
              />
            </div>
            <div class="ml-3 flex-1 pt-0.5">
              <p
                class="text-sm font-medium"
                :class="type === 'success' ? 'text-emerald-800 dark:text-emerald-100' : 'text-red-800 dark:text-red-100'"
              >
                {{ title }}
              </p>
              <p
                class="mt-1 text-sm"
                :class="type === 'success' ? 'text-emerald-700 dark:text-emerald-200' : 'text-red-700 dark:text-red-200'"
              >
                {{ message }}
              </p>
            </div>
            <div class="ml-4 flex flex-shrink-0">
              <button
                type="button"
                class="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                :class="type === 'success' ? 'text-emerald-400 hover:text-emerald-500 focus:ring-emerald-500' : 'text-red-400 hover:text-red-500 focus:ring-red-500'"
                @click="$emit('close')"
              >
                <span class="sr-only">Fermer</span>
                <XMarkIcon class="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </TransitionChild>
    </div>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { TransitionRoot, TransitionChild } from '@headlessui/vue'
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/vue/24/outline'

defineProps<{
  show: boolean
  type: 'success' | 'error'
  title: string
  message: string
}>()

defineEmits<{
  close: []
}>()
</script>
