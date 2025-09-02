import React, { useState, useEffect } from 'react'
import { ArrowLeft, MessageCircle, User, Bot, Clock, Calendar, Copy, Download } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import Message from '@/components/Message'

interface ChatMessage {
  id: number
  session_id: string
  message_type: 'user' | 'bot'
  content: string
  created_at: string
  is_helpful: boolean | null
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

      // 獲取會話基本資訊
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle()

      if (sessionError) {
        console.error('獲取會話資訊失敗:', sessionError)
        setError('無法獲取會話資訊')
        return
      }

      if (!sessionData) {
        setError('會話不存在')
        return
      }

      setSessionInfo(sessionData)

      // 獲取消息列表
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.error('獲取消息列表失敗:', messagesError)
        setError('無法獲取消息列表')
        return
      }

      setMessages(messagesData || [])
    } catch (error) {
      console.error('載入對話詳情失敗:', error)
      setError('載入失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
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
        return `\n[${time}] ${sender}:\n${msg.content}\n`
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
                  content={message.content}
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