<script setup lang="ts">
import BentoCard from '@/components/ui/BentoCard.vue'

defineProps<{
  animation?: 'slide' | 'fade'
  hover?: boolean
}>()
</script>

<template>
  <BentoCard :animation="animation" :hover="hover" class="p-6">
    <slot />
  </BentoCard>
</template>
