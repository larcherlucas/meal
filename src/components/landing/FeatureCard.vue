<script setup lang="ts">
import { type Feature } from '@/types'
import CardWrapper from './CardWrapper.vue'

defineProps<{
  feature: Feature
}>()
</script>

<template>
  <CardWrapper hover>
    <component
      :is="feature.icon"
      class="w-12 h-12 text-mocha-600 dark:text-mocha-300 mb-4"
    />
    <h3 class="text-xl font-semibold mb-2 text-gray-900">
      {{ feature.title }}
    </h3>
    <p class="text-gray-600">
      {{ feature.description }}
    </p>
  </CardWrapper>
</template>