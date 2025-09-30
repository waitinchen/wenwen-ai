/**
 * 高文文聊天機器人測試介面
 * 功能完整的測試平台 UI 設計
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  MessageCircle,
  Settings,
  Download,
  Upload
} from 'lucide-react'

// 測試數據類型定義
interface TestQuestion {
  id: number
  question: string
  intent: string
  expectedResponse: string
  scoring: Record<string, number>
  category: string
}

interface TestResult {
  questionId: number
  userResponse: string
  score: number
  feedback: string
  timestamp: string
}

interface TestSession {
  sessionId: string
  startTime: string
  endTime?: string
  totalScore: number
  results: TestResult[]
  status: 'pending' | 'running' | 'completed' | 'paused'
}

const WenwenTestUI: React.FC = () => {
  // 狀態管理
  const [currentQuestion, setCurrentQuestion] = useState<TestQuestion | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [testSession, setTestSession] = useState<TestSession | null>(null)
  const [botResponse, setBotResponse] = useState('')
  const [manualScore, setManualScore] = useState<number>(0)
  const [feedback, setFeedback] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [testMode, setTestMode] = useState<'manual' | 'auto'>('manual')

  // 測試配置
  const categories = [
    { id: 'all', name: '全部題目', color: 'bg-gray-100' },
    { id: 'core_service', name: '核心服務', color: 'bg-green-100' },
    { id: 'out_of_scope', name: '超出範圍', color: 'bg-red-100' },
    { id: 'mixed_type', name: '混合問題', color: 'bg-yellow-100' },
    { id: 'vague_chat', name: '閒聊引導', color: 'bg-blue-100' },
    { id: 'boundary_test', name: '邊界測試', color: 'bg-purple-100' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 頁面標題 */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            高文文聊天機器人測試平台
          </h1>
          <p className="text-gray-600">
            綜合測試高文文的對話能力、邊界識別和用戶體驗表現
          </p>
        </div>

        {/* 主要內容區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左側：測試控制面板 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 測試會話狀態 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  測試會話狀態
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">進度</span>
                  <Badge variant="outline">
                    {currentQuestionIndex + 1} / 30
                  </Badge>
                </div>
                <Progress
                  value={(currentQuestionIndex / 30) * 100}
                  className="w-full"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {testSession?.results.filter(r => r.score >= 80).length || 0}
                    </div>
                    <div className="text-xs text-green-700">優秀</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {testSession?.results.filter(r => r.score >= 60 && r.score < 80).length || 0}
                    </div>
                    <div className="text-xs text-yellow-700">良好</div>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => {/* 開始測試邏輯 */}}
                    disabled={testSession?.status === 'running'}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {testSession?.status === 'running' ? '測試進行中...' : '開始測試'}
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {/* 暫停邏輯 */}}
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {/* 重置邏輯 */}}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {/* 導出報告 */}}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 類別選擇 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">測試類別</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedCategory === category.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${category.color}`} />
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 測試設定 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  測試設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">測試模式</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="testMode"
                        value="manual"
                        checked={testMode === 'manual'}
                        onChange={(e) => setTestMode(e.target.value as 'manual')}
                        className="mr-2"
                      />
                      人工評分
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="testMode"
                        value="auto"
                        checked={testMode === 'auto'}
                        onChange={(e) => setTestMode(e.target.value as 'auto')}
                        className="mr-2"
                      />
                      自動評分
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">其他設定</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      隨機排序題目
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      記錄詳細日誌
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 中間：當前測試題目 */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    當前測試題目
                  </CardTitle>
                  <Badge variant="secondary">
                    第 {currentQuestionIndex + 1} 題
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentQuestion ? (
                  <>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-2">用戶問題：</div>
                      <div className="font-medium text-gray-900">
                        {currentQuestion.question}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{currentQuestion.intent}</Badge>
                      <Badge variant="secondary">{currentQuestion.category}</Badge>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-700 mb-2">期待回應類型：</div>
                      <div className="text-sm text-blue-900">
                        {currentQuestion.expectedResponse}
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => {/* 發送問題給高文文 */}}
                    >
                      發送問題給高文文
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    請選擇測試類別開始測試
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 評分區域 */}
            {testMode === 'manual' && (
              <Card>
                <CardHeader>
                  <CardTitle>人工評分</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      整體評分 (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={manualScore}
                      onChange={(e) => setManualScore(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      評分備註
                    </label>
                    <Textarea
                      placeholder="請說明評分理由..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {/* 保存並下一題 */}}
                    >
                      保存評分
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {/* 下一題 */}}
                    >
                      下一題
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右側：機器人回應和結果 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 高文文回應 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">高文文的回應</CardTitle>
              </CardHeader>
              <CardContent>
                {botResponse ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-sm text-green-700 mb-2">機器人回應：</div>
                      <div className="text-green-900 whitespace-pre-wrap">
                        {botResponse}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">回應已收到</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    等待機器人回應...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 即時分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">即時分析</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">語氣友善度</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-20 h-2" />
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">內容相關性</span>
                    <div className="flex items-center gap-2">
                      <Progress value={92} className="w-20 h-2" />
                      <span className="text-sm font-medium">92%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">回應完整性</span>
                    <div className="flex items-center gap-2">
                      <Progress value={78} className="w-20 h-2" />
                      <span className="text-sm font-medium">78%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 歷史結果 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">測試歷史</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {testSession?.results.map((result, index) => (
                    <div
                      key={result.questionId}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Q{result.questionId}</span>
                        {result.score >= 80 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : result.score >= 60 ? (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <Badge variant="outline">
                        {result.score}分
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 底部總結面板 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl">測試總結</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {testSession?.totalScore || 0}
                </div>
                <div className="text-sm text-blue-700">總分</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {testSession?.results.filter(r => r.score >= 80).length || 0}
                </div>
                <div className="text-sm text-green-700">優秀題目</div>
              </div>

              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">
                  {testSession?.results.filter(r => r.score >= 60 && r.score < 80).length || 0}
                </div>
                <div className="text-sm text-yellow-700">良好題目</div>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">
                  {testSession?.results.filter(r => r.score < 60).length || 0}
                </div>
                <div className="text-sm text-red-700">需改善題目</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default WenwenTestUI