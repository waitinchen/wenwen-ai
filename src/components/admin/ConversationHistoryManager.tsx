import React, { useState, useEffect } from 'react'
import { Search, MessageCircle, Users, Clock, ArrowRight, Filter, Calendar, Plus, Trash2, Database, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { testDataGenerator } from '@/utils/testDataGenerator'

interface ConversationSession {
  id: string
  user_id?: string
  line_user_id?: number
  client_ip?: string
  user_agent?: string
  started_at: string
  last_active: string
  message_count: number
  last_message_preview?: string
  user_profiles?: {
    id: string
    display_name: string
    avatar_url?: string
  } | null
  line_users?: {
    id: number
    line_user_id: string
    display_name: string
    picture_url?: string
  } | null
  // 為了向後相容，添加舊的欄位名稱
  user_ip?: string
  session_id?: string
  last_activity?: string
  latest_message?: string
  user_display_name?: string
  user_avatar?: string
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
  const [isGeneratingData, setIsGeneratingData] = useState(false)
  const [isClearingData, setIsClearingData] = useState(false)

  // 生成 Mock 對話資料
  // 從消息記錄重建會話資訊
  const rebuildSessionsFromMessages = (messages: any[]): ConversationSession[] => {
    const sessionGroups: { [key: string]: any[] } = {}

    // 按會話ID分組消息
    messages.forEach(message => {
      const sessionId = message.session_id
      if (!sessionGroups[sessionId]) {
        sessionGroups[sessionId] = []
      }
      sessionGroups[sessionId].push(message)
    })

    // 為每個會話生成會話資訊
    return Object.entries(sessionGroups).map(([sessionId, sessionMessages]) => {
      const sortedMessages = sessionMessages.sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )

      const firstMessage = sortedMessages[0]
      const lastMessage = sortedMessages[sortedMessages.length - 1]
      const userMessages = sortedMessages.filter(msg => msg.message_type === 'user')

      return {
        id: sessionId,
        session_id: sessionId,
        user_id: null,
        line_user_id: null,
        client_ip: 'unknown',
        user_agent: 'Unknown',
        started_at: firstMessage.created_at,
        last_active: lastMessage.created_at,
        message_count: sessionMessages.length,
        last_message_preview: userMessages.length > 0 ? userMessages[userMessages.length - 1].content : '',
        user_profiles: null,
        line_users: null,
        user_ip: 'unknown',
        last_activity: lastMessage.created_at,
        latest_message: userMessages.length > 0 ? userMessages[userMessages.length - 1].content : '',
        user_display_name: `用戶 (${sessionId.substring(0, 8)})`,
        user_avatar: undefined
      }
    })
  }

  const generateMockConversationData = async (): Promise<ConversationSession[]> => {
    const mockSessions: ConversationSession[] = [
      {
        id: 'mock-session-1',
        user_id: 'user-1',
        line_user_id: 1,
        client_ip: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2小時前
        last_active: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30分鐘前
        message_count: 8,
        last_message_preview: '我想學美語，有什麼推薦的補習班嗎？',
        user_profiles: null,
        line_users: {
          id: 1,
          line_user_id: 'U1234567890',
          display_name: '小明',
          picture_url: 'https://example.com/avatar1.jpg'
        },
        user_ip: '192.168.1.100',
        session_id: 'mock-session-1',
        last_activity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        latest_message: '我想學美語，有什麼推薦的補習班嗎？',
        user_display_name: '小明',
        user_avatar: 'https://example.com/avatar1.jpg'
      },
      {
        id: 'mock-session-2',
        user_id: 'user-2',
        line_user_id: 2,
        client_ip: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        started_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5小時前
        last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2小時前
        message_count: 12,
        last_message_preview: '文山特區有什麼好吃的餐廳？',
        user_profiles: null,
        line_users: {
          id: 2,
          line_user_id: 'U0987654321',
          display_name: '小美',
          picture_url: 'https://example.com/avatar2.jpg'
        },
        user_ip: '192.168.1.101',
        session_id: 'mock-session-2',
        last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        latest_message: '文山特區有什麼好吃的餐廳？',
        user_display_name: '小美',
        user_avatar: 'https://example.com/avatar2.jpg'
      },
      {
        id: 'mock-session-3',
        user_id: 'user-3',
        line_user_id: null,
        client_ip: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (Android 11; Mobile; rv:68.0)',
        started_at: new Date().toISOString(), // 今天
        last_active: new Date().toISOString(), // 現在
        message_count: 4,
        last_message_preview: '停車資訊',
        user_profiles: null,
        line_users: null,
        user_ip: '192.168.1.102',
        session_id: 'mock-session-3',
        last_activity: new Date().toISOString(),
        latest_message: '停車資訊',
        user_display_name: '用戶 192.168.1.102',
        user_avatar: undefined
      }
    ]
    
    return mockSessions
  }

  useEffect(() => {
    loadConversations()
  }, [sortBy, sortOrder])

  useEffect(() => {
    filterAndSearch()
  }, [sessions, searchTerm, dateFilter])

  const loadConversations = async () => {
    try {
      setLoading(true)

      console.log('[ConversationHistoryManager] 開始載入對話記錄...')

      // 先檢查 chat_sessions 表格是否存在，並JOIN用戶資料
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select(`
          id,
          session_id,
          user_id,
          line_user_id,
          user_ip,
          user_agent,
          started_at,
          last_activity,
          message_count,
          user_meta,
          created_at,
          updated_at,
          user_profiles (
            id,
            display_name,
            avatar_url
          ),
          line_users (
            id,
            line_user_id,
            display_name,
            picture_url
          )
        `)
        .order(sortBy === 'last_activity' ? 'last_activity' : sortBy, { ascending: sortOrder === 'asc' })
        .limit(100)

      console.log('[ConversationHistoryManager] Supabase 查詢結果:', {
        sessionCount: sessionData?.length || 0,
        hasError: !!sessionError,
        errorDetails: sessionError
      })

      if (sessionError) {
        console.error('[ConversationHistoryManager] 載入會話失敗:', {
          message: sessionError.message,
          code: sessionError.code,
          details: sessionError.details,
          hint: sessionError.hint
        })

        // 如果是表格不存在或權限問題，嘗試直接查詢 chat_messages
        console.log('[ConversationHistoryManager] 嘗試從 chat_messages 表格重建會話資料...')

        try {
          const { data: messagesData, error: messagesError } = await supabase
            .from('chat_messages')
            .select('session_id, message_type, content, created_at')
            .order('created_at', { ascending: false })
            .limit(200)

          if (!messagesError && messagesData && messagesData.length > 0) {
            console.log('[ConversationHistoryManager] 從消息重建會話，找到', messagesData.length, '條消息')
            const rebuiltSessions = rebuildSessionsFromMessages(messagesData)
            setSessions(rebuiltSessions)
            setTotalStats({
              totalSessions: rebuiltSessions.length,
              totalMessages: messagesData.length,
              todaySessions: rebuiltSessions.filter(s => {
                const today = new Date().toDateString()
                const sessionDate = new Date(s.started_at).toDateString()
                return today === sessionDate
              }).length
            })
            setLoading(false)
            return
          }
        } catch (rebuildError) {
          console.error('[ConversationHistoryManager] 重建會話失敗:', rebuildError)
        }

        // 最後使用 Mock 資料作為回退
        console.log('[ConversationHistoryManager] 使用 Mock 資料作為回退')
        const mockSessions = await generateMockConversationData()
        setSessions(mockSessions)
        setTotalStats({
          totalSessions: mockSessions.length,
          totalMessages: mockSessions.reduce((sum, s) => sum + s.message_count, 0),
          todaySessions: mockSessions.filter(s => {
            const today = new Date().toDateString()
            const sessionDate = new Date(s.started_at).toDateString()
            return today === sessionDate
          }).length
        })
        setLoading(false)
        return
      }

      if (!sessionData) {
        setSessions([])
        return
      }

      // 處理會話資料 (支援新舊格式相容)
      const sessionsWithDetails = sessionData.map((session) => {
        console.log('[ConversationHistoryManager] 處理會話資料:', session)

        // 解析用戶元資料
        let userMeta = null;
        try {
          if (session.user_meta) {
            userMeta = typeof session.user_meta === 'string'
              ? JSON.parse(session.user_meta)
              : session.user_meta;
          }
        } catch (error) {
          console.warn('[ConversationHistoryManager] 解析用戶元資料失敗:', error);
        }

        // 相容性處理：處理不同的欄位名稱
        const userIp = session.user_ip || 'unknown'
        const lastActivity = session.last_activity || session.created_at
        const sessionId = session.session_id || session.id

        // 生成顯示名稱 - 優先使用JOIN的資料，再用userMeta作為fallback
        const displayName = session.user_profiles?.[0]?.display_name ||
                            session.line_users?.[0]?.display_name ||
                            userMeta?.display_name ||
                            userMeta?.line_display_name ||
                            `用戶 ${userIp === 'unknown' ? '未知' : userIp}`;
        const avatarUrl = session.user_profiles?.[0]?.avatar_url ||
                          session.line_users?.[0]?.picture_url ||
                          userMeta?.avatar_url ||
                          userMeta?.line_avatar_url;

        return {
          id: session.id || sessionId,
          user_id: session.user_id,
          line_user_id: session.line_user_id,
          user_ip: userIp,
          user_agent: session.user_agent || 'Unknown',
          started_at: session.started_at || session.created_at || new Date().toISOString(),
          last_activity: lastActivity,
          last_active: lastActivity, // 添加缺失的欄位
          message_count: session.message_count || 0,
          last_message_preview: '', // 稍後從消息表查詢
          user_profiles: session.user_profiles?.[0] || null,
          line_users: session.line_users?.[0] || null,
          // 為了向後相容，添加舊的欄位名稱
          session_id: sessionId,
          latest_message: '', // 稍後從消息表查詢
          user_display_name: displayName,
          user_avatar: avatarUrl
        }
      })

      setSessions(sessionsWithDetails)

      // 統計數據
      const totalSessions = sessionsWithDetails.length
      const totalMessages = sessionsWithDetails.reduce((sum, s) => sum + s.message_count, 0)
      
      // 計算今日會話 - 使用正確的 UTC 時間比較
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
      
      // 轉換為 UTC 時間字符串進行比較
      const todayStartUTC = todayStart.toISOString()
      const todayEndUTC = todayEnd.toISOString()
      
      const todaySessions = sessionsWithDetails.filter(session => {
        const sessionDate = session.started_at
        return sessionDate >= todayStartUTC && sessionDate < todayEndUTC
      }).length

      // 調試信息
      console.log('今日會話計算:', {
        todayStartUTC,
        todayEndUTC,
        totalSessions: sessionsWithDetails.length,
        todaySessions,
        sampleSession: sessionsWithDetails[0]?.started_at
      })

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

  const handleGenerateTestData = async () => {
    setIsGeneratingData(true)
    try {
      // 直接在前端生成測試數據，不依賴數據庫
      const testSessions = generateMockSessions(15)
      setSessions(testSessions)
      
      // 更新統計數據
      setTotalStats({
        totalSessions: testSessions.length,
        totalMessages: testSessions.reduce((sum, session) => sum + (session.message_count || 0), 0),
        todaySessions: testSessions.filter(session => {
          const today = new Date().toDateString()
          return new Date(session.started_at).toDateString() === today
        }).length
      })
      
      alert('✅ 測試數據生成成功！')
    } catch (error) {
      console.error('生成測試數據失敗:', error)
      alert('❌ 生成測試數據失敗，請檢查控制台')
    } finally {
      setIsGeneratingData(false)
    }
  }

  const generateMockSessions = (count: number) => {
    const sessions = []
    const sampleMessages = [
      '文山特區有什麼好吃的餐廳？',
      '停車資訊',
      '最近的活動有哪些？',
      '商場營業時間',
      '有推薦的咖啡廳嗎？',
      '交通怎麼去？',
      '附近有什麼景點？',
      '有優惠活動嗎？',
      '客服電話是多少？',
      '如何成為會員？'
    ]

    for (let i = 0; i < count; i++) {
      const sessionId = `test_session_${Date.now()}_${i}`
      const userIp = i % 3 === 0 ? 'unknown-client' : `192.168.1.${100 + i}`
      const hasLineUser = i % 4 === 0
      const messageCount = Math.floor(Math.random() * 5) + 1
      const latestMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)]
      
      sessions.push({
        id: i + 1,
        session_id: sessionId,
        user_ip: userIp,
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        line_user_id: hasLineUser ? i + 1 : null,
        started_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        last_activity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        message_count: messageCount,
        latest_message: latestMessage,
        user_display_name: hasLineUser ? `測試用戶${i + 1}` : (userIp === 'unknown-client' ? '遊客用戶' : `用戶 (${userIp})`),
        user_avatar: hasLineUser ? `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 1}` : '',
        line_users: hasLineUser ? {
          id: i + 1,
          line_user_id: `test_user_${i + 1}`,
          display_name: `測試用戶${i + 1}`,
          picture_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 1}`
        } : null
      })
    }
    
    return sessions
  }

  const handleClearTestData = async () => {
    if (!confirm('確定要清除所有測試數據嗎？此操作無法復原！')) {
      return
    }
    
    setIsClearingData(true)
    try {
      // 清除前端測試數據
      setSessions([])
      setTotalStats({
        totalSessions: 0,
        totalMessages: 0,
        todaySessions: 0
      })
      alert('✅ 測試數據清除成功！')
    } catch (error) {
      console.error('清除測試數據失敗:', error)
      alert('❌ 清除測試數據失敗，請檢查控制台')
    } finally {
      setIsClearingData(false)
    }
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
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateTestData}
              disabled={isGeneratingData}
              className="inline-flex items-center gap-2 px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingData ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isGeneratingData ? '生成中...' : '生成測試數據'}
            </button>
            <button
              onClick={handleClearTestData}
              disabled={isClearingData}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClearingData ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isClearingData ? '清除中...' : '清除測試數據'}
            </button>
            <button
              onClick={loadConversations}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-4 w-4" />
              重新載入
            </button>
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
                          {session.user_avatar ? 'LINE用戶' : 
                           session.user_ip && session.user_ip !== 'unknown-client' ? `IP: ${session.user_ip}` : '遊客用戶'}
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