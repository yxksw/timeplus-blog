'use client'

import { SiteConfig, BlogIndex } from '@/types/blog'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Folder, Menu, X, User, ChevronDown, Maximize2, Minimize2 } from 'lucide-react'

interface HeaderProps {
  config?: SiteConfig
  onAboutClick?: () => void
}

export default function Header({ config, onAboutClick }: HeaderProps) {
  const [showCategories, setShowCategories] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [blogIndex, setBlogIndex] = useState<BlogIndex | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const categoryRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => setBlogIndex(data))
      .catch(() => {})
  }, [])

  // 点击外部关闭分类菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategories(false)
      }
    }

    if (showCategories) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCategories])

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <header className="site-header fixed bottom-0 left-0 w-full h-20 bg-[rgba(18,18,18,0.9)] backdrop-blur-xl z-[10002] flex items-center px-4 md:px-6 transition-transform duration-1000">
      <Link href="/" className="flex items-center gap-2 md:gap-4 min-w-0 flex-shrink-0">
        {config?.logo && (
          <img 
            src={config.logo} 
            alt={config?.name || 'Logo'} 
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
        )}
        <div className="min-w-0">
          <h1 className="text-sm md:text-base text-[#a0a0a1] m-0 truncate">
            <strong className="text-white font-bold">{config?.name || 'TimePlus'}</strong>
          </h1>
          {config?.description && (
            <span className="text-xs md:text-sm text-[#a0a0a1] ml-2 hidden lg:inline">
              {config.description}
            </span>
          )}
        </div>
      </Link>

      {/* Desktop Navigation */}
      <nav className="ml-auto hidden md:block">
        <ul className="flex items-center gap-1 lg:gap-2">
          {/* Categories Dropdown */}
          <li className="relative" ref={categoryRef}>
            <button 
              className="px-3 lg:px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center gap-1 lg:gap-2 text-sm lg:text-base"
              onClick={() => setShowCategories(!showCategories)}
            >
              <Folder size={16} className="lg:w-[18px] lg:h-[18px]" />
              <span>分类</span>
              <ChevronDown size={14} className={`transition-transform ${showCategories ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Categories Dropdown Menu */}
            {showCategories && blogIndex && blogIndex.categories.length > 0 && (
              <div 
                className="absolute bottom-full left-0 mb-2 bg-[rgba(18,18,18,0.95)] backdrop-blur-xl rounded-lg border border-[#36383c] py-2 min-w-[150px]"
              >
                {blogIndex.categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/?category=${cat.slug}`}
                    className="block px-4 py-2 text-white hover:bg-white/10 transition-colors text-sm whitespace-nowrap"
                    onClick={() => setShowCategories(false)}
                  >
                    {cat.name} ({cat.count})
                  </Link>
                ))}
              </div>
            )}
          </li>
          
          {/* Fullscreen Button */}
          <li>
            <button 
              onClick={toggleFullscreen}
              className="px-3 lg:px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center gap-1 lg:gap-2 text-sm lg:text-base"
              title={isFullscreen ? '退出全屏' : '全屏'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </li>
          
          <li>
            <button 
              onClick={onAboutClick}
              className="px-3 lg:px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center gap-1 lg:gap-2 text-sm lg:text-base"
            >
              <User size={16} className="lg:w-[18px] lg:h-[18px]" />
              <span>关于</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Mobile Menu Button */}
      <button 
        className="md:hidden ml-auto p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        aria-label="菜单"
      >
        {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden fixed bottom-20 left-0 right-0 bg-[rgba(18,18,18,0.95)] backdrop-blur-xl z-[10001] border-t border-[#36383c] max-h-[60vh] overflow-y-auto">
          <nav className="px-4 py-2">
            <ul className="flex flex-col gap-1">
              {/* Mobile Categories */}
              <li className="border-b border-[#36383c] pb-2 mb-2">
                <div className="px-4 py-2 text-[#a0a0a1] text-sm font-medium">分类</div>
                {blogIndex && blogIndex.categories.length > 0 ? (
                  blogIndex.categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/?category=${cat.slug}`}
                      className="block px-4 py-2 text-white hover:bg-white/10 transition-colors text-sm"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {cat.name} ({cat.count})
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-2 text-[#a0a0a1] text-sm">暂无分类</div>
                )}
              </li>
              
              {/* Mobile Fullscreen */}
              <li>
                <button 
                  onClick={() => {
                    toggleFullscreen()
                    setShowMobileMenu(false)
                  }}
                  className="w-full px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center gap-3 text-left"
                >
                  {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                  {isFullscreen ? '退出全屏' : '全屏'}
                </button>
              </li>
              
              <li>
                <button 
                  onClick={() => {
                    onAboutClick?.()
                    setShowMobileMenu(false)
                  }}
                  className="w-full px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors flex items-center gap-3 text-left"
                >
                  <User size={20} />
                  关于
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}
