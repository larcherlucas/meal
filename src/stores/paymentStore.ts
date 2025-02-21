import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '../api/config'
import { useAuthStore } from './authStore'

interface PaymentHistory {
  id: string
  amount: number
  status: 'succeeded' | 'failed' | 'pending'
  createdAt: string
  paymentMethod: {
    type: string
    last4?: string
    brand?: string
  }
  subscriptionPlan: string
}

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  interval: 'month' | 'year'
  features: string[]
}

interface SubscriptionRequest {
  planId: string
  paymentMethodId?: string
}

export const usePaymentStore = defineStore('payment', () => {
  const paymentHistory = ref<PaymentHistory[]>([])
  const availablePlans = ref<SubscriptionPlan[]>([
    {
      id: 'plan_monthly',
      name: 'Abonnement Mensuel',
      description: 'Accès complet à toutes les fonctionnalités - Facturation mensuelle',
      price: 9.99,
      interval: 'month',
      features: [
        'Accès illimité aux recettes',
        'Planification de menus personnalisés',
        'Suivi des restrictions alimentaires',
        'Support client prioritaire'
      ]
    },
    {
      id: 'plan_yearly',
      name: 'Abonnement Annuel',
      description: 'Accès complet à toutes les fonctionnalités - Facturation annuelle (2 mois offerts)',
      price: 99.99,
      interval: 'year',
      features: [
        'Accès illimité aux recettes',
        'Planification de menus personnalisés',
        'Suivi des restrictions alimentaires',
        'Support client prioritaire',
        'Économisez 20% par rapport à l\'abonnement mensuel'
      ]
    }
  ])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const processingPayment = ref(false)
  const authStore = useAuthStore()

  const isSubscribed = computed(() => authStore.hasActiveSubscription)
  const isAdmin = computed(() => authStore.isAdmin)
  const currentSubscription = computed(() => authStore.user?.subscription)

  async function fetchPaymentHistory() {
    if (!authStore.isAuthenticated) {
      return []
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.get('/payment-history')
      paymentHistory.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement de l\'historique des paiements'
      console.error('Erreur lors du chargement de l\'historique des paiements:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function createSubscription(subscriptionRequest: SubscriptionRequest) {
    processingPayment.value = true
    error.value = null
    
    try {
      const response = await apiService.post('/subscription', subscriptionRequest)
      
      // Mise à jour des informations utilisateur pour refléter le nouvel abonnement
      await authStore.fetchUser()
      
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de la création de l\'abonnement'
      console.error('Erreur lors de la création de l\'abonnement:', err)
      throw err
    } finally {
      processingPayment.value = false
    }
  }

  async function cancelSubscription() {
    processingPayment.value = true
    error.value = null
    
    try {
      const response = await apiService.post('/subscription/cancel')
      
      // Mise à jour des informations utilisateur pour refléter l'annulation
      await authStore.fetchUser()
      
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de l\'annulation de l\'abonnement'
      console.error('Erreur lors de l\'annulation de l\'abonnement:', err)
      throw err
    } finally {
      processingPayment.value = false
    }
  }

  // Fonction admin pour récupérer tous les paiements
  async function fetchAllPayments() {
    if (!isAdmin.value) {
      error.value = "Vous n'avez pas les droits d'administrateur pour accéder à cette fonction"
      throw new Error("Accès non autorisé")
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      const response = await apiService.get('/admin/payments')
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des paiements'
      console.error('Erreur lors du chargement des paiements:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  function getPlanById(planId: string): SubscriptionPlan | undefined {
    return availablePlans.value.find(plan => plan.id === planId)
  }

  // Initialiser l'historique des paiements si l'utilisateur est connecté
  if (authStore.isAuthenticated) {
    fetchPaymentHistory()
  }

  return {
    paymentHistory,
    availablePlans,
    isLoading,
    error,
    processingPayment,
    isSubscribed,
    isAdmin,
    currentSubscription,
    fetchPaymentHistory,
    createSubscription,
    cancelSubscription,
    fetchAllPayments,
    getPlanById
  }
})