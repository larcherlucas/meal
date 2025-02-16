<template>
  <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-mocha-800/80 backdrop-blur-glass border-b border-mocha-200/20 dark:border-mocha-700/20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo et Navigation principale -->
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/" class="text-xl font-bold text-mocha-700 hover:text-mocha-800 transition-colors">
              Menu Planner
            </router-link>
          </div>
          
          <!-- Navigation Desktop -->
          <div class="hidden sm:ml-6 sm:flex sm:space-x-4">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="nav-link group flex items-center"
              :class="[$route.path === item.href ? 'nav-link-active' : '']"
            >
              <component 
                :is="item.icon" 
                class="h-5 w-5 mr-2 transition-transform group-hover:scale-110" 
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
            class="p-2 rounded-full text-mocha-700 dark:text-mocha-300 
                   hover:bg-mocha-100 dark:hover:bg-mocha-700 
                   transition-all duration-300 hover:scale-110"
          >
            <SunIcon v-if="themeStore.isDark" class="h-5 w-5" />
            <MoonIcon v-else class="h-5 w-5" />
          </button>

          <!-- Menu Profil -->
          <div v-if="authStore.isAuthenticated" class="relative">
            <button
              @click="toggleProfileMenu"
              class="flex items-center space-x-2 p-2 rounded-full 
                     hover:bg-mocha-100 dark:hover:bg-mocha-700 
                     transition-all duration-300"
            >
              <div class="h-8 w-8 rounded-full bg-gradient-to-br from-mocha-400 to-mocha-600 
                          text-mocha-50 flex items-center justify-center text-sm font-medium
                          transform hover:scale-110 transition-transform">
                {{ userInitials }}
              </div>
              <ChevronDownIcon 
                class="h-4 w-4 text-mocha-700 dark:text-mocha-300 transition-transform"
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
                class="absolute right-0 mt-2 w-48 bento-card py-1"
              >
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-sm text-mocha-700 dark:text-mocha-300 
                         hover:bg-mocha-100 dark:hover:bg-mocha-700 transition-colors"
                  @click="isProfileMenuOpen = false"
                >
                  Mon Profil
                </router-link>
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 
                         hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            </transition>
          </div>

          <!-- Bouton Connexion -->
          <router-link
            v-else
            to="/auth/login"
            class="btn-primary"
          >
            Connexion
          </router-link>

          <!-- Menu Mobile Toggle -->
          <button
            @click="toggleMenu"
            class="sm:hidden p-2 rounded-full hover:bg-mocha-100 dark:hover:bg-mocha-700 transition-colors"
          >
            <span class="sr-only">{{ isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu' }}</span>
            <component
              :is="isMenuOpen ? XMarkIcon : Bars3Icon"
              class="h-6 w-6 text-mocha-700 dark:text-mocha-300"
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
            :class="[
              $route.path === item.href
                ? 'bg-mocha-100 dark:bg-mocha-800 text-mocha-700 dark:text-mocha-200'
                : 'text-mocha-700 dark:text-mocha-300 hover:bg-mocha-50 dark:hover:bg-mocha-700'
            ]"
            @click="isMenuOpen = false"
          >
            <div class="flex items-center">
              <component :is="item.icon" class="h-5 w-5 mr-2" />
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
  ChevronDownIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const isMenuOpen = ref(false)
const isProfileMenuOpen = ref(false)

const navigation = [
  { name: 'Accueil', href: '/', icon: HomeIcon },
  { name: 'Menu', href: '/menu', icon: CalendarIcon },
  { name: 'Générateur', href: '/menu/generator', icon: SparklesIcon, requiresAuth: true, requiresSubscription: true },
  { name: 'Abonnement', href: '/subscription', icon: CreditCardIcon },
]

const userInitials = computed(() => {
  if (!authStore.user) return ''
  return `${authStore.user.firstName?.[0] || ''}${authStore.user.lastName?.[0] || ''}`.toUpperCase()
})

const handleLogout = async () => {
  authStore.logout()
  router.push('/')
  isProfileMenuOpen.value = false
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const toggleProfileMenu = () => {
  isProfileMenuOpen.value = !isProfileMenuOpen.value
}
</script>