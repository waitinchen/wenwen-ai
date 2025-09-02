import React, { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Eye, X, RefreshCw, FileText, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

import { supabase } from '@/lib/supabase'

interface ContentWarning {
  id: number
  source_table: string
  source_id: number
  warning_type: string
  warning_level: 'low' | 'medium' | 'high'
  warning_message: string
  suggested_fix: string
  is_resolved: boolean
  created_at: string
}

interface ContentWarningBadgeProps {
  sourceTable: string
  sourceId: number
  content?: string
  onWarningsUpdate?: (warnings: ContentWarning[]) => void
  className?: string
}

const ContentWarningBadge = ({ 
  sourceTable, 
  sourceId, 
  content, 
  onWarningsUpdate, 
  className 
}: ContentWarningBadgeProps) => {
  const [warnings, setWarnings] = useState<ContentWarning[]>([])
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    loadWarnings()
  }, [sourceTable, sourceId])

  const loadWarnings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.functions.invoke('content-validation', {
        body: {
          action: 'get-warnings',
          sourceTable,
          sourceId
        }
      })
      
      if (error) throw error
      if (data?.data) {
        setWarnings(data.data)
        onWarningsUpdate?.(data.data)
      }
    } catch (error) {
      console.error('Failed to load warnings:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkContent = async () => {
    if (!content) return
    
    try {
      setChecking(true)
      const { data, error } = await supabase.functions.invoke('content-validation', {
        body: {
          action: 'check-content',
          content,
          contentType: 'text',
          sourceTable,
          sourceId
        }
      })
      
      if (error) throw error
      if (data?.data && data.data.hasWarnings) {
        await loadWarnings() // 重新載入警告
      }
    } catch (error) {
      console.error('Failed to check content:', error)
    } finally {
      setChecking(false)
    }
  }

  const resolveWarning = async (warningId: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('content-validation', {
        body: {
          action: 'resolve-warning',
          sourceId: warningId
        }
      })
      
      if (error) throw error
      await loadWarnings() // 重新載入警告
    } catch (error) {
      console.error('Failed to resolve warning:', error)
    }
  }

  const unresolvedWarnings = warnings.filter(w => !w.is_resolved)
  const highLevelWarnings = unresolvedWarnings.filter(w => w.warning_level === 'high')
  
  if (loading) {
    return (
      <div className={cn("inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded", className)}>
        <RefreshCw className="w-3 h-3 animate-spin" />
        檢查中...
      </div>
    )
  }

  if (unresolvedWarnings.length === 0) {
    return (
      <div className={cn("inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded", className)}>
        <CheckCircle className="w-3 h-3" />
        內容正常
        {content && (
          <button
            onClick={checkContent}
            disabled={checking}
            className="ml-1 text-green-600 hover:text-green-800"
            title="重新檢查內容"
          >
            <RefreshCw className={cn("w-3 h-3", checking && "animate-spin")} />
          </button>
        )}
      </div>
    )
  }

  const getBadgeColor = () => {
    if (highLevelWarnings.length > 0) return 'bg-red-100 text-red-700 border-red-200'
    if (unresolvedWarnings.some(w => w.warning_level === 'medium')) return 'bg-orange-100 text-orange-700 border-orange-200'
    return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  }

  const getIcon = () => {
    if (highLevelWarnings.length > 0) return <AlertTriangle className="w-3 h-3" />
    return <AlertCircle className="w-3 h-3" />
  }

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 text-xs border rounded transition-colors",
          getBadgeColor(),
          "hover:opacity-80"
        )}
      >
        {getIcon()}
        內容不合理 ({unresolvedWarnings.length})
        <Eye className="w-3 h-3 ml-1" />
      </button>

      {showDetails && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">內容問題詳情</h4>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {unresolvedWarnings.map((warning, index) => (
              <div key={warning.id} className={cn(
                "p-3 border-b border-gray-100 last:border-b-0",
                warning.warning_level === 'high' && "bg-red-50",
                warning.warning_level === 'medium' && "bg-orange-50",
                warning.warning_level === 'low' && "bg-yellow-50"
              )}>
                <div className="flex items-start gap-2">
                  <div className={cn(
                    "flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5",
                    warning.warning_level === 'high' && "bg-red-500",
                    warning.warning_level === 'medium' && "bg-orange-500",
                    warning.warning_level === 'low' && "bg-yellow-500"
                  )} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "px-1.5 py-0.5 text-xs font-medium rounded",
                        warning.warning_level === 'high' && "bg-red-100 text-red-700",
                        warning.warning_level === 'medium' && "bg-orange-100 text-orange-700",
                        warning.warning_level === 'low' && "bg-yellow-100 text-yellow-700"
                      )}>
                        {warning.warning_type === 'geography' && '地理'}
                        {warning.warning_type === 'time' && '時間'}
                        {warning.warning_type === 'fact' && '事實'}
                        {warning.warning_type === 'logic' && '邏輯'}
                      </span>
                      
                      <span className="text-xs text-gray-500">
                        {warning.warning_level === 'high' && '高危'}
                        {warning.warning_level === 'medium' && '中等'}
                        {warning.warning_level === 'low' && '輕微'}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-800 mb-1">
                      {warning.warning_message}
                    </p>
                    
                    {warning.suggested_fix && (
                      <p className="text-xs text-blue-600 mb-2">
                        💡 {warning.suggested_fix}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => resolveWarning(warning.id)}
                        className="text-xs text-green-600 hover:text-green-800 font-medium"
                      >
                        標記已修正
                      </button>
                      
                      <span className="text-xs text-gray-400">
                        {new Date(warning.created_at).toLocaleString('zh-TW')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {content && (
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <button
                onClick={checkContent}
                disabled={checking}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={cn("w-3 h-3", checking && "animate-spin")} />
                {checking ? '檢查中...' : '重新檢查內容'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ContentWarningBadge
