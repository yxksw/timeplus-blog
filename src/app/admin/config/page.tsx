'use client'

import { useState, useEffect } from 'react'
import { SiteConfig } from '@/types/blog'
import { useRouter } from 'next/navigation'

export default function ConfigPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<SiteConfig>({
    name: '',
    description: '',
    author: '',
    logo: '',
    social: {},
  })

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/config')
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Failed to load config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (res.ok) {
        alert('配置保存成功！')
      } else {
        const error = await res.json()
        alert(`保存失败: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving config:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
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
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">网站配置</h1>
          <button
            onClick={() => router.push('/admin')}
            className="px-6 py-2 bg-[#34363b] text-white rounded-lg hover:bg-[#404247] transition-colors"
          >
            返回
          </button>
        </div>

        <div className="space-y-6">
          <section className="bg-[#1d1e22] rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">基本信息</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">网站名称</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none"
                  placeholder="TimePlus Blog"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">网站描述</label>
                <textarea
                  value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none min-h-[100px]"
                  placeholder="一款简约的相册博客"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">作者</label>
                <input
                  type="text"
                  value={config.author}
                  onChange={(e) => setConfig({ ...config, author: e.target.value })}
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Logo URL</label>
                <input
                  type="text"
                  value={config.logo}
                  onChange={(e) => setConfig({ ...config, logo: e.target.value })}
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none"
                  placeholder="/logo.png"
                />
                {config.logo && (
                  <img
                    src={config.logo}
                    alt="Logo Preview"
                    className="mt-2 w-16 h-16 rounded-full object-cover"
                  />
                )}
              </div>
            </div>
          </section>

          <section className="bg-[#1d1e22] rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">社交链接</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">主页</label>
                <input
                  type="url"
                  value={config.social?.home || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    social: { ...config.social, home: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none"
                  placeholder="https://your-site.com"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">微博</label>
                <input
                  type="url"
                  value={config.social?.weibo || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    social: { ...config.social, weibo: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none"
                  placeholder="https://weibo.com/yourname"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">GitHub</label>
                <input
                  type="url"
                  value={config.social?.github || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    social: { ...config.social, github: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none"
                  placeholder="https://github.com/yourname"
                />
              </div>
            </div>
          </section>

          <section className="bg-[#1d1e22] rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">备案信息</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">ICP备案号</label>
                <input
                  type="text"
                  value={config.icp || ''}
                  onChange={(e) => setConfig({ ...config, icp: e.target.value })}
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none"
                  placeholder="京ICP备XXXXXXXX号"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">公安备案号</label>
                <input
                  type="text"
                  value={config.police || ''}
                  onChange={(e) => setConfig({ ...config, police: e.target.value })}
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none"
                  placeholder="京公网安备XXXXXXXXXXX号"
                />
              </div>
            </div>
          </section>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-[var(--heo-theme)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存配置'}
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-8 py-3 bg-[#34363b] text-white rounded-lg hover:bg-[#404247] transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
