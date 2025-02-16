<script setup lang="ts">
import { type Testimonial } from '@/types'
import CardWrapper from './CardWrapper.vue'

defineProps<{
  testimonial: Testimonial
}>()
</script>

<template>
  <CardWrapper hover>
    <div class="flex items-center mb-4">
      <img
        :src="testimonial.image"
        :alt="testimonial.name"
        class="w-12 h-12 rounded-full object-cover"
      />
      <div class="ml-4">
        <h4 class="font-semibold text-gray-900">{{ testimonial.name }}</h4>
        <p class="text-sm text-gray-600">{{ testimonial.role }}</p>
      </div>
    </div>
    <p class="text-gray-700">{{ testimonial.text }}</p>
  </CardWrapper>
</template>