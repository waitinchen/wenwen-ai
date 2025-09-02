import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageCircle,
  Shield,
  Activity,
  Clock,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getDashboardStats,
  getConversationTrends,
  getPopularQuestions,
  getUsageHeatmap,
  getUserSatisfaction,
  getBlockedQuestionsStats
} from '@/lib/api'
import AnalyticsDashboard from './AnalyticsDashboard'

interface AnalyticsPageProps {
  className?: string
}

const AnalyticsPage = ({ className }: AnalyticsPageProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // 數據分析狀態
  const [dashboardStats, setDashboardStats] = useState<any>({})
  const [conversationTrends, setConversationTrends] = useState<any[]>([])
  const [popularQuestions, setPopularQuestions] = useState<any[]>([])
  const [usageHeatmap, setUsageHeatmap] = useState<any[]>([])
  const [userSatisfaction, setUserSatisfaction] = useState<any>({})
  const [blockedStats, setBlockedStats] = useState<any>({})

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    setLoading(true)
    setError('')
    try {
      const dateRange = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00Z',
        end: new Date().toISOString().split('T')[0] + 'T23:59:59Z'
      }

      const [statsData, trendsData, questionsData, heatmapData, satisfactionData, blockedData] = await Promise.all([
        getDashboardStats(dateRange),
        getConversationTrends(dateRange),
        getPopularQuestions(dateRange),
        getUsageHeatmap(dateRange),
        getUserSatisfaction(dateRange),
        getBlockedQuestionsStats(dateRange)
      ])
      
      setDashboardStats(statsData || {})
      setConversationTrends(trendsData || [])
      setPopularQuestions(questionsData || [])
      setUsageHeatmap(heatmapData || [])
      setUserSatisfaction(satisfactionData || {})
      setBlockedStats(blockedData || {})
    } catch (err: any) {
      setError(err.message || '載入分析數據失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadAnalyticsData()
  }

  if (loading) {
    return (
      <div className={cn("flex justify-center items-center py-12", className)}>
        <div className="flex items-center gap-2 text-gray-600">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#06C755]"></div>
          <span>載入分析數據中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-sm font-medium text-red-800">載入錯誤</p>
          </div>
          <div className="mt-2 text-sm text-red-700">{error}</div>
          <button
            onClick={handleRefresh}
            className="mt-3 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-800 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            重新載入
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6 max-w-7xl mx-auto", className)}>
      {/* 標頭 */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-500" />
            數據分析
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            查看系統運行狀況和用戶互動數據統計
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#06C755] text-white rounded-lg hover:bg-[#05B34A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          刷新數據
        </button>
      </div>

      {/* 分析儀表板 */}
      <AnalyticsDashboard
        dashboardStats={dashboardStats}
        conversationTrends={conversationTrends}
        popularQuestions={popularQuestions}
        usageHeatmap={usageHeatmap}
        userSatisfaction={userSatisfaction}
        blockedStats={blockedStats}
      />
    </div>
  )
}

export default AnalyticsPage
