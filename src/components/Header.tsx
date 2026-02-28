'use client'

import { SiteConfig } from '@/types/blog'
import Link from 'next/link'
import { useState } from 'react'
import { Folder, PenLine, Settings } from 'lucide-react'

interface HeaderProps {
  config?: SiteConfig
  onAboutClick?: () => void
}

export default function Header({ config, onAboutClick }: HeaderProps) {
  const [showCategories, setShowCategories] = useState(false)

  return (
    <header className="site-header fixed bottom-0 left-0 w-full h-20 bg-[rgba(18,18,18,0.8)] backdrop-blur-xl z-[10002] flex items-center px-6 transition-transform duration-1000">
      <Link href="/" className="flex items-center gap-4">
        {config?.logo && (
          <img 
            src={config.logo} 
            alt={config?.name || 'Logo'} 
            className="w-8 h-8 rounded-full"
          />
        )}
        <h1 className="text-base text-[#a0a0a1] m-0">
          <strong className="text-white font-bold">{config?.name || 'TimePlus'}</strong>
        </h1>
        {config?.description && (
          <span className="text-sm text-[#a0a0a1] ml-2 hidden md:inline">
            {config.description}
          </span>
        )}
      </Link>

      <nav className="ml-auto">
        <ul className="flex items-center gap-2">
          <li 
            className="relative"
            onMouseEnter={() => setShowCategories(true)}
            onMouseLeave={() => setShowCategories(false)}
          >
            <button className="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center gap-2">
              <Folder size={18} />
              分类
            </button>
          </li>
          
          <li>
            <Link 
              href="/write" 
              className="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <PenLine size={18} />
              写文章
            </Link>
          </li>
          
          <li>
            <Link 
              href="/admin" 
              className="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center gap-2"
            >
              <Settings size={18} />
              管理
            </Link>
          </li>
          
          <li>
            <button 
              onClick={onAboutClick}
              className="px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              关于
            </button>
          </li>
        </ul>
      </nav>
    </header>
  )
}
