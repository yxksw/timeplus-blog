export const INIT_DELAY = 0.3
export const ANIMATION_DELAY = 0.1
export const CARD_SPACING = 36
export const CARD_SPACING_SM = 24
export const BLOG_SLUG_KEY = process.env.BLOG_SLUG_KEY || ''

export const GITHUB_CONFIG = {
  OWNER: process.env.NEXT_PUBLIC_GITHUB_OWNER || '',
  REPO: process.env.NEXT_PUBLIC_GITHUB_REPO || '',
  BRANCH: process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main',
  APP_ID: process.env.NEXT_PUBLIC_GITHUB_APP_ID || '-',
  ENCRYPT_KEY: process.env.NEXT_PUBLIC_GITHUB_ENCRYPT_KEY || 'timeplus-blog-key',
} as const

export const SITE_CONFIG = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'TimePlus Blog',
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '一款简约的相册博客',
  author: process.env.NEXT_PUBLIC_SITE_AUTHOR || 'TimePlus',
  url: process.env.NEXT_PUBLIC_SITE_URL || '',
} as const
