import React, { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Check } from 'lucide-react'
import { adminLogin } from '@/lib/api'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { cn } from '@/lib/utils'

const AdminLogin = () => {
  const [email, setEmail] = useState(() => {
    // 從 localStorage 載入記住的帳號
    return localStorage.getItem('admin_remembered_email') || ''
  })
  const [password, setPassword] = useState(() => {
    // 從 localStorage 載入記住的密碼
    return localStorage.getItem('admin_remembered_password') || ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberCredentials, setRememberCredentials] = useState(() => {
    // 檢查是否有記住的帳號密碼
    return !!(localStorage.getItem('admin_remembered_email') && localStorage.getItem('admin_remembered_password'))
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login, isAuthenticated } = useAdminAuth()
  const location = useLocation()
  
  const from = (location.state as any)?.from?.pathname || '/admin'

  // 如果已經登入，重定向到管理後台
  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const adminData = await adminLogin(email, password)
      
      // 根據記住帳號密碼的設定來保存或清除帳號密碼
      if (rememberCredentials) {
        localStorage.setItem('admin_remembered_email', email)
        localStorage.setItem('admin_remembered_password', password)
      } else {
        localStorage.removeItem('admin_remembered_email')
        localStorage.removeItem('admin_remembered_password')
      }
      
      login(adminData, rememberCredentials)
      // 導航會由isAuthenticated狀態處理
    } catch (err: any) {
      setError(err.message || '登入失敗，請檢查帳號密碼')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearRememberedCredentials = () => {
    localStorage.removeItem('admin_remembered_email')
    localStorage.removeItem('admin_remembered_password')
    setEmail('')
    setPassword('')
    setRememberCredentials(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06C755] to-[#04A047] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* 標頭 */}
        <div className="bg-[#06C755] text-white p-6 text-center">
          <img 
            src="/images/高文文.png" 
            alt="高文文" 
            className="w-16 h-16 mx-auto mb-3 rounded-full border-4 border-white shadow-lg object-cover"
          />
          <h1 className="text-2xl font-bold">高文文智能客服-高雄鳳山區</h1>
          <p className="text-sm opacity-90">管理後台登入</p>
        </div>

        {/* 登入表單 */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                管理員帳號
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent transition-all"
                placeholder="請輸入管理員郵箱"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密碼
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent transition-all"
                  placeholder="請輸入密碼"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* 記住帳號密碼 */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberCredentials}
                  onChange={(e) => setRememberCredentials(e.target.checked)}
                  className="sr-only"
                />
                <div className={cn(
                  'w-5 h-5 border-2 rounded flex items-center justify-center transition-all',
                  rememberCredentials 
                    ? 'bg-[#06C755] border-[#06C755]' 
                    : 'border-gray-300 hover:border-[#06C755]'
                )}>
                  {rememberCredentials && <Check size={14} className="text-white" />}
                </div>
                <span className="ml-2 text-sm text-gray-700">記住帳號密碼</span>
              </label>
              
              {/* 清除記住的帳號密碼按鈕 */}
              {rememberCredentials && (
                <button
                  type="button"
                  onClick={handleClearRememberedCredentials}
                  className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                  disabled={isLoading}
                >
                  清除
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all',
                'bg-[#06C755] text-white hover:bg-[#04A047] active:bg-[#038A3E]',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#06C755]'
              )}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={20} />
              )}
              {isLoading ? '登入中...' : '登入管理後台'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin