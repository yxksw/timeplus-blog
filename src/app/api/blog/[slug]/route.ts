import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { parseBlogPost, createPostMarkdown } from '@/lib/blog'
import { verifyToken } from '@/lib/auth-server'

const CONTENT_DIR = path.join(process.cwd(), 'content')

async function ensureContentDir() {
  try {
    await fs.access(CONTENT_DIR)
  } catch {
    await fs.mkdir(CONTENT_DIR, { recursive: true })
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const filePath = path.join(CONTENT_DIR, `${slug}.md`)
    
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const post = parseBlogPost(slug, content)
      return NextResponse.json(post)
    } catch {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
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
    
    const { ...postData } = body
    
    if (!postData.title) {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 })
    }
    
    if (!postData.content) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 })
    }
    
    await ensureContentDir()
    
    const markdown = createPostMarkdown(postData)
    const filePath = path.join(CONTENT_DIR, `${slug}.md`)
    
    console.log('Writing file to:', filePath)
    await fs.writeFile(filePath, markdown, 'utf-8')
    
    return NextResponse.json({ success: true, slug, path: filePath })
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
    
    const { slug } = await params
    
    const filePath = path.join(CONTENT_DIR, `${slug}.md`)
    
    try {
      await fs.unlink(filePath)
    } catch {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/blog/[slug]:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
