import { create } from "zustand";

type AuthState = {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,

  setAuthenticated: (value) =>
    set({
      isAuthenticated: value,
    }),

  logout: () =>
    set({
      isAuthenticated: false,
    }),
}));
