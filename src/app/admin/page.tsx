'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BlogPost, BlogIndex } from '@/types/blog'
import { formatDate } from '@/lib/utils'
import { useAdminStore, getAuthToken } from '@/lib/admin-auth'
import AuthGuard from '@/components/AuthGuard'
import { Plus, Settings, Github, LogOut, Edit, Trash2, ArrowLeft, FileText } from 'lucide-react'

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminContent />
    </AuthGuard>
  )
}

function AdminContent() {
  const router = useRouter()
  const { logout } = useAdminStore()
  const [blogIndex, setBlogIndex] = useState<BlogIndex | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadBlogIndex()
  }, [])

  const loadBlogIndex = async () => {
    try {
      const res = await fetch('/api/blog')
      if (res.ok) {
        const data = await res.json()
        setBlogIndex(data)
      }
    } catch (error) {
      console.error('Failed to load blog index:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (slug: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return
    
    setDeleting(slug)
    try {
      const token = getAuthToken()
      const res = await fetch(`/api/blog/${slug}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      })
      
      if (res.ok) {
        loadBlogIndex()
      } else {
        const error = await res.json()
        alert(`删除失败: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('删除失败')
    } finally {
      setDeleting(null)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#242629] flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#242629] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">文章管理</h1>
          <div className="flex flex-wrap gap-2 md:gap-4 w-full sm:w-auto">
            <Link
              href="/write"
              className="flex-1 sm:flex-none px-4 md:px-6 py-2 bg-[var(--heo-theme)] text-white rounded-lg hover:opacity-90 transition-opacity text-center text-sm md:text-base"
            >
              <Plus size={16} className="inline mr-1 md:hidden" />
              <span className="hidden md:inline">写文章</span>
              <span className="md:hidden">写文章</span>
            </Link>
            <Link
              href="/admin/config"
              className="flex-1 sm:flex-none px-4 md:px-6 py-2 bg-[#34363b] text-white rounded-lg hover:bg-[#404247] transition-colors text-center text-sm md:text-base"
            >
              <Settings size={16} className="inline mr-1 md:hidden" />
              <span className="hidden md:inline">网站配置</span>
              <span className="md:hidden">配置</span>
            </Link>
            <Link
              href="/admin/github"
              className="flex-1 sm:flex-none px-4 md:px-6 py-2 bg-[#34363b] text-white rounded-lg hover:bg-[#404247] transition-colors text-center text-sm md:text-base"
            >
              <Github size={16} className="inline mr-1" />
              <span className="hidden md:inline">GitHub</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-none px-4 md:px-6 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-center text-sm md:text-base"
            >
              <LogOut size={16} className="inline mr-1 md:hidden" />
              <span className="hidden md:inline">登出</span>
              <span className="md:hidden">登出</span>
            </button>
          </div>
        </div>

        {blogIndex && blogIndex.posts.length > 0 ? (
          <>
            <div className="hidden md:block bg-[#1d1e22] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#30343f]">
                  <tr>
                    <th className="px-6 py-4 text-left">标题</th>
                    <th className="px-6 py-4 text-left">分类</th>
                    <th className="px-6 py-4 text-left">日期</th>
                    <th className="px-6 py-4 text-left">图片</th>
                    <th className="px-6 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {blogIndex.posts.map((post) => (
                    <tr key={post.slug} className="border-t border-[#36383c]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {post.firstImage && (
                            <img
                              src={post.firstImage}
                              alt={post.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <span className="font-medium">{post.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-[var(--heo-theme-op)] rounded-full text-sm">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#a0a0a1]">
                        {formatDate(post.date)}
                      </td>
                      <td className="px-6 py-4 text-[#a0a0a1]">
                        {post.images.length} 张
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/write?edit=${post.slug}`}
                            className="px-4 py-2 bg-[#34363b] rounded hover:bg-[#404247] transition-colors text-sm"
                          >
                            编辑
                          </Link>
                          <button
                            onClick={() => handleDelete(post.slug)}
                            disabled={deleting === post.slug}
                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors text-sm disabled:opacity-50"
                          >
                            {deleting === post.slug ? '删除中...' : '删除'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-4">
              {blogIndex.posts.map((post) => (
                <div key={post.slug} className="bg-[#1d1e22] rounded-lg p-4">
                  <div className="flex gap-4">
                    {post.firstImage && (
                      <img
                        src={post.firstImage}
                        alt={post.title}
                        className="w-20 h-20 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{post.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2 py-1 bg-[var(--heo-theme-op)] rounded text-xs">
                          {post.category}
                        </span>
                        <span className="text-xs text-[#a0a0a1]">
                          {formatDate(post.date)}
                        </span>
                        <span className="text-xs text-[#a0a0a1]">
                          {post.images.length} 张图片
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-[#36383c]">
                    <Link
                      href={`/write?edit=${post.slug}`}
                      className="flex-1 py-2 bg-[#34363b] rounded text-center text-sm hover:bg-[#404247] transition-colors"
                    >
                      <Edit size={14} className="inline mr-1" />
                      编辑
                    </Link>
                    <button
                      onClick={() => handleDelete(post.slug)}
                      disabled={deleting === post.slug}
                      className="flex-1 py-2 bg-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={14} className="inline mr-1" />
                      {deleting === post.slug ? '删除中...' : '删除'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <FileText size={48} className="mx-auto text-[#a0a0a1] mb-4" />
            <p className="text-[#a0a0a1] mb-4">暂无文章</p>
            <Link
              href="/write"
              className="px-6 py-2 bg-[var(--heo-theme)] text-white rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              <Plus size={16} />
              写第一篇文章
            </Link>
          </div>
        )}

        {blogIndex && blogIndex.categories.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">分类统计</h2>
            <div className="flex flex-wrap gap-3">
              {blogIndex.categories.map((cat) => (
                <span
                  key={cat.slug}
                  className="px-4 py-2 bg-[#1d1e22] rounded-lg"
                >
                  {cat.name} ({cat.count})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
