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
  id: number
  email: string
  username: string
  role: 'admin' | 'user' | 'premium'
  household_members?: HouseholdComposition
  subscription?: Subscription
  preferences?: UserPreferences
  created_at?: string
  updated_at?: string
}

export interface Subscription {
  type: string | null
  isActive: boolean
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'pending'
  startDate?: string
  endDate?: string
}

export interface UserPreferences {
  language?: 'fr' | 'en'
  theme?: 'light' | 'dark'
  notifications?: {
    email: boolean
    app: boolean
  }
  defaultServings?: number
  dietaryRestrictions?: string[]
  excludedIngredients?: string[]
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
  id: number
  user_id: number
  meal_schedule: MealSchedule
  menu_type: 'weekly' | 'monthly'
  status: 'active' | 'archived' | 'draft'
  is_customized: boolean
  family_size: number
  generated_options: {
    meal_types: ('breakfast' | 'lunch' | 'dinner' | 'snack')[]
    generated_at: string
    dietary_restrictions: string[]
    excluded_ingredients: string[]
  }
  generated_at: string
  valid_from: string
  valid_to: string
}

export interface MealSchedule {
  [key: string]: {
    breakfast?: MenuRecipe | null
    lunch?: MenuRecipe | null
    dinner?: MenuRecipe | null
    snack?: MenuRecipe | null
  }
}

export interface MenuRecipe {
  title: string
  servings: number
  cook_time: number
  image_url: string
  prep_time: number
  recipe_id: number
  is_favorite: boolean
  difficulty_level: 'easy' | 'medium' | 'hard'
}

// Recipe Types
export interface Recipe {
  id: number
  title: string
  description: string
  ingredients: any // À adapter selon la structure exacte reçue du backend
  steps: any // À adapter selon la structure exacte reçue du backend
  prep_time: number
  cook_time: number
  servings: number
  difficulty_level: 'easy' | 'medium' | 'hard'
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert'
  image_url?: string
  is_premium?: boolean
  category?: string
  origin?: string
  season?: string
  rating?: number
  author_id?: number
  author_email?: string
  favorite_count?: string
  average_rating?: string
}

export interface Ingredient {
  id: string | number
  name: string
  quantity: number
  unit: string
  optional?: boolean
}

export interface Step {
  order: number
  description: string
  duration?: number
}

export interface DietaryRestriction {
  id: string | number
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
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  timestamp: number
  read: boolean
  duration?: number
}

// Génération de menu
export interface GenerateMenuParams {
  type: 'week' | 'month'
  preferences: {
    excludedIngredients?: string[]
    dietaryRestrictions?: string[]
    mealTypes?: ('breakfast' | 'lunch' | 'dinner' | 'snack')[]
    servingsCount?: number
  }
}

// API Response Types
export interface ApiSuccessResponse<T> {
  status: 'success'
  data: T
  message?: string
  totalCount?: number
  subscription?: any
}

export interface ApiErrorResponse {
  error: string
  status?: number
  errors?: Record<string, string>
}

export interface SignupForm {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  preferences?: {
    language?: string;
    theme?: string;
    [key: string]: any;
  };
}