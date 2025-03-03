<template>
  <nav class="fixed top-0 left-0 right-0 z-50" style="background-color: #F5E8DD;">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo et Navigation principale -->
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="text-xl font-bold" style="color: rgba(86, 122, 94, 1); transition: color 0.2s;">
              Menu Planner
            </router-link>
          </div>
          
          <!-- Navigation Desktop -->
          <div class="hidden sm:ml-6 sm:flex sm:space-x-4">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="nav-link group flex items-center transition-colors"
              :style="[
                $route.path === item.href 
                  ? { backgroundColor: 'rgba(253, 230, 138, 1)', color: 'rgba(86, 122, 94, 1)' }
                  : { color: 'rgba(86, 122, 94, 1)' }
              ]"
            >
              <component 
                :is="item.icon" 
                class="h-5 w-5 mr-2 transition-transform group-hover:scale-110" 
                style="color: rgba(86, 122, 94, 1);"
              />
              {{ item.name }}
            </router-link>
          </div>
        </div>

        <!-- Actions à droite -->
        <div class="flex items-center space-x-4">
          <!-- Bouton Theme -->
          <button
            @click="themeStore.toggleTheme"
            class="p-2 rounded-full transition-all duration-300 hover:scale-110"
            style="color: rgba(89, 2, 2, 1);"
            :style="{ 'hover:background-color': 'rgba(252, 211, 77, 1)' }"
          >
            <SunIcon v-if="themeStore.isDark" class="h-5 w-5" />
            <MoonIcon v-else class="h-5 w-5" />
          </button>

          <!-- Menu Profil -->
          <div v-if="authStore.isAuthenticated" class="relative">
            <button
              @click="toggleProfileMenu"
              class="flex items-center space-x-2 p-2 rounded-full transition-all duration-300"
              style="color: rgba(89, 2, 2, 1);"
              :style="{ 'hover:background-color': 'rgba(252, 211, 77, 1)' }"
            >
              <div class="h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transform hover:scale-110 transition-transform" 
                   style="background: linear-gradient(to bottom right, rgba(89, 2, 2, 0.8), rgba(89, 2, 2, 1)); color: rgba(254, 243, 199, 1);">
                {{ userInitials }}
              </div>
              <ChevronDownIcon 
                class="h-4 w-4 transition-transform"
                style="color: rgba(89, 2, 2, 1);"
                :class="{ 'rotate-180': isProfileMenuOpen }"
              />
            </button>

            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <div
                v-if="isProfileMenuOpen"
                class="absolute right-0 mt-2 w-48 py-1 rounded-bento shadow-bento"
                style="background-color: rgba(255, 251, 235, 1); border: 1px solid rgba(253, 230, 138, 1);"
              >
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-sm transition-colors"
                  style="color: rgba(86, 122, 94, 1);"
                  @click="isProfileMenuOpen = false"
                  :style="{ 'hover:background-color': 'rgba(254, 243, 199, 1)', 'hover:color': 'rgba(66, 94, 72, 1)' }"
                >
                  Mon Profil
                </router-link>
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm transition-colors"
                  style="color: rgba(220, 38, 38, 1);"
                  :style="{ 'hover:background-color': 'rgba(254, 226, 226, 1)' }"
                >
                  Déconnexion
                </button>
              </div>
            </transition>
          </div>

          <!-- Bouton Connexion -->
          <router-link
            v-else
            to="/login"
            class="px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-opacity-50" 
            style="background-color: rgba(86, 122, 94, 1); color: rgba(254, 243, 199, 1); --tw-ring-color: rgba(86, 122, 94, 0.5);"
            :style="{ 'hover:background-color': 'rgba(66, 94, 72, 1)' }"
          >
            Connexion
          </router-link>

          <!-- Menu Mobile Toggle -->
          <button
            @click="toggleMenu"
            class="sm:hidden p-2 rounded-full transition-colors"
            style="color: rgba(86, 122, 94, 1);"
            :style="{ 'hover:background-color': 'rgba(252, 211, 77, 1)' }"
          >
            <span class="sr-only">{{ isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu' }}</span>
            <component
              :is="isMenuOpen ? XMarkIcon : Bars3Icon"
              class="h-6 w-6"
              style="color: rgba(86, 122, 94, 1);"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Menu Mobile -->
    <transition
      enter-active-class="transition-opacity duration-300 ease-linear"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300 ease-linear"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isMenuOpen" class="sm:hidden">
        <div class="pt-2 pb-3 space-y-1">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="block px-4 py-2 text-base transition-colors"
            :style="[
              $route.path === item.href
                ? { backgroundColor: 'rgba(253, 230, 138, 1)', color: 'rgba(86, 122, 94, 1)' }
                : { color: 'rgba(86, 122, 94, 1)', 'hover:backgroundColor': 'rgba(252, 211, 77, 1)', 'hover:color': 'rgba(66, 94, 72, 1)' }
            ]"
            @click="isMenuOpen = false"
          >
            <div class="flex items-center">
              <component :is="item.icon" class="h-5 w-5 mr-2" style="color: rgba(86, 122, 94, 1);" />
              {{ item.name }}
            </div>
          </router-link>
        </div>
      </div>
    </transition>
  </nav>

  <!-- Spacer pour le contenu sous la navbar fixe -->
  <div class="h-16"></div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import {
  HomeIcon,
  CalendarIcon,
  SparklesIcon,
  CreditCardIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ChevronDownIcon,
  BookOpenIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const isMenuOpen = ref(false)
const isProfileMenuOpen = ref(false)

const navigation = [
  { name: 'Accueil', href: '/', icon: HomeIcon },
  { name: 'Recettes', href: '/recipes', icon: BookOpenIcon },
  { name: 'Menu', href: '/menus/current', icon: CalendarIcon, requiresAuth: true },
  { name: 'Générateur', href: '/menu/generator', icon: SparklesIcon, requiresAuth: true, requiresSubscription: true },
  { name: 'Abonnement', href: '/subscription', icon: CreditCardIcon },
]

const userInitials = computed(() => {
  if (!authStore.user) return ''
  return `${authStore.user.firstName?.[0] || ''}${authStore.user.lastName?.[0] || ''}`.toUpperCase()
})

const handleLogout = async () => {
  try {
    // Fermer d'abord le menu du profil
    isProfileMenuOpen.value = false
    
    // Effectuer la déconnexion via le store
    await authStore.logout()
    
    // Redirection vers la page d'accueil (landing page)
    router.push('/')
    
    // Optionnel: Afficher une notification de déconnexion réussie
    // Si vous avez un système de notification global
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    // Gérer l'erreur si nécessaire
  }
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const toggleProfileMenu = () => {
  isProfileMenuOpen.value = !isProfileMenuOpen.value
}
</script>