import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/Toast'

interface AnalyticsData {
  totalUsers: number
  totalSessions: number
  totalMessages: number
  averageResponseTime: number
  userSatisfaction: number
  dailyStats: Array<{
    date: string
    users: number
    sessions: number
    messages: number
  }>
  hourlyStats: Array<{
    hour: number
    count: number
  }>
  topQuestions: Array<{
    question: string
    count: number
  }>
  userFeedback: {
    positive: number
    negative: number
    neutral: number
  }
}

interface UseAnalyticsProps {
  dateRange?: {
    start: string
    end: string
  }
  autoFetch?: boolean
}

export function useAnalytics({ dateRange, autoFetch = true }: UseAnalyticsProps = {}) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useToast()

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const endDate = dateRange?.end || new Date().toISOString()

      // 並行獲取所有數據
      const [
        usersResult,
        sessionsResult,
        messagesResult,
        dailyStatsResult,
        hourlyStatsResult,
        topQuestionsResult,
        feedbackResult
      ] = await Promise.all([
        // 總用戶數
        supabase
          .from('line_users')
          .select('count', { count: 'exact' })
          .eq('is_active', true),
        
        // 總會話數
        supabase
          .from('chat_sessions')
          .select('count', { count: 'exact' })
          .gte('started_at', startDate)
          .lte('started_at', endDate),
        
        // 總消息數
        supabase
          .from('chat_messages')
          .select('count', { count: 'exact' })
          .gte('created_at', startDate)
          .lte('created_at', endDate),
        
        // 每日統計
        supabase
          .from('chat_sessions')
          .select(`
            started_at,
            line_users!inner(count),
            chat_messages(count)
          `)
          .gte('started_at', startDate)
          .lte('started_at', endDate)
          .order('started_at', { ascending: true }),
        
        // 每小時統計
        supabase
          .from('chat_sessions')
          .select('started_at')
          .gte('started_at', startDate)
          .lte('started_at', endDate),
        
        // 熱門問題
        supabase
          .from('chat_messages')
          .select('message_text')
          .eq('message_type', 'user')
          .gte('created_at', startDate)
          .lte('created_at', endDate),
        
        // 用戶反饋
        supabase
          .from('chat_messages')
          .select('user_feedback')
          .not('user_feedback', 'is', null)
          .gte('created_at', startDate)
          .lte('created_at', endDate)
      ])

      // 處理錯誤
      const results = [usersResult, sessionsResult, messagesResult, dailyStatsResult, hourlyStatsResult, topQuestionsResult, feedbackResult]
      const errors = results.filter(result => result.error)
      if (errors.length > 0) {
        throw new Error(`Database errors: ${errors.map(e => e.error?.message).join(', ')}`)
      }

      // 計算平均響應時間
      const { data: responseTimeData } = await supabase
        .from('chat_messages')
        .select('response_time')
        .not('response_time', 'is', null)
        .gte('created_at', startDate)
        .lte('created_at', endDate)

      const averageResponseTime = responseTimeData?.length 
        ? responseTimeData.reduce((sum, msg) => sum + (msg.response_time || 0), 0) / responseTimeData.length
        : 0

      // 處理每日統計
      const dailyStatsMap = new Map<string, { users: Set<string>, sessions: number, messages: number }>()
      
      if (dailyStatsResult.data) {
        dailyStatsResult.data.forEach(session => {
          const date = new Date(session.started_at).toISOString().split('T')[0]
          if (!dailyStatsMap.has(date)) {
            dailyStatsMap.set(date, { users: new Set(), sessions: 0, messages: 0 })
          }
          const dayData = dailyStatsMap.get(date)!
          dayData.sessions++
          // 這裡需要根據實際數據結構調整
        })
      }

      const dailyStats = Array.from(dailyStatsMap.entries()).map(([date, data]) => ({
        date,
        users: data.users.size,
        sessions: data.sessions,
        messages: data.messages
      }))

      // 處理每小時統計
      const hourlyStatsMap = new Map<number, number>()
      if (hourlyStatsResult.data) {
        hourlyStatsResult.data.forEach(session => {
          const hour = new Date(session.started_at).getHours()
          hourlyStatsMap.set(hour, (hourlyStatsMap.get(hour) || 0) + 1)
        })
      }

      const hourlyStats = Array.from(hourlyStatsMap.entries())
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => a.hour - b.hour)

      // 處理熱門問題
      const questionCounts = new Map<string, number>()
      if (topQuestionsResult.data) {
        topQuestionsResult.data.forEach(msg => {
          const question = msg.message_text.toLowerCase().trim()
          if (question.length > 10) { // 過濾太短的問題
            questionCounts.set(question, (questionCounts.get(question) || 0) + 1)
          }
        })
      }

      const topQuestions = Array.from(questionCounts.entries())
        .map(([question, count]) => ({ question, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      // 處理用戶反饋
      const feedback = { positive: 0, negative: 0, neutral: 0 }
      if (feedbackResult.data) {
        feedbackResult.data.forEach(msg => {
          if (msg.user_feedback === 1) feedback.positive++
          else if (msg.user_feedback === -1) feedback.negative++
          else feedback.neutral++
        })
      }

      const totalFeedback = feedback.positive + feedback.negative + feedback.neutral
      const userSatisfaction = totalFeedback > 0 
        ? (feedback.positive / totalFeedback) * 100 
        : 0

      setData({
        totalUsers: usersResult.count || 0,
        totalSessions: sessionsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        averageResponseTime: Math.round(averageResponseTime),
        userSatisfaction: Math.round(userSatisfaction * 100) / 100,
        dailyStats,
        hourlyStats,
        topQuestions,
        userFeedback: feedback
      })

    } catch (error) {
      console.error('Error fetching analytics:', error)
      addToast({
        type: 'error',
        title: '載入失敗',
        message: '無法載入分析數據'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchAnalytics()
    }
  }, [dateRange, autoFetch])

  return {
    data,
    isLoading,
    fetchAnalytics,
    refetch: fetchAnalytics
  }
}

