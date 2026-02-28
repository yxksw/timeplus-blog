'use client'

import { SiteConfig } from '@/types/blog'
import { Home, Github, X } from 'lucide-react'

interface FooterProps {
  config?: SiteConfig
  isVisible?: boolean
  onClose?: () => void
}

export default function Footer({ config, isVisible, onClose }: FooterProps) {
  if (!isVisible) return null

  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        className="fixed inset-0 z-[10000]"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
        onClick={onClose}
      />
      
      {/* Footer Panel */}
      <footer 
        id="footer" 
        className="fixed bottom-20 left-0 right-0 bg-[#1d1e22] z-[10001] py-6 md:py-8 px-4 md:px-8"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          aria-label="关闭"
        >
          <X size={20} />
        </button>
        
        <div className="max-w-4xl mx-auto">
          {/* About Section */}
          <div className="mb-6">
            <h2 className="text-white text-base md:text-lg font-bold mb-2">
              关于{config?.name || 'TimePlus'}
            </h2>
            <p className="text-[#a0a0a1] text-sm leading-relaxed">
              {config?.description || '一款简约的相册博客'}
            </p>
          </div>
          
          {/* Contact Section */}
          <div className="mb-6">
            <h3 className="text-white text-sm font-medium mb-3">联系我</h3>
            <div className="flex gap-3">
              {config?.social?.home && (
                <a 
                  href={config.social.home} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1d1e22] hover:bg-[var(--heo-theme)] hover:text-white transition-colors"
                >
                  <Home size={18} />
                </a>
              )}
              {config?.social?.github && (
                <a 
                  href={config.social.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1d1e22] hover:bg-[var(--heo-theme)] hover:text-white transition-colors"
                >
                  <Github size={18} />
                </a>
              )}
            </div>
          </div>
          
          {/* Footer Info */}
          <div className="pt-4 border-t border-[#36383c] flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#b5b5b5]">
            <span>主题：<a href="https://github.com/zhheo/TimePlus" target="_blank" rel="noopener noreferrer" className="hover:text-white">洪墨时光</a></span>
            {config?.icp && (
              <span>
                <a href="http://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  {config.icp}
                </a>
              </span>
            )}
            {config?.police && (
              <span className="flex items-center gap-1">
                <img src="/police.png" alt="公安备案" className="w-3 h-3" />
                <a href="https://beian.mps.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  {config.police}
                </a>
              </span>
            )}
          </div>
        </div>
      </footer>
    </>
  )
}
