<template>
  <section :class="[
    'py-20',
    variant === 'primary' ? 'bg-gradient-to-br from-mocha-800 to-mocha-600 text-mocha-50' :
    variant === 'secondary' ? 'bg-mocha-50 dark:bg-mocha-900' :
    'bg-white dark:bg-mocha-800'
  ]">
    <div class="max-w-7xl mx-auto px-4">
      <slot></slot>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'default'
}>()
</script>