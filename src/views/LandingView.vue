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

// Palette de couleurs en RGB
const colors = {
  green: 'rgb(96, 140, 2)',      // #618C03
  yellow: 'rgb(242, 182, 4)',    // #F2B705
  orange: 'rgb(216, 121, 4)',    // #D97904
  brightRed: 'rgb(216, 43, 4)',  // #D92B04
  deepRed: 'rgb(140, 14, 2)',    // #8C0E03
  lightGreen: 'rgb(215, 235, 182)', // Version claire du vert pour les fonds
  lightYellow: 'rgb(252, 235, 180)', // Version claire du jaune pour les fonds
}

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
    router.push('/signup')
  }
}
</script>

<template>
  <div class="overflow-hidden">
    <Navbar />
    
    <!-- Hero Section - Fond subtil avec la couleur verte claire -->
    <section class="min-h-screen flex items-center pt-16" :style="{ backgroundColor: colors.lightYellow }">
      <div class="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div class="flex flex-col justify-center animate-fade-in">
          <h1 class="heading-1 mb-6" :style="{ color: colors.deepRed }">
            Le futur de l'alimentation personnalisée
          </h1>
          <p class="text-body-lg mb-8 max-w-lg" :style="{ color: colors.orange }">
            Découvrez une nouvelle façon de planifier vos repas. Plus intelligent, plus personnalisé, plus savoureux.
          </p>
          <ActionButton 
            text="Essayer gratuitement" 
            @action="startTrial" 
            :style="{ backgroundColor: colors.brightRed, color: 'white' }" 
          />
        </div>
      </div>
    </section>

    <!-- Features Section - Blanc pour plus de clarté -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <SectionTitle 
          title="Une expérience culinaire révolutionnaire" 
          :style="{ color: colors.deepRed }" 
        />
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            v-for="(feature, index) in features"
            :key="feature.title"
            :feature="feature"
            :style="{ 
              borderColor: index % 4 === 0 ? colors.green : 
                          index % 4 === 1 ? colors.yellow : 
                          index % 4 === 2 ? colors.orange : 
                          colors.brightRed 
            }"
          />
        </div>
      </div>
    </section>

    <!-- Testimonials Section - Fond vert subtil -->
    <section class="py-20" :style="{ backgroundColor: colors.lightGreen }">
      <div class="max-w-7xl mx-auto px-6">
        <SectionTitle 
          title="Ils nous font confiance" 
          :style="{ color: colors.deepRed }" 
        />
        <div class="grid md:grid-cols-3 gap-8">
          <TestimonialCard
            v-for="(testimonial, index) in testimonials"
            :key="testimonial.name"
            :testimonial="testimonial"
            :style="{ 
              borderColor: index % 3 === 0 ? colors.yellow : 
                          index % 3 === 1 ? colors.orange : 
                          colors.brightRed 
            }"
          />
        </div>
      </div>
    </section>

    <PricingSection />

    <!-- CTA Section (Pied de page) avec la couleur jaune -->
    <section class="py-20" :style="{ backgroundColor: colors.yellow }">
      <div class="max-w-4xl mx-auto px-6 text-center animate-fade-in">
        <SectionTitle 
          title="Prêt à transformer votre cuisine ?" 
          :style="{ color: colors.deepRed }"
        />
        <p class="text-xl mb-8" :style="{ color: colors.deepRed }">
          Rejoignez des milliers d'utilisateurs satisfaits et commencez votre voyage culinaire dès aujourd'hui.
        </p>
        <ActionButton 
          text="Commencer gratuitement" 
          variant="primary"
          @action="startTrial" 
          :style="{ backgroundColor: colors.brightRed, color: 'white' }" 
        />
      </div>
    </section>
  </div>
</template>

<style>
/* Ajout de styles globaux pour les transitions et interactions */
.animate-fade-in {
  animation: fadeIn 0.8s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Ajouter des transitions pour les boutons et cartes */
button, .feature-card, .testimonial-card {
  transition: all 0.3s ease;
}

button:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.feature-card:hover, .testimonial-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}
</style>