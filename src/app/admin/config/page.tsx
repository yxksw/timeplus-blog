'use client'

import { useState, useEffect } from 'react'
import { SiteConfig } from '@/types/blog'
import { useRouter } from 'next/navigation'
import { useAdminStore, getAuthToken } from '@/lib/admin-auth'
import AuthGuard from '@/components/AuthGuard'
import { ArrowLeft, LogOut, Save, Home, Settings, Globe, Shield } from 'lucide-react'

function ConfigContent() {
  const router = useRouter()
  const { logout } = useAdminStore()
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
      const token = getAuthToken()
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <Settings size={24} className="text-[var(--heo-theme)]" />
            <h1 className="text-2xl md:text-3xl font-bold">网站配置</h1>
          </div>
          <div className="flex gap-2 md:gap-4 w-full sm:w-auto">
            <button
              onClick={() => router.push('/admin')}
              className="flex-1 sm:flex-none px-4 md:px-6 py-2 bg-[#34363b] text-white rounded-lg hover:bg-[#404247] transition-colors text-center text-sm md:text-base"
            >
              <ArrowLeft size={16} className="inline mr-1" />
              <span className="hidden sm:inline">返回</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-none px-4 md:px-6 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-center text-sm md:text-base"
            >
              <LogOut size={16} className="inline mr-1 sm:hidden" />
              <span className="hidden sm:inline">登出</span>
              <span className="sm:hidden">登出</span>
            </button>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <section className="bg-[#1d1e22] rounded-lg p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={18} className="text-[var(--heo-theme)]" />
              <h2 className="text-lg md:text-xl font-bold">基本信息</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">网站名称</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none text-sm md:text-base"
                  placeholder="TimePlus Blog"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">网站描述</label>
                <textarea
                  value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none min-h-[80px] md:min-h-[100px] text-sm md:text-base"
                  placeholder="一款简约的相册博客"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">作者</label>
                <input
                  type="text"
                  value={config.author}
                  onChange={(e) => setConfig({ ...config, author: e.target.value })}
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none text-sm md:text-base"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Logo URL</label>
                <input
                  type="text"
                  value={config.logo}
                  onChange={(e) => setConfig({ ...config, logo: e.target.value })}
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none text-sm md:text-base"
                  placeholder="/logo.png"
                />
                {config.logo && (
                  <img
                    src={config.logo}
                    alt="Logo Preview"
                    className="mt-2 w-12 h-12 md:w-16 md:h-16 rounded-full object-cover"
                  />
                )}
              </div>
            </div>
          </section>

          <section className="bg-[#1d1e22] rounded-lg p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Home size={18} className="text-[var(--heo-theme)]" />
              <h2 className="text-lg md:text-xl font-bold">社交链接</h2>
            </div>
            
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
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none text-sm md:text-base"
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
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none text-sm md:text-base"
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
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none text-sm md:text-base"
                  placeholder="https://github.com/yourname"
                />
              </div>
            </div>
          </section>

          <section className="bg-[#1d1e22] rounded-lg p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={18} className="text-[var(--heo-theme)]" />
              <h2 className="text-lg md:text-xl font-bold">备案信息</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">ICP备案号</label>
                <input
                  type="text"
                  value={config.icp || ''}
                  onChange={(e) => setConfig({ ...config, icp: e.target.value })}
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none text-sm md:text-base"
                  placeholder="京ICP备XXXXXXXX号"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">公安备案号</label>
                <input
                  type="text"
                  value={config.police || ''}
                  onChange={(e) => setConfig({ ...config, police: e.target.value })}
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none text-sm md:text-base"
                  placeholder="京公网安备XXXXXXXXXXX号"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-none px-6 md:px-8 py-3 bg-[var(--heo-theme)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
            >
              <Save size={16} className="inline mr-2" />
              {saving ? '保存中...' : '保存配置'}
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 sm:flex-none px-6 md:px-8 py-3 bg-[#34363b] text-white rounded-lg hover:bg-[#404247] transition-colors text-center"
            >
              <Home size={16} className="inline mr-2" />
              返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConfigPage() {
  return (
    <AuthGuard>
      <ConfigContent />
    </AuthGuard>
  )
}
