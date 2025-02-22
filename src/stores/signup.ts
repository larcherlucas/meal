import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './auth';
import { useUserPreferencesStore } from './userPreferences';
import { apiService } from '../api/config'; // Utilise l'instance axios configurée
import type { SignupForm, SignupPayload } from '../types';

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
      
      if (response.data?.token) {
        const authStore = useAuthStore();
        const preferencesStore = useUserPreferencesStore();
        
        authStore.setToken(response.data.token);
        authStore.user = response.data.user;
        preferencesStore.initFromAuthStore();
        
        signupSuccess.value = true;
        return true;
      }
      
      throw new Error('Format de réponse invalide');
    } catch (err: any) {
      console.error('Erreur lors de l\'inscription:', err);
      
      if (err.response?.status === 409) {
        error.value = 'Cet email est déjà utilisé';
      } else if (err.response?.data?.message) {
        error.value = err.response.data.message;
      } else {
        error.value = 'Une erreur est survenue lors de l\'inscription';
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