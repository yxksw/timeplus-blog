import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { SiteConfig } from '@/types/blog'

const CONTENT_DIR = path.join(process.cwd(), 'content')
const CONFIG_FILE = path.join(CONTENT_DIR, 'config.json')

const defaultConfig: SiteConfig = {
  name: 'TimePlus Blog',
  description: '一款简约的相册博客',
  author: 'TimePlus',
  logo: '/logo.png',
  social: {
    home: '',
    weibo: '',
    github: '',
  },
}

async function ensureContentDir() {
  try {
    await fs.access(CONTENT_DIR)
  } catch {
    await fs.mkdir(CONTENT_DIR, { recursive: true })
  }
}

export async function GET() {
  try {
    await ensureContentDir()
    const data = await fs.readFile(CONFIG_FILE, 'utf-8')
    const config = JSON.parse(data)
    return NextResponse.json(config)
  } catch {
    return NextResponse.json(defaultConfig)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { privateKey, ...config } = body as SiteConfig & { privateKey?: string }
    
    await ensureContentDir()
    await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8')
    
    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error('Error in PUT /api/config:', error)
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 })
  }
}
