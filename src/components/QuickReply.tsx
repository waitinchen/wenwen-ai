import React from 'react'
import { cn } from '@/lib/utils'

interface QuickReplyProps {
  suggestions: string[]
  onSelectSuggestion: (suggestion: string) => void
  className?: string
}

const QuickReply: React.FC<QuickReplyProps> = ({ 
  suggestions, 
  onSelectSuggestion,
  className 
}) => {
  if (!suggestions || suggestions.length === 0) return null

  return (
    <div className={cn('px-4 py-2', className)}>
      <div className="text-xs text-gray-500 mb-2">取選一個啟動詞：</div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelectSuggestion(suggestion)}
            className={cn(
              'px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700',
              'rounded-full text-xs transition-colors duration-200',
              'border border-gray-200 hover:border-gray-300'
            )}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickReply