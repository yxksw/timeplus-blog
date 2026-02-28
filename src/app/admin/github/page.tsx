'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminStore, getAuthToken } from '@/lib/admin-auth'
import { useGitHubConfigStore } from '@/lib/github-config'
import { GitHubSyncConfig } from '@/types/github'
import AuthGuard from '@/components/AuthGuard'
import { Github, Check, X, Loader2 } from 'lucide-react'

function GitHubConfigContent() {
  const router = useRouter()
  const { logout } = useAdminStore()
  const { config, setConfig, clearConfig, isConfigured } = useGitHubConfigStore()
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [formData, setFormData] = useState<GitHubSyncConfig>({
    enabled: false,
    owner: '',
    repo: '',
    branch: 'main',
    appId: '',
    privateKey: '',
  })

  useEffect(() => {
    if (config) {
      setFormData(config)
    }
  }, [config])

  const handleTest = async () => {
    if (!formData.owner || !formData.repo || !formData.appId || !formData.privateKey) {
      setTestResult({ success: false, message: '请填写所有必填字段' })
      return
    }

    setTesting(true)
    setTestResult(null)

    try {
      const token = getAuthToken()
      const res = await fetch('/api/github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'test',
          config: formData,
        }),
      })

      const data = await res.json()
      setTestResult({ success: data.success, message: data.message })
    } catch (error) {
      setTestResult({ success: false, message: '测试失败' })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      setConfig(formData)
      alert('配置已保存')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    if (confirm('确定要清除 GitHub 配置吗？')) {
      clearConfig()
      setFormData({
        enabled: false,
        owner: '',
        repo: '',
        branch: 'main',
        appId: '',
        privateKey: '',
      })
      setTestResult(null)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#242629] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Github size={32} />
            GitHub 同步设置
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="px-6 py-2 bg-[#34363b] text-white rounded-lg hover:bg-[#404247] transition-colors"
            >
              返回
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              登出
            </button>
          </div>
        </div>

        <div className="bg-[#1d1e22] rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">启用 GitHub 同步</h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#34363b] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--heo-theme)]"></div>
            </label>
          </div>
          <p className="text-[#a0a0a1] text-sm">
            启用后，发布文章时可以选择同步到 GitHub 仓库
          </p>
        </div>

        <div className="bg-[#1d1e22] rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold mb-4">GitHub App 配置</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Owner (用户名/组织) *</label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none"
                placeholder="your-username"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">仓库名 *</label>
              <input
                type="text"
                value={formData.repo}
                onChange={(e) => setFormData({ ...formData, repo: e.target.value })}
                className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none"
                placeholder="your-blog-repo"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">分支</label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none"
                placeholder="main"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">App ID *</label>
              <input
                type="text"
                value={formData.appId}
                onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
                className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none"
                placeholder="123456"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Private Key (PEM 格式) *</label>
            <textarea
              value={formData.privateKey}
              onChange={(e) => setFormData({ ...formData, privateKey: e.target.value })}
              className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none min-h-[150px] font-mono text-xs"
              placeholder="-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----"
            />
          </div>

          {testResult && (
            <div className={`flex items-center gap-2 p-4 rounded-lg ${
              testResult.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {testResult.success ? <Check size={20} /> : <X size={20} />}
              {testResult.message}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleTest}
              disabled={testing}
              className="px-6 py-3 bg-[#34363b] text-white rounded-lg hover:bg-[#404247] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {testing ? <Loader2 size={18} className="animate-spin" /> : null}
              测试连接
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-3 bg-[var(--heo-theme)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              保存配置
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              清除配置
            </button>
          </div>
        </div>

        <div className="bg-[#1d1e22] rounded-lg p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">使用说明</h2>
          <ol className="text-sm text-[#a0a0a1] space-y-2 list-decimal list-inside">
            <li>在 GitHub 创建一个 GitHub App（Settings → Developer settings → GitHub Apps）</li>
            <li>设置 Repository permissions → Contents → Read and write</li>
            <li>创建并下载 Private Key（PEM 格式）</li>
            <li>将 App 安装到你的博客仓库</li>
            <li>填写上方配置并测试连接</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default function GitHubConfigPage() {
  return (
    <AuthGuard>
      <GitHubConfigContent />
    </AuthGuard>
  )
}
