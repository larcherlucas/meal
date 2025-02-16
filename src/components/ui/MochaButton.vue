<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary'
  fullWidth?: boolean
  loading?: boolean
  disabled?: boolean
}>()
</script>

<template>
  <button
    :class="[
      'transition-all duration-300 rounded-lg font-medium',
      'transform hover:scale-105 active:scale-95',
      'focus:outline-none focus:ring-2 focus:ring-mocha-500 focus:ring-opacity-50',
      fullWidth ? 'w-full' : '',
      variant === 'secondary' 
        ? 'bg-mocha-100 text-mocha-800 hover:bg-mocha-200' 
        : 'bg-mocha-600 text-white hover:bg-mocha-700',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
      loading ? 'relative !text-transparent' : ''
    ]"
    :disabled="disabled || loading"
  >
    <div class="px-4 py-2">
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
        <div class="loader"></div>
      </div>
      <slot></slot>
    </div>
  </button>
</template>