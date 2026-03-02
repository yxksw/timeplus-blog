import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AdminState {
  isAuthenticated: boolean
  token: string | null
  hasSecretKey: boolean
  login: (token: string, hasSecretKey?: boolean) => void
  logout: () => void
  checkAuth: () => boolean
  checkCanCreatePost: () => boolean
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      hasSecretKey: false,
      login: (token: string, hasSecretKey: boolean = false) => {
        set({
          isAuthenticated: true,
          token,
          hasSecretKey,
        })
      },
      logout: () => {
        set({
          isAuthenticated: false,
          token: null,
          hasSecretKey: false,
        })
      },
      checkAuth: () => {
        const state = get()
        return state.isAuthenticated && !!state.token
      },
      checkCanCreatePost: () => {
        const state = get()
        return state.isAuthenticated && !!state.token && state.hasSecretKey
      },
    }),
    {
      name: 'admin-auth-storage',
    }
  )
)

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem('admin-auth-storage')
  if (!stored) return null
  try {
    const parsed = JSON.parse(stored)
    return parsed.state?.token || null
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem('admin-auth-storage')
  if (!stored) return false
  try {
    const parsed = JSON.parse(stored)
    return parsed.state?.isAuthenticated && !!parsed.state?.token
  } catch {
    return false
  }
}
