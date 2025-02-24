<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useAuthStore } from './stores/auth'
import { useThemeStore } from './stores/theme'
import Navigation from './components/Navigation.vue'
import AuthNotification from './components/auth/AuthNotification.vue'

const authStore = useAuthStore()
const themeStore = useThemeStore()

// États pour la notification et le chargement
const showNotification = ref(false)
const notificationType = ref<'success' | 'error'>('success')
const notificationTitle = ref('')
const notificationMessage = ref('')
const isInitializing = ref(true)

// Fonction pour afficher une notification
const showNotificationMessage = (type: 'success' | 'error', title: string, message: string, duration = 3000) => {
  notificationType.value = type
  notificationTitle.value = title
  notificationMessage.value = message
  showNotification.value = true
  
  if (duration > 0) {
    setTimeout(() => {
      showNotification.value = false
    }, duration)
  }
}

// Fonction pour fermer la notification
const closeNotification = () => {
  showNotification.value = false
}

// Surveiller les changements d'état d'authentification
watch(() => authStore.isAuthenticated, (newValue, oldValue) => {
  if (!newValue && oldValue) {
    showNotificationMessage('error', 'Déconnexion réussie', 'Vous avez été déconnecté avec succès')
  }
})

// Initialisation de l'application
onMounted(async () => {
  try {
    // Utiliser la fonction initialize mise à jour dans votre store
    await authStore.initialize()
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error)
    showNotificationMessage('error', 'Erreur', 'Un problème est survenu lors du chargement de l\'application')
  } finally {
    isInitializing.value = false
  }
})
</script>

<template>
  <div v-if="isInitializing" class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="text-center">
      <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-300">Chargement de l'application...</p>
    </div>
  </div>
  
  <div v-else class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>