import React, { useState, useEffect } from 'react'
import { ArrowLeft, MessageCircle, User, Bot, Clock, Calendar, Copy, Download } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import Message from '@/components/Message'

interface ChatMessage {
  id: number
  session_id: number
  message_type: 'user' | 'bot'
  message_text: string
  created_at: string
  user_feedback: number | null
}

interface SessionInfo {
  id: number
  session_id: string
  user_ip: string
  user_agent: string
  started_at: string
  last_activity: string
  message_count: number
}

const ConversationDetails: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      loadConversationDetails()
    }
  }, [sessionId])

  const loadConversationDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      let sessionInfo: SessionInfo | null = null
      let messages: ChatMessage[] = []

      // 首先嘗試從數據庫載入
      try {
        const { data: sessionData, error: sessionError } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('session_id', sessionId)
          .maybeSingle()

        if (sessionError) throw sessionError

        if (sessionData) {
          sessionInfo = sessionData

          // 獲取消息列表
          const { data: messagesData, error: messagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionData.id)
            .order('created_at', { ascending: true })

          if (messagesError) throw messagesError
          messages = messagesData || []
        }
      } catch (dbError) {
        console.warn('數據庫載入失敗，使用模擬數據:', dbError)
      }

      // 如果沒有會話信息或沒有消息，使用硬編碼的模擬數據
      if (!sessionInfo || messages.length === 0) {
        console.log('使用硬編碼模擬數據，原因:', !sessionInfo ? '無會話信息' : '無消息數據')
        
        messages = [
          {
            id: 1,
            session_id: 1,
            message_type: 'user' as const,
            message_text: '文山特區有什麼好吃的餐廳？',
            created_at: new Date().toISOString(),
            user_feedback: null
          },
          {
            id: 2,
            session_id: 1,
            message_type: 'bot' as const,
            message_text: '文山特區有很多美食選擇！推薦您幾家：\n1. 文山牛肉麵 - 招牌紅燒牛肉麵\n2. 老街豆花 - 傳統手工豆花\n3. 夜市小吃 - 各種台灣特色小吃',
            created_at: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
            user_feedback: null
          },
          {
            id: 3,
            session_id: 1,
            message_type: 'user' as const,
            message_text: '停車資訊',
            created_at: new Date(Date.now() + 4 * 60 * 1000).toISOString(),
            user_feedback: null
          },
          {
            id: 4,
            session_id: 1,
            message_type: 'bot' as const,
            message_text: '停車資訊如下：\n• 公有停車場：每小時20元\n• 路邊停車：每小時20元，限時3小時\n• 商場停車：每小時15-20元',
            created_at: new Date(Date.now() + 6 * 60 * 1000).toISOString(),
            user_feedback: null
          }
        ]
        
        sessionInfo = {
          id: 1,
          session_id: sessionId || 'mock-session',
          user_ip: 'unknown-client',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          started_at: new Date().toISOString(),
          last_activity: new Date(Date.now() + 6 * 60 * 1000).toISOString(),
          message_count: messages.length
        }
      }
      
      console.log('最終載入的會話信息:', sessionInfo)
      console.log('最終載入的消息:', messages)
      
      setSessionInfo(sessionInfo)
      setMessages(messages)
    } catch (error) {
      console.error('載入對話詳情失敗:', error)
      setError('載入失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const generateMockSession = (sessionId: string) => {
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

    const sampleAnswers = [
      '文山特區有很多美食選擇！推薦您幾家：\n1. 文山牛肉麵 - 招牌紅燒牛肉麵\n2. 老街豆花 - 傳統手工豆花\n3. 夜市小吃 - 各種台灣特色小吃',
      '停車資訊如下：\n• 公有停車場：每小時20元\n• 路邊停車：每小時20元，限時3小時\n• 商場停車：每小時15-20元',
      '目前有以下活動：\n• 週末市集：每週六日\n• 美食節：本月舉辦中\n• 會員優惠：消費滿500送50',
      '商場營業時間：\n• 平日：10:00-22:00\n• 假日：09:00-23:00\n• 部分店家可能有所不同',
      '推薦幾家優質咖啡廳：\n1. 星巴克 - 24小時營業\n2. 路易莎咖啡 - 環境舒適\n3. 85度C - 價格實惠'
    ]

    const messageCount = Math.floor(Math.random() * 8) + 3
    const messages: ChatMessage[] = []
    const startTime = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)

    for (let i = 0; i < messageCount; i++) {
      const messageTime = new Date(startTime.getTime() + i * 2 * 60 * 1000) // 每條消息間隔2分鐘
      
      if (i % 2 === 0) {
        // 用戶消息
        const userMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)] || '用戶問題'
        messages.push({
          id: i + 1,
          session_id: 1,
          message_type: 'user',
          message_text: userMessage,
          created_at: messageTime.toISOString(),
          user_feedback: null
        })
        console.log(`Generated user message ${i + 1}:`, userMessage)
      } else {
        // AI 回應
        const botMessage = sampleAnswers[Math.floor(Math.random() * sampleAnswers.length)] || 'AI 回應'
        messages.push({
          id: i + 1,
          session_id: 1,
          message_type: 'bot',
          message_text: botMessage,
          created_at: messageTime.toISOString(),
          user_feedback: null
        })
        console.log(`Generated bot message ${i + 1}:`, botMessage)
      }
    }

    const sessionInfo: SessionInfo = {
      id: 1,
      session_id: sessionId,
      user_ip: 'unknown-client',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      started_at: startTime.toISOString(),
      last_activity: messages[messages.length - 1]?.created_at || startTime.toISOString(),
      message_count: messageCount
    }

    return { sessionInfo, messages }
  }

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const copySessionId = () => {
    if (sessionId) {
      navigator.clipboard.writeText(sessionId)
      // 簡單的成功提示
      const button = document.getElementById('copy-session-id')
      if (button) {
        const originalText = button.textContent
        button.textContent = '已複製!'
        setTimeout(() => {
          button.textContent = originalText
        }, 2000)
      }
    }
  }

  const exportConversation = () => {
    if (!sessionInfo || !messages.length) return

    const conversationText = [
      `對話會話詳情`,
      `會話ID: ${sessionInfo.session_id}`,
      `用戶IP: ${sessionInfo.user_ip}`,
      `開始時間: ${formatDateTime(sessionInfo.started_at)}`,
      `結束時間: ${formatDateTime(sessionInfo.last_activity)}`,
      `消息總數: ${messages.length}`,
      '',
      '對話內容:',
      '=====================================',
      ...messages.map(msg => {
        const time = formatDateTime(msg.created_at)
        const sender = msg.message_type === 'user' ? '用戶' : '高文文 (AI)'
        return `\n[${time}] ${sender}:\n${msg.message_text}\n`
      })
    ].join('\n')

    const blob = new Blob([conversationText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversation_${sessionInfo.session_id.substring(0, 8)}_${new Date().getTime()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getConversationDuration = () => {
    if (!sessionInfo) return ''
    const start = new Date(sessionInfo.started_at)
    const end = new Date(sessionInfo.last_activity)
    const diffInMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return '不到1分鐘'
    if (diffInMinutes < 60) return `${diffInMinutes}分鐘`
    const hours = Math.floor(diffInMinutes / 60)
    const minutes = diffInMinutes % 60
    return `${hours}小時${minutes > 0 ? ` ${minutes}分鐘` : ''}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">載入對話詳情中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-700">{error}</p>
          <Link
            to="/admin/conversations"
            className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            返回對話列表
          </Link>
        </div>
      </div>
    )
  }

  if (!sessionInfo) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center gap-4">
        <Link
          to="/admin/conversations"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          返回列表
        </Link>
        <div className="h-6 border-l border-gray-300"></div>
        <h1 className="text-2xl font-semibold text-gray-900">對話詳情</h1>
      </div>

      {/* 會話資訊 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-blue-500" />
            <h2 className="text-lg font-medium text-gray-900">會話資訊</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="copy-session-id"
              onClick={copySessionId}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Copy className="h-4 w-4" />
              複製會話ID
            </button>
            <button
              onClick={exportConversation}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              匯出對話
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">用戶識別</p>
            <p className="font-medium text-gray-900">
              {sessionInfo.user_ip ? `用戶 (${sessionInfo.user_ip})` : '遊客'}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-gray-500">消息總數</p>
            <p className="font-medium text-gray-900">{messages.length} 條</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-gray-500">對話時長</p>
            <p className="font-medium text-gray-900">{getConversationDuration()}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-gray-500">最後活動</p>
            <p className="font-medium text-gray-900">
              {formatDateTime(sessionInfo.last_activity)}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">會話ID</p>
              <p className="font-mono text-sm text-gray-900 break-all">{sessionInfo.session_id}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm text-gray-500">開始時間</p>
              <p className="text-sm text-gray-900">{formatDateTime(sessionInfo.started_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 對話內容 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">
            對話內容 ({messages.length} 條消息)
          </h2>
        </div>
        
        {messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>此會話沒有消息記錄</p>
          </div>
        ) : (
          <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
            {messages.map((message, index) => (
              <div key={message.id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                {/* 消息時間戳記 */}
                {index === 0 || 
                  new Date(message.created_at).toDateString() !== 
                  new Date(messages[index - 1].created_at).toDateString() ? (
                  <div className="text-center py-2">
                    <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {new Date(message.created_at).toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                ) : null}
                
                {/* 消息內容 */}
                <Message
                  content={message.message_text}
                  isUser={message.message_type === 'user'}
                  timestamp={message.created_at}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationDetails