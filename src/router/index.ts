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
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue')
    },
    {
      path: '/auth/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue')
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
      component: () => import('@/views/MenuView.vue')
    },
    {
      path: '/menu/generator',
      name: 'menu-generator',
      component: () => import('@/views/MenuGeneratorView.vue'),
      meta: { requiresAuth: true, requiresSubscription: true }
    },
    {
      path: '/subscription',
      name: 'subscription',
      component: () => import('@/views/SubscriptionView.vue')
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Si l'utilisateur est connecté et tente d'accéder à la landing page, redirigez-le vers la homepage
  if (to.name === 'landing' && authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }

  // Redirection si la route nécessite une authentification
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // Redirection si la route nécessite un abonnement actif
  if (to.meta.requiresSubscription && !authStore.hasActiveSubscription) {
    next({ name: 'subscription' })
    return
  }

  next()
})

export default router
