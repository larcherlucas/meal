import { App } from 'vue'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

// Liste des routes qui ne requièrent pas d'authentification
const publicRoutes = [
  '/login',
  '/signup',
  '/reset-password',
  '/about',
  '/terms',
  '/privacy'
]

export default {
  install: (app: App) => {
    // Initialisation du système d'authentification
    const initAuth = async () => {
      const authStore = useAuthStore()
      
      // Marquer comme non initialisé au départ
      authStore.$patch({ isInitialized: false })
      
      // Initialiser l'authentification
      await authStore.initialize()
      
      // Configuration de la navigation
      router.beforeEach(async (to, from, next) => {
        // Attendre que l'authentification soit initialisée
        if (!authStore.isInitialized) {
          // Attendre au maximum 3 secondes pour l'initialisation
          await new Promise<void>((resolve) => {
            const checkInit = () => {
              if (authStore.isInitialized) {
                resolve()
              } else {
                setTimeout(checkInit, 100)
              }
            }
            checkInit()
            // Timeout de sécurité
            setTimeout(resolve, 3000)
          })
        }
        
        const requiresAuth = !publicRoutes.some(route => 
          to.path === route || to.path.startsWith(`${route}/`)
        )
        
        if (requiresAuth && !authStore.isAuthenticated) {
          // Sauvegarder la route cible pour rediriger après connexion
          const redirectPath = to.fullPath
          next({
            path: '/login',
            query: { redirect: redirectPath }
          })
        } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
          // Routes réservées aux admins
          next({ path: '/' })
        } else if (to.meta.requiresSubscription && !authStore.hasActiveSubscription) {
          // Routes nécessitant un abonnement
          next({ path: '/subscription' })
        } else {
          next()
        }
      })
      
      // Gérer les erreurs 401 dans l'application entière
      app.config.errorHandler = (err: any, vm, info) => {
        if (err.response?.status === 401) {
          authStore.logout()
        }
        // Conserver le comportement par défaut
        console.error(err, vm, info)
      }
      
      // Exposer globalement pour faciliter l'accès dans les templates
      app.config.globalProperties.$auth = {
        isAuthenticated: () => authStore.isAuthenticated,
        isAdmin: () => authStore.isAdmin,
        hasSubscription: () => authStore.hasActiveSubscription,
        logout: () => authStore.logout(),
        user: () => authStore.user
      }
    }
    
    // Initialiser l'authentification au démarrage
    initAuth()
  }
}