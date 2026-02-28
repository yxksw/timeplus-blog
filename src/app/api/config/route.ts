import { NextRequest, NextResponse } from 'next/server'
import { SiteConfig } from '@/types/blog'
import { verifyToken } from '@/lib/auth-server'
import { GitHubSyncConfig } from '@/types/github'
import crypto from 'crypto'

const GITHUB_API = 'https://api.github.com'

function getEnvConfig(): GitHubSyncConfig | null {
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH || 'main'
  const appId = process.env.GITHUB_APP_ID
  let privateKey = process.env.GITHUB_PRIVATE_KEY
  
  if (!owner || !repo || !appId || !privateKey) {
    return null
  }
  
  privateKey = privateKey
    .replace(/\\n/g, '\n')
    .replace(/"/g, '')
  
  if (!privateKey.includes('-----BEGIN')) {
    privateKey = `-----BEGIN RSA PRIVATE KEY-----\n${privateKey}\n-----END RSA PRIVATE KEY-----`
  }
  
  return {
    enabled: true,
    owner,
    repo,
    branch,
    appId,
    privateKey,
  }
}

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return false
  return verifyToken(token)
}

function getJWT(appId: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000)
  
  const payload = {
    iat: now - 60,
    exp: now + 600,
    iss: appId,
  }
  
  const header = { alg: 'RS256', typ: 'JWT' }
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url')
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const data = `${headerB64}.${payloadB64}`
  
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(data)
  sign.end()
  
  const signature = sign.sign(privateKey, 'base64url')
  
  return `${data}.${signature}`
}

async function getInstallationToken(jwt: string, owner: string): Promise<string> {
  const installationsRes = await fetch(`${GITHUB_API}/app/installations`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  
  if (!installationsRes.ok) {
    throw new Error('Failed to get installations')
  }
  
  const installations = await installationsRes.json()
  const installation = installations.find((inst: any) => inst.account.login === owner)
  
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

async function loadConfigFromGitHub(token: string, config: GitHubSyncConfig): Promise<SiteConfig> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${config.owner}/${config.repo}/contents/content/config.json?ref=${config.branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.raw',
        },
      }
    )
    
    if (res.ok) {
      return await res.json()
    }
  } catch (error) {
    console.error('Error loading config from GitHub:', error)
  }
  
  return {
    name: 'TimePlus Blog',
    description: '一款简约的相册博客',
    author: 'TimePlus',
    logo: '/logo.png',
    social: {},
  }
}

async function saveConfigToGitHub(
  token: string,
  config: GitHubSyncConfig,
  siteConfig: SiteConfig
): Promise<void> {
  const path = 'content/config.json'
  
  // Get existing file SHA if it exists
  let sha: string | null = null
  const getRes = await fetch(
    `${GITHUB_API}/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
      },
    }
  )
  
  if (getRes.ok) {
    const existing = await getRes.json()
    sha = existing.sha
  }
  
  const body: any = {
    message: 'Update site config',
    content: Buffer.from(JSON.stringify(siteConfig, null, 2)).toString('base64'),
    branch: config.branch,
  }
  
  if (sha) {
    body.sha = sha
  }
  
  const res = await fetch(
    `${GITHUB_API}/repos/${config.owner}/${config.repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Failed to save config')
  }
}

export async function GET() {
  try {
    const githubConfig = getEnvConfig()
    
    if (!githubConfig) {
      return NextResponse.json({
        name: 'TimePlus Blog',
        description: '请配置 GitHub 环境变量',
        author: 'TimePlus',
        logo: '/logo.png',
        social: {},
      })
    }
    
    const jwt = getJWT(githubConfig.appId, githubConfig.privateKey)
    const token = await getInstallationToken(jwt, githubConfig.owner)
    const config = await loadConfigFromGitHub(token, githubConfig)
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error in GET /api/config:', error)
    return NextResponse.json({
      name: 'TimePlus Blog',
      description: '加载失败',
      author: 'TimePlus',
      logo: '/logo.png',
      social: {},
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    
    const githubConfig = getEnvConfig()
    
    if (!githubConfig) {
      return NextResponse.json({ error: 'GitHub 未配置' }, { status: 500 })
    }
    
    const body = await request.json()
    const siteConfig: SiteConfig = {
      name: body.name || 'TimePlus Blog',
      description: body.description || '',
      author: body.author || 'TimePlus',
      logo: body.logo || '/logo.png',
      social: body.social || {},
      icp: body.icp || '',
      police: body.police || '',
    }
    
    const jwt = getJWT(githubConfig.appId, githubConfig.privateKey)
    const token = await getInstallationToken(jwt, githubConfig.owner)
    await saveConfigToGitHub(token, githubConfig, siteConfig)
    
    return NextResponse.json({ success: true, config: siteConfig })
  } catch (error) {
    console.error('Error in PUT /api/config:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update config'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
