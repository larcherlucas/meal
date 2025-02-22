<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import MochaButton from '@/components/ui/MochaButton.vue'
import { 
  SunIcon, 
  MoonIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const navigateToAuth = (path: 'login' | 'signup') => {
  router.push({ name: path })
}
</script>

<template>
  <nav class="fixed top-0 w-full bg-white/80 dark:bg-mocha-800/80 backdrop-blur-glass border-b border-mocha-200/20 dark:border-mocha-700/20 z-50 py-4 px-6">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <router-link 
        to="/" 
        class="text-xl font-bold text-mocha-700 dark:text-mocha-200 hover:text-mocha-800 dark:hover:text-mocha-100 transition-colors"
      >
        Menu Planner
      </router-link>
      
      <div class="flex items-center space-x-4">
        <!-- Bouton Theme - Toujours visible -->
        <button
          @click="themeStore.toggleTheme"
          class="p-2 rounded-full text-mocha-700 dark:text-mocha-300 
                 hover:bg-mocha-100 dark:hover:bg-mocha-700 
                 transition-all duration-300 hover:scale-110"
        >
          <SunIcon v-if="themeStore.isDark" class="h-5 w-5" />
          <MoonIcon v-else class="h-5 w-5" />
        </button>

        <!-- Boutons Auth -->
        <div v-if="!authStore.isAuthenticated">
          <MochaButton 
            variant="text" 
            @click="navigateToAuth('signup')"
            class="mr-2"
          >
            S'inscrire
          </MochaButton>
          <MochaButton 
            variant="primary" 
            @click="navigateToAuth('login')"
          >
            Connexion
          </MochaButton>
        </div>

        <!-- Bouton Dashboard -->
        <MochaButton 
          v-else 
          variant="primary" 
          @click="router.push('/home')"
        >
          Mon espace
        </MochaButton>
      </div>
    </div>
  </nav>

  <!-- Spacer pour le contenu sous la navbar fixe -->
  <div class="h-16"></div>
</template>