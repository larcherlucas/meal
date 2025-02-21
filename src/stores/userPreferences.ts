import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '../api/config';
import { useAuthStore } from './auth'; // Ajout de l'import manquant

export interface FoodPreferences {
  liked: string[];
  disliked: string[];
}

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

export interface UserProfile {
  firstName: string;
  lastName: string;
  household: {
    adults: number;
    childrenOver3: number;
    childrenUnder3: number;
    babies: number;
  };
  foodPreferences: FoodPreferences;
  dietaryRestrictions: DietaryRestrictions;
  language: string;
}

export const useUserPreferencesStore = defineStore('userPreferences', () => {
  // État initial
  const userProfile = ref<UserProfile>({
    firstName: '',
    lastName: '',
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

  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const availableFoods = ref([
    'Tomates', 'Carottes', 'Poivrons', 'Courgettes', 'Aubergine', 'Chou-fleur',
    'Brocoli', 'Épinards', 'Laitue', 'Concombre', 'Pommes de terre', 'Champignons',
    'Poulet', 'Bœuf', 'Porc', 'Agneau', 'Dinde', 'Canard', 'Poisson', 'Fruits de mer',
    'Riz', 'Pâtes', 'Quinoa', 'Lentilles', 'Pois chiches', 'Haricots',
    'Fromage', 'Yaourt', 'Lait', 'Beurre', 'Crème', 'Oeufs', 'Foie'
  ]);

  // Getters
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

  // Actions
  async function fetchUserProfile() {
    isLoading.value = true;
    error.value = null;
    
    try {
      const [prefsResponse, dietaryResponse] = await Promise.all([
        apiService.account.getOne('me'),
        apiService.dietaryRestrictions.getAll()
      ]);

      // Fusion des données
      const userData = prefsResponse.data;
      const dietaryData = dietaryResponse.data;

      userProfile.value = {
        ...userProfile.value,
        ...userData,
        dietaryRestrictions: dietaryData
      };
    } catch (err) {
      console.error('Failed to fetch user preferences:', err);
      error.value = 'Erreur lors du chargement des préférences utilisateur';
    } finally {
      isLoading.value = false;
    }
  }

  async function saveUserProfile() {
    isLoading.value = true;
    error.value = null;
    
    try {
      await Promise.all([
        apiService.account.update(userProfile.value.id, {
          firstName: userProfile.value.firstName,
          lastName: userProfile.value.lastName,
          household: userProfile.value.household
        }),
        apiService.dietaryRestrictions.update('all', userProfile.value.dietaryRestrictions)
      ]);
      
      return true;
    } catch (err) {
      console.error('Failed to save user preferences:', err);
      error.value = 'Erreur lors de la sauvegarde des préférences utilisateur';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

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

  function addAllergy(allergyName: string) {
    if (allergyName.trim() && !userProfile.value.dietaryRestrictions.allergies.includes(allergyName)) {
      userProfile.value.dietaryRestrictions.allergies.push(allergyName);
    }
  }

  function removeAllergy(allergyName: string) {
    userProfile.value.dietaryRestrictions.allergies = 
      userProfile.value.dietaryRestrictions.allergies.filter(a => a !== allergyName);
  }

  function getPreferenceStatus(food: string): 'liked' | 'disliked' | null {
    if (userProfile.value.foodPreferences.liked.includes(food)) return 'liked';
    if (userProfile.value.foodPreferences.disliked.includes(food)) return 'disliked';
    return null;
  }

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

  // Initialiser à partir d'un store Auth existant
  function initFromAuthStore() {
    try {
      const authStore = useAuthStore();
      if (authStore && authStore.user) {
        if (authStore.user.firstName) userProfile.value.firstName = authStore.user.firstName;
        if (authStore.user.lastName) userProfile.value.lastName = authStore.user.lastName;
        
        if (authStore.user.household) {
          userProfile.value.household = { ...authStore.user.household };
        }
      }
    } catch (err) {
      console.error('Erreur lors de l\'initialisation depuis AuthStore:', err);
    }
  }

  // Ne pas initialiser automatiquement pour éviter l'erreur circulaire
  // initFromAuthStore();

  return {
    userProfile,
    isLoading,
    error,
    availableFoods,
    totalHouseholdMembers,
    allDietaryRestrictions,
    fetchUserProfile,
    saveUserProfile,
    toggleFoodPreference,
    addAllergy,
    removeAllergy,
    getPreferenceStatus,
    resetToDefaults,
    initFromAuthStore
  }
});