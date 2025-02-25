<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscription'
import BentoCard from '@/components/ui/BentoCard.vue'
import MochaButton from '@/components/ui/MochaButton.vue'
import FeatureList from '@/components/ui/FeatureList.vue'

const router = useRouter()
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()
const { plans } = subscriptionStore

const isProcessing = ref(false)

const handleSubscribe = async (planId: string) => {
  if (!authStore.isAuthenticated) {
    router.push({ 
      name: 'login',
      query: { redirect: '/subscription' }
    })
    return
  }

  isProcessing.value = true
  try {
    // Intégration avec la solution de paiement
    console.log('Souscription au plan:', planId)
  } catch (error) {
    console.error('Erreur lors du paiement:', error)
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4">
    <div class="text-center mb-12 animate-fade-in">
      <h1 class="text-3xl font-bold mb-4" style="color: rgba(89, 1, 1, 1);">
        Choisissez votre abonnement
      </h1>
      <p style="color: rgba(216, 121, 4, 1);">
        Accédez à toutes nos recettes et fonctionnalités premium
      </p>
    </div>

    <div class="grid md:grid-cols-3 gap-8">
      <BentoCard
        v-for="(plan, index) in plans"
        :key="plan.id"
        :popular="plan.id === 'yearly'"
        :animation="index === 0 ? 'slide' : index === 1 ? 'fade' : 'scale'"
      >
        <div class="p-6" style="background-color: rgba(144, 165, 69, 0.1);">
          <h3 class="text-xl font-bold mb-2" style="color: #590202;">{{ plan.name }}</h3>
          
          <div class="mb-6">
            <div class="flex items-baseline">
              <span class="text-4xl font-bold" style="color: #D97904;">
                {{ plan.price }}€
              </span>
              <span class="ml-2" style="color: rgba(216, 121, 4, 1);">/mois</span>
            </div>
            <p class="text-sm mt-1" style="color: #590202;">
              {{ plan.period === 'year' ? 'Facturation annuelle' : 
                 plan.period === 'month' ? 'Facturation mensuelle' : 
                 'Sans engagement' }}
            </p>
          </div>

          <FeatureList :features="plan.features" class="mb-8" />

          <MochaButton
            :variant="plan.id === 'free' ? 'secondary' : 'primary'"
            :loading="isProcessing"
            full-width
            @click="handleSubscribe(plan.id)"
            :style="plan.id === 'free' ? 'background-color: rgba(144, 165, 69, 1); color: white;' : 'background-color: rgba(242, 182, 4, 1); color: rgba(89, 1, 1, 1);'"
          >
            {{ plan.id === 'free' ? 'Commencer gratuitement' : 'Choisir ce plan' }}
          </MochaButton>
        </div>
      </BentoCard>
    </div>

    <div class="mt-16 grid md:grid-cols-2 gap-8">
      <BentoCard animation="fade">
        <div class="p-6" style="background-color: rgba(144, 165, 69, 0.1);">
          <h3 class="text-xl font-semibold mb-4" style="color: rgba(86, 122, 94, 1);">
            Paiement sécurisé
          </h3>
          <p style="color: rgb(96 74 56 / var(--tw-text-opacity, 1));">
            Vos paiements sont sécurisés et nous ne stockons jamais vos informations bancaires.
          </p>
        </div>
      </BentoCard>

      <BentoCard animation="fade">
        <div class="p-6" style="background-color: rgba(144, 165, 69, 0.1);">
          <h3 class="text-xl font-semibold mb-4" style="color: rgba(86, 122, 94, 1);">
            Satisfait ou remboursé
          </h3>
          <p style="color: rgb(96 74 56 / var(--tw-text-opacity, 1));">
            Essayez notre service pendant 30 jours. Si vous n'êtes pas satisfait, nous vous remboursons intégralement.
          </p>
        </div>
      </BentoCard>
    </div>
  </div>
</template>