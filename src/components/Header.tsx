'use client'

import { SiteConfig } from '@/types/blog'
import Link from 'next/link'
import { useState } from 'react'
import { Folder, PenLine, Settings, Menu, X } from 'lucide-react'

interface HeaderProps {
  config?: SiteConfig
  onAboutClick?: () => void
}

export default function Header({ config, onAboutClick }: HeaderProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <header id="header">
      <Link href="/" className="flex items-center">
        {config?.logo && (
          <img 
            src={config.logo} 
            alt={config?.name || 'Logo'} 
            className="site-logo"
          />
        )}
        <h1>
          <a href="/">{config?.name || 'TimePlus'}</a>
        </h1>
        {config?.description && (
          <span className="discription hidden md:inline">
            {config.description}
          </span>
        )}
      </Link>

      <nav>
        <ul className="hidden md:flex">
          <li>
            <Link href="/write">
              <PenLine size={16} className="inline mr-1" />
              写文章
            </Link>
          </li>
          
          <li>
            <Link href="/admin">
              <Settings size={16} className="inline mr-1" />
              管理
            </Link>
          </li>
          
          <li>
            <button onClick={onAboutClick}>
              关于
            </button>
          </li>
        </ul>
        
        <ul className="flex md:hidden">
          <li>
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </li>
        </ul>
      </nav>
      
      {showMobileMenu && (
        <div className="fixed inset-0 top-[60px] bg-[rgba(18,18,18,0.95)] z-[10001] md:hidden">
          <nav className="flex flex-col items-center justify-center h-full gap-4">
            <Link 
              href="/write" 
              className="text-white text-lg py-3 px-6"
              onClick={() => setShowMobileMenu(false)}
            >
              <PenLine size={18} className="inline mr-2" />
              写文章
            </Link>
            <Link 
              href="/admin" 
              className="text-white text-lg py-3 px-6"
              onClick={() => setShowMobileMenu(false)}
            >
              <Settings size={18} className="inline mr-2" />
              管理
            </Link>
            <button 
              className="text-white text-lg py-3 px-6"
              onClick={() => {
                setShowMobileMenu(false)
                onAboutClick?.()
              }}
            >
              关于
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
