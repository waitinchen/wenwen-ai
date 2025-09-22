import React, { useState, useEffect, useRef } from 'react'
import { Loader2, MessageCircle, RefreshCw, Settings, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { sendMessage, type ChatResponse } from '@/lib/api'
import { sendChatMessage, getChatHistory, type ChatResponse as NewChatResponse } from '@/lib/chatApi'
import { supabase } from '@/lib/supabase'
import { useUserAuth } from '@/contexts/UserAuthContext'
import Message from '@/components/Message'
import MessageInput from '@/components/MessageInput'
import QuickReply from '@/components/QuickReply'

interface ChatMessage {
  id: string
  content: string
  isUser: boolean
  timestamp: string
  displayName?: string
  avatarUrl?: string
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [userDisplayName, setUserDisplayName] = useState('訪客')
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // 使用LINE用戶認證Context
  const { lineUser, isLoading: userLoading, error: userError, clearUser } = useUserAuth()

  // 常用問題推薦 - 從資料庫加載
  const [quickSuggestions, setQuickSuggestions] = useState<string[]>([]);

  // 載入快速建議
  const loadQuickSuggestions = async () => {
    try {
      const { getQuickQuestions } = await import('@/lib/api')
      const questions = await getQuickQuestions()
      const enabledQuestions = questions
        .filter(q => q.is_enabled)
        .sort((a, b) => a.display_order - b.display_order)
        .map(q => q.question)
      setQuickSuggestions(enabledQuestions)
    } catch (error) {
      console.error('載入快速建議失敗:', error)
      // 使用預設建議
      setQuickSuggestions([
        '文山特區有哪些推薦餐廳？',
        '有什麼美食推薦？',
        '停車資訊',
        '怎麼去文山特區？',
        '有哪些停車場？',
        '商家營業時間'
      ])
    }
  }

  // 使用LINE用戶資訊創建歡迎訊息
  const createWelcomeMessage = (): ChatMessage => {
    const baseMessage = '嗨！我是高文文～23歲的高雄女孩！😊\n\n歡迎來到文山特區商圈！我是大家的專屬客服助理，很開心幫大家介紹咱們的：\n\n🍽️ 美食餐廳推薦（超熟的！）\n🏪 商店資訊查詢\n🅿️ 交通停車指引\n🎁 活動優惠資訊'
    
    if (lineUser) {
      return {
        id: 'welcome',
        content: `嗨 ${lineUser.line_display_name}！我是高文文～😊\n\n歡迎來到文山特區商圈！很開心認識你！我是大家的專屬客服助理，可以幫你介紹：\n\n🍽️ 美食餐廳推薦（超熟的！）\n🏪 商店資訊查詢\n🅿️ 交通停車指引\n🎁 活動優惠資訊\n\n有什麼想知道的都可以問我哦～🌟`,
        isUser: false,
        timestamp: new Date().toISOString()
      }
    }
    
    return {
      id: 'welcome',
      content: baseMessage + '\n\n有什麼想知道的都可以問我哦～🌟',
      isUser: false,
      timestamp: new Date().toISOString()
    }
  }

  // 加载快速問題
  useEffect(() => {
    loadQuickSuggestions();
  }, []);

  // 滾動到最新訊息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 初始化歡迎訊息（當LINE用戶資訊更新時也會更新）
  useEffect(() => {
    setMessages([createWelcomeMessage()])
  }, [lineUser]) // 當lineUser變化時更新歡迎訊息

  // 發送訊息（支援完整用戶資料保存）
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // 確定用戶顯示名稱和頭像
    const displayName = lineUser?.line_display_name || userDisplayName
    const avatarUrl = lineUser?.line_avatar_url || userAvatarUrl

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content,
      isUser: true,
      timestamp: new Date().toISOString(),
      displayName,
      avatarUrl
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      // 使用新的聊天 API
      const response: NewChatResponse = await sendChatMessage(
        sessionId || null,
        content,
        displayName,
        avatarUrl
      )

      if (!response.ok) {
        throw new Error(response.error || '發送訊息失敗')
      }

      // 更新sessionId
      if (response.session_id && !sessionId) {
        setSessionId(response.session_id)
      }

      // 添加 AI 回覆
      if (response.assistant) {
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          content: response.assistant.content,
          isUser: false,
          timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, botMessage])
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setError('很抱歉，目前系統繁忙，請稍後再試或刷新頁面。')
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: '很抱歉，目前系統繁忙，請稍後再試或刷新頁面。',
        isUser: false,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // 清空聊天記錄
  const handleReset = () => {
    setMessages([])
    setSessionId(undefined)
    setError(null)
    
    // 重新載入歡迎訊息
    setTimeout(() => {
      setMessages([createWelcomeMessage()])
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 標頭 */}
      <header className="bg-[#06C755] text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <MessageCircle size={24} />
            <div>
              <h1 className="font-semibold text-lg">高文文 - 文山特區客服</h1>
              <p className="text-sm opacity-90">活潑的高雄女孩 • AI智能助理</p>
            </div>
          </div>
          
          {/* 用戶資訊和操作按鈕 */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* LINE用戶資訊顯示 */}
            {lineUser && (
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1 md:px-3 md:py-1 mr-1">
                {lineUser.line_avatar_url ? (
                  <img 
                    src={lineUser.line_avatar_url} 
                    alt={lineUser.line_display_name}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-white/20"
                  />
                ) : (
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <User size={14} className="text-white md:w-4 md:h-4" />
                  </div>
                )}
                <span className="text-xs md:text-sm font-medium hidden sm:inline">{lineUser.line_display_name}</span>
              </div>
            )}
            
            <button
              onClick={handleReset}
              className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="清空聊天記錄"
            >
              <RefreshCw size={18} className="md:w-5 md:h-5" />
            </button>
            <Link
              to="/admin/login"
              className="p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="管理後台"
            >
              <Settings size={18} className="md:w-5 md:h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 聊天內容區域 */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* 訊息列表 */}
          <div className="space-y-4 mb-6">
            {messages.map((message) => (
              <Message
                key={message.id}
                content={message.content}
                isUser={message.isUser}
                timestamp={message.timestamp}
                userAvatarUrl={lineUser?.line_avatar_url}
                userDisplayName={lineUser?.line_display_name}
              />
            ))}
            
            {/* 加載指示器 */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">正在思考...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* 錯誤提示 */}
          {(error || userError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error || userError}
            </div>
          )}
          
          {/* 用戶載入狀態 */}
          {userLoading && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span>正在初始化LINE用戶資訊...</span>
            </div>
          )}
          
          {/* 常用問題 */}
          {messages.length <= 1 && (
            <QuickReply
              suggestions={quickSuggestions}
              onSelectSuggestion={handleSendMessage}
            />
          )}
        </div>
        
        {/* 滾動定位元素 */}
        <div ref={messagesEndRef} />
      </main>

      {/* 輸入框 */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={isLoading || userLoading}
      />
    </div>
  )
}

export default ChatInterface