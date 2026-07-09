export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  is_active: boolean;
  ai_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  display_name?: string;
  phone?: string;
}

export interface AuthResponse {
  user: UserProfile;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}
