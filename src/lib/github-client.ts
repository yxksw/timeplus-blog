import { GITHUB_CONFIG } from '@/consts'

const GITHUB_API = 'https://api.github.com'

interface GitHubFile {
  name: string
  path: string
  sha: string
  content: string
  encoding: string
}

interface GitHubTreeItem {
  path: string
  mode: string
  type: string
  sha: string
  size?: number
  url?: string
}

export class GitHubClient {
  private owner: string
  private repo: string
  private branch: string
  private privateKey: string | null = null
  private appId: string
  private token: string | null = null

  constructor() {
    this.owner = GITHUB_CONFIG.OWNER
    this.repo = GITHUB_CONFIG.REPO
    this.branch = GITHUB_CONFIG.BRANCH
    this.appId = GITHUB_CONFIG.APP_ID
  }

  setPrivateKey(key: string) {
    this.privateKey = key
    this.token = null
  }

  clearAuth() {
    this.privateKey = null
    this.token = null
  }

  private async getJWT(): Promise<string> {
    if (!this.privateKey) {
      throw new Error('Private key not set')
    }

    const now = Math.floor(Date.now() / 1000)
    const payload = {
      iat: now - 60,
      exp: now + 600,
      iss: this.appId,
    }

    const header = { alg: 'RS256', typ: 'JWT' }

    const encoder = new TextEncoder()
    const data = encoder.encode(
      btoa(JSON.stringify(header)) + '.' + btoa(JSON.stringify(payload))
    )

    const key = await crypto.subtle.importKey(
      'pkcs8',
      this.pemToArrayBuffer(this.privateKey),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, data)
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))

    return btoa(JSON.stringify(header)) + '.' + btoa(JSON.stringify(payload)) + '.' + signatureBase64
  }

  private pemToArrayBuffer(pem: string): ArrayBuffer {
    const b64 = pem
      .replace(/-----BEGIN RSA PRIVATE KEY-----/g, '')
      .replace(/-----END RSA PRIVATE KEY-----/g, '')
      .replace(/-----BEGIN PRIVATE KEY-----/g, '')
      .replace(/-----END PRIVATE KEY-----/g, '')
      .replace(/\s/g, '')

    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  private async getInstallationToken(): Promise<string> {
    const jwt = await this.getJWT()

    const installationsRes = await fetch(`${GITHUB_API}/app/installations`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/vnd.github+json',
      },
    })

    if (!installationsRes.ok) {
      throw new Error('Failed to get installations')
    }

    const installations = await installationsRes.json()
    const installation = installations.find(
      (inst: any) => inst.account.login === this.owner
    )

    if (!installation) {
      throw new Error('Installation not found')
    }

    const tokenRes = await fetch(
      `${GITHUB_API}/app/installations/${installation.id}/access_tokens`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwt}`,
          Accept: 'application/vnd.github+json',
        },
      }
    )

    if (!tokenRes.ok) {
      throw new Error('Failed to get installation token')
    }

    const tokenData = await tokenRes.json()
    return tokenData.token
  }

  private async ensureToken() {
    if (!this.token) {
      this.token = await this.getInstallationToken()
    }
    return this.token
  }

  async getFile(path: string): Promise<GitHubFile | null> {
    const token = await this.ensureToken()
    const res = await fetch(
      `${GITHUB_API}/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.raw',
        },
      }
    )

    if (!res.ok) {
      if (res.status === 404) return null
      throw new Error(`Failed to get file: ${res.statusText}`)
    }

    const content = await res.text()
    const shaRes = await fetch(
      `${GITHUB_API}/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github+json',
        },
      }
    )
    const shaData = await shaRes.json()

    return {
      name: shaData.name,
      path: shaData.path,
      sha: shaData.sha,
      content: content,
      encoding: 'utf-8',
    }
  }

  async createFile(path: string, content: string, message: string): Promise<void> {
    const token = await this.ensureToken()
    const res = await fetch(
      `${GITHUB_API}/repos/${this.owner}/${this.repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          content: btoa(unescape(encodeURIComponent(content))),
          branch: this.branch,
        }),
      }
    )

    if (!res.ok) {
      const error = await res.json()
      throw new Error(`Failed to create file: ${error.message}`)
    }
  }

  async updateFile(
    path: string,
    content: string,
    message: string,
    sha: string
  ): Promise<void> {
    const token = await this.ensureToken()
    const res = await fetch(
      `${GITHUB_API}/repos/${this.owner}/${this.repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          content: btoa(unescape(encodeURIComponent(content))),
          sha,
          branch: this.branch,
        }),
      }
    )

    if (!res.ok) {
      const error = await res.json()
      throw new Error(`Failed to update file: ${error.message}`)
    }
  }

  async deleteFile(path: string, message: string, sha: string): Promise<void> {
    const token = await this.ensureToken()
    const res = await fetch(
      `${GITHUB_API}/repos/${this.owner}/${this.repo}/contents/${path}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sha,
          branch: this.branch,
        }),
      }
    )

    if (!res.ok) {
      const error = await res.json()
      throw new Error(`Failed to delete file: ${error.message}`)
    }
  }

  async listFiles(path: string): Promise<GitHubTreeItem[]> {
    const token = await this.ensureToken()
    const res = await fetch(
      `${GITHUB_API}/repos/${this.owner}/${this.repo}/contents/${path}?ref=${this.branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github+json',
        },
      }
    )

    if (!res.ok) {
      if (res.status === 404) return []
      throw new Error(`Failed to list files: ${res.statusText}`)
    }

    return await res.json()
  }

  async uploadImage(path: string, imageBase64: string, message: string): Promise<string> {
    const token = await this.ensureToken()
    const res = await fetch(
      `${GITHUB_API}/repos/${this.owner}/${this.repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          content: imageBase64,
          branch: this.branch,
        }),
      }
    )

    if (!res.ok) {
      const error = await res.json()
      throw new Error(`Failed to upload image: ${error.message}`)
    }

    const data = await res.json()
    return data.content.download_url
  }
}

export const githubClient = new GitHubClient()
