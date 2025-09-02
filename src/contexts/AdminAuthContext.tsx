import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { adminVerifyToken, adminLogout, type AdminLoginData } from '@/lib/api'

interface AdminAuthContextType {
  admin: AdminLoginData['admin'] | null
  token: string | null
  isLoading: boolean
  permissions: string[]
  hasPermission: (permission: string) => boolean
  login: (adminData: AdminLoginData) => void
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

interface AdminAuthProviderProps {
  children: ReactNode
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [admin, setAdmin] = useState<AdminLoginData['admin'] | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [permissions, setPermissions] = useState<string[]>([])

  // 讀取權限清單
  const hasPermission = (permission: string): boolean => {
    if (!permissions || permissions.length === 0) return false
    
    // 超級管理員擁有所有權限
    if (admin?.role === 'superadmin') return true
    
    // 直接匹配
    if (permissions.includes(permission)) return true
    
    // 模糊匹配（例如 'faq:manage' 匹配 'faq:*'）
    const permissionBase = permission.split(':')[0]
    return permissions.some(p => p.startsWith(`${permissionBase}:`))
  }

  // 載入時檢查本地存儲的token
  useEffect(() => {
    async function loadStoredAuth() {
      setIsLoading(true)
      try {
        const storedToken = localStorage.getItem('admin_token')
        if (storedToken) {
          const authData = await adminVerifyToken(storedToken)
          setAdmin(authData.admin)
          setToken(storedToken)
          setPermissions(authData.admin.permissions || [])
        }
      } catch (error) {
        console.error('Token verification failed:', error)
        localStorage.removeItem('admin_token')
      } finally {
        setIsLoading(false)
      }
    }

    loadStoredAuth()
  }, [])

  const login = (adminData: AdminLoginData) => {
    setAdmin(adminData.admin)
    setToken(adminData.token)
    setPermissions(adminData.admin.permissions || [])
    localStorage.setItem('admin_token', adminData.token)
  }

  const logout = async () => {
    try {
      if (token) {
        await adminLogout(token)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAdmin(null)
      setToken(null)
      setPermissions([])
      localStorage.removeItem('admin_token')
    }
  }

  const isAuthenticated = !!(admin && token)

  return (
    <AdminAuthContext.Provider value={{
      admin,
      token,
      isLoading,
      permissions,
      hasPermission,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </AdminAuthContext.Provider>
  )
}