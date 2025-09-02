import React from 'react'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageProps {
  content: string
  isUser: boolean
  timestamp: string
  className?: string
  userAvatarUrl?: string
  userDisplayName?: string
}

const Message: React.FC<MessageProps> = ({ 
  content, 
  isUser, 
  timestamp,
  className,
  userAvatarUrl,
  userDisplayName
}) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 用戶消息佈局（右側）
  if (isUser) {
    return (
      <div className={cn('flex mb-4 w-full justify-end items-end gap-2', className)}>
        <div className="bg-[#06C755] text-white px-4 py-3 rounded-2xl rounded-tr-md max-w-[80%] break-words shadow-sm">
          {/* 消息內容 */}
          <div className="leading-relaxed whitespace-pre-wrap text-sm">
            {content.split('\n').map((line, index) => {
              // 處理markdown格式的粗體文字 **text**
              if (line.includes('**')) {
                const parts = line.split(/\*\*(.*?)\*\*/g)
                return (
                  <div key={index}>
                    {parts.map((part, partIndex) => 
                      partIndex % 2 === 1 ? (
                        <strong key={partIndex} className="font-semibold">{part}</strong>
                      ) : (
                        <span key={partIndex}>{part}</span>
                      )
                    )}
                    {index < content.split('\n').length - 1 && <br />}
                  </div>
                )
              }
              return (
                <div key={index}>
                  {line}
                  {index < content.split('\n').length - 1 && <br />}
                </div>
              )
            })}
          </div>
          
          {/* 時間標籤 */}
          <div className="text-xs mt-2 opacity-70 text-white">
            {formatTime(timestamp)}
          </div>
        </div>
        
        {/* 用戶頭像 */}
        <div className="flex-shrink-0 mb-1">
          {userAvatarUrl ? (
            <img 
              src={userAvatarUrl} 
              alt={userDisplayName || '用戶'} 
              className="w-10 h-10 rounded-full border-2 border-[#06C755] shadow-md object-cover"
              onError={(e) => {
                // 如果頭像載入失敗，顯示預設圖示
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent && !parent.querySelector('.default-avatar')) {
                  const defaultAvatar = document.createElement('div')
                  defaultAvatar.className = 'w-10 h-10 rounded-full bg-[#06C755] flex items-center justify-center border-2 border-[#06C755] shadow-md default-avatar'
                  defaultAvatar.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="7" r="4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
                  parent.appendChild(defaultAvatar)
                }
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#06C755] flex items-center justify-center border-2 border-[#06C755] shadow-md">
              <User size={20} className="text-white" />
            </div>
          )}
        </div>
      </div>
    )
  }

  // AI消息佈局（左側）
  return (
    <div className={cn('flex mb-4 w-full justify-start items-end gap-2', className)}>
      {/* AI頭像 */}
      <div className="flex-shrink-0 mb-1">
        <img 
          src="/images/高文文.png" 
          alt="高文文" 
          className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover"
        />
      </div>
      
      <div className="bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-md max-w-[80%] break-words shadow-sm">
        {/* 消息內容 */}
        <div className="leading-relaxed whitespace-pre-wrap text-sm">
          {content.split('\n').map((line, index) => {
            // 處理markdown格式的粗體文字 **text**
            if (line.includes('**')) {
              const parts = line.split(/\*\*(.*?)\*\*/g)
              return (
                <div key={index}>
                  {parts.map((part, partIndex) => 
                    partIndex % 2 === 1 ? (
                      <strong key={partIndex} className="font-semibold">{part}</strong>
                    ) : (
                      <span key={partIndex}>{part}</span>
                    )
                  )}
                  {index < content.split('\n').length - 1 && <br />}
                </div>
              )
            }
            return (
              <div key={index}>
                {line}
                {index < content.split('\n').length - 1 && <br />}
              </div>
            )
          })}
        </div>
        
        {/* 時間標籤 */}
        <div className="text-xs mt-2 opacity-70 text-gray-500">
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  )
}

export default Message