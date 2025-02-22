export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
  household_members?: HouseholdComposition;
  subscription?: {
    isActive: boolean;
    plan: string;
    expiresAt: string;
  };
}

export interface HouseholdComposition {
  adults: number;
  children_over_3: number;
  children_under_3: number;
  babies: number;
}

export interface SignupForm {
  username: string;
  email: string;
  password: string;
  household_members?: HouseholdComposition;
  preferences?: {
    language: string;
    theme: 'light' | 'dark';
  };
}

// Interface pour la transformation des données lors de l'envoi à l'API
export interface SignupPayload {
  username: string;
  email: string;
  password: string;
  household_members?: {
    adults: number;
    children_over_3: number;
    children_under_3: number;
    babies: number;
  };
  preferences?: {
    language: string;
    theme: 'light' | 'dark';
  };
}