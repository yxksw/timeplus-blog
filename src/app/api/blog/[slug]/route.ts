import { NextRequest, NextResponse } from 'next/server'
import { parseBlogPost } from '@/lib/blog'
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

function checkAuth(request: NextRequest): { valid: boolean; error?: string } {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return { valid: false, error: '缺少授权头' }
  }
  
  const token = authHeader.replace('Bearer ', '')
  if (!token) {
    return { valid: false, error: 'Token 为空' }
  }
  
  const isValid = verifyToken(token)
  if (!isValid) {
    return { valid: false, error: 'Token 无效或已过期' }
  }
  
  return { valid: true }
}

function createPostMarkdown(post: any): string {
  const frontmatter = [
    '---',
    `title: "${post.title || ''}"`,
    `date: ${post.date || new Date().toISOString()}`,
    `category: ${post.category || 'default'}`,
    post.tags && post.tags.length > 0 ? `tags: [${post.tags.map((t: string) => `"${t}"`).join(', ')}]` : '',
    post.device ? `device: "${post.device}"` : '',
    post.location ? `location: "${post.location}"` : '',
    `published: ${post.published !== false}`,
    '---',
    '',
  ].filter(Boolean).join('\n')
  
  return frontmatter + (post.content || '')
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

async function saveToGitHub(config: GitHubSyncConfig, slug: string, markdown: string, message: string): Promise<string> {
  const jwt = getJWT(config.appId, config.privateKey)
  const token = await getInstallationToken(jwt, config.owner)
  
  const path = `content/${slug}.md`
  
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
    content: Buffer.from(markdown).toString('base64'),
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
    throw new Error(error.message || '保存失败')
  }
  
  const result = await res.json()
  return result.content?.html_url || `https://github.com/${config.owner}/${config.repo}/blob/${config.branch}/${path}`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const config = getEnvConfig()
    
    if (config) {
      const jwt = getJWT(config.appId, config.privateKey)
      const token = await getInstallationToken(jwt, config.owner)
      
      const res = await fetch(
        `${GITHUB_API}/repos/${config.owner}/${config.repo}/contents/content/${slug}.md?ref=${config.branch}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.raw',
          },
        }
      )
      
      if (res.ok) {
        const content = await res.text()
        const post = parseBlogPost(slug, content)
        return NextResponse.json(post)
      }
    }
    
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  } catch (error) {
    console.error('Error in GET /api/blog/[slug]:', error)
    return NextResponse.json({ error: 'Failed to load post' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authCheck = checkAuth(request)
    if (!authCheck.valid) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 })
    }
    
    const config = getEnvConfig()
    if (!config) {
      return NextResponse.json({ error: 'GitHub 未配置，请设置环境变量' }, { status: 500 })
    }
    
    const { slug } = await params
    
    if (!slug || slug.trim() === '') {
      return NextResponse.json({ error: 'Slug 不能为空' }, { status: 400 })
    }
    
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: '请求体解析失败' }, { status: 400 })
    }
    
    if (!body.title) {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 })
    }
    
    if (!body.content) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 })
    }
    
    const markdown = createPostMarkdown(body)
    const message = `${body.isEdit ? 'Update' : 'Create'} post: ${body.title}`
    
    const url = await saveToGitHub(config, slug, markdown, message)
    
    return NextResponse.json({ success: true, slug, url })
  } catch (error) {
    console.error('Error in PUT /api/blog/[slug]:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Failed to update post', 
      details: errorMessage 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authCheck = checkAuth(request)
    if (!authCheck.valid) {
      return NextResponse.json({ error: authCheck.error }, { status: 401 })
    }
    
    const config = getEnvConfig()
    if (!config) {
      return NextResponse.json({ error: 'GitHub 未配置' }, { status: 500 })
    }
    
    const { slug } = await params
    const path = `content/${slug}.md`
    
    const jwt = getJWT(config.appId, config.privateKey)
    const token = await getInstallationToken(jwt, config.owner)
    
    const getRes = await fetch(
      `${GITHUB_API}/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github+json',
        },
      }
    )
    
    if (!getRes.ok) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    const existing = await getRes.json()
    
    const res = await fetch(
      `${GITHUB_API}/repos/${config.owner}/${config.repo}/contents/${path}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Delete post: ${slug}`,
          sha: existing.sha,
          branch: config.branch,
        }),
      }
    )
    
    if (!res.ok) {
      return NextResponse.json({ error: '删除失败' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/blog/[slug]:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
