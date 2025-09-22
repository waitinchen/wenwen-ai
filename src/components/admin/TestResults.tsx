import React, { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  RefreshCw, 
  AlertTriangle,
  BarChart3,
  Zap
} from 'lucide-react'
import { autoTester, TestSuite } from '@/utils/autoTest'
import { cn } from '@/lib/utils'

const TestResults: React.FC = () => {
  const [testSuite, setTestSuite] = useState<TestSuite | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoTestEnabled, setAutoTestEnabled] = useState(false)

  const runFullTest = async () => {
    setLoading(true)
    try {
      const result = await autoTester.runAllTests()
      setTestSuite(result)
    } catch (error) {
      console.error('測試執行失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const runQuickTest = async () => {
    setLoading(true)
    try {
      const result = await autoTester.runQuickTest()
      setTestSuite(result)
    } catch (error) {
      console.error('快速測試失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  // 自動測試
  useEffect(() => {
    if (autoTestEnabled) {
      const interval = setInterval(() => {
        runQuickTest()
      }, 30000) // 每 30 秒執行一次快速測試

      return () => clearInterval(interval)
    }
  }, [autoTestEnabled])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'skip':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'fail':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'skip':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getOverallStatus = () => {
    if (!testSuite) return 'unknown'
    if (testSuite.failed === 0) return 'pass'
    if (testSuite.passed > testSuite.failed) return 'warning'
    return 'fail'
  }

  const getOverallStatusColor = () => {
    const status = getOverallStatus()
    switch (status) {
      case 'pass':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'fail':
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
            <BarChart3 className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-semibold text-gray-900">自動測試結果</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={runQuickTest}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              {loading ? '測試中...' : '快速測試'}
            </button>
            <button
              onClick={runFullTest}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Play className={cn("h-4 w-4", loading && "animate-spin")} />
              {loading ? '測試中...' : '完整測試'}
            </button>
            <button
              onClick={() => setAutoTestEnabled(!autoTestEnabled)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors",
                autoTestEnabled 
                  ? "text-green-600 bg-green-50 hover:bg-green-100"
                  : "text-gray-600 bg-gray-50 hover:bg-gray-100"
              )}
            >
              <RefreshCw className={cn("h-4 w-4", autoTestEnabled && "animate-spin")} />
              {autoTestEnabled ? '自動測試中' : '啟用自動測試'}
            </button>
          </div>
        </div>

        {/* 測試統計 */}
        {testSuite && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600">通過</span>
              </div>
              <p className="text-2xl font-semibold text-green-600">{testSuite.passed}</p>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm text-gray-600">失敗</span>
              </div>
              <p className="text-2xl font-semibold text-red-600">{testSuite.failed}</p>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-gray-600">跳過</span>
              </div>
              <p className="text-2xl font-semibold text-yellow-600">{testSuite.skipped}</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-600">耗時</span>
              </div>
              <p className="text-2xl font-semibold text-blue-600">
                {(testSuite.totalDuration / 1000).toFixed(1)}s
              </p>
            </div>
          </div>
        )}

        {/* 整體狀態 */}
        {testSuite && (
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg border mt-4",
            getOverallStatusColor()
          )}>
            {getStatusIcon(getOverallStatus())}
            <span className="font-medium">
              測試狀態: {
                getOverallStatus() === 'pass' ? '全部通過' :
                getOverallStatus() === 'warning' ? '部分通過' : '測試失敗'
              }
            </span>
          </div>
        )}
      </div>

      {/* 測試結果詳情 */}
      {testSuite && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">
              {testSuite.name} - 詳細結果
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {testSuite.tests.map((test, index) => (
              <div key={index} className={cn(
                "flex items-center justify-between p-4 rounded-lg border",
                getStatusColor(test.status)
              )}>
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <p className="font-medium">{test.name}</p>
                    <p className="text-sm opacity-75">{test.message}</p>
                    {test.details && (
                      <p className="text-xs opacity-50 mt-1 font-mono">
                        {typeof test.details === 'object' 
                          ? JSON.stringify(test.details, null, 2)
                          : test.details
                        }
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono">{test.duration}ms</p>
                  <p className="text-xs opacity-75">
                    {test.status === 'pass' ? '✓' : 
                     test.status === 'fail' ? '✗' : '○'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 測試說明 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">測試說明</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <Zap className="h-4 w-4 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium">快速測試</p>
              <p>執行核心功能測試，包括環境變數、數據庫連接和聊天 API</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Play className="h-4 w-4 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium">完整測試</p>
              <p>執行所有測試項目，包括性能測試和數據完整性檢查</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <RefreshCw className="h-4 w-4 text-yellow-500 mt-0.5" />
            <div>
              <p className="font-medium">自動測試</p>
              <p>每 30 秒自動執行快速測試，持續監控系統狀態</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestResults

