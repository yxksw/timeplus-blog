import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { GitHubSyncConfig } from '@/types/github'

interface GitHubConfigState {
  config: GitHubSyncConfig | null
  isConfigured: boolean
  setConfig: (config: GitHubSyncConfig) => void
  clearConfig: () => void
}

export const useGitHubConfigStore = create<GitHubConfigState>()(
  persist(
    (set) => ({
      config: null,
      isConfigured: false,
      setConfig: (config) =>
        set({
          config,
          isConfigured: !!(config.privateKey && config.owner && config.repo),
        }),
      clearConfig: () =>
        set({
          config: null,
          isConfigured: false,
        }),
    }),
    {
      name: 'github-sync-config',
    }
  )
)

export function getGitHubConfig(): GitHubSyncConfig | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem('github-sync-config')
  if (!stored) return null
  try {
    const parsed = JSON.parse(stored)
    return parsed.state?.config || null
  } catch {
    return null
  }
}
