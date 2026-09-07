import { create } from 'zustand';
import { setApiAccessToken } from '../../api/client';
import i18n from '../../i18n';
import { authApi } from './api';
import { Language, LoginRequest, RegisterRequest, UpdateProfileRequest, User } from './types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  loadProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  setLanguage: (lang: Language) => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  setLanguage: (lang: Language) => {
    localStorage.setItem('petete_lang', lang);
    i18n.changeLanguage(lang);
    if (get().user) {
      set({ user: { ...get().user!, idioma: lang } });
    }
  },

  login: async (data: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const resp = await authApi.login(data);
      setApiAccessToken(resp.access_token);
      set({
        user: resp.user,
        accessToken: resp.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
      if (resp.user.idioma) {
        get().setLanguage(resp.user.idioma);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Error en iniciar sessió. Revisa les dades.';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      const resp = await authApi.register(data);
      setApiAccessToken(resp.access_token);
      set({
        user: resp.user,
        accessToken: resp.access_token,
        isAuthenticated: true,
        isLoading: false,
      });
      if (resp.user.idioma) {
        get().setLanguage(resp.user.idioma);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Error en el registre. Revisa les dades.';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } catch (err) {
      // ignore
    } finally {
      setApiAccessToken(null);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  loadProfile: async () => {
    try {
      const user = await authApi.getProfile();
      set({ user, isAuthenticated: true });
      if (user.idioma) {
        get().setLanguage(user.idioma);
      }
    } catch (err) {
      setApiAccessToken(null);
      set({ user: null, isAuthenticated: false });
    }
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await authApi.updateProfile(data);
      set({ user: updatedUser, isLoading: false });
      if (data.idioma) {
        get().setLanguage(data.idioma);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Error en actualitzar el perfil.';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const tokenResp = await authApi.refresh();
      setApiAccessToken(tokenResp.access_token);
      set({ accessToken: tokenResp.access_token });
      await get().loadProfile();
    } catch (err) {
      setApiAccessToken(null);
      set({ user: null, accessToken: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
