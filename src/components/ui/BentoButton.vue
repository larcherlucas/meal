<template>
  <button
    :class="[
      'group transition-all duration-300 rounded-lg font-medium',
      variant === 'primary' ? 'btn-primary' : 'btn-secondary',
      size === 'lg' ? 'px-8 py-4 text-lg' : 'px-6 py-3',
      rounded ? 'rounded-full' : 'rounded-lg'
    ]"
    v-bind="$attrs"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary'
  size?: 'default' | 'lg'
  rounded?: boolean
}>()
</script>