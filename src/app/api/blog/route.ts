import { NextRequest, NextResponse } from 'next/server'
import { BlogPost, BlogIndex, SiteConfig } from '@/types/blog'
import { parseBlogPost } from '@/lib/blog'
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

async function loadPostsFromGitHub(token: string, config: GitHubSyncConfig): Promise<BlogPost[]> {
  const posts: BlogPost[] = []
  
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${config.owner}/${config.repo}/contents/content?ref=${config.branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github+json',
        },
      }
    )
    
    if (!res.ok) {
      console.error('Failed to list content directory')
      return posts
    }
    
    const files = await res.json()
    const mdFiles = files.filter((f: any) => f.name.endsWith('.md') && f.name !== 'config.md')
    
    for (const file of mdFiles) {
      const fileRes = await fetch(file.url, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.raw',
        },
      })
      
      if (fileRes.ok) {
        const content = await fileRes.text()
        const slug = file.name.replace('.md', '')
        const post = parseBlogPost(slug, content)
        if (post.published) {
          posts.push(post)
        }
      }
    }
  } catch (error) {
    console.error('Error loading posts from GitHub:', error)
  }
  
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function GET(request: NextRequest) {
  try {
    const config = getEnvConfig()
    
    if (!config) {
      return NextResponse.json({
        posts: [],
        categories: [],
        config: {
          name: 'TimePlus Blog',
          description: '请配置 GitHub 环境变量',
          author: 'TimePlus',
          logo: '/logo.png',
          social: {},
        },
      })
    }
    
    const jwt = getJWT(config.appId, config.privateKey)
    const token = await getInstallationToken(jwt, config.owner)
    
    const [posts, siteConfig] = await Promise.all([
      loadPostsFromGitHub(token, config),
      loadConfigFromGitHub(token, config),
    ])
    
    const categories = posts.reduce((acc, post) => {
      const existing = acc.find(c => c.name === post.category)
      if (existing) {
        existing.count++
      } else {
        acc.push({ name: post.category, slug: post.category.toLowerCase(), count: 1 })
      }
      return acc
    }, [] as { name: string; slug: string; count: number }[])
    
    const index: BlogIndex = {
      posts,
      categories,
      config: siteConfig,
    }
    
    return NextResponse.json(index)
  } catch (error) {
    console.error('Error in GET /api/blog:', error)
    return NextResponse.json({ 
      error: 'Failed to load blog index',
      posts: [],
      categories: [],
      config: {
        name: 'TimePlus Blog',
        description: '加载失败',
        author: 'TimePlus',
        logo: '/logo.png',
        social: {},
      },
    }, { status: 500 })
  }
}
