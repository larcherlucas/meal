<script setup lang="ts">
defineProps<{
  popular?: boolean
  animation?: 'fade' | 'slide' | 'scale'
}>()
</script>

<template>
  <div
    class="bento-card relative transform transition-all duration-300 hover:-translate-y-1"
    :class="{
      'ring-2 ring-mocha-500': popular,
      'animate-fade-in': animation === 'fade',
      'animate-slide-up': animation === 'slide',
      'animate-scale-up': animation === 'scale'
    }"
  >
    <div v-if="popular" class="absolute -top-4 right-4">
      <span class="bg-mocha-500 text-white px-3 py-1 rounded-full text-sm">
        Meilleure offre
      </span>
    </div>
    <slot></slot>
  </div>
</template>