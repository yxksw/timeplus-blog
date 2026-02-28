'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'
import { GITHUB_CONFIG } from '@/consts'

export default function LoginPage() {
  const router = useRouter()
  const { setPrivateKey } = useAuthStore()
  const [mode, setMode] = useState<'password' | 'key'>('password')
  const [password, setPassword] = useState('')
  const [privateKey, setPrivateKeyInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'password') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            privateKey: privateKey || undefined,
            password,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          setPrivateKey(data.encryptedKey)
          router.push('/admin')
        } else {
          const err = await res.json()
          setError(err.error || '登录失败')
        }
      } else {
        setPrivateKey(privateKey)
        router.push('/admin')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#242629] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1d1e22] rounded-lg p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            TimePlus Blog
          </h1>
          <p className="text-[#a0a0a1] text-center mb-8">
            GitHub App 登录
          </p>

          {GITHUB_CONFIG.APP_ID === '-' && (
            <div className="bg-yellow-500/20 text-yellow-400 px-4 py-3 rounded-lg mb-6 text-sm">
              请先配置 GitHub App ID 和相关环境变量
            </div>
          )}

          <div className="flex mb-6">
            <button
              onClick={() => setMode('password')}
              className={`flex-1 py-2 text-center rounded-l-lg transition-colors ${
                mode === 'password'
                  ? 'bg-[var(--heo-theme)] text-white'
                  : 'bg-[#34363b] text-[#a0a0a1]'
              }`}
            >
              密码登录
            </button>
            <button
              onClick={() => setMode('key')}
              className={`flex-1 py-2 text-center rounded-r-lg transition-colors ${
                mode === 'key'
                  ? 'bg-[var(--heo-theme)] text-white'
                  : 'bg-[#34363b] text-[#a0a0a1]'
              }`}
            >
              私钥登录
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {mode === 'password' ? (
              <>
                <div>
                  <label className="block text-sm text-[#a0a0a1] mb-2">
                    GitHub App 私钥
                  </label>
                  <textarea
                    value={privateKey}
                    onChange={(e) => setPrivateKeyInput(e.target.value)}
                    className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none min-h-[120px] font-mono text-xs"
                    placeholder="粘贴你的 GitHub App 私钥内容..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#a0a0a1] mb-2">
                    加密密码
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none"
                    placeholder="输入密码加密私钥"
                    required
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm text-[#a0a0a1] mb-2">
                  已加密的私钥
                </label>
                <textarea
                  value={privateKey}
                  onChange={(e) => setPrivateKeyInput(e.target.value)}
                  className="w-full px-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none min-h-[120px] font-mono text-xs"
                  placeholder="粘贴已加密的私钥..."
                  required
                />
              </div>
            )}

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--heo-theme)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="https://github.com/settings/developers"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[var(--heo-theme)] hover:underline"
            >
              创建 GitHub App
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-[#36383c]">
            <h3 className="text-sm font-bold text-white mb-3">使用说明</h3>
            <ol className="text-xs text-[#a0a0a1] space-y-2 list-decimal list-inside">
              <li>在 GitHub 创建一个 GitHub App</li>
              <li>授予 App 对仓库的写入权限</li>
              <li>生成并下载私钥 (PEM格式)</li>
              <li>将私钥内容粘贴到上方输入框</li>
              <li>设置加密密码保护私钥</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
