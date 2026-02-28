'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminStore, getAuthToken } from '@/lib/admin-auth'
import AuthGuard from '@/components/AuthGuard'
import { ArrowLeft, LogOut, Github, Check, X, Link2, Unlink, RefreshCw, Settings } from 'lucide-react'

function GitHubContent() {
  const router = useRouter()
  const { logout } = useAdminStore()
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [syncResult, setSyncResult] = useState<string | null>(null)
  
  const [config, setConfig] = useState({
    owner: '',
    repo: '',
    branch: 'main',
    appId: '',
    privateKey: '',
    configured: false,
  })

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/github')
      if (res.ok) {
        const data = await res.json()
        setConfig({
          owner: data.owner || '',
          repo: data.repo || '',
          branch: data.branch || 'main',
          appId: data.appId || '',
          privateKey: '',
          configured: data.configured || false,
        })
      }
    } catch (error) {
      console.error('Failed to load GitHub config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTest = async () => {
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
          ...config,
        }),
      })

      const data = await res.json()
      setTestResult(res.ok && data.success ? 'success' : 'error')
    } catch (error) {
      console.error('Test error:', error)
      setTestResult('error')
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    
    try {
      const token = getAuthToken()
      const res = await fetch('/api/github', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'save',
          ...config,
        }),
      })

      if (res.ok) {
        alert('GitHub 配置保存成功！')
        loadConfig()
      } else {
        const error = await res.json()
        alert(`保存失败: ${error.error}`)
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    
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
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setSyncResult(`同步成功！共同步 ${data.count || 0} 篇文章`)
      } else {
        setSyncResult(`同步失败: ${data.error}`)
      }
    } catch (error) {
      console.error('Sync error:', error)
      setSyncResult('同步失败')
    } finally {
      setSyncing(false)
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
            <Github size={24} className="text-[var(--heo-theme)]" />
            <h1 className="text-2xl md:text-3xl font-bold">GitHub 同步</h1>
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
              <Settings size={18} className="text-[var(--heo-theme)]" />
              <h2 className="text-lg md:text-xl font-bold">GitHub App 配置</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#a0a0a1]">状态:</span>
                {config.configured ? (
                  <span className="flex items-center gap-1 text-green-400">
                    <Check size={14} />
                    已配置
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <X size={14} />
                    未配置
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2">仓库所有者 (Owner)</label>
                <input
                  type="text"
                  value={config.owner}
                  onChange={(e) => setConfig({ ...config, owner: e.target.value })}
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none text-sm md:text-base"
                  placeholder="your-username"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">仓库名称 (Repo)</label>
                <input
                  type="text"
                  value={config.repo}
                  onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none text-sm md:text-base"
                  placeholder="your-blog-repo"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">分支</label>
                <input
                  type="text"
                  value={config.branch}
                  onChange={(e) => setConfig({ ...config, branch: e.target.value })}
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none text-sm md:text-base"
                  placeholder="main"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">GitHub App ID</label>
                <input
                  type="text"
                  value={config.appId}
                  onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none text-sm md:text-base"
                  placeholder="123456"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Private Key (PEM 格式)</label>
                <textarea
                  value={config.privateKey}
                  onChange={(e) => setConfig({ ...config, privateKey: e.target.value })}
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none font-mono text-xs min-h-[120px] md:min-h-[150px]"
                  placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
                />
                <p className="text-xs text-[#a0a0a1] mt-1">
                  留空则保持原有密钥不变
                </p>
              </div>
            </div>
          </section>

          <section className="bg-[#1d1e22] rounded-lg p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Link2 size={18} className="text-[var(--heo-theme)]" />
              <h2 className="text-lg md:text-xl font-bold">操作</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <button
                onClick={handleTest}
                disabled={testing}
                className="flex-1 px-4 md:px-6 py-3 bg-[#34363b] text-white rounded-lg hover:bg-[#404247] transition-colors disabled:opacity-50"
              >
                {testing ? (
                  <RefreshCw size={16} className="inline mr-2 animate-spin" />
                ) : (
                  <Check size={16} className="inline mr-2" />
                )}
                测试连接
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 md:px-6 py-3 bg-[var(--heo-theme)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存配置'}
              </button>
            </div>

            {testResult && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                testResult === 'success' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {testResult === 'success' ? '连接成功！' : '连接失败，请检查配置'}
              </div>
            )}
          </section>

          {config.configured && (
            <section className="bg-[#1d1e22] rounded-lg p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw size={18} className="text-[var(--heo-theme)]" />
                <h2 className="text-lg md:text-xl font-bold">同步</h2>
              </div>
              
              <p className="text-sm text-[#a0a0a1] mb-4">
                将本地文章同步到 GitHub 仓库
              </p>

              <button
                onClick={handleSync}
                disabled={syncing}
                className="w-full sm:w-auto px-6 py-3 bg-[#34363b] text-white rounded-lg hover:bg-[#404247] transition-colors disabled:opacity-50"
              >
                {syncing ? (
                  <RefreshCw size={16} className="inline mr-2 animate-spin" />
                ) : (
                  <RefreshCw size={16} className="inline mr-2" />
                )}
                {syncing ? '同步中...' : '开始同步'}
              </button>

              {syncResult && (
                <div className="mt-4 p-3 rounded-lg text-sm bg-[#34363b] text-white">
                  {syncResult}
                </div>
              )}
            </section>
          )}

          <section className="bg-[#1d1e22] rounded-lg p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4">配置说明</h2>
            <div className="text-sm text-[#a0a0a1] space-y-3">
              <p>1. 在 GitHub 创建一个 GitHub App</p>
              <p>2. 设置 Repository permissions: Contents (Read and Write)</p>
              <p>3. 生成 Private Key 并下载 PEM 文件</p>
              <p>4. 将 GitHub App 安装到你的仓库</p>
              <p>5. 填写上述配置并保存</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default function GitHubPage() {
  return (
    <AuthGuard>
      <GitHubContent />
    </AuthGuard>
  )
}
