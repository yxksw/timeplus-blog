import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  isAuthenticated: boolean
  privateKey: string | null
  setPrivateKey: (key: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      privateKey: null,
      setPrivateKey: (key) =>
        set({
          privateKey: key,
          isAuthenticated: !!key,
        }),
      logout: () =>
        set({
          privateKey: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        privateKey: state.privateKey,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
