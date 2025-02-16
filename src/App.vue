<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import Navigation from './components/Navigation.vue'
import AuthNotification from './components/auth/AuthNotification.vue'

const authStore = useAuthStore()
const themeStore = useThemeStore()

// États pour la notification
const showNotification = ref(false)
const notificationType = ref<'success' | 'error'>('success')
const notificationTitle = ref('')
const notificationMessage = ref('')

// Fonction pour fermer la notification
const closeNotification = () => {
  showNotification.value = false
}

// Surveiller les changements d'état d'authentification
watch(() => authStore.isAuthenticated, (newValue, oldValue) => {
  if (!newValue && oldValue) { // Si l'utilisateur vient de se déconnecter
    showNotification.value = true
    notificationType.value = 'error' // Changé de 'success' à 'error'
    notificationTitle.value = 'Déconnexion réussie'
    notificationMessage.value = 'Vous avez été déconnecté avec succès'
    
    // Fermer la notification après 3 secondes
    setTimeout(() => {
      showNotification.value = false
    }, 3000)
  }
})

onMounted(() => {
  if (authStore.token) {
    authStore.fetchUser()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <Navigation />
    <AuthNotification
      :show="showNotification"
      :type="notificationType"
      :title="notificationTitle"
      :message="notificationMessage"
      @close="closeNotification"
    />
    <main class="container mx-auto px-4 py-8">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>