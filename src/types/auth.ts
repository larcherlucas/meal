interface LoginCredentials {
    email: string;
    password: string;
  }
  
  interface AuthResponse {
    token: string;
    user: User;
  }
  
  interface User {
    id: string;
    email: string;
    username: string;
    role: 'admin' | 'user';
    household?: {
      adults: number;
      childrenOver3: number;
      childrenUnder3: number;
      babies: number;
    };
    subscription?: {
      isActive: boolean;
      plan: string;
      expiresAt: string;
    };
  }