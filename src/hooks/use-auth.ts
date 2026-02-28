'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminStore, getAuthToken } from '@/lib/admin-auth'

export function useRequireAuth(redirectUrl: string = '/admin/login') {
  const router = useRouter()
  const { isAuthenticated, checkAuth } = useAdminStore()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const verifyAuth = async () => {
      const token = getAuthToken()
      
      if (!token) {
        router.push(redirectUrl)
        return
      }

      try {
        const res = await fetch('/api/admin/auth', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        
        const data = await res.json()
        
        if (data.authenticated) {
          setAuthorized(true)
        } else {
          router.push(redirectUrl)
        }
      } catch {
        router.push(redirectUrl)
      } finally {
        setLoading(false)
      }
    }

    verifyAuth()
  }, [router, redirectUrl])

  return { loading, authorized }
}

export function useAuthGuard() {
  const { isAuthenticated, token, logout } = useAdminStore()
  
  const checkAuthStatus = async (): Promise<boolean> => {
    if (!token) return false
    
    try {
      const res = await fetch('/api/admin/auth', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await res.json()
      return data.authenticated
    } catch {
      return false
    }
  }

  return {
    isAuthenticated,
    token,
    logout,
    checkAuthStatus,
  }
}
