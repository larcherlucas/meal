import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
  const plans = ref<SubscriptionPlan[]>([
    {
      id: 'free',
      name: 'Gratuit',
      price: 0,
      period: 'month',
      features: [
        'Accès à 50 recettes',
        'Générateur de menu basique',
        'Liste de courses simple'
      ],
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

  const getCurrentPlan = computed(() => {
    return plans.value.find(plan => plan.id === currentPlan.value)
  })

  const canAccessRecipe = (recipeId: number) => {
    const plan = getCurrentPlan.value
    if (!plan) return false
    // Logique pour vérifier si la recette est accessible avec l'abonnement actuel
    return true
  }

  return {
    plans,
    currentPlan,
    getCurrentPlan,
    canAccessRecipe
  }
})