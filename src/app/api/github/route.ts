import { NextRequest, NextResponse } from 'next/server'
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
  if (!authHeader) return false
  const token = authHeader.replace('Bearer ', '')
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
    },
  })
  
  if (!installationsRes.ok) {
    const errorText = await installationsRes.text()
    console.error('Installations error:', errorText)
    throw new Error('Failed to get installations')
  }
  
  const installations = await installationsRes.json()
  const installation = installations.find((inst: any) => inst.account.login === owner)
  
  if (!installation) {
    throw new Error('Installation not found for this owner')
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

export async function GET(request: NextRequest) {
  const envConfig = getEnvConfig()
  return NextResponse.json({
    hasEnvConfig: !!envConfig,
    config: envConfig ? {
      enabled: envConfig.enabled,
      owner: envConfig.owner,
      repo: envConfig.repo,
      branch: envConfig.branch,
      appId: envConfig.appId,
    } : null,
  })
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    
    const envConfig = getEnvConfig()
    const body = await request.json()
    const { action, config: clientConfig, path, content, message } = body
    
    const config = envConfig || clientConfig
    
    if (!config) {
      return NextResponse.json({ 
        success: false, 
        message: '未配置 GitHub 信息，请设置环境变量或在页面配置' 
      }, { status: 400 })
    }
    
    if (action === 'test') {
      return await testConnection(config)
    }
    
    if (action === 'sync') {
      return await syncToGitHub(config, path, content, message)
    }
    
    return NextResponse.json({ error: '未知操作' }, { status: 400 })
  } catch (error) {
    console.error('GitHub sync error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      success: false, 
      message: errorMessage 
    }, { status: 500 })
  }
}

async function testConnection(config: GitHubSyncConfig): Promise<NextResponse> {
  try {
    const jwt = getJWT(config.appId, config.privateKey)
    const token = await getInstallationToken(jwt, config.owner)
    
    const res = await fetch(
      `${GITHUB_API}/repos/${config.owner}/${config.repo}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github+json',
        },
      }
    )
    
    if (!res.ok) {
      throw new Error('无法访问仓库')
    }
    
    const repo = await res.json()
    
    return NextResponse.json({
      success: true,
      message: `连接成功: ${repo.full_name}`,
      repo: {
        name: repo.name,
        fullName: repo.full_name,
        private: repo.private,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '连接失败'
    return NextResponse.json({
      success: false,
      message: errorMessage,
    })
  }
}

async function syncToGitHub(
  config: GitHubSyncConfig,
  path: string,
  content: string,
  message: string
): Promise<NextResponse> {
  try {
    const jwt = getJWT(config.appId, config.privateKey)
    const token = await getInstallationToken(jwt, config.owner)
    
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
      message,
      content: Buffer.from(content).toString('base64'),
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
      throw new Error(error.message || '同步失败')
    }
    
    const result = await res.json()
    
    return NextResponse.json({
      success: true,
      message: '同步成功',
      url: result.content?.html_url || `https://github.com/${config.owner}/${config.repo}/blob/${config.branch}/${path}`,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '同步失败'
    return NextResponse.json({
      success: false,
      message: errorMessage,
    })
  }
}
