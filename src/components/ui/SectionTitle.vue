<script setup lang="ts">
defineProps<{
  title: string
  className?: string
}>()
</script>

<template>
  <h2 
    class="text-3xl md:text-4xl font-bold text-center mb-16 animate-fade-in"
    :class="className || 'text-gray-900'"
  >
    {{ title }}
  </h2>
</template>