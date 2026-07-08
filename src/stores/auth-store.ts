import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

const mockUser: User = {
  id: "usr_001",
  name: "Sarah Chen",
  email: "sarah.chen@moataz.ai",
  role: "Owner",
  status: "active",
  avatarUrl: undefined,
  lastActiveAt: new Date().toISOString(),
  createdAt: "2024-01-15T08:00:00.000Z",
  updatedAt: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,

      login: async (email, _password) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 700));
        if (!email || !email.includes("@")) {
          set({ isLoading: false });
          return { ok: false, error: "Invalid email address" };
        }
        set({
          user: { ...mockUser, email },
          isAuthenticated: true,
          isLoading: false,
          token: "mock_jwt_token_" + Math.random().toString(36).slice(2),
        });
        return { ok: true };
      },

      register: async (name, email, _password) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 900));
        if (!name || !email.includes("@")) {
          set({ isLoading: false });
          return { ok: false, error: "Please provide a valid name and email" };
        }
        set({
          user: { ...mockUser, name, email },
          isAuthenticated: true,
          isLoading: false,
          token: "mock_jwt_token_" + Math.random().toString(36).slice(2),
        });
        return { ok: true };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, token: null });
      },

      updateProfile: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates, updatedAt: new Date().toISOString() } : null,
        }));
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "moataz-auth",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as unknown as Storage))),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    }
  )
);
