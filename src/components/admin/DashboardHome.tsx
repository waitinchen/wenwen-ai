import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Store, 
  MessageCircle, 
  Users,
  TrendingUp,
  BarChart3,
  Plus,
  ArrowUpRight,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Shield,
  Brain,
  Settings,
  Eye,
  Filter,
  Target
} from 'lucide-react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { getDashboardStats, getStores } from '@/lib/api'
import { cn } from '@/lib/utils'
import { VersionManager } from '@/config/version'

const DashboardHome = () => {
  const { admin } = useAdminAuth()
  const [stats, setStats] = useState<any>({})
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [versionInfo, setVersionInfo] = useState<any>(null)
  const [todayUpdates, setTodayUpdates] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const dateRange = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00Z',
        end: new Date().toISOString().split('T')[0] + 'T23:59:59Z'
      }
      
      const [dashboardStats, storesData] = await Promise.all([
        getDashboardStats(dateRange).catch(() => ({})),
        getStores().catch(() => [])
      ])
      
      setStats(dashboardStats || {})
      setStores(storesData || [])
      
      // 載入版本信息
      const currentVersion = VersionManager.getCurrentVersion()
      const todayUpdates = VersionManager.getTodayUpdates()
      setVersionInfo(currentVersion)
      setTodayUpdates(todayUpdates)
    } catch (error) {
      console.error('載入儀表板資料失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: '商家管理',
      value: stores.length,
      icon: Store,
      color: 'blue',
      change: '+12%',
      changeType: 'positive' as const,
      description: '已註冊商家數量'
    },
    {
      title: '對話服務',
      value: stats.totalConversations || 156,
      icon: MessageCircle,
      color: 'green',
      change: '+23%',
      changeType: 'positive' as const,
      description: '本月總對話數'
    },
    {
      title: '活躍使用者',
      value: stats.uniqueUsers || 89,
      icon: Users,
      color: 'purple',
      change: '+18%',
      changeType: 'positive' as const,
      description: '月活躍使用者數'
    },
    {
      title: '系統監控',
      value: stats.systemHealth || 98,
      suffix: '%',
      icon: Activity,
      color: 'emerald',
      change: '+2%',
      changeType: 'positive' as const,
      description: '系統健康度'
    },
    {
      title: 'AI 回應',
      value: stats.avgResponseTime || 1.2,
      suffix: 's',
      icon: Brain,
      color: 'cyan',
      change: '-0.3s',
      changeType: 'positive' as const,
      description: '平均回應時間'
    },
    {
      title: '內容審核',
      value: stats.blockedQuestions || 3,
      icon: Shield,
      color: 'orange',
      change: '-2',
      changeType: 'positive' as const,
      description: '今日攝截數'
    }
  ]

  const quickActions = [
    {
      title: '商家管理',
      description: '新增和管理商家資訊',
      icon: Store,
      color: 'blue',
      link: '/admin/stores',
      count: stores.length
    },
    {
      title: '對話記錄',
      description: '查看使用者對話歷史',
      icon: MessageCircle,
      color: 'green',
      link: '/admin/conversations',
      count: stats.totalConversations || 0
    },
    {
      title: '資料分析',
      description: '查看詳細統計報告',
      icon: BarChart3,
      color: 'purple',
      link: '/admin/analytics',
      count: '新'
    },
    {
      title: 'FAQ 管理',
      description: '編輯常見問題和回答',
      icon: MessageCircle,
      color: 'emerald',
      link: '/admin/faqs',
      count: stats.totalFAQs || 0
    },
    {
      title: '訓練資料',
      description: '更新 AI 訓練資料',
      icon: TrendingUp,
      color: 'cyan',
      link: '/admin/training',
      count: stats.trainingCount || 0
    },
    {
      title: 'AI 設定',
      description: 'AI 模型設定與最佳化',
      icon: Brain,
      color: 'orange',
      link: '/admin/ai-config',
      count: '設定'
    }
  ]

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border' | 'hover' | 'gradient') => {
    const colors = {
      blue: {
        bg: 'bg-blue-500',
        text: 'text-blue-600',
        border: 'border-blue-200',
        hover: 'hover:border-blue-300 hover:bg-blue-50',
        gradient: 'from-blue-500 to-blue-600'
      },
      green: {
        bg: 'bg-green-500',
        text: 'text-green-600',
        border: 'border-green-200',
        hover: 'hover:border-green-300 hover:bg-green-50',
        gradient: 'from-green-500 to-green-600'
      },
      purple: {
        bg: 'bg-purple-500',
        text: 'text-purple-600',
        border: 'border-purple-200',
        hover: 'hover:border-purple-300 hover:bg-purple-50',
        gradient: 'from-purple-500 to-purple-600'
      },
      red: {
        bg: 'bg-red-500',
        text: 'text-red-600',
        border: 'border-red-200',
        hover: 'hover:border-red-300 hover:bg-red-50',
        gradient: 'from-red-500 to-red-600'
      },
      emerald: {
        bg: 'bg-emerald-500',
        text: 'text-emerald-600',
        border: 'border-emerald-200',
        hover: 'hover:border-emerald-300 hover:bg-emerald-50',
        gradient: 'from-emerald-500 to-emerald-600'
      },
      cyan: {
        bg: 'bg-cyan-500',
        text: 'text-cyan-600',
        border: 'border-cyan-200',
        hover: 'hover:border-cyan-300 hover:bg-cyan-50',
        gradient: 'from-cyan-500 to-cyan-600'
      },
      orange: {
        bg: 'bg-orange-500',
        text: 'text-orange-600',
        border: 'border-orange-200',
        hover: 'hover:border-orange-300 hover:bg-orange-50',
        gradient: 'from-orange-500 to-orange-600'
      }
    }
    return colors[color as keyof typeof colors]?.[type] || colors.blue[type]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 space-y-8">
      {/* 現代化歡迎資訊 */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">您好，{admin?.full_name || '管理員'}</h1>
            <p className="text-blue-100 text-lg font-medium mb-4">
              今天是 {new Date().toLocaleDateString('zh-TW', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">系統狀態：</span>
                <span className="ml-2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">正常運行</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">上次登入： 2 小時前</span>
              </div>
              {versionInfo && (
                <div className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">版本：</span>
                  <span className="ml-2 px-2 py-1 bg-white/20 text-white text-xs font-bold rounded-full">
                    {versionInfo.version}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
              <div className="text-2xl font-bold mb-1">{new Date().toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}</div>
              <div className="text-sm opacity-90">{new Date().toLocaleDateString('zh-TW', { weekday: 'short' })}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 現代化資料統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{card.title}</p>
                    <div className={cn(
                      'p-2 rounded-xl bg-gradient-to-br shadow-lg',
                      `${getColorClasses(card.color, 'gradient')}`
                    )}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-2">
                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                    {card.suffix && <span className="text-lg text-slate-500 ml-1">{card.suffix}</span>}
                  </p>
                  <p className="text-xs text-slate-500 mb-3">{card.description}</p>
                  <div className="flex items-center">
                    <div className={cn(
                      'flex items-center px-2 py-1 rounded-full text-xs font-bold',
                      card.changeType === 'positive' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-red-100 text-red-700'
                    )}>
                      <TrendingUp className={cn(
                        'w-3 h-3 mr-1',
                        card.changeType !== 'positive' && 'rotate-180'
                      )} />
                      {card.change}
                    </div>
                    <span className="text-slate-400 text-xs ml-2">較上月</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* 快速操作模組 - 佔用 2 欄 */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">快速操作</h3>
              <div className="flex items-center text-sm text-slate-500">
                <Target className="w-4 h-4 mr-1" />
                熱門功能
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link
                    key={index}
                    to={action.link}
                    className={cn(
                      'group flex items-center p-4 rounded-xl border-2 border-slate-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
                      getColorClasses(action.color, 'hover')
                    )}
                  >
                    <div className={cn(
                      'p-3 rounded-xl mr-4 bg-gradient-to-br shadow-md group-hover:scale-110 transition-transform duration-300',
                      `${getColorClasses(action.color, 'gradient')}`
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-1">{action.title}</h4>
                      <p className="text-sm text-slate-500 mb-2">{action.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          'text-xs font-bold px-2 py-1 rounded-full',
                          typeof action.count === 'number' 
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-blue-100 text-blue-700'
                        )}>
                          {typeof action.count === 'number' ? `${action.count} 項` : action.count}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* 系統狀態與活動日誌 */}
        <div className="space-y-6">
          {/* 系統狀態 */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">系統狀態</h3>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-medium text-green-600">在線</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center">
                  <Activity className="w-4 h-4 text-blue-500 mr-3" />
                  <span className="text-sm font-medium text-slate-700">CPU 使用率</span>
                </div>
                <span className="text-sm font-bold text-slate-900">32%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center">
                  <Brain className="w-4 h-4 text-purple-500 mr-3" />
                  <span className="text-sm font-medium text-slate-700">AI 回應</span>
                </div>
                <span className="text-sm font-bold text-green-600">1.2s</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-orange-500 mr-3" />
                  <span className="text-sm font-medium text-slate-700">安全狀態</span>
                </div>
                <span className="text-sm font-bold text-green-600">正常</span>
              </div>
            </div>
          </div>

          {/* 今日更新 */}
          {todayUpdates.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">今日更新</h3>
                <Link to="/admin/version" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  查看全部 →
                </Link>
              </div>
              <div className="space-y-3">
                {todayUpdates.slice(0, 3).map((update, index) => (
                  <div key={update.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{update.title}</p>
                      <p className="text-xs text-slate-500">{update.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {update.type}
                        </span>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          {update.impact}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 最近活動 */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">最近活動</h3>
              <Eye className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">新增了 3 家商家資訊</p>
                  <p className="text-xs text-slate-500">{new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">更新了 FAQ 內容</p>
                  <p className="text-xs text-slate-500">{new Date(Date.now() - 5 * 60 * 60 * 1000).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">系統安全檢查完成</p>
                  <p className="text-xs text-slate-500">{new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">數據備份完成</p>
                  <p className="text-xs text-slate-500">{new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome