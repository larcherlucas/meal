// Authentication Types
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthResponse {
  token: string
  user: User
  expiresIn?: number
}

// User Types
export interface User {
  id: string
  email: string
  username: string
  role: 'admin' | 'user'
  household_members?: HouseholdComposition
  subscription?: Subscription
  preferences?: UserPreferences
  createdAt?: string
  updatedAt?: string
}

export interface Subscription {
  isActive: boolean
  plan: string | null
  status: 'active' | 'inactive' | 'cancelled' | 'expired'
  startDate?: string
  expiresAt?: string
  nextBillingDate?: string
}

export interface UserPreferences {
  language: 'fr' | 'en'
  theme: 'light' | 'dark'
  notifications?: {
    email: boolean
    app: boolean
  }
}

export interface HouseholdComposition {
  adults: number
  children_over_3: number
  children_under_3: number
  babies: number
}

// Registration Types
export interface SignupData {
  username: string
  email: string
  password: string
  confirmPassword: string
  householdMembers?: HouseholdComposition
  preferences?: Partial<UserPreferences>
}

// Menu Types
export interface Menu {
  id: string
  userId: string
  name: string
  startDate: string
  endDate: string
  meals: Meal[]
  createdAt: string
  updatedAt: string
}

export interface Meal {
  id: string
  menuId: string
  day: number
  period: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  recipes: Recipe[]
}

export interface Recipe {
  id: string
  name: string
  description: string
  preparationTime: number
  cookingTime: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  ingredients: Ingredient[]
  steps: string[]
  tags: string[]
  dietaryRestrictions: DietaryRestriction[]
  imageUrl?: string
}

export interface Ingredient {
  id: string
  name: string
  quantity: number
  unit: string
}

export interface DietaryRestriction {
  id: string
  name: string
  description?: string
}

// Profile Types
export interface ProfileUpdateData {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
  household_members?: Partial<HouseholdComposition>
  preferences?: Partial<UserPreferences>
}

// Notification Types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warn'
  title: string
  message: string
  timestamp: number
  read: boolean
}