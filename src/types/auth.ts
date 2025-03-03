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
  role: 'admin' | 'user' | 'premium';
  household_members?: HouseholdComposition;
  subscription?: {
    type: string | null;
    isActive: boolean;
    status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'pending';
    startDate: string | null;
    endDate: string | null;
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
  household?: HouseholdComposition;
  preferences?: {
    language: string;
    theme: 'light' | 'dark';
  };
}