<template>
    <div class="quick-menu-creation p-6 rounded-lg" style="background-color: rgba(242, 182, 4, 0.2)">
      <h3 class="text-lg font-medium mb-3" style="color: rgba(216, 121, 4, 1)">
        Vous n'avez pas encore de menu pour cette semaine
      </h3>
      
      <div class="flex flex-col sm:flex-row gap-4">
        <button 
          @click="goToMenuCreation" 
          class="px-4 py-2 text-white rounded-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
          style="background-color: rgba(144, 165, 69, 1)"
        >
          Préparer votre menu seul
        </button>
        
        <button 
          @click="goToMenuGenerator" 
          class="px-4 py-2 text-white rounded-lg transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
          style="background-color: rgba(216, 23, 23, 1)"
        >
          Générer un menu en fonction de vous
        </button>
      </div>
      
      <div v-if="!hasPreferences" class="mt-4 text-amber-600 text-sm">
        <p>
          ℹ️ Pour une génération plus personnalisée, 
          <router-link to="/profile" class="text-amber-700 underline font-medium">
            complétez votre profil
          </router-link>
          avec vos préférences alimentaires et la composition de votre foyer.
        </p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useUserPreferencesStore } from '@/stores/userPreferences'
  
  const router = useRouter()
  const userPreferencesStore = useUserPreferencesStore()
  
  // Vérifier si l'utilisateur a des préférences définies
  const hasPreferences = computed(() => {
    return userPreferencesStore.hasCompletedProfile || 
           (userPreferencesStore.dietaryRestrictions && 
            userPreferencesStore.dietaryRestrictions.length > 0)
  })
  
  const goToMenuCreation = () => {
    router.push('/menu')
  }
  
  const goToMenuGenerator = () => {
    router.push('/menu/generator')
  }
  </script>