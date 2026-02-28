'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminStore } from '@/lib/admin-auth'
import { Lock, ArrowLeft, Key } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login } = useAdminStore()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        login(data.token)
        router.push('/admin')
      } else {
        setError(data.error || '登录失败')
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
        <div className="bg-[#1d1e22] rounded-lg p-6 md:p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[var(--heo-theme-op)] flex items-center justify-center">
              <Lock size={32} className="text-[var(--heo-theme)]" />
            </div>
          </div>
          
          <h1 className="text-xl md:text-2xl font-bold text-white text-center mb-2">
            管理员登录
          </h1>
          <p className="text-[#a0a0a1] text-center mb-6 md:mb-8 text-sm md:text-base">
            请输入管理员密码
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#a0a0a1] mb-2">
                管理员密码
              </label>
              <div className="relative">
                <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0a0a1]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#34363b] border border-[#36383c] rounded-lg text-white focus:border-[var(--heo-theme)] outline-none"
                  placeholder="输入密码"
                  required
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--heo-theme)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-[var(--heo-theme)] hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft size={14} />
              返回首页
            </a>
          </div>

          <div className="mt-6 md:mt-8 pt-6 border-t border-[#36383c]">
            <h3 className="text-sm font-bold text-white mb-3">提示</h3>
            <p className="text-xs text-[#a0a0a1]">
              默认密码: <code className="bg-[#34363b] px-2 py-1 rounded">admin123</code>
            </p>
            <p className="text-xs text-[#a0a0a1] mt-2">
              可通过环境变量 <code className="bg-[#34363b] px-1 rounded">ADMIN_PASSWORD</code> 修改密码
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
