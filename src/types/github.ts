export interface GitHubSyncConfig {
  enabled: boolean
  owner: string
  repo: string
  branch: string
  appId: string
  privateKey: string
}

export interface SyncResult {
  success: boolean
  message: string
  url?: string
}
