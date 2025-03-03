import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '../api/config'
import { useAuthStore } from './auth'
import { useNotificationStore } from './NotificationStore'

// Types pour les préférences alimentaires
export interface FoodPreferences {
  liked: string[];
  disliked: string[];
}

// Types pour les restrictions alimentaires
export interface DietaryRestrictions {
  pork: boolean;
  meat: boolean;
  halal: boolean;
  noSugar: boolean;
  noPeanuts: boolean;
  noNuts: boolean;
  noEggs: boolean;
  noSoy: boolean;
  noShellfish: boolean;
  allergies: string[];
}

// Types pour la composition du foyer
export interface HouseholdComposition {
  adults: number;
  childrenOver3: number;
  childrenUnder3: number;
  babies: number;
}

// Type complet pour le profil utilisateur
export interface UserProfile {
  id?: string;
  username: string;
  household: HouseholdComposition;
  foodPreferences: FoodPreferences;
  dietaryRestrictions: DietaryRestrictions;
  language: string;
  theme?: 'light' | 'dark';
}

export const useUserPreferencesStore = defineStore('userPreferences', () => {
  // État initial
  const userProfile = ref<UserProfile>({
    username: '',
    household: {
      adults: 1,
      childrenOver3: 0,
      childrenUnder3: 0,
      babies: 0
    },
    foodPreferences: {
      liked: [],
      disliked: []
    },
    dietaryRestrictions: {
      pork: false,
      meat: false,
      halal: false,
      noSugar: false,
      noPeanuts: false,
      noNuts: false,
      noEggs: false,
      noSoy: false,
      noShellfish: false,
      allergies: []
    },
    language: 'fr'
  });

  // États pour le suivi du chargement et des erreurs
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);
  const isInitialized = ref(false);
  
  // Liste des aliments disponibles (pourrait être chargée depuis l'API)
  const availableFoods = ref([
    'Tomates', 'Carottes', 'Poivrons', 'Courgettes', 'Aubergine', 'Chou-fleur',
    'Brocoli', 'Épinards', 'Laitue', 'Concombre', 'Pommes de terre', 'Champignons',
    'Poulet', 'Bœuf', 'Porc', 'Agneau', 'Dinde', 'Canard', 'Poisson', 'Fruits de mer',
    'Riz', 'Pâtes', 'Quinoa', 'Lentilles', 'Pois chiches', 'Haricots',
    'Fromage', 'Yaourt', 'Lait', 'Beurre', 'Crème', 'Oeufs', 'Foie'
  ]);

  // Computed properties
  const totalHouseholdMembers = computed(() => {
    const { adults, childrenOver3, childrenUnder3, babies } = userProfile.value.household;
    return adults + childrenOver3 + childrenUnder3 + babies;
  });

  const allDietaryRestrictions = computed(() => {
    const restrictions = [];
    const dr = userProfile.value.dietaryRestrictions;
    
    if (dr.meat) restrictions.push('Végétarien');
    if (dr.pork) restrictions.push('Pas de porc');
    if (dr.halal) restrictions.push('Halal');
    if (dr.noSugar) restrictions.push('Sans sucre');
    if (dr.noPeanuts) restrictions.push('Sans arachides');
    if (dr.noNuts) restrictions.push('Sans fruits à coque');
    if (dr.noEggs) restrictions.push('Sans œufs');
    if (dr.noSoy) restrictions.push('Sans soja');
    if (dr.noShellfish) restrictions.push('Sans crustacés');
    
    return [...restrictions, ...dr.allergies];
  });

  // Récupérer les stores externes
  const getAuthStore = () => useAuthStore();
  const getNotificationStore = () => useNotificationStore();

  // Récupérer le profil utilisateur depuis l'API
  async function fetchUserProfile() {
    if (isLoading.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // Vérifier si l'utilisateur est authentifié
      const authStore = getAuthStore();
      if (!authStore.isAuthenticated) {
        throw new Error("Vous devez être connecté pour accéder à vos préférences");
      }
      
      // Récupérer le profil de base et les restrictions alimentaires
      const [profileResponse, dietaryResponse] = await Promise.all([
        apiService.get('/account/me'),
        apiService.get('/account/me/dietary-restrictions')
      ]);
      
      // Adapter les données du backend au format du store
      const userData = profileResponse ? adaptProfileData(profileResponse) : null;
      const dietaryData = dietaryResponse ? adaptDietaryData(dietaryResponse) : null;
      
      // Mettre à jour le profil utilisateur
      if (userData) {
        userProfile.value = {
          ...userProfile.value,
          ...userData,
          dietaryRestrictions: dietaryData || userProfile.value.dietaryRestrictions
        };
      }
      
      isInitialized.value = true;
    } catch (err: any) {
      error.value = err.message || 'Erreur lors du chargement des préférences utilisateur';
      getNotificationStore().error(error.value);
      console.error('Erreur lors du chargement des préférences:', err);
    } finally {
      isLoading.value = false;
    }
  }

  // Adapter les données du profil venant du backend
  function adaptProfileData(data: any): Partial<UserProfile> {
    return {
      id: data.id,
      username: data.username || '',
      // Adapter household_members au format du frontend
      household: {
        adults: data.household_members?.adults || 1,
        childrenOver3: data.household_members?.children_over_3 || 0,
        childrenUnder3: data.household_members?.children_under_3 || 0,
        babies: data.household_members?.babies || 0
      },
      // Récupérer les préférences alimentaires
      foodPreferences: {
        liked: data.preferences?.food_preferences?.liked || [],
        disliked: data.preferences?.food_preferences?.disliked || []
      },
      // Récupérer les préférences de langue et thème
      language: data.preferences?.language || 'fr',
      theme: data.preferences?.theme || 'light'
    };
  }

  // Adapter les restrictions alimentaires venant du backend
  function adaptDietaryData(data: any[]): DietaryRestrictions {
    const restrictions: DietaryRestrictions = {
      pork: false,
      meat: false,
      halal: false,
      noSugar: false,
      noPeanuts: false,
      noNuts: false,
      noEggs: false,
      noSoy: false,
      noShellfish: false,
      allergies: []
    };
    
    // Parcourir les restrictions reçues et mettre à jour l'objet
    data.forEach(item => {
      const type = item.restriction_type.toLowerCase();
      
      switch (type) {
        case 'pork':
          restrictions.pork = true;
          break;
        case 'meat':
        case 'vegetarian':
          restrictions.meat = true;
          break;
        case 'halal':
          restrictions.halal = true;
          break;
        case 'no_sugar':
        case 'nosugar':
          restrictions.noSugar = true;
          break;
        case 'no_peanuts':
        case 'nopeanuts':
          restrictions.noPeanuts = true;
          break;
        case 'no_nuts':
        case 'nonuts':
          restrictions.noNuts = true;
          break;
        case 'no_eggs':
        case 'noeggs':
          restrictions.noEggs = true;
          break;
        case 'no_soy':
        case 'nosoy':
          restrictions.noSoy = true;
          break;
        case 'no_shellfish':
        case 'noshellfish':
          restrictions.noShellfish = true;
          break;
        case 'allergy':
          if (item.details) {
            restrictions.allergies.push(item.details);
          }
          break;
        default:
          // Pour les allergies ou types non-standard, les ajouter à la liste d'allergies
          if (type.startsWith('allergy_')) {
            restrictions.allergies.push(type.substring(8));
          }
      }
    });
    
    return restrictions;
  }

  // Préparer les données pour l'envoi au backend
  function prepareProfileDataForApi(): any {
    // Convertir le format du frontend vers celui attendu par l'API
    return {
      username: userProfile.value.username,
      household_members: {
        adults: userProfile.value.household.adults,
        children_over_3: userProfile.value.household.childrenOver3,
        children_under_3: userProfile.value.household.childrenUnder3,
        babies: userProfile.value.household.babies
      },
      preferences: {
        language: userProfile.value.language,
        theme: userProfile.value.theme || 'light',
        food_preferences: {
          liked: userProfile.value.foodPreferences.liked,
          disliked: userProfile.value.foodPreferences.disliked
        }
      }
    };
  }

  // Préparer les restrictions alimentaires pour l'API
  function prepareDietaryRestrictionsForApi(): any[] {
    const restrictions = [];
    const dr = userProfile.value.dietaryRestrictions;
    
    // Convertir les booléens en objets avec restriction_type
    if (dr.pork) restrictions.push({ restriction_type: 'pork' });
    if (dr.meat) restrictions.push({ restriction_type: 'meat' });
    if (dr.halal) restrictions.push({ restriction_type: 'halal' });
    if (dr.noSugar) restrictions.push({ restriction_type: 'no_sugar' });
    if (dr.noPeanuts) restrictions.push({ restriction_type: 'no_peanuts' });
    if (dr.noNuts) restrictions.push({ restriction_type: 'no_nuts' });
    if (dr.noEggs) restrictions.push({ restriction_type: 'no_eggs' });
    if (dr.noSoy) restrictions.push({ restriction_type: 'no_soy' });
    if (dr.noShellfish) restrictions.push({ restriction_type: 'no_shellfish' });
    
    // Ajouter les allergies
    dr.allergies.forEach(allergy => {
      restrictions.push({
        restriction_type: 'allergy',
        details: allergy
      });
    });
    
    return restrictions;
  }

  // Enregistrer le profil utilisateur
  async function saveUserProfile() {
    if (isSaving.value) return false;
    
    isSaving.value = true;
    error.value = null;
    
    try {
      // Vérifier si l'utilisateur est authentifié
      const authStore = getAuthStore();
      if (!authStore.isAuthenticated) {
        throw new Error("Vous devez être connecté pour enregistrer vos préférences");
      }
      
      // Préparer les données à envoyer
      const profileData = prepareProfileDataForApi();
      const dietaryRestrictions = prepareDietaryRestrictionsForApi();
      
      // Mise à jour du profil
      await apiService.patch('/account/me', profileData);
      
      // Supprimer toutes les restrictions existantes
      await apiService.delete('/account/me/dietary-restrictions');
      
      // Ajouter les nouvelles restrictions de manière séquentielle
      // Cela permet de gérer les erreurs potentielles pour chaque restriction
      for (const restriction of dietaryRestrictions) {
        try {
          await apiService.post('/account/me/dietary-restrictions', restriction);
        } catch (restrictionError) {
          console.error(`Erreur lors de l'ajout d'une restriction:`, restrictionError);
          // Continuer l'ajout des autres restrictions même si une échoue
        }
      }
      
      getNotificationStore().success(
        'Préférences enregistrées', 
        'Vos préférences ont été mises à jour avec succès'
      );
      
      return true;
    } catch (err: any) {
      // Gérer différents types d'erreurs
      const errorMessage = err.response?.data?.error 
        || err.message 
        || 'Erreur lors de la sauvegarde des préférences utilisateur';
      
      error.value = errorMessage;
      getNotificationStore().error(errorMessage);
      
      console.error('Erreur détaillée lors de la sauvegarde des préférences:', err);
      
      return false;
    } finally {
      // S'assurer que isSaving est remis à false, même en cas d'erreur
      isSaving.value = false;
    }
  }
  // Fonction pour basculer une préférence alimentaire
  function toggleFoodPreference(food: string, preferenceType: 'liked' | 'disliked') {
    const oppositeType = preferenceType === 'liked' ? 'disliked' : 'liked';
    
    // Supprimer de la liste opposée si présent
    const oppositeList = userProfile.value.foodPreferences[oppositeType];
    const oppositeIndex = oppositeList.indexOf(food);
    if (oppositeIndex !== -1) {
      oppositeList.splice(oppositeIndex, 1);
    }
    
    // Ajouter ou supprimer de la liste actuelle
    const currentList = userProfile.value.foodPreferences[preferenceType];
    const currentIndex = currentList.indexOf(food);
    
    if (currentIndex === -1) {
      // Ajouter à la liste
      currentList.push(food);
    } else {
      // Supprimer de la liste
      currentList.splice(currentIndex, 1);
    }
  }

  // Ajouter une allergie
  function addAllergy(allergyName: string) {
    if (allergyName.trim() && !userProfile.value.dietaryRestrictions.allergies.includes(allergyName)) {
      userProfile.value.dietaryRestrictions.allergies.push(allergyName);
    }
  }

  // Supprimer une allergie
  function removeAllergy(allergyName: string) {
    userProfile.value.dietaryRestrictions.allergies = 
      userProfile.value.dietaryRestrictions.allergies.filter(a => a !== allergyName);
  }

  // Obtenir le statut de préférence d'un aliment
  function getPreferenceStatus(food: string): 'liked' | 'disliked' | null {
    if (userProfile.value.foodPreferences.liked.includes(food)) return 'liked';
    if (userProfile.value.foodPreferences.disliked.includes(food)) return 'disliked';
    return null;
  }

  // Réinitialiser les préférences aux valeurs par défaut
  function resetToDefaults() {
    userProfile.value = {
      username: userProfile.value.username,
      household: {
        adults: 1,
        childrenOver3: 0,
        childrenUnder3: 0,
        babies: 0
      },
      foodPreferences: {
        liked: [],
        disliked: []
      },
      dietaryRestrictions: {
        pork: false,
        meat: false,
        halal: false,
        noSugar: false,
        noPeanuts: false,
        noNuts: false,
        noEggs: false,
        noSoy: false,
        noShellfish: false,
        allergies: []
      },
      language: 'fr'
    };
  }

  // Initialiser à partir du AuthStore
  function initFromAuthStore() {
    try {
      const authStore = getAuthStore();
      if (authStore && authStore.user) {
        // Récupérer le username
        if (authStore.user.username) {
          userProfile.value.username = authStore.user.username;
        }
        
        // Récupérer la composition du foyer si disponible
        if (authStore.user.household_members) {
          userProfile.value.household = {
            adults: authStore.user.household_members.adults || 1,
            childrenOver3: authStore.user.household_members.children_over_3 || 0,
            childrenUnder3: authStore.user.household_members.children_under_3 || 0,
            babies: authStore.user.household_members.babies || 0
          };
        }
        
        // Récupérer les préférences si disponibles
        if (authStore.user.preferences) {
          if (authStore.user.preferences.language) {
            userProfile.value.language = authStore.user.preferences.language;
          }
          
          if (authStore.user.preferences.theme) {
            userProfile.value.theme = authStore.user.preferences.theme;
          }
          
          if (authStore.user.preferences.food_preferences) {
            userProfile.value.foodPreferences = {
              liked: authStore.user.preferences.food_preferences.liked || [],
              disliked: authStore.user.preferences.food_preferences.disliked || []
            };
          }
        }
      }
    } catch (err) {
      console.error('Erreur lors de l\'initialisation depuis AuthStore:', err);
    }
  }

  // Fonction pour effacer le store lors de la déconnexion
  function clearStore() {
    resetToDefaults();
    error.value = null;
    isInitialized.value = false;
  }

  return {
    // État
    userProfile,
    isLoading,
    isSaving,
    error,
    isInitialized,
    availableFoods,
    
    // Getters calculés
    totalHouseholdMembers,
    allDietaryRestrictions,
    
    // Actions
    fetchUserProfile,
    saveUserProfile,
    toggleFoodPreference,
    addAllergy,
    removeAllergy,
    getPreferenceStatus,
    resetToDefaults,
    initFromAuthStore,
    clearStore
  }
})