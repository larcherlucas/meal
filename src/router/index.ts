import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
      component: () => import('@/views/auth/LoginView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }
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
      path: '/subscription',
      name: 'subscription',
      component: () => import('@/views/SubscriptionView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Vérification du token si l'utilisateur semble connecté
  if (authStore.token && !authStore.isVerified) {
    try {
      await authStore.verifyToken()
    } catch (error) {
      authStore.logout()
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }

  // Si l'utilisateur est connecté et tente d'accéder à la landing page, 
  // redirigez-le vers la homepage
  if (to.path === '/' && authStore.isAuthenticated) {
    next({ path: '/home' })
    return
  }

  // Redirection si la route nécessite une authentification
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  // Redirection si la route nécessite un abonnement actif
  if (to.meta.requiresSubscription && !authStore.hasActiveSubscription) {
    next({ path: '/subscription' })
    return
  }

  // Empêcher l'accès aux pages de login/signup si déjà connecté
  if ((to.path === '/login' || to.path === '/signup') && authStore.isAuthenticated) {
    next({ path: '/home' })
    return
  }

  next()
})

export default router