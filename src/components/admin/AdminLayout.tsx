import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Store, 
  Brain, 
  GraduationCap, 
  HelpCircle, 
  BarChart3,
  MessageCircle,
  MessageSquare,
  Users,
  Activity,
  Settings,
  Zap,
  Calendar,
  AlertTriangle,
  Filter,
  Heart,
  TestTube,
  GitBranch,
  Tag
} from 'lucide-react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { cn } from '@/lib/utils'
import TopNavBar from './TopNavBar'

interface MenuItem {
  path: string
  label: string
  icon: any
  exact?: boolean
  adminOnly?: boolean
}

const AdminLayout = () => {
  const { admin } = useAdminAuth()
  const location = useLocation()

  const menuGroups = [
    {
      title: '概覽',
      items: [
        {
          path: '/admin',
          label: '儀表板',
          icon: LayoutDashboard,
          exact: true
        },
        {
          path: '/admin/analytics',
          label: '資料分析',
          icon: BarChart3
        }
      ] as MenuItem[]
    },
    {
      title: '業務管理',
      items: [
        {
          path: '/admin/stores',
          label: '商家管理',
          icon: Store
        },
        {
          path: '/admin/activities',
          label: '活動管理',
          icon: Calendar
        },
        {
          path: '/admin/conversations',
          label: '對話記錄',
          icon: MessageSquare
        }
      ] as MenuItem[]
    },
    {
      title: '內容配置',
      items: [
        {
          path: '/admin/training',
          label: '訓練資料',
          icon: GraduationCap
        },
        {
          path: '/admin/faqs',
          label: '常見問題',
          icon: HelpCircle
        },
        {
          path: '/admin/quick-questions',
          label: '快速問題',
          icon: Zap
        }
      ] as MenuItem[]
    },
    {
      title: '系統配置',
      items: [
        {
          path: '/admin/ai-config',
          label: 'AI 設定',
          icon: Brain,
          adminOnly: true
        },
        {
          path: '/admin/content-warnings',
          label: '內容合理性',
          icon: AlertTriangle
        },
        {
          path: '/admin/interaction-filters',
          label: '互動攔截',
          icon: Filter
        }
      ] as MenuItem[]
    },
    {
      title: '系統監控',
      items: [
        {
          path: '/admin/health',
          label: '健康檢查',
          icon: Heart
        },
        {
          path: '/admin/tests',
          label: '自動測試',
          icon: TestTube
        },
        {
          path: '/admin/version',
          label: '版本管理',
          icon: GitBranch
        }
      ] as MenuItem[]
    }
  ]

  const isActivePath = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 左側導覽 */}
      <div className="w-64 bg-white shadow-lg border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-slate-900">文山特區</h1>
              <p className="text-sm text-slate-500 font-medium">智慧管理系統</p>
            </div>
          </div>
        </div>

        {/* 導覽組 */}
        <nav className="flex-1 px-4 py-6 space-y-8">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-3">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.items
                  .filter(item => !item.adminOnly || admin?.role === 'super_admin')
                  .map((item) => {
                    const Icon = item.icon
                    const active = isActivePath(item.path, item.exact)
                    
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group',
                            active
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
                          )}
                        >
                          <Icon className={cn(
                            'w-5 h-5 transition-colors',
                            active ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'
                          )} />
                          {item.label}
                        </Link>
                      </li>
                    )
                  })
                }
              </ul>
            </div>
          ))}
        </nav>

        {/* 使用者資訊區域 */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-white text-sm font-bold">
                {admin?.full_name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{admin?.full_name}</p>
              <p className="text-xs text-slate-500 font-medium">
                {admin?.role === 'super_admin' ? '超級管理員' : '管理員'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 主內容區域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 頂部導覽列 */}
        <TopNavBar />
        
        {/* 頁面內容 */}
        <main className="flex-1 overflow-auto bg-slate-50 p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout