export interface BlogPost {
  slug: string
  title: string
  content: string
  excerpt: string
  images: string[]
  firstImage: string
  date: string
  category: string
  tags: string[]
  device?: string
  location?: string
  published: boolean
}

export interface BlogCategory {
  name: string
  slug: string
  count: number
}

export interface SiteConfig {
  name: string
  description: string
  author: string
  logo: string
  social: {
    home?: string
    weibo?: string
    github?: string
    email?: string
  }
  icp?: string
  police?: string
  analytics?: string
}

export interface BlogIndex {
  posts: BlogPost[]
  categories: BlogCategory[]
  config: SiteConfig
}
