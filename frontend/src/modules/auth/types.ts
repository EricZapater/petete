export type Language = 'ca' | 'es' | 'en';

export interface User {
  id: string;
  email: string;
  nom: string;
  idioma: Language;
  created_at: string;
  updated_at: string;
}

export interface RegisterRequest {
  nom: string;
  email: string;
  password: string;
  idioma?: Language;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface UpdateProfileRequest {
  nom?: string;
  idioma?: Language;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: string[];
}
