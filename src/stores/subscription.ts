import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/api/config'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/NotificationStore'

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  period: 'month' | 'year'
  features: string[]
  recipeAccess: number
  hasVideoAccess: boolean
}

export const useSubscriptionStore = defineStore('subscription', () => {
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()

  const plans = ref<SubscriptionPlan[]>([
    {
      id: 'free',
      name: 'Gratuit',
      price: 0,
      period: 'month',
      features: ['Accès à 50 recettes', 'Générateur de menu basique', 'Liste de courses simple'],
      recipeAccess: 50,
      hasVideoAccess: false
    },
    {
      id: 'monthly',
      name: 'Premium Mensuel',
      price: 20,
      period: 'month',
      features: [
        'Accès illimité aux recettes',
        'Accès aux vidéos des recettes',
        'Générateur de menu avancé',
        'Liste de courses personnalisée',
        'Support prioritaire'
      ],
      recipeAccess: Infinity,
      hasVideoAccess: true
    },
    {
      id: 'yearly',
      name: 'Premium Annuel',
      price: 12,
      period: 'year',
      features: [
        'Tous les avantages Premium',
        'Tarif préférentiel (12€/mois)',
        'Accès anticipé aux nouvelles recettes',
        'Contenu exclusif',
        'Webinaires mensuels'
      ],
      recipeAccess: Infinity,
      hasVideoAccess: true
    }
  ])

  const currentPlan = ref<string>('free')
  const subscriptionStatus = ref<'active' | 'pending' | 'cancelled' | 'expired' | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getCurrentPlan = computed(() => {
    return plans.value.find(plan => plan.id === currentPlan.value)
  })

// Dans subscription.ts
async function fetchCurrentPlan() {
  try {
    isLoading.value = true
    
    // Utiliser les données de l'utilisateur au lieu de faire une requête séparée
    if (authStore.user && authStore.user.subscription) {
      // Déterminer le plan en fonction du type d'abonnement
      if (authStore.user.subscription.isActive) {
        currentPlan.value = authStore.user.subscription.type || 'monthly'; // Par défaut 'monthly' si type est null
        subscriptionStatus.value = authStore.user.subscription.status;
      } else {
        currentPlan.value = 'free';
        subscriptionStatus.value = authStore.user.subscription.status || 'inactive';
      }
    } else {
      currentPlan.value = 'free';
      subscriptionStatus.value = null;
    }
  } catch (err) {
    console.error('Failed to process subscription:', err);
    error.value = "Erreur lors du chargement de l'abonnement";
  } finally {
    isLoading.value = false;
  }
}

  async function subscribe(planId: string) {
    try {
      isLoading.value = true
      await apiService.payment.createSubscription({ planId })
      currentPlan.value = planId
      subscriptionStatus.value = 'active'
      await authStore.fetchUser()
      notificationStore.show({ type: 'success', message: 'Abonnement activé avec succès' })
      return true
    } catch (err) {
      console.error('Subscription failed:', err)
      error.value = "Erreur lors de la souscription"
      notificationStore.show({ type: 'error', message: "Échec de la souscription" })
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function cancelSubscription() {
    try {
      isLoading.value = true
      await apiService.payment.cancelSubscription()
      currentPlan.value = 'free'
      subscriptionStatus.value = 'cancelled'
      await authStore.fetchUser()
      notificationStore.show({ type: 'success', message: 'Abonnement annulé avec succès' })
      return true
    } catch (err) {
      console.error('Cancellation failed:', err)
      error.value = "Erreur lors de l'annulation"
      notificationStore.show({ type: 'error', message: "Échec de l'annulation" })
      return false
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  const canAccessRecipe = (recipeId: number) => {
    const plan = getCurrentPlan.value
    if (!plan) return false
    return plan.recipeAccess >= recipeId || plan.recipeAccess === Infinity
  }

  return {
    plans,
    currentPlan,
    subscriptionStatus,
    isLoading,
    error,
    getCurrentPlan,
    fetchCurrentPlan,
    subscribe,
    cancelSubscription,
    clearError,
    canAccessRecipe
  }
})
