import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth';
import { useUserPreferencesStore } from './userPreferences';
import axios from 'axios';

interface SignupForm {
  email: string;
  password: string;
  username: string;
  household: {
    adults: number;
    childrenOver3: number;
    childrenUnder3: number;
    babies: number;
  };
}

export const useSignupStore = defineStore('signup', () => {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const signupSuccess = ref(false);
  
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
    withCredentials: true
  });

  const resetState = () => {
    isLoading.value = false;
    error.value = null;
    signupSuccess.value = false;
  };

  const signup = async (formData: SignupForm): Promise<boolean> => {
    resetState();
    isLoading.value = true;
    
    try {
      const signupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        household_members: {
          adults: 0,
          children_over_3: 0,
          children_under_3: 0,
          babies: 0
        },
        preferences: {}
      };

      // Appel à l'API pour créer le compte
      const response = await api.post('/signup', signupData);
      
      if (response.data?.status === 'success' && response.data?.data?.token) {
        // Récupérer les stores nécessaires après la réussite (pour éviter les dépendances circulaires)
        const authStore = useAuthStore();
        const preferencesStore = useUserPreferencesStore();
        
        // Connecter l'utilisateur automatiquement
        authStore.setToken(response.data.data.token);
        authStore.user = response.data.data.user;
        
        // Mettre à jour les préférences utilisateur avec les données d'inscription
        preferencesStore.userProfile.firstName = formData.firstName;
        preferencesStore.userProfile.lastName = formData.lastName;
        preferencesStore.userProfile.household = formData.household;
        
        // Initialiser le store de préférences avec les données d'auth
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
    signup,
    resetState
  };
});