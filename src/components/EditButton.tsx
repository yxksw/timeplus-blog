'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Settings, PenLine, FolderOpen, User, Github } from 'lucide-react'

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
          <Settings size={22} />
        </button>
        
        {showMenu && (
          <div className="absolute bottom-14 right-0 bg-[var(--heo-card-bg)] rounded-lg shadow-xl overflow-hidden min-w-[150px]">
            <Link
              href="/write"
              className="flex items-center gap-2 px-4 py-3 text-white hover:bg-white/10 transition-colors"
            >
              <PenLine size={18} />
              写文章
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-3 text-white hover:bg-white/10 transition-colors"
            >
              <FolderOpen size={18} />
              文章管理
            </Link>
            <Link
              href="/admin/config"
              className="flex items-center gap-2 px-4 py-3 text-white hover:bg-white/10 transition-colors"
            >
              <Settings size={18} />
              网站配置
            </Link>
            <Link
              href="/admin/github"
              className="flex items-center gap-2 px-4 py-3 text-white hover:bg-white/10 transition-colors"
            >
              <Github size={18} />
              GitHub 同步
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
