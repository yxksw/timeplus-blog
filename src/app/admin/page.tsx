'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BlogPost, BlogIndex } from '@/types/blog'
import { formatDate } from '@/lib/utils'
import { useAdminStore, getAuthToken } from '@/lib/admin-auth'
import AuthGuard from '@/components/AuthGuard'

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
    <div className="min-h-screen bg-[#242629] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">文章管理</h1>
          <div className="flex gap-4">
            <Link
              href="/write"
              className="px-6 py-2 bg-[var(--heo-theme)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              写文章
            </Link>
            <Link
              href="/admin/config"
              className="px-6 py-2 bg-[#34363b] text-white rounded-lg hover:bg-[#404247] transition-colors"
            >
              网站配置
            </Link>
            <Link
              href="/admin/github"
              className="px-6 py-2 bg-[#34363b] text-white rounded-lg hover:bg-[#404247] transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </Link>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              登出
            </button>
          </div>
        </div>

        {blogIndex && blogIndex.posts.length > 0 ? (
          <div className="bg-[#1d1e22] rounded-lg overflow-hidden">
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
        ) : (
          <div className="text-center py-20">
            <p className="text-[#a0a0a1] mb-4">暂无文章</p>
            <Link
              href="/write"
              className="px-6 py-2 bg-[var(--heo-theme)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
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
