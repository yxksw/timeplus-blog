import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { BlogPost, BlogIndex, SiteConfig } from '@/types/blog'
import { parseBlogPost } from '@/lib/blog'

const CONTENT_DIR = path.join(process.cwd(), 'content')
const CONFIG_FILE = path.join(CONTENT_DIR, 'config.json')

async function ensureContentDir() {
  try {
    await fs.access(CONTENT_DIR)
  } catch {
    await fs.mkdir(CONTENT_DIR, { recursive: true })
  }
}

async function loadConfig(): Promise<SiteConfig> {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return {
      name: 'TimePlus Blog',
      description: '一款简约的相册博客',
      author: 'TimePlus',
      logo: '/logo.png',
      social: {},
    }
  }
}

async function loadPosts(): Promise<BlogPost[]> {
  await ensureContentDir()
  const posts: BlogPost[] = []
  
  try {
    const files = await fs.readdir(CONTENT_DIR)
    const mdFiles = files.filter(f => f.endsWith('.md'))
    
    for (const file of mdFiles) {
      const filePath = path.join(CONTENT_DIR, file)
      const content = await fs.readFile(filePath, 'utf-8')
      const slug = file.replace('.md', '')
      const post = parseBlogPost(slug, content)
      if (post.published) {
        posts.push(post)
      }
    }
  } catch (error) {
    console.error('Error loading posts:', error)
  }
  
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function GET(request: NextRequest) {
  try {
    const [posts, config] = await Promise.all([loadPosts(), loadConfig()])
    
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
      config,
    }
    
    return NextResponse.json(index)
  } catch (error) {
    console.error('Error in GET /api/blog:', error)
    return NextResponse.json({ error: 'Failed to load blog index' }, { status: 500 })
  }
}
