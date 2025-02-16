<script setup lang="ts">
import { CheckIcon } from '@heroicons/vue/24/outline'

defineProps<{
  features: string[]
}>()
</script>

<template>
  <ul class="space-y-4">
    <li v-for="feature in features" :key="feature" class="flex items-start">
      <CheckIcon class="h-5 w-5 text-mocha-500 mr-2 flex-shrink-0" />
      <span class="text-mocha-700">{{ feature }}</span>
    </li>
  </ul>
</template>