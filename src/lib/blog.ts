import { BlogPost, BlogIndex, BlogCategory, SiteConfig } from '@/types/blog'
import { GITHUB_CONFIG } from '@/consts'

const DATA_PATH = 'content'

function parseFrontmatter(content: string): { frontmatter: Record<string, any>; body: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)
  
  if (!match) {
    return { frontmatter: {}, body: content }
  }
  
  const frontmatterLines = match[1].split('\n')
  const frontmatter: Record<string, any> = {}
  
  for (const line of frontmatterLines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim()
      let value: string | string[] = line.slice(colonIndex + 1).trim()
      
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''))
      } else if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1)
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1)
      }
      
      frontmatter[key] = value
    }
  }
  
  return { frontmatter, body: match[2] }
}

function extractImages(content: string): string[] {
  const imgRegex = /!\[.*?\]\((.*?)\)/g
  const images: string[] = []
  let match
  while ((match = imgRegex.exec(content)) !== null) {
    images.push(match[1])
  }
  return images
}

function generateExcerpt(content: string, maxLength: number = 150): string {
  const plainText = content
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/[#*_`~]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
  
  if (plainText.length <= maxLength) return plainText
  return plainText.slice(0, maxLength) + '...'
}

export function parseBlogPost(slug: string, content: string): BlogPost {
  const { frontmatter, body } = parseFrontmatter(content)
  const images = extractImages(body)
  
  return {
    slug,
    title: frontmatter.title || 'Untitled',
    content: body,
    excerpt: generateExcerpt(body),
    images,
    firstImage: images[0] || '',
    date: frontmatter.date || new Date().toISOString(),
    category: frontmatter.category || 'default',
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    device: frontmatter.device,
    location: frontmatter.location,
    published: frontmatter.published !== false,
  }
}

export function createPostMarkdown(post: Partial<BlogPost>): string {
  const frontmatter = [
    '---',
    `title: "${post.title || ''}"`,
    `date: ${post.date || new Date().toISOString()}`,
    `category: ${post.category || 'default'}`,
    post.tags && post.tags.length > 0 ? `tags: [${post.tags.map(t => `"${t}"`).join(', ')}]` : '',
    post.device ? `device: "${post.device}"` : '',
    post.location ? `location: "${post.location}"` : '',
    `published: ${post.published !== false}`,
    '---',
    '',
  ].filter(Boolean).join('\n')
  
  return frontmatter + (post.content || '')
}

export async function loadBlogIndex(): Promise<BlogIndex> {
  try {
    const response = await fetch('/api/blog')
    if (!response.ok) throw new Error('Failed to load blog index')
    return await response.json()
  } catch (error) {
    console.error('Error loading blog index:', error)
    return {
      posts: [],
      categories: [],
      config: {
        name: 'TimePlus Blog',
        description: '一款简约的相册博客',
        author: 'TimePlus',
        logo: '/logo.png',
        social: {},
      },
    }
  }
}

export async function loadBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(`/api/blog/${slug}`)
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error('Failed to load blog post')
    }
    return await response.json()
  } catch (error) {
    console.error('Error loading blog post:', error)
    return null
  }
}
