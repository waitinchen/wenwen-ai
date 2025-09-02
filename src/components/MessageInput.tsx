import React, { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  className?: string
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  disabled = false,
  className 
}) => {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedMessage = message.trim()
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage)
      setMessage('')
      // 重置輸入框高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  // 自動調整高度
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [message])

  return (
    <div className={cn(
      'sticky bottom-0 bg-white border-t border-gray-200 p-4',
      className
    )}>
      <form onSubmit={handleSubmit} className="flex gap-3 items-end max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onInput={adjustHeight}
            placeholder="輸入您的問題... 按 Enter 發送，Shift + Enter 換行"
            disabled={disabled}
            rows={1}
            className={cn(
              'w-full px-4 py-3 pr-12 rounded-2xl border border-gray-300',
              'focus:outline-none focus:ring-2 focus:ring-[#06C755] focus:border-transparent',
              'resize-none overflow-hidden text-sm leading-relaxed',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'placeholder:text-gray-400'
            )}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
        </div>
        
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-full',
            'bg-[#06C755] text-white shadow-lg transition-all duration-200',
            'hover:bg-[#05b74f] hover:scale-105 active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
            'disabled:hover:bg-[#06C755]'
          )}
        >
          <Send size={20} className="ml-0.5" />
        </button>
      </form>

    </div>
  )
}

export default MessageInput