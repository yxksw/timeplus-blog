'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminStore } from '@/lib/admin-auth'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, token } = useAdminStore()

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, token, router])

  if (!isAuthenticated || !token) {
    return fallback || (
      <div className="min-h-screen bg-[#242629] flex items-center justify-center">
        <div className="text-white">正在验证身份...</div>
      </div>
    )
  }

  return <>{children}</>
}
