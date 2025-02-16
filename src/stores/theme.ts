import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('theme') === 'dark')
  
  watch(isDark, (val) => {
    localStorage.setItem('theme', val ? 'dark' : 'light')
    updateTheme()
  })
  
  function updateTheme() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  
  function toggleTheme() {
    isDark.value = !isDark.value
  }
  
  // Initialize theme
  updateTheme()
  
  return {
    isDark,
    toggleTheme
  }
})