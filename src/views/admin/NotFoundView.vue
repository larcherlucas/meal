<!-- src/views/admin/NotFoundView.vue -->
<template>
    <div class="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center px-4">
      <div class="space-y-6">
        <h1 class="text-6xl font-bold text-mocha-800 dark:text-mocha-100">404</h1>
        
        <h2 class="text-2xl font-semibold text-mocha-700 dark:text-mocha-200">Page non trouvée</h2>
        
        <p class="text-mocha-600 dark:text-mocha-300 max-w-md mx-auto">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div class="flex justify-center space-x-4 pt-4">
          <router-link 
            to="/admin"
            class="px-4 py-2 bg-mocha-600 text-white rounded-md hover:bg-mocha-700 transition"
          >
            Retour au tableau de bord
          </router-link>
          
          <button 
            @click="goBack" 
            class="px-4 py-2 bg-mocha-200 text-mocha-700 rounded-md hover:bg-mocha-300 dark:bg-mocha-700 dark:text-mocha-300 dark:hover:bg-mocha-600 transition"
          >
            Page précédente
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  // Fonction pour revenir à la page précédente
  const goBack = () => {
    router.back()
  }
  </script>