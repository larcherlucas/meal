// src/stores/signup.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './auth';
import { useUserPreferencesStore } from './userPreferences';
import { useNotificationStore } from './NotificationStore';
import { navigateTo } from '@/utils/router-helpers';
import type { SignupData, ApiErrorResponse } from '@/types';

// Interface spécifique pour le formulaire d'inscription, adaptée à votre implémentation
export interface SignupForm {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  preferences?: {
    language?: string;
    theme?: string;
    [key: string]: any;
  };
}

export const useSignupStore = defineStore('signup', () => {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const fieldErrors = ref<Record<string, string>>({});
  const signupSuccess = ref(false);
  const attemptCount = ref(0); // Compteur de tentatives d'inscription

  const resetState = () => {
    isLoading.value = false;
    error.value = null;
    fieldErrors.value = {};
    signupSuccess.value = false;
    // Ne pas réinitialiser attemptCount pour suivre les tentatives multiples
  };

  /**
   * Tente l'inscription d'un nouvel utilisateur
   * @param formData Données du formulaire d'inscription validées par Vee-validate
   * @returns Booléen indiquant si l'inscription a réussi
   */
  const initiateSignup = async (formData: SignupForm): Promise<boolean> => {
    resetState();
    isLoading.value = true;
    attemptCount.value++; // Incrémente le compteur de tentatives
    
    const notificationStore = useNotificationStore();
    const authStore = useAuthStore();
    const preferencesStore = useUserPreferencesStore();

    try {
      const payload: SignupData = {
        username: formData.username,
        email: formData.email.trim().toLowerCase(), // Normalisation de l'email
        password: formData.password,
        confirmPassword: formData.password,
        preferences: {
          language: 'fr',
          theme: 'light',
          // Ajouter plus de préférences utilisateur si nécessaire
        }
      };
      
      // Journalisation en développement uniquement
      if (import.meta.env.DEV) {
        console.log('Envoi de la requête d\'inscription:', { ...payload, password: '[MASQUÉ]' });
      }
      
      // Utilisation de la méthode signup du store d'authentification
      const success = await authStore.signup(payload);
      
      if (success) {
        // Initialiser les préférences à partir du store d'authentification
        preferencesStore.initFromAuthStore();
        
        signupSuccess.value = true;
        
        // Notification de succès améliorée
        notificationStore.success(
          'Votre compte a été créé avec succès! Bienvenue dans Menu Planner.',
          { duration: 7000 }
        );
        
        // Analyser si l'utilisateur a fait plusieurs tentatives avant de réussir
        if (attemptCount.value > 1) {
          // Enregistrement anonyme pour amélioration UX si plusieurs tentatives
          console.info(`Inscription réussie après ${attemptCount.value} tentatives`);
        }
        
        // Redirection vers le profil avec délai pour permettre à l'utilisateur de voir la notification
        setTimeout(async () => {
          await navigateTo('/profile');
        }, 1000);
        
        return true;
      }
      
      // Si authStore.signup n'a pas retourné true mais n'a pas lancé d'erreur
      if (authStore.error) {
        error.value = authStore.error;
      } else {
        error.value = 'Échec de l\'inscription pour une raison inconnue';
      }
      
      return false;
    } catch (err: any) {
      console.error('Erreur lors de l\'inscription:', err);
      
      // Gestion avancée des erreurs d'API
      handleSignupError(err);
      
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Traite les différents types d'erreurs provenant de l'API
   */
  const handleSignupError = (err: any) => {
    const notificationStore = useNotificationStore();
    
    // Extraction des données d'erreur
    const errorResponse = err.response?.data as ApiErrorResponse | undefined;
    const status = err.response?.status;
    
    // Traitement des erreurs spécifiques aux champs
    if (errorResponse?.errors && typeof errorResponse.errors === 'object') {
      fieldErrors.value = errorResponse.errors;
      
      // Message global si erreurs multiples
      if (Object.keys(errorResponse.errors).length > 0) {
        error.value = 'Veuillez corriger les erreurs dans le formulaire';
        
        // Notification pour meilleure visibilité
        notificationStore.error('Des erreurs ont été détectées dans le formulaire', {
          duration: 7000
        });
      }
    } 
    // Traitement des erreurs par status code avec messages plus spécifiques
    else if (status) {
      switch (status) {
        case 409: // Conflit (email déjà utilisé)
          error.value = 'Cet email est déjà utilisé. Veuillez utiliser un autre email ou vous connecter.';
          fieldErrors.value.email = 'Email déjà utilisé';
          break;
          
        case 400: // Mauvaise requête
          error.value = errorResponse?.error || 'Données d\'inscription invalides';
          break;
          
        case 422: // Validation échouée
          error.value = errorResponse?.error || 'Veuillez vérifier les informations saisies';
          break;
          
        case 500: // Erreur serveur
          error.value = 'Une erreur serveur est survenue. Veuillez réessayer ultérieurement.';
          notificationStore.error('Erreur serveur lors de l\'inscription. Notre équipe a été notifiée.', {
            duration: 10000
          });
          
          // Log détaillé pour debugging
          console.error('Erreur serveur 500 lors de l\'inscription:', err);
          break;
          
        case 429: // Trop de requêtes
          const retryAfter = err.response?.headers?.['retry-after'] || '60';
          error.value = `Trop de tentatives. Veuillez réessayer après ${retryAfter} secondes.`;
          notificationStore.warning(`Limite de tentatives atteinte. Veuillez patienter ${retryAfter} secondes.`, {
            duration: parseInt(retryAfter) * 1000
          });
          break;
          
        default:
          error.value = errorResponse?.error || `Une erreur est survenue lors de l'inscription (${status})`;
      }
    } 
    // Erreur réseau ou autre
    else {
      error.value = err.message || 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
      
      notificationStore.error('Problème de connexion au serveur. Veuillez vérifier votre connexion internet.', {
        duration: 7000,
        closable: true
      });
    }
  };

  return {
    isLoading,
    error,
    fieldErrors,
    signupSuccess,
    attemptCount,
    initiateSignup,
    resetState
  };
});