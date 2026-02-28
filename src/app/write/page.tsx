'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BlogPost } from '@/types/blog'
import { useAdminStore, getAuthToken } from '@/lib/admin-auth'
import { useGitHubConfigStore, getGitHubConfig } from '@/lib/github-config'
import { createPostMarkdown } from '@/lib/blog'
import AuthGuard from '@/components/AuthGuard'
import { slugify } from '@/lib/utils'
import { Github, Loader2, Check, ExternalLink } from 'lucide-react'

function WriteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editSlug = searchParams.get('edit')
  const { isAuthenticated } = useAdminStore()
  const { isConfigured } = useGitHubConfigStore()
  const [loading, setLoading] = useState(false)
  const [loadingPost, setLoadingPost] = useState(!!editSlug)
  const [syncToGitHub, setSyncToGitHub] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string; url?: string } | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    category: '',
    tags: '',
    device: '',
    location: '',
  })
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    const newSlug = slugify(formData.title || 'untitled')
    setFormData(prev => ({ ...prev, slug: newSlug }))
  }, [formData.title])

  useEffect(() => {
    const imgRegex = /!\[.*?\]\((.*?)\)/g
    const foundImages: string[] = []
    let match
    while ((match = imgRegex.exec(formData.content)) !== null) {
      foundImages.push(match[1])
    }
    setImages(foundImages)
  }, [formData.content])

  useEffect(() => {
    if (editSlug) {
      loadPost(editSlug)
    }
  }, [editSlug])

  const loadPost = async (slug: string) => {
    try {
      const res = await fetch(`/api/blog/${slug}`)
      if (res.ok) {
        const post: BlogPost = await res.json()
        setFormData({
          title: post.title,
          slug: post.slug,
          content: post.content,
          category: post.category,
          tags: post.tags.join(', '),
          device: post.device || '',
          location: post.location || '',
        })
      }
    } catch (error) {
      console.error('Failed to load post:', error)
    } finally {
      setLoadingPost(false)
    }
  }

  const syncToGitHubRepo = async (postData: Partial<BlogPost>, markdown: string) => {
    const gitHubConfig = getGitHubConfig()
    if (!gitHubConfig || !gitHubConfig.enabled) return

    setSyncing(true)
    try {
      const token = getAuthToken()
      const res = await fetch('/api/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'sync',
          config: gitHubConfig,
          path: `content/${postData.slug}.md`,
          content: markdown,
          message: `${editSlug ? 'Update' : 'Create'} post: ${postData.title}`,
        }),
      })

      const data = await res.json()
      setSyncResult({ success: data.success, message: data.message, url: data.url })
    } catch (error) {
      setSyncResult({ success: false, message: 'GitHub 同步失败' })
    } finally {
      setSyncing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.content) {
      alert('请填写标题和内容')
      return
    }

    setLoading(true)
    setSyncResult(null)
    
    try {
      const postData: Partial<BlogPost> = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        category: formData.category || 'default',
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        device: formData.device,
        location: formData.location,
        date: new Date().toISOString(),
        published: true,
      }

      const token = getAuthToken()
      const res = await fetch(`/api/blog/${formData.slug}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      })

      if (res.ok) {
        if (syncToGitHub) {
          const markdown = createPostMarkdown(postData)
          await syncToGitHubRepo(postData, markdown)
        }
        
        if (!syncToGitHub || syncResult?.success !== false) {
          alert(editSlug ? '文章更新成功！' : '文章发布成功！')
          router.push('/admin')
        }
      } else {
        const error = await res.json()
        alert(`发布失败: ${error.error}`)
      }
    } catch (error) {
      console.error('Error publishing post:', error)
      alert('发布失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const insertImage = (url: string) => {
    const markdown = `![image](${url})`
    setFormData(prev => ({
      ...prev,
      content: prev.content + '\n' + markdown
    }))
  }

  if (loadingPost) {
    return (
      <div className="min-h-screen bg-[#242629] flex items-center justify-center">
        <div className="text-white">加载文章中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#242629] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{editSlug ? '编辑文章' : '写文章'}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm mb-2">标题 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none"
              placeholder="输入文章标题"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Slug（URL路径）</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none"
              placeholder="article-slug"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">分类</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none"
                placeholder="default"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">标签（逗号分隔）</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none"
                placeholder="tag1, tag2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">设备</label>
              <input
                type="text"
                value={formData.device}
                onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none"
                placeholder="iPhone 15 Pro"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">地点</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none"
                placeholder="北京"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">内容（Markdown格式）*</label>
            <div className="mb-2">
              <input
                type="text"
                placeholder="输入图片URL，按回车添加"
                className="px-4 py-2 bg-[#34363b] border border-[#36383c] rounded-lg text-white text-sm w-64"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const target = e.target as HTMLInputElement
                    if (target.value.trim()) {
                      insertImage(target.value.trim())
                      target.value = ''
                    }
                  }
                }}
              />
            </div>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none min-h-[400px] font-mono text-sm"
              placeholder="使用 Markdown 格式编写内容&#10;&#10;图片语法: ![描述](图片URL)&#10;&#10;多张图片会自动显示为相册"
              required
            />
          </div>

          {images.length > 0 && (
            <div>
              <label className="block text-sm mb-2">图片预览 ({images.length}张)</label>
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {isConfigured && (
            <div className="bg-[#1d1e22] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Github size={20} className="text-[var(--heo-theme)]" />
                  <div>
                    <div className="font-medium">同步到 GitHub</div>
                    <div className="text-xs text-[#a0a0a1]">发布文章时同步到 GitHub 仓库</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncToGitHub}
                    onChange={(e) => setSyncToGitHub(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#34363b] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--heo-theme)]"></div>
                </label>
              </div>
              
              {syncResult && (
                <div className={`mt-3 flex items-center gap-2 text-sm ${
                  syncResult.success ? 'text-green-400' : 'text-red-400'
                }`}>
                  {syncResult.success ? <Check size={16} /> : null}
                  {syncResult.message}
                  {syncResult.url && (
                    <a 
                      href={syncResult.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[var(--heo-theme)] hover:underline flex items-center gap-1"
                    >
                      查看 <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || syncing}
              className="px-8 py-3 bg-[var(--heo-theme)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {(loading || syncing) ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? '发布中...' : (editSlug ? '更新文章' : '发布文章')}
              {syncing ? '(同步中...)' : ''}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3 bg-[#34363b] text-white rounded-lg hover:bg-[#404247] transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function WritePage() {
  return (
    <AuthGuard>
      <WriteContent />
    </AuthGuard>
  )
}
