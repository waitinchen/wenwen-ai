import React, { useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Home, Bell, Settings, User, LogOut, ChevronDown, Search, AlertTriangle, Filter } from 'lucide-react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { cn } from '@/lib/utils'

interface TopNavBarProps {
  title?: string
  breadcrumbs?: Array<{
    label: string
    path?: string | undefined
  }>
}

const TopNavBar = ({ title, breadcrumbs }: TopNavBarProps) => {
  const location = useLocation()
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  // 預設麵包屑導覽
  const getDefaultBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const crumbs = [{ label: '首頁', path: '/admin' }]
    
    const pathMap: Record<string, string> = {
      'conversations': '對話記錄',
      'analytics': '資料分析', 
      'stores': '商家管理',
      'activities': '活動管理',
      'ai-config': 'AI 設定',
      'training': '訓練資料',
      'faqs': '常見問題',
      'quick-questions': '快速問題',
      'content-warnings': '內容合理性',
      'interaction-filters': '互動攔截'
    }
    
    if (pathSegments.length > 1) {
      const page = pathSegments[1]
      if (pathMap[page]) {
        crumbs.push({ label: pathMap[page], path: `/admin/${page}` })
      }
      
      // 如果有子路徑（如對話詳情）
      if (pathSegments.length > 2) {
        crumbs.push({ label: '詳情', path: undefined })
      }
    }
    
    return crumbs
  }
  
  const displayBreadcrumbs = breadcrumbs || getDefaultBreadcrumbs()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
    setShowUserMenu(false)
  }
  
  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-8 py-5">
        {/* 左側：麵包屑導覽 */}
        <nav className="flex items-center space-x-2">
          <Home className="h-4 w-4 text-slate-400" />
          {displayBreadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="h-4 w-4 text-slate-300" />}
              {crumb.path ? (
                <Link
                  to={crumb.path}
                  className="text-slate-600 hover:text-blue-600 transition-colors font-medium text-sm px-2 py-1 rounded-md hover:bg-slate-50"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-blue-600 font-semibold text-sm bg-blue-50 px-3 py-1 rounded-md">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
        
        {/* 中間：搜尋框 - 已隱藏 (功能未完成) */}
        <div className="flex-1 max-w-md mx-8 hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋內容..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        
        {/* 右側：工具列和使用者選單 */}
        <div className="flex items-center space-x-3">
          {/* 快速操作 */}
          <div className="flex items-center space-x-2">
            {/* 通知按鈕 */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* 通知下拉選單 */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">通知中心</h3>
                    <p className="text-xs text-slate-500">最新系統活動和提醒</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-slate-50 border-b border-slate-100">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">系統更新完成</p>
                          <p className="text-xs text-slate-500 mt-1">管理後台功能已成功升級</p>
                          <p className="text-xs text-slate-400 mt-1">5 分鐘前</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 hover:bg-slate-50 border-b border-slate-100">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">資料備份完成</p>
                          <p className="text-xs text-slate-500 mt-1">系統資料已成功備份</p>
                          <p className="text-xs text-slate-400 mt-1">1 小時前</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 hover:bg-slate-50">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">內容審核提醒</p>
                          <p className="text-xs text-slate-500 mt-1">有 3 條內容需要審核</p>
                          <p className="text-xs text-slate-400 mt-1">2 小時前</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 border-t border-slate-100">
                    <Link 
                      to="/admin"
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      onClick={() => setShowNotifications(false)}
                    >
                      查看所有通知
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* 設定按鈕 */}
            <div className="relative">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
              >
                <Settings className="h-5 w-5" />
              </button>
              
              {/* 設定下拉選單 */}
              {showSettings && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">系統設定</h3>
                  </div>
                  <Link
                    to="/admin/ai-config"
                    className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setShowSettings(false)}
                  >
                    <Settings className="w-4 h-4 mr-3 text-slate-400" />
                    AI 配置
                  </Link>
                  <Link
                    to="/admin/content-warnings"
                    className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setShowSettings(false)}
                  >
                    <AlertTriangle className="w-4 h-4 mr-3 text-slate-400" />
                    內容合理性
                  </Link>
                  <Link
                    to="/admin/interaction-filters"
                    className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setShowSettings(false)}
                  >
                    <Filter className="w-4 h-4 mr-3 text-slate-400" />
                    互動攔截
                  </Link>
                  <div className="border-t border-slate-100 mt-2 pt-2">
                    <Link
                      to="/admin"
                      className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setShowSettings(false)}
                    >
                      <Home className="w-4 h-4 mr-3 text-slate-400" />
                      回到儀表板
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 使用者下拉選單 */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-slate-100"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm text-left hidden sm:block">
                <div className="font-semibold text-slate-900">{admin?.full_name || '管理員'}</div>
                <div className="text-slate-500 text-xs">
                  {admin?.role === 'super_admin' ? '超級管理員' : '管理員'}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200" style={{
                transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)'
              }} />
            </button>
            
            {/* 下拉選單 */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900">{admin?.full_name || '管理員'}</p>
                  <p className="text-xs text-slate-500">
                    {admin?.role === 'super_admin' ? '超級管理員' : '管理員'}
                  </p>
                </div>
                <Link
                  to="/"
                  className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Home className="w-4 h-4 mr-3 text-slate-400" />
                  前台頁面
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  登出
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopNavBar