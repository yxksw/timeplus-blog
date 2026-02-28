'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function EditButton() {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="fixed bottom-24 right-6 z-[10003]">
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-12 h-12 rounded-full bg-[var(--heo-theme)] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label="菜单"
        >
          <i className="iconfont icon-setting text-xl"></i>
        </button>
        
        {showMenu && (
          <div className="absolute bottom-14 right-0 bg-[var(--heo-card-bg)] rounded-lg shadow-xl overflow-hidden min-w-[150px]">
            <Link
              href="/write"
              className="block px-4 py-3 text-white hover:bg-white/10 transition-colors"
            >
              <i className="iconfont icon-edit mr-2"></i>
              写文章
            </Link>
            <Link
              href="/admin"
              className="block px-4 py-3 text-white hover:bg-white/10 transition-colors"
            >
              <i className="iconfont icon-folder mr-2"></i>
              文章管理
            </Link>
            <Link
              href="/admin/config"
              className="block px-4 py-3 text-white hover:bg-white/10 transition-colors"
            >
              <i className="iconfont icon-setting mr-2"></i>
              网站配置
            </Link>
            <Link
              href="/admin/login"
              className="block px-4 py-3 text-white hover:bg-white/10 transition-colors"
            >
              <i className="iconfont icon-user mr-2"></i>
              登录
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
