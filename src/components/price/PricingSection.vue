<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BentoCard from '@/components/ui/BentoCard.vue'
import MochaButton from '@/components/ui/MochaButton.vue'
import FeatureList from '@/components/ui/FeatureList.vue'
import { CheckIcon } from '@heroicons/vue/24/outline'

interface PricingPlan {
  id: string
  name: string
  price: number
  period: 'month' | 'year' | 'free'
  popular?: boolean
  features: string[]
}

const router = useRouter()
const authStore = useAuthStore()

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    period: 'free',
    features: [
      'Accès à 50 recettes',
      'Générateur de menu basique',
      'Liste de courses simple'
    ]
  },
  {
    id: 'monthly',
    name: 'Premium Mensuel',
    price: 10.99,
    period: 'month',
    features: [
      'Accès illimité aux recettes',
      'Accès aux vidéos des recettes',
      'Générateur de menu avancé',
      'Liste de courses personnalisée',
      'Support prioritaire'
    ]
  },
  {
    id: 'yearly',
    name: 'Premium Annuel',
    price: 89.99,
    period: 'year',
    popular: true,
    features: [
      'Accès illimité aux recettes',
      'Générateur de menu avancé',
      'Analyse nutritionnelle',
      'Liste de courses intelligente',
      'Support prioritaire'
    ]
  }
]

const handlePlanSelection = (planId: string) => {
  if (!authStore.isAuthenticated) {
    router.push({
      path: '/auth/register',
      query: { plan: planId } // Optionnel: pour pré-sélectionner le plan après inscription
    })
  } else {
    router.push({
      path: '/payment',
      query: { plan: planId }
    })
  }
}

const getPeriodText = (plan: PricingPlan) => {
  switch (plan.period) {
    case 'month':
      return '/mois'
    case 'year':
      return '/an'
    default:
      return ''
  }
}

const getCtaText = (plan: PricingPlan) => {
  return plan.period === 'free' ? 'Commencer gratuitement' : 'Choisir ce plan'
}

const formatPrice = (price: number) => {
  return price.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const calculateMonthlyPrice = (plan: PricingPlan) => {
  if (plan.period === 'year') {
    return (plan.price / 12).toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
  return null
}
</script>

<template>
  <section class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-6">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 animate-fade-in">
        Des forfaits adaptés à vos besoins
      </h2>

      <div class="grid md:grid-cols-3 gap-8">
        <BentoCard
          v-for="(plan, index) in plans"
          :key="plan.id"
          :popular="plan.popular"
          :animation="index === 1 ? 'slide' : 'fade'"
          class="relative"
        >
          <div class="p-6">
            <h3 class="text-2xl font-bold text-gray-900 mb-2">
              {{ plan.name }}
            </h3>
            
            <div class="mb-6">
              <div class="flex items-baseline">
                <span class="text-4xl font-bold text-gray-900">
                  {{ formatPrice(plan.price) }}€
                </span>
                <span class="text-gray-600 ml-2">
                  {{ getPeriodText(plan) }}
                </span>
              </div>
              
              <p v-if="plan.period === 'year'" class="text-sm text-mocha-600 mt-1">
                Soit {{ calculateMonthlyPrice(plan) }}€ par mois
              </p>
            </div>

            <FeatureList :features="plan.features" class="mb-8" />

            <MochaButton
              :variant="plan.period === 'free' ? 'secondary' : 'primary'"
              full-width
              @click="handlePlanSelection(plan.id)"
            >
              {{ getCtaText(plan) }}
            </MochaButton>
          </div>
        </BentoCard>
      </div>

      <!-- Section garanties -->
      <div class="mt-16 grid md:grid-cols-2 gap-8">
        <BentoCard animation="fade" class="p-6">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-mocha-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div class="ml-4">
              <h4 class="text-lg font-semibold text-gray-900">Paiement sécurisé</h4>
              <p class="mt-2 text-gray-600">
                Vos paiements sont sécurisés et nous ne stockons jamais vos informations bancaires.
              </p>
            </div>
          </div>
        </BentoCard>

        <BentoCard animation="fade" class="p-6">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-mocha-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <h4 class="text-lg font-semibold text-gray-900">Satisfait ou remboursé</h4>
              <p class="mt-2 text-gray-600">
                Essayez notre service pendant 30 jours. Si vous n'êtes pas satisfait, nous vous remboursons intégralement.
              </p>
            </div>
          </div>
        </BentoCard>
      </div>
    </div>
  </section>
</template>