import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/Toast'

interface ChatMessage {
  id: number
  session_id: number
  message_type: 'user' | 'bot' | 'system'
  message_text: string
  response_time: number | null
  user_feedback: number | null
  created_at: string
  metadata: any | null
}

interface UseRealtimeChatProps {
  sessionId: string
  onNewMessage?: (message: ChatMessage) => void
}

export function useRealtimeChat({ sessionId, onNewMessage }: UseRealtimeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    if (!sessionId) return

    // 獲取初始消息
    const fetchInitialMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true })

        if (error) throw error
        setMessages(data || [])
      } catch (error) {
        console.error('Error fetching messages:', error)
        addToast({
          type: 'error',
          title: '載入消息失敗',
          message: '無法載入聊天記錄，請重新整理頁面'
        })
      }
    }

    fetchInitialMessages()

    // 設置實時訂閱
    const channel = supabase
      .channel(`chat_messages:session_id=eq.${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage
          setMessages(prev => [...prev, newMessage])
          onNewMessage?.(newMessage)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const updatedMessage = payload.new as ChatMessage
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          )
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
        if (status === 'SUBSCRIBED') {
          console.log('Connected to realtime chat')
        } else if (status === 'CHANNEL_ERROR') {
          addToast({
            type: 'error',
            title: '連接失敗',
            message: '無法連接到實時聊天服務'
          })
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [sessionId, onNewMessage, addToast])

  const sendMessage = async (messageText: string, messageType: 'user' | 'bot' | 'system' = 'user') => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: parseInt(sessionId),
          message_type: messageType,
          message_text: messageText,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error sending message:', error)
      addToast({
        type: 'error',
        title: '發送失敗',
        message: '無法發送消息，請重試'
      })
      throw error
    }
  }

  const updateMessageFeedback = async (messageId: number, feedback: 1 | -1) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ user_feedback: feedback })
        .eq('id', messageId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating feedback:', error)
      addToast({
        type: 'error',
        title: '更新失敗',
        message: '無法更新反饋，請重試'
      })
    }
  }

  return {
    messages,
    isConnected,
    sendMessage,
    updateMessageFeedback
  }
}

