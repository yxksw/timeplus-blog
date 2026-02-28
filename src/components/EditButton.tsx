'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Settings, PenLine, FolderOpen, Github, X } from 'lucide-react'

export default function EditButton() {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="edit-button" onClick={() => setShowMenu(!showMenu)}>
      {showMenu ? <X size={24} /> : <Settings size={24} />}
      
      {showMenu && (
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={() => setShowMenu(false)}
        />
      )}
      
      {showMenu && (
        <div 
          className="absolute bottom-16 right-0 bg-[var(--heo-card-bg)] rounded-lg shadow-xl overflow-hidden min-w-[160px] border border-[var(--heo-card-border)]"
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href="/write"
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors"
            onClick={() => setShowMenu(false)}
          >
            <PenLine size={18} />
            <span>写文章</span>
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors"
            onClick={() => setShowMenu(false)}
          >
            <FolderOpen size={18} />
            <span>文章管理</span>
          </Link>
          <Link
            href="/admin/config"
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors"
            onClick={() => setShowMenu(false)}
          >
            <Settings size={18} />
            <span>网站配置</span>
          </Link>
          <Link
            href="/admin/github"
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors"
            onClick={() => setShowMenu(false)}
          >
            <Github size={18} />
            <span>GitHub 同步</span>
          </Link>
        </div>
      )}
    </div>
  )
}
