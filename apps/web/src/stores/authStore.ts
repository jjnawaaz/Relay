import { create } from "zustand";

type AuthState = {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!sessionStorage.getItem("accessToken"),

  setAuthenticated: (value) =>
    set({
      isAuthenticated: value,
    }),

  logout: () => {
    sessionStorage.removeItem("accessToken");

    set({
      isAuthenticated: false,
    });
  },
}));
