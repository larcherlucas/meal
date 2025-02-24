import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './auth';
import { useUserPreferencesStore } from './userPreferences';
import { apiService } from '../api/config';
import router from '@/router';
import { navigateTo } from '@/utils/router-helpers';
import type { SignupForm } from '../types';

export const useSignupStore = defineStore('signup', () => {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const signupSuccess = ref(false);

  const resetState = () => {
    isLoading.value = false;
    error.value = null;
    signupSuccess.value = false;
  };

  const initiateSignup = async (formData: SignupForm): Promise<boolean> => {
    resetState();
    isLoading.value = true;

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.password,
        preferences: {
          language: 'fr',
          theme: 'dark'
        }
      };

      console.log('Payload avant envoi:', payload);
      
      const response = await apiService.auth.signup(payload);
      console.log('Réponse de l\'API:', response.data);
      
      // Format de réponse attendu
      if (response.data?.token) {
        const authStore = useAuthStore();
        const preferencesStore = useUserPreferencesStore();
        
        authStore.token = response.data.token;
        authStore.user = response.data.user;
        authStore.isVerified = true;
        localStorage.setItem('token', response.data.token);
        preferencesStore.initFromAuthStore();
        
        signupSuccess.value = true;
        
        // Redirection immédiate après inscription réussie (sans setTimeout)
        await navigateTo('/profile');
        
        return true;
      } else if (response.data?.data?.token) {
        // Format alternatif possible
        const authStore = useAuthStore();
        const preferencesStore = useUserPreferencesStore();
        
        authStore.token = response.data.data.token;
        authStore.user = response.data.data.user;
        authStore.isVerified = true;
        localStorage.setItem('token', response.data.data.token);
        preferencesStore.initFromAuthStore();
        
        signupSuccess.value = true;
        
        // Redirection immédiate après inscription réussie (sans setTimeout)
        await navigateTo('/profile');
        
        return true;
      }
      
      throw new Error('Format de réponse invalide');
    } catch (err: any) {
      console.error('Erreur lors de l\'inscription:', err);
      
      // Détection améliorée des messages d'erreur
      const errorResponse = err.response?.data;
      const errorMessage = errorResponse?.message || errorResponse?.error || err.message;
      
      if (errorMessage.includes('déjà utilisé') || 
          err.response?.status === 409) {
        error.value = 'Cet email est déjà utilisé. Veuillez utiliser un autre email ou vous connecter.';
      } else if (errorResponse?.message) {
        error.value = errorResponse.message;
      } else {
        error.value = 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';
      }
      
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    signupSuccess,
    initiateSignup,
    resetState
  };
});