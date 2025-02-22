import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  withCredentials: true
});

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  subscription_status?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<User | null>(null);
  
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const hasActiveSubscription = computed(() => user.value?.subscription_status === 'active');

  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const response = await api.post('/login', credentials);
      
      // Vérifier la structure de la réponse selon votre API
      if (response.data?.data?.token) {
        setToken(response.data.data.token);
        user.value = response.data.data.user;
        return true;
      }
      
      throw new Error('Format de réponse invalide');
    } catch (error: any) {
      console.error('Login failed:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Email ou mot de passe incorrect');
      } else if (error.response?.status === 403) {
        throw new Error('Votre compte a été désactivé');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Une erreur est survenue lors de la connexion');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/logout');
    } finally {
      token.value = null;
      user.value = null;
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const fetchUser = async (): Promise<void> => {
    if (!token.value) return;
    
    try {
      const response = await api.get('/verify-token');
      if (response.data?.data?.user) {
        user.value = response.data.data.user;
      } else {
        throw new Error('Invalid user data format');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      await logout();
      throw error;
    }
  };

  // Initialize
  if (token.value) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    fetchUser().catch(() => logout());
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    hasActiveSubscription,
    login,
    logout,
    fetchUser
  };
});