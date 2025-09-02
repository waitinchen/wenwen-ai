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
      console.log('呼叫line-user-register Edge Function')
      
      const { data, error: functionError } = await supabase.functions.invoke('line-user-register', {
        body: {
          line_uid: lineUid,
          line_display_name: displayName,
          line_avatar_url: avatarUrl
        }
      })

      if (functionError) {
        console.error('Edge Function錯誤:', functionError)
        throw new Error(functionError.message || 'LINE用戶註冊失敗')
      }

      if (data?.error) {
        console.error('API回應錯誤:', data.error)
        throw new Error(data.error.message || 'LINE用戶註冊失敗')
      }

      if (data?.data?.user) {
        console.log('LINE用戶註冊成功:', data.data)
        setLineUser(data.data.user)
        
        // 儲存到localStorage以便下次使用
        localStorage.setItem('lineUser', JSON.stringify(data.data.user))
        
        console.log(`${data.data.message}: ${displayName}`)
      } else {
        throw new Error('無效的回應格式')
      }
    } catch (error: any) {
      console.error('註冊LINE用戶失敗:', error)
      setError(error.message || '註冊失敗')
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