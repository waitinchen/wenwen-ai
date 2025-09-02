import React, { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Filter, 
  Search,
  Eye,
  X,
  Trash2
} from 'lucide-react'
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
  resolved_by?: number
  resolved_at?: string
  created_at: string
  updated_at: string
}

interface WarningStats {
  total: number
  unresolved: number
  byType: { [key: string]: number }
  byLevel: { [key: string]: number }
}

interface ContentWarningManagerProps {
  className?: string
}

const ContentWarningManager = ({ className }: ContentWarningManagerProps) => {
  const [warnings, setWarnings] = useState<ContentWarning[]>([])
  const [stats, setStats] = useState<WarningStats>({ total: 0, unresolved: 0, byType: {}, byLevel: {} })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // 篩選狀態
  const [filterType, setFilterType] = useState('all')
  const [filterLevel, setFilterLevel] = useState('all')
  const [filterResolved, setFilterResolved] = useState('unresolved')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadWarnings()
  }, [])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const loadWarnings = async () => {
    try {
      setLoading(true)
      setError('')
      
      const { data, error } = await supabase.functions.invoke('content-validation', {
        body: {
          action: 'get-all-warnings'
        }
      })
      
      if (error) throw error
      if (data?.data) {
        setWarnings(data.data.warnings)
        setStats(data.data.stats)
      }
    } catch (error: any) {
      setError(error.message || '載入內容警告失敗')
    } finally {
      setLoading(false)
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
      
      setSuccess('警告已標記為已解決')
      await loadWarnings()
    } catch (error: any) {
      setError(error.message || '標記警告失敗')
    }
  }

  const batchResolveWarnings = async (warningIds: number[]) => {
    try {
      for (const id of warningIds) {
        await resolveWarning(id)
      }
      setSuccess(`已解決 ${warningIds.length} 個警告`)
    } catch (error: any) {
      setError(error.message || '批量解決警告失敗')
    }
  }

  const performBatchCheck = async () => {
    try {
      setLoading(true)
      setError('')
      
      // 這裡可以實現批量檢查所有內容的功能
      // 由於複雜度較高，暫時顯示成功訊息
      setSuccess('批量檢查功能正在開發中...')
      
    } catch (error: any) {
      setError(error.message || '批量檢查失敗')
    } finally {
      setLoading(false)
    }
  }

  // 篩選警告
  const filteredWarnings = warnings.filter(warning => {
    const matchesType = filterType === 'all' || warning.warning_type === filterType
    const matchesLevel = filterLevel === 'all' || warning.warning_level === filterLevel
    const matchesResolved = filterResolved === 'all' || 
                           (filterResolved === 'resolved' && warning.is_resolved) ||
                           (filterResolved === 'unresolved' && !warning.is_resolved)
    const matchesSearch = !searchTerm || 
                         warning.warning_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warning.suggested_fix?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesType && matchesLevel && matchesResolved && matchesSearch
  })

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'geography': '地理位置',
      'time': '時間邏輯',
      'fact': '事實準確',
      'logic': '邏輯一致'
    }
    return labels[type] || type
  }

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'high': 'text-red-600 bg-red-100',
      'medium': 'text-orange-600 bg-orange-100', 
      'low': 'text-yellow-600 bg-yellow-100'
    }
    return colors[level] || 'text-gray-600 bg-gray-100'
  }

  const getLevelLabel = (level: string) => {
    const labels: { [key: string]: string } = {
      'high': '高危',
      'medium': '中等',
      'low': '輕微'
    }
    return labels[level] || level
  }

  const getTableLabel = (table: string) => {
    const labels: { [key: string]: string } = {
      'faqs': '常見問題',
      'training_data': '訓練資料',
      'business_info': '商圈資訊',
      'stores': '商家資料'
    }
    return labels[table] || table
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* 標題區域 */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-orange-500" />
            內容合理性管理
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            檢測並管理知識庫中的不合理內容，確保資訊準確性
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadWarnings}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            重新載入
          </button>
          
          <button
            onClick={performBatchCheck}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye className="w-4 h-4" />
            批量檢查
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">總警告數</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">待解決</p>
              <p className="text-2xl font-bold text-red-600">{stats.unresolved}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">地理問題</p>
              <p className="text-2xl font-bold text-orange-600">{stats.byType.geography || 0}</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-xs font-bold">地</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">時間問題</p>
              <p className="text-2xl font-bold text-purple-600">{stats.byType.time || 0}</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-xs font-bold">時</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">已解決</p>
              <p className="text-2xl font-bold text-green-600">{stats.total - stats.unresolved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* 篩選控制 */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">篩選：</span>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">所有類型</option>
            <option value="geography">地理位置</option>
            <option value="time">時間邏輯</option>
            <option value="fact">事實準確</option>
            <option value="logic">邏輯一致</option>
          </select>
          
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">所有級別</option>
            <option value="high">高危</option>
            <option value="medium">中等</option>
            <option value="low">輕微</option>
          </select>
          
          <select
            value={filterResolved}
            onChange={(e) => setFilterResolved(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部狀態</option>
            <option value="unresolved">待解決</option>
            <option value="resolved">已解決</option>
          </select>
          
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索警告內容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-1.5 w-full text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 成功/錯誤訊息 */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">錯誤</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* 警告列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            內容警告列表 ({filteredWarnings.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center gap-2 text-gray-600">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>載入中...</span>
            </div>
          </div>
        ) : filteredWarnings.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-1">沒有找到相關警告</p>
              <p className="text-sm">所有內容都符合合理性標準</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredWarnings.map((warning) => (
              <div key={warning.id} className={cn(
                "p-4",
                warning.warning_level === 'high' && "bg-red-50 border-l-4 border-red-400",
                warning.warning_level === 'medium' && "bg-orange-50 border-l-4 border-orange-400",
                warning.warning_level === 'low' && "bg-yellow-50 border-l-4 border-yellow-400",
                warning.is_resolved && "opacity-60"
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn(
                        "px-2.5 py-0.5 text-xs font-medium rounded-full",
                        getLevelColor(warning.warning_level)
                      )}>
                        {getLevelLabel(warning.warning_level)}
                      </span>
                      
                      <span className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {getTypeLabel(warning.warning_type)}
                      </span>
                      
                      <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {getTableLabel(warning.source_table)} #{warning.source_id}
                      </span>
                      
                      {warning.is_resolved && (
                        <span className="px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          ✓ 已解決
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-900 mb-2 font-medium">
                      {warning.warning_message}
                    </p>
                    
                    {warning.suggested_fix && (
                      <p className="text-sm text-blue-600 mb-2">
                        💡 建議修正：{warning.suggested_fix}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>建立時間：{new Date(warning.created_at).toLocaleString('zh-TW')}</span>
                      {warning.resolved_at && (
                        <span>解決時間：{new Date(warning.resolved_at).toLocaleString('zh-TW')}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {!warning.is_resolved && (
                      <button
                        onClick={() => resolveWarning(warning.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" />
                        標記已修正
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ContentWarningManager
