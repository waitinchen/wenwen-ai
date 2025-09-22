import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface LineUser {
  id: number
  line_uid: string
  line_display_name: string
  line_avatar_url?: string
  is_active: boolean
  first_interaction_at: string
  last_interaction_at: string
  total_conversations: number
  created_at: string
  updated_at: string
}

interface UserAuthContextType {
  lineUser: LineUser | null
  isLoading: boolean
  error: string | null
  registerLineUser: (lineUid: string, displayName: string, avatarUrl?: string) => Promise<void>
  clearUser: () => void
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined)

export const UserAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lineUser, setLineUser] = useState<LineUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 從URL參數檢查LINE LIFF資訊
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const lineUid = urlParams.get('line_uid')
    const displayName = urlParams.get('line_display_name')
    const avatarUrl = urlParams.get('line_avatar_url')

    console.log('檢查URL參數:', { lineUid, displayName, avatarUrl })

    if (lineUid && displayName) {
      console.log('發現LINE LIFF參數，開始註冊用戶')
      registerLineUser(lineUid, displayName, avatarUrl || undefined)
    }
  }, [])

  const registerLineUser = async (lineUid: string, displayName: string, avatarUrl?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('處理LINE用戶資訊:', { lineUid, displayName, avatarUrl })
      
      // 創建模擬的LINE用戶物件
      const mockLineUser: LineUser = {
        id: 1,
        line_uid: lineUid,
        line_display_name: displayName,
        line_avatar_url: avatarUrl,
        is_active: true,
        first_interaction_at: new Date().toISOString(),
        last_interaction_at: new Date().toISOString(),
        total_conversations: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('LINE用戶資訊已設定:', mockLineUser)
      setLineUser(mockLineUser)
      
      // 儲存到localStorage以便下次使用
      localStorage.setItem('lineUser', JSON.stringify(mockLineUser))
      
      console.log(`歡迎 ${displayName}！`)
    } catch (error: any) {
      console.error('處理LINE用戶失敗:', error)
      setError(error.message || '處理失敗')
    } finally {
      setIsLoading(false)
    }
  }

  const clearUser = () => {
    setLineUser(null)
    setError(null)
    localStorage.removeItem('lineUser')
    console.log('已清除LINE用戶資訊')
  }

  // 從localStorage恢復用戶資訊（如果沒有URL參數的話）
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const hasLineParams = urlParams.has('line_uid')

    // 只有在沒有URL參數時才從localStorage恢復
    if (!hasLineParams && !lineUser) {
      const savedUser = localStorage.getItem('lineUser')
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          setLineUser(parsedUser)
          console.log('從localStorage恢復LINE用戶資訊:', parsedUser.line_display_name)
        } catch (error) {
          console.error('解析儲存的用戶資訊失敗:', error)
          localStorage.removeItem('lineUser')
        }
      }
    }
  }, [])

  const value: UserAuthContextType = {
    lineUser,
    isLoading,
    error,
    registerLineUser,
    clearUser
  }

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  )
}

export const useUserAuth = () => {
  const context = useContext(UserAuthContext)
  if (context === undefined) {
    throw new Error('useUserAuth must be used within a UserAuthProvider')
  }
  return context
}

export default UserAuthContext