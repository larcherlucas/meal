import { createRouter, createWebHistory, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/NotificationStore'

// Vérification d'authentification avec gestion des redirections
const checkAuth = async (
  to: RouteLocationNormalized, 
  from: RouteLocationNormalized, 
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()

  // Vérification du token si l'utilisateur semble connecté mais non vérifié
  if (authStore.token && !authStore.isVerified) {
    try {
      await authStore.verifyToken()
    } catch (error) {
      await authStore.logout(false) // false = ne pas appeler l'API logout
      return next({ 
        path: '/login', 
        query: { redirect: to.fullPath, session: 'expired' } 
      })
    }
  }

  // Vérifier si la route nécessite une authentification
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ 
      path: '/login', 
      query: { redirect: to.fullPath } 
    })
  }

  // Vérifier si la route nécessite un abonnement actif
  if (to.meta.requiresSubscription && !authStore.hasActiveSubscription) {
    notificationStore.show({
      type: 'warning',
      message: 'Cette fonctionnalité nécessite un abonnement actif.'
    })
    return next({ path: '/subscription' })
  }

  // Vérifier si la route nécessite un rôle admin
  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    notificationStore.show({
      type: 'error',
      message: 'Cette section est réservée aux administrateurs.'
    })
    return next({ path: '/home' })
  }

  // Si l'utilisateur est connecté et tente d'accéder à la landing page ou aux pages d'auth
  if (authStore.isAuthenticated && (
    to.path === '/' || 
    to.path === '/login' || 
    to.path === '/signup'
  )) {
    return next({ path: '/home' })
  }

  // Continuer la navigation
  next()
}

// Configuration des routes
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/LandingView.vue')
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/auth/RegisterView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { title: 'Connexion', layout: 'auth' }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/auth/ForgotPasswordView.vue'),
      meta: { title: 'Mot de passe oublié', layout: 'auth' }
    },
    {
      path: '/reset-password/:token',
      name: 'reset-password',
      component: () => import('@/views/auth/ResetPasswordView.vue'),
      meta: { title: 'Réinitialisation du mot de passe', layout: 'auth' }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/recipes',
      name: 'recipes',
      component: () => import('@/views/MenuView.vue'),
      meta: { 
        requiresAuth: true 
      }
    },
    {
      path: '/menu',
      name: 'menu',
      component: () => import('@/views/MenuView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/menu/generator',
      name: 'menu-generator',
      component: () => import('@/views/MenuGeneratorView.vue'),
      meta: { 
        requiresAuth: true,
        requiresSubscription: true 
      }
    },
    {
      path: '/menus/:id',
      name: 'weekly-menu-calendar',
      component: () => import('@/views/WeeklyMenuCalendar.vue'),
      meta: { 
        requiresAuth: true,
        requiresSubscription: true 
      }
    },
    {
      path: '/subscription',
      name: 'subscription',
      component: () => import('@/views/SubscriptionView.vue'),
      meta: { requiresAuth: true }
    },
    // Routes d'administration
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { 
        requiresAuth: true,
        requiresAdmin: true // Nouveau meta pour vérifier le rôle admin
      },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/AdminDashboard.vue'),
        },
        {
          path: 'recipes',
          name: 'admin-recipes',
          component: () => import('@/views/admin/recipes/RecipesList.vue').catch(() => {
            console.error('Erreur lors du chargement du composant RecipesList');
            return import('@/views/admin/NotFoundView.vue');
          }),
        },
        {
          path: 'recipes/create',
          name: 'admin-recipe-create',
          component: () => import('@/views/admin/recipes/RecipeForm.vue'),
        },
        {
          path: 'recipes/:id/edit',
          name: 'admin-recipe-edit',
          component: () => import('@/views/admin/recipes/RecipeForm.vue'),
          props: true
        },
        {
          path: 'cache',
          name: 'admin-cache',
          component: () => import('@/views/admin/CacheManagement.vue'),
        }
      ]
    }
  ],
  // Remonter en haut de page à chaque changement de route
  scrollBehavior() {
    return { top: 0 }
  }
})

// Appliquer le middleware d'authentification à toutes les routes
router.beforeEach(checkAuth)

export default router