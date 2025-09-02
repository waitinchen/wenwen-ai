import React, { useState, useEffect } from 'react'
import { Search, MessageCircle, Users, Clock, ArrowRight, Filter, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface ConversationSession {
  id: number
  session_id: string
  user_ip: string
  user_agent: string
  started_at: string
  last_activity: string
  message_count: number
  latest_message?: string
  user_display_name: string
  user_avatar?: string
  line_users?: {
    id: number
    line_uid: string
    line_display_name: string
    line_avatar_url?: string
  } | null
}

const ConversationHistoryManager: React.FC = () => {
  const [sessions, setSessions] = useState<ConversationSession[]>([])
  const [filteredSessions, setFilteredSessions] = useState<ConversationSession[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('all') // 'today', 'week', 'month', 'all'
  const [sortBy, setSortBy] = useState('last_activity') // 'last_activity', 'started_at', 'message_count'
  const [sortOrder, setSortOrder] = useState('desc')
  const [totalStats, setTotalStats] = useState({
    totalSessions: 0,
    totalMessages: 0,
    todaySessions: 0
  })

  useEffect(() => {
    loadConversations()
  }, [sortBy, sortOrder])

  useEffect(() => {
    filterAndSearch()
  }, [sessions, searchTerm, dateFilter])

  const loadConversations = async () => {
    try {
      setLoading(true)
      
      // 獲取會話列表
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .limit(100)

      if (sessionError) {
        console.error('載入會話失敗:', sessionError)
        return
      }

      if (!sessionData) {
        setSessions([])
        return
      }

      // 為每個會話獲取LINE用戶信息和最新消息
      const sessionsWithDetails = await Promise.all(
        sessionData.map(async (session) => {
          try {
            // 獲取LINE用戶資訊
            let lineUser = null
            if (session.line_user_id) {
              const { data: userData } = await supabase
                .from('line_users')
                .select('id, line_uid, line_display_name, line_avatar_url')
                .eq('id', session.line_user_id)
                .maybeSingle()
              
              lineUser = userData
            }

            // 獲取該會話的最新用戶消息作為預覽
            const { data: latestMessage } = await supabase
              .from('chat_messages')
              .select('content')
              .eq('session_id', session.session_id)
              .eq('message_type', 'user')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            // 優先顯示LINE用戶信息
            let userDisplayName = '';
            let userAvatar = '';
            
            if (lineUser && lineUser.line_display_name) {
              userDisplayName = lineUser.line_display_name;
              userAvatar = lineUser.line_avatar_url || '';
            } else {
              userDisplayName = session.user_ip ? `用戶 (${session.user_ip})` : '遊客';
            }

            return {
              ...session,
              latest_message: latestMessage?.content || '無消息記錄',
              user_display_name: userDisplayName,
              user_avatar: userAvatar,
              line_users: lineUser,
              // 確保必要字段不為null
              user_ip: session.user_ip || 'unknown',
              session_id: session.session_id || '',
              user_agent: session.user_agent || '',
              started_at: session.started_at || new Date().toISOString(),
              last_activity: session.last_activity || new Date().toISOString(),
              message_count: session.message_count || 0
            }
          } catch (error) {
            console.error('處理會話數據錯誤:', error, session)
            // 返回安全的默認值
            return {
              ...session,
              latest_message: '無法載入消息',
              user_display_name: '無效用戶',
              user_avatar: '',
              line_users: null,
              user_ip: session.user_ip || 'unknown',
              session_id: session.session_id || '',
              user_agent: session.user_agent || '',
              started_at: session.started_at || new Date().toISOString(),
              last_activity: session.last_activity || new Date().toISOString(),
              message_count: session.message_count || 0
            }
          }
        })
      )

      setSessions(sessionsWithDetails)

      // 統計數據
      const totalSessions = sessionsWithDetails.length
      const totalMessages = sessionsWithDetails.reduce((sum, s) => sum + s.message_count, 0)
      const today = new Date().toISOString().split('T')[0]
      const todaySessions = sessionsWithDetails.filter(
        s => s.started_at.startsWith(today)
      ).length

      setTotalStats({ totalSessions, totalMessages, todaySessions })
    } catch (error) {
      console.error('載入對話歷史失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSearch = () => {
    let filtered = [...sessions]

    // 日期過濾
    if (dateFilter !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter(s => new Date(s.last_activity) >= filterDate)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          filtered = filtered.filter(s => new Date(s.last_activity) >= filterDate)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          filtered = filtered.filter(s => new Date(s.last_activity) >= filterDate)
          break
      }
    }

    // 搜索過濾 - 添加null值安全檢查
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(s => {
        try {
          // 安全的字符串比較，添加null值檢查
          const userIp = (s.user_ip || '').toLowerCase()
          const latestMessage = (s.latest_message || '').toLowerCase()
          const sessionId = (s.session_id || '').toLowerCase()
          
          return userIp.includes(term) ||
                 latestMessage.includes(term) ||
                 sessionId.includes(term)
        } catch (error) {
          console.error('搜索過濾錯誤:', error, '會話數據:', s)
          // 如果出現錯誤，跳過這個項目
          return false
        }
      })
    }

    setFilteredSessions(filtered)
  }

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return '剛剛'
    if (diffInHours < 24) return `${diffInHours}小時前`
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}天前`
    return formatDateTime(timestamp)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">載入對話歷史中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 頁面標題和統計 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-semibold text-gray-900">對話歷史管理</h1>
          </div>
        </div>
        
        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">總會話數</p>
                <p className="text-xl font-semibold text-gray-900">{totalStats.totalSessions}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">總消息數</p>
                <p className="text-xl font-semibold text-gray-900">{totalStats.totalMessages}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">今日會話</p>
                <p className="text-xl font-semibold text-gray-900">{totalStats.todaySessions}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 過濾和搜索 */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="搜索用戶IP、消息內容或會話ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* 日期過濾 */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">所有時間</option>
            <option value="today">今天</option>
            <option value="week">過去7天</option>
            <option value="month">過去30天</option>
          </select>
          
          {/* 排序 */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field)
              setSortOrder(order)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="last_activity-desc">最新活動時間</option>
            <option value="started_at-desc">開始時間（新到舊）</option>
            <option value="started_at-asc">開始時間（舊到新）</option>
            <option value="message_count-desc">消息數（多到少）</option>
            <option value="message_count-asc">消息數（少到多）</option>
          </select>
        </div>
      </div>

      {/* 會話列表 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">
            對話會話列表 ({filteredSessions.length})
          </h2>
        </div>
        
        {filteredSessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>沒有找到對話記錄</p>
            {searchTerm && (
              <p className="text-sm mt-2">請嘗試調整搜索條件</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSessions.map((session) => (
              <div key={session.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {/* 顯示LINE用戶頭像或默認圖標 */}
                      {session.user_avatar ? (
                        <img 
                          src={session.user_avatar} 
                          alt={session.user_display_name}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            // 如果頭像載入失敗，顯示默認圖標
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const nextElement = target.nextSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      {!session.user_avatar && (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      <div className="hidden w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {session.user_display_name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {session.user_avatar ? 'LINE用戶' : `IP: ${session.user_ip}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="ml-11">
                      <p className="text-sm text-gray-600 mb-1 truncate max-w-md">
                        最新消息: {session.latest_message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {session.message_count} 條消息
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(session.last_activity)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    to={`/admin/conversations/${session.session_id}`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    查看詳情
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationHistoryManager