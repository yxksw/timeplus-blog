'use client'

import { SiteConfig } from '@/types/blog'
import { Home, Github, Mail } from 'lucide-react'

interface FooterProps {
  config?: SiteConfig
  isVisible?: boolean
  onClose?: () => void
}

export default function Footer({ config, isVisible, onClose }: FooterProps) {
  return (
    <div 
      className={`panel ${isVisible ? 'active' : ''}`}
      id="footer"
    >
      <button 
        className="closer"
        onClick={onClose}
        aria-label="关闭"
      />
      
      <div className="inner">
        <div className="split">
          <div id="about">
            <section>
              <h2 className="text-white text-lg mb-4">关于 {config?.name || 'TimePlus'}</h2>
              <p className="text-[#a0a0a1] text-sm leading-relaxed">
                {config?.description || '一款简约的相册博客'}
              </p>
            </section>
            
            <section>
              <h2 className="text-white text-lg mb-4">联系我</h2>
              <ul className="icons">
                {config?.social?.home && (
                  <li>
                    <a 
                      href={config.social.home} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="iconfont"
                    >
                      <Home size={20} />
                    </a>
                  </li>
                )}
                {config?.social?.github && (
                  <li>
                    <a 
                      href={config.social.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="iconfont"
                    >
                      <Github size={20} />
                    </a>
                  </li>
                )}
                {config?.social?.email && (
                  <li>
                    <a 
                      href={`mailto:${config.social.email}`}
                      className="iconfont"
                    >
                      <Mail size={20} />
                    </a>
                  </li>
                )}
              </ul>
            </section>
          </div>
        </div>
        
        <div className="copyright">
          <div className="copyright-info">
            <span>设计 ZHHEO & ZMKI</span>
            <span>主题：<a href="https://github.com/zhheo/TimePlus" target="_blank" rel="noopener noreferrer">洪墨时光</a></span>
            {config?.icp && (
              <span>
                <a href="http://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
                  {config.icp}
                </a>
              </span>
            )}
            {config?.police && (
              <span className="police">
                <img src="/police.png" alt="公安备案" className="w-4 h-4" />
                <a href="https://beian.mps.gov.cn/" target="_blank" rel="noopener noreferrer">
                  {config.police}
                </a>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
