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
  household?: HouseholdComposition;
  subscription?: {
    isActive: boolean;
    plan: string;
    expiresAt: string;
  };
}

export interface HouseholdComposition {
  adults: number;
  childrenOver3: number;
  childrenUnder3: number;
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