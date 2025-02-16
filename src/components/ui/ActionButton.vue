<script setup lang="ts">
import { ArrowRightIcon } from '@heroicons/vue/24/outline'
import MochaButton from './MochaButton.vue'

defineProps<{
  text: string
  variant?: 'primary' | 'secondary'
}>()

defineEmits<{
  (e: 'action'): void
}>()
</script>

<template>
  <MochaButton :variant="variant || 'primary'" @click="$emit('action')" class="inline-flex">
    {{ text }}
    <ArrowRightIcon class="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
  </MochaButton>
</template>