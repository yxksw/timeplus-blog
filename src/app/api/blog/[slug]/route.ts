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

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return false
  return verifyToken(token)
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
    if (!checkAuth(request)) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    
    const { slug } = await params
    const body = await request.json()
    const { ...postData } = body
    
    await ensureContentDir()
    
    const markdown = createPostMarkdown(postData)
    const filePath = path.join(CONTENT_DIR, `${slug}.md`)
    
    await fs.writeFile(filePath, markdown, 'utf-8')
    
    return NextResponse.json({ success: true, slug })
  } catch (error) {
    console.error('Error in PUT /api/blog/[slug]:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
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
