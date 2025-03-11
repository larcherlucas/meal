<template>
    <div class="min-h-screen bg-gray-100 dark:bg-mocha-800">
      <!-- Barre latérale d'administration -->
      <aside class="fixed inset-y-0 left-0 w-64 bg-white dark:bg-mocha-900 shadow-lg overflow-y-auto z-20 transition-transform transform-gpu" :class="{ '-translate-x-full sm:translate-x-0': !sidebarOpen }">
        <div class="p-4 border-b border-gray-200 dark:border-mocha-700">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-mocha-800 dark:text-mocha-100">Menu Planner</h2>
            <button @click="toggleSidebar" class="sm:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
          <p class="text-sm text-mocha-600 dark:text-mocha-300">Administration</p>
        </div>
        
        <nav class="p-4 space-y-1">
          <router-link 
            to="/admin" 
            exact-active-class="bg-mocha-100 text-mocha-800 dark:bg-mocha-700 dark:text-mocha-100"
            class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-mocha-600 hover:bg-mocha-50 hover:text-mocha-800 dark:text-mocha-300 dark:hover:bg-mocha-800 dark:hover:text-mocha-100"
          >
            <HomeIcon class="h-5 w-5 mr-2" />
            Tableau de bord
          </router-link>
          
          <router-link 
            to="/admin/recipes" 
            active-class="bg-mocha-100 text-mocha-800 dark:bg-mocha-700 dark:text-mocha-100"
            class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-mocha-600 hover:bg-mocha-50 hover:text-mocha-800 dark:text-mocha-300 dark:hover:bg-mocha-800 dark:hover:text-mocha-100"
          >
            <ClipboardDocumentListIcon class="h-5 w-5 mr-2" />
            Recettes
          </router-link>
          
          <router-link 
            to="/admin/cache" 
            active-class="bg-mocha-100 text-mocha-800 dark:bg-mocha-700 dark:text-mocha-100"
            class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-mocha-600 hover:bg-mocha-50 hover:text-mocha-800 dark:text-mocha-300 dark:hover:bg-mocha-800 dark:hover:text-mocha-100"
          >
            <CpuChipIcon class="h-5 w-5 mr-2" />
            Gestion du cache
          </router-link>
          
          <div class="pt-4 border-t border-gray-200 dark:border-mocha-700">
            <router-link 
              to="/home" 
              class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-mocha-600 hover:bg-mocha-50 hover:text-mocha-800 dark:text-mocha-300 dark:hover:bg-mocha-800 dark:hover:text-mocha-100"
            >
              <ArrowLeftIcon class="h-5 w-5 mr-2" />
              Retour au site
            </router-link>
          </div>
        </nav>
      </aside>
      
      <!-- Contenu principal -->
      <div class="sm:ml-64">
        <!-- En-tête -->
        <header class="bg-white dark:bg-mocha-900 shadow-sm p-4 flex items-center justify-between">
          <div class="flex items-center">
            <button @click="toggleSidebar" class="sm:hidden p-2 mr-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none">
              <Bars3Icon v-if="!sidebarOpen" class="h-6 w-6" />
              <XMarkIcon v-else class="h-6 w-6" />
            </button>
            <h1 class="text-xl font-semibold text-mocha-800 dark:text-mocha-100">{{ pageTitle }}</h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Toggle du thème -->
            <button
              @click="toggleTheme"
              class="p-2 rounded-full transition-all duration-300 focus:outline-none"
              :class="isDark ? 'bg-mocha-700 text-mocha-300' : 'bg-mocha-100 text-mocha-700'"
            >
              <SunIcon v-if="isDark" class="h-5 w-5" />
              <MoonIcon v-else class="h-5 w-5" />
            </button>
            
            <!-- Menu utilisateur -->
            <div class="relative" ref="userMenuRef">
              <button
                @click="toggleUserMenu"
                class="flex items-center p-1 rounded-full hover:bg-mocha-100 dark:hover:bg-mocha-800 focus:outline-none"
              >
                <div class="h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transform hover:scale-110 transition-transform" 
                     style="background: linear-gradient(to bottom right, rgba(89, 2, 2, 0.8), rgba(89, 2, 2, 1)); color: rgba(254, 243, 199, 1);">
                  {{ userInitials }}
                </div>
                <ChevronDownIcon 
                  class="h-4 w-4 ml-1 transition-transform"
                  :class="{ 'rotate-180': isUserMenuOpen }"
                />
              </button>
              
              <!-- Menu déroulant utilisateur -->
              <div 
                v-if="isUserMenuOpen"
                class="absolute right-0 mt-2 w-48 bg-white dark:bg-mocha-800 rounded-md shadow-lg z-10 py-1"
              >
                <div class="px-4 py-2 border-b border-gray-200 dark:border-mocha-700">
                  <p class="text-sm font-medium text-mocha-800 dark:text-mocha-100">{{ username }}</p>
                  <p class="text-xs text-mocha-500 dark:text-mocha-400">Administrateur</p>
                </div>
                <router-link 
                  to="/profile" 
                  class="block px-4 py-2 text-sm text-mocha-600 hover:bg-mocha-100 hover:text-mocha-800 dark:text-mocha-300 dark:hover:bg-mocha-700 dark:hover:text-mocha-100"
                >
                  Profil
                </router-link>
                <button 
                  @click="logout" 
                  class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <!-- Contenu de la page -->
        <main class="p-4 lg:p-8">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" @update:page-title="updatePageTitle" />
            </transition>
          </router-view>
        </main>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch, onBeforeMount, onMounted, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { useThemeStore } from '@/stores/theme'
  import { 
    HomeIcon, 
    ClipboardDocumentListIcon, 
    CpuChipIcon,
    Bars3Icon,
    XMarkIcon,
    SunIcon,
    MoonIcon,
    ChevronDownIcon,
    ArrowLeftIcon
  } from '@heroicons/vue/24/outline'
  
  const router = useRouter()
  const authStore = useAuthStore()
  const themeStore = useThemeStore()
  
  // État de l'interface
  const sidebarOpen = ref(false)
  const isUserMenuOpen = ref(false)
  const userMenuRef = ref<HTMLElement | null>(null)
  const pageTitle = ref('Tableau de bord')
  
  // Computed properties
  const isDark = computed(() => themeStore.isDark)
  const username = computed(() => authStore.user?.username || '')
  const userInitials = computed(() => {
    const name = authStore.user?.username || ''
    if (!name) return ''
    
    // Si le nom contient un espace, prendre les premières lettres de chaque partie
    if (name.includes(' ')) {
      return name.split(' ').map(part => part[0]).join('').toUpperCase()
    }
    
    // Sinon, prendre les deux premières lettres
    return name.substring(0, 2).toUpperCase()
  })
  
  // Fonctions
  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }
  
  function toggleTheme() {
    themeStore.toggleTheme()
  }
  
  function toggleUserMenu() {
    isUserMenuOpen.value = !isUserMenuOpen.value
  }
  
  function updatePageTitle(title: string) {
    pageTitle.value = title
  }
  
  async function logout() {
    await authStore.logout()
    router.push('/login')
  }
  
  // Fermer le menu utilisateur lors d'un clic à l'extérieur
  function handleClickOutside(event: MouseEvent) {
    if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
      isUserMenuOpen.value = false
    }
  }
  
  // Vérifier si l'utilisateur est admin
  onBeforeMount(() => {
    if (!authStore.isAuthenticated || authStore.user?.role !== 'admin') {
      router.push('/login')
    }
  })
  
  // Gestionnaire d'événements pour les clics à l'extérieur
  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
  
  // Fermer la sidebar sur les petits écrans lors d'un changement de route
  watch(() => router.currentRoute.value.path, () => {
    if (window.innerWidth < 640) {
      sidebarOpen.value = false
    }
  })
  </script>
  
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