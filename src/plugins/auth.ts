import { App } from 'vue'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

// Liste des routes publiques
const PUBLIC_ROUTES = [
  '/login', 
  '/signup', 
  '/reset-password', 
  '/about', 
  '/terms', 
  '/privacy'
]

export default {
  install: (app: App) => {
    const authStore = useAuthStore()

    // Configuration de la navigation
    router.beforeEach(async (to, from, next) => {
      // Vérifier si la route nécessite une authentification
      const requiresAuth = !PUBLIC_ROUTES.some(route => 
        to.path === route || to.path.startsWith(`${route}/`)
      )

      // Vérifier le token si l'utilisateur n'est pas authentifié
      if (requiresAuth && !authStore.isAuthenticated) {
        // Sauvegarder la route de destination pour rediriger après connexion
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
        return
      }

      // Routes spécifiques nécessitant des permissions supplémentaires
      if (to.meta.requiresAdmin && !authStore.isAdmin) {
        next({ path: '/' })
        return
      }

      if (to.meta.requiresSubscription && !authStore.hasActiveSubscription) {
        next({ path: '/subscription' })
        return
      }

      next()
    })

    // Gestionnaire global des erreurs
    app.config.errorHandler = (err, vm, info) => {
      console.error('Erreur globale:', err, info)
      
      // Gérer spécifiquement les erreurs d'authentification
      if (err instanceof Error && err.message.includes('token')) {
        authStore.logout()
      }
    }
  }
}