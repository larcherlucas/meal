<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  SparklesIcon,
  ClockIcon,
  ChartBarIcon,
  ShoppingCartIcon,
} from '@heroicons/vue/24/outline'

import type { Feature, Testimonial } from '@/types'
import Navbar from '@/components/layout/Navbar.vue'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import ActionButton from '@/components/ui/ActionButton.vue'
import FeatureCard from '@/components/landing/FeatureCard.vue'
import TestimonialCard from '@/components/landing/TestimonialCard.vue'
import PricingSection from '@/components/price/PricingSection.vue'

const router = useRouter()
const authStore = useAuthStore()

const features: Feature[] = [
  {
    icon: SparklesIcon,
    title: 'Menus personnalisés',
    description: 'Des menus générés automatiquement selon vos goûts et besoins nutritionnels.'
  },
  {
    icon: ClockIcon,
    title: 'Gain de temps',
    description: 'Fini le casse-tête des repas. Planifiez votre semaine en quelques clics.'
  },
  {
    icon: ChartBarIcon,
    title: 'Suivi nutritionnel',
    description: 'Gardez un œil sur vos apports avec des analyses détaillées.'
  },
  {
    icon: ShoppingCartIcon,
    title: 'Courses optimisées',
    description: 'Liste de courses intelligente, organisée par rayon pour plus d\'efficacité.'
  }
]

const testimonials: Testimonial[] = [
  {
    name: 'Marie L.',
    role: 'Mère de famille',
    image: '/images/testimonials/marie.jpg',
    text: 'Grâce à Menu Planner, je gagne un temps précieux tout en variant nos repas. Mes enfants adorent découvrir de nouvelles recettes !'
  },
  {
    name: 'Thomas R.',
    role: 'Sportif',
    image: '/images/testimonials/thomas.jpg',
    text: 'Le suivi nutritionnel est parfait pour mes objectifs sportifs. Les recettes sont délicieuses et adaptées à mes besoins en protéines.'
  },
  {
    name: 'Sophie M.',
    role: 'Mère de famille',
    image: '/images/testimonials/sophie.jpg',
    text: 'Un vrai gain de temps au quotidien. La génération automatique des menus me simplifie vraiment la vie.'
  }
]

const startTrial = () => {
  if (authStore.isAuthenticated) {
    router.push('/menu')
  } else {
    router.push('/auth/register')
  }
}
</script>

<template>
  <div class="overflow-hidden">
    <Navbar />
    
    <!-- Hero Section -->
    <section class="min-h-screen flex items-center bg-gray-50 pt-16">
      <div class="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div class="flex flex-col justify-center animate-fade-in">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Le futur de l'alimentation personnalisée
          </h1>
          <p class="text-lg md:text-xl text-gray-700 mb-8 max-w-lg">
            Découvrez une nouvelle façon de planifier vos repas. Plus intelligent, plus personnalisé, plus savoureux.
          </p>
          <ActionButton text="Essayer gratuitement" @action="startTrial" />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <SectionTitle title="Une expérience culinaire révolutionnaire" />
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            v-for="feature in features"
            :key="feature.title"
            :feature="feature"
          />
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-6">
        <SectionTitle title="Ils nous font confiance" />
        <div class="grid md:grid-cols-3 gap-8">
          <TestimonialCard
            v-for="testimonial in testimonials"
            :key="testimonial.name"
            :testimonial="testimonial"
          />
        </div>
      </div>
    </section>

    <PricingSection />

    <!-- CTA Section -->
    <section class="py-20 bg-mocha-600">
      <div class="max-w-4xl mx-auto px-6 text-center animate-fade-in">
        <SectionTitle 
          title="Prêt à transformer votre cuisine ?" 
          className="text-white"
        />
        <p class="text-xl text-mocha-100 mb-8">
          Rejoignez des milliers d'utilisateurs satisfaits et commencez votre voyage culinaire dès aujourd'hui.
        </p>
        <ActionButton 
          text="Commencer gratuitement" 
          variant="secondary"
          @action="startTrial" 
        />
      </div>
    </section>
  </div>
</template>