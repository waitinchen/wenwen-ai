import React, { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Wrench, 
  Database, 
  Server, 
  Settings,
  Download,
  Play
} from 'lucide-react'
import { healthChecker, SystemHealth } from '@/utils/healthCheck'
import { autoFixer, FixResult } from '@/utils/autoFix'
import { cn } from '@/lib/utils'

const SystemHealthDashboard: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(false)
  const [fixing, setFixing] = useState(false)
  const [fixResults, setFixResults] = useState<FixResult[]>([])
  const [autoFixEnabled, setAutoFixEnabled] = useState(false)

  const runHealthCheck = async () => {
    setLoading(true)
    try {
      const result = await healthChecker.runAllChecks()
      setHealth(result)
    } catch (error) {
      console.error('健康檢查失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const runAutoFix = async () => {
    setFixing(true)
    try {
      const results = await autoFixer.runAutoFix({
        fixEnvironmentIssues: true,
        fixDatabaseIssues: true,
        fixAPIIssues: true,
        createMissingTables: true,
        resetMockData: true
      })
      setFixResults(results)
      
      // 修復後重新檢查
      setTimeout(() => {
        runHealthCheck()
      }, 2000)
    } catch (error) {
      console.error('自動修復失敗:', error)
    } finally {
      setFixing(false)
    }
  }

  useEffect(() => {
    runHealthCheck()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 頁面標題 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Server className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-semibold text-gray-900">系統健康檢查</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={runHealthCheck}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              {loading ? '檢查中...' : '重新檢查'}
            </button>
            <button
              onClick={runAutoFix}
              disabled={fixing}
              className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Wrench className={cn("h-4 w-4", fixing && "animate-spin")} />
              {fixing ? '修復中...' : '自動修復'}
            </button>
          </div>
        </div>

        {/* 整體狀態 */}
        {health && (
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg border",
            getOverallStatusColor(health.overall)
          )}>
            {getStatusIcon(health.overall)}
            <span className="font-medium">
              系統狀態: {
                health.overall === 'healthy' ? '正常' :
                health.overall === 'warning' ? '警告' : '錯誤'
              }
            </span>
          </div>
        )}
      </div>

      {/* 檢查結果 */}
      {health && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">檢查結果</h2>
          </div>
          <div className="p-6 space-y-4">
            {health.checks.map((check, index) => (
              <div key={index} className={cn(
                "flex items-center justify-between p-4 rounded-lg border",
                getStatusColor(check.status)
              )}>
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <p className="font-medium">{check.message}</p>
                    {check.details && (
                      <p className="text-sm opacity-75 mt-1">
                        {typeof check.details === 'object' 
                          ? JSON.stringify(check.details, null, 2)
                          : check.details
                        }
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs opacity-75">
                  {new Date(check.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 修復結果 */}
      {fixResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">修復結果</h2>
          </div>
          <div className="p-6 space-y-4">
            {fixResults.map((result, index) => (
              <div key={index} className={cn(
                "flex items-center justify-between p-4 rounded-lg border",
                result.success 
                  ? "text-green-600 bg-green-50 border-green-200"
                  : "text-red-600 bg-red-50 border-red-200"
              )}>
                <div className="flex items-center gap-3">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">{result.message}</p>
                    {result.details && (
                      <p className="text-sm opacity-75 mt-1">
                        {typeof result.details === 'object' 
                          ? JSON.stringify(result.details, null, 2)
                          : result.details
                        }
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs opacity-75">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 快速操作 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => autoFixer.fixEnvironmentIssues()}
            className="flex items-center gap-2 p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium">下載環境配置</p>
              <p className="text-sm text-gray-500">生成 .env.local 文件</p>
            </div>
          </button>
          
          <button
            onClick={() => autoFixer.createTestData()}
            className="flex items-center gap-2 p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Play className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">創建測試數據</p>
              <p className="text-sm text-gray-500">生成示例對話記錄</p>
            </div>
          </button>
          
          <button
            onClick={() => setAutoFixEnabled(!autoFixEnabled)}
            className={cn(
              "flex items-center gap-2 p-4 text-left border rounded-lg transition-colors",
              autoFixEnabled 
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-gray-200 hover:bg-gray-50"
            )}
          >
            <Settings className="h-5 w-5" />
            <div>
              <p className="font-medium">自動修復</p>
              <p className="text-sm text-gray-500">
                {autoFixEnabled ? '已啟用' : '點擊啟用'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 系統信息 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">系統信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">應用版本</p>
            <p className="font-mono">{import.meta.env.VITE_APP_VERSION || '1.0.0'}</p>
          </div>
          <div>
            <p className="text-gray-500">環境模式</p>
            <p className="font-mono">{import.meta.env.MODE}</p>
          </div>
          <div>
            <p className="text-gray-500">Supabase URL</p>
            <p className="font-mono text-xs break-all">
              {import.meta.env.VITE_SUPABASE_URL || '未設置'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">最後檢查</p>
            <p className="font-mono">
              {health ? new Date(health.timestamp).toLocaleString() : '未執行'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemHealthDashboard

