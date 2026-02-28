'use client'

import { SiteConfig } from '@/types/blog'

interface FooterProps {
  config?: SiteConfig
  isVisible?: boolean
  onClose?: () => void
}

export default function Footer({ config, isVisible, onClose }: FooterProps) {
  return (
    <footer 
      id="footer" 
      className={`fixed bottom-20 left-0 w-full bg-[rgba(36,38,41,0.975)] backdrop-blur-xl z-[10001] transition-transform duration-500 py-8 px-8 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 w-12 h-12 opacity-50 hover:opacity-100 transition-opacity"
        aria-label="关闭"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23fff' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 279.3l-82.1 82.1c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l82.1-82.1-82.1-82.1c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0L256 232.7l82.1-82.1c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17L293.9 256l82.1 82.1z'/%3E%3C/svg%3E")`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '2em',
        }}
      />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <section className="flex-1">
            <h2 className="text-white text-lg mb-4">关于 {config?.name || 'TimePlus'}</h2>
            <p className="text-[#a0a0a1] text-sm leading-relaxed">
              {config?.description || '一款简约的相册博客'}
            </p>
          </section>
          
          <section>
            <h2 className="text-white text-lg mb-4">联系我</h2>
            <ul className="flex gap-4">
              {config?.social?.home && (
                <li>
                  <a 
                    href={config.social.home} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1d1e22] hover:bg-[var(--heo-theme)] hover:text-white transition-colors"
                  >
                    <i className="iconfont icon-shouye text-xl"></i>
                  </a>
                </li>
              )}
              {config?.social?.weibo && (
                <li>
                  <a 
                    href={config.social.weibo} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1d1e22] hover:bg-[var(--heo-theme)] hover:text-white transition-colors"
                  >
                    <i className="iconfont icon-weibo text-xl"></i>
                  </a>
                </li>
              )}
              {config?.social?.github && (
                <li>
                  <a 
                    href={config.social.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1d1e22] hover:bg-[var(--heo-theme)] hover:text-white transition-colors"
                  >
                    <i className="iconfont icon-github text-xl"></i>
                  </a>
                </li>
              )}
            </ul>
          </section>
        </div>
        
        <div className="mt-8 pt-4 border-t border-[#36383c] flex flex-wrap items-center gap-4 text-sm text-[#b5b5b5]">
          <span>设计 ZHHEO & ZMKI</span>
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
              <img src="/police.png" alt="公安备案" className="w-4 h-4" />
              <a href="https://beian.mps.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                {config.police}
              </a>
            </span>
          )}
        </div>
      </div>
    </footer>
  )
}
