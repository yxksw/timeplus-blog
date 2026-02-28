import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { parseBlogPost, createPostMarkdown } from '@/lib/blog'
import { githubClient } from '@/lib/github-client'

const CONTENT_DIR = path.join(process.cwd(), 'content')

async function ensureContentDir() {
  try {
    await fs.access(CONTENT_DIR)
  } catch {
    await fs.mkdir(CONTENT_DIR, { recursive: true })
  }
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
    const { slug } = await params
    const body = await request.json()
    const { privateKey, ...postData } = body
    
    if (!privateKey) {
      return NextResponse.json({ error: 'Private key required' }, { status: 401 })
    }
    
    await ensureContentDir()
    
    const markdown = createPostMarkdown(postData)
    const filePath = path.join(CONTENT_DIR, `${slug}.md`)
    
    await fs.writeFile(filePath, markdown, 'utf-8')
    
    if (process.env.GITHUB_ENABLED === 'true') {
      try {
        githubClient.setPrivateKey(privateKey)
        await githubClient.createFile(
          `content/${slug}.md`,
          markdown,
          `Update post: ${postData.title}`
        )
      } catch (githubError) {
        console.error('GitHub sync failed:', githubError)
      }
    }
    
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
    const { slug } = await params
    const body = await request.json()
    const { privateKey } = body
    
    if (!privateKey) {
      return NextResponse.json({ error: 'Private key required' }, { status: 401 })
    }
    
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
