'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BlogPost } from '@/types/blog'
import { useAuthStore } from '@/lib/auth-store'
import { slugify } from '@/lib/utils'

export default function WritePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.content) {
      alert('请填写标题和内容')
      return
    }

    setLoading(true)
    
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

      const res = await fetch(`/api/blog/${formData.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      })

      if (res.ok) {
        alert('文章发布成功！')
        router.push('/')
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

  return (
    <div className="min-h-screen bg-[#242629] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">写文章</h1>
        
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

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[var(--heo-theme)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? '发布中...' : '发布文章'}
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
