/**
 * 回應腳本管理系統 - React 管理後台
 * 版本: WEN 1.4.0
 * 功能: 完整的回應腳本管理工作流程界面
 */

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface QuestionType {
  id: string
  type_name: string
  description: string
  category: string
  keywords: string[]
  intent_pattern: string
  is_active: boolean
  priority: number
  created_at: string
}

interface ResponseScript {
  id: string
  question_type_id: string
  script_name: string
  script_content: string
  script_type: 'TEXT' | 'TEMPLATE' | 'DYNAMIC'
  variables: Record<string, any>
  conditions: Record<string, any>
  version: string
  is_active: boolean
  usage_count: number
  success_rate: number
  question_types?: {
    type_name: string
    category: string
    keywords: string[]
  }
}

interface ScriptReview {
  id: string
  script_id: string
  review_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUIRED'
  review_notes: string
  suggested_changes: string
  review_score: number
  response_scripts?: {
    script_name: string
    question_types?: {
      type_name: string
      category: string
    }
  }
  auth?: {
    users: {
      email: string
    }
  }
  reviewed_at: string
}

const API_BASE = 'https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/response-script-management'

export default function ResponseScriptManagement() {
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([])
  const [responseScripts, setResponseScripts] = useState<ResponseScript[]>([])
  const [scriptReviews, setScriptReviews] = useState<ScriptReview[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('question-types')

  // 表單狀態
  const [newQuestionType, setNewQuestionType] = useState({
    type_name: '',
    description: '',
    category: 'GENERAL',
    keywords: [] as string[],
    intent_pattern: '',
    priority: 0
  })

  const [newResponseScript, setNewResponseScript] = useState({
    question_type_id: '',
    script_name: '',
    script_content: '',
    script_type: 'TEXT' as 'TEXT' | 'TEMPLATE' | 'DYNAMIC',
    variables: {},
    conditions: {}
  })

  const [newReview, setNewReview] = useState({
    script_id: '',
    review_status: 'PENDING' as 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUIRED',
    review_notes: '',
    suggested_changes: '',
    review_score: 5
  })

  // 載入數據
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [questionTypesRes, scriptsRes, reviewsRes] = await Promise.all([
        fetch(`${API_BASE}/question-types`),
        fetch(`${API_BASE}/response-scripts`),
        fetch(`${API_BASE}/script-reviews`)
      ])

      const questionTypesData = await questionTypesRes.json()
      const scriptsData = await scriptsRes.json()
      const reviewsData = await reviewsRes.json()

      if (questionTypesData.success) setQuestionTypes(questionTypesData.data)
      if (scriptsData.success) setResponseScripts(scriptsData.data)
      if (reviewsData.success) setScriptReviews(reviewsData.data)
    } catch (error) {
      console.error('載入數據失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  // 創建問題類型
  const handleCreateQuestionType = async () => {
    try {
      const response = await fetch(`${API_BASE}/question-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestionType)
      })

      const result = await response.json()
      if (result.success) {
        setQuestionTypes([...questionTypes, result.data])
        setNewQuestionType({
          type_name: '',
          description: '',
          category: 'GENERAL',
          keywords: [],
          intent_pattern: '',
          priority: 0
        })
        alert('問題類型創建成功！')
      } else {
        alert('創建失敗：' + result.error)
      }
    } catch (error) {
      alert('創建失敗：' + error.message)
    }
  }

  // 創建回應腳本
  const handleCreateResponseScript = async () => {
    try {
      const response = await fetch(`${API_BASE}/response-scripts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResponseScript)
      })

      const result = await response.json()
      if (result.success) {
        setResponseScripts([...responseScripts, result.data])
        setNewResponseScript({
          question_type_id: '',
          script_name: '',
          script_content: '',
          script_type: 'TEXT',
          variables: {},
          conditions: {}
        })
        alert('回應腳本創建成功！')
      } else {
        alert('創建失敗：' + result.error)
      }
    } catch (error) {
      alert('創建失敗：' + error.message)
    }
  }

  // 創建腳本審核
  const handleCreateScriptReview = async () => {
    try {
      const response = await fetch(`${API_BASE}/script-reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview)
      })

      const result = await response.json()
      if (result.success) {
        setScriptReviews([...scriptReviews, result.data])
        setNewReview({
          script_id: '',
          review_status: 'PENDING',
          review_notes: '',
          suggested_changes: '',
          review_score: 5
        })
        alert('腳本審核創建成功！')
      } else {
        alert('創建失敗：' + result.error)
      }
    } catch (error) {
      alert('創建失敗：' + error.message)
    }
  }

  // 更新審核狀態
  const handleUpdateReview = async (reviewId: string, status: string) => {
    try {
      const response = await fetch(`${API_BASE}/script-reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_status: status })
      })

      const result = await response.json()
      if (result.success) {
        loadData() // 重新載入數據
        alert('審核狀態更新成功！')
      } else {
        alert('更新失敗：' + result.error)
      }
    } catch (error) {
      alert('更新失敗：' + error.message)
    }
  }

  // 生成知識庫訓練資料
  const handleGenerateTrainingData = async (scriptId: string) => {
    try {
      const response = await fetch(`${API_BASE}/generate-training-data/${scriptId}`, {
        method: 'POST'
      })

      const result = await response.json()
      if (result.success) {
        alert('知識庫訓練資料生成成功！')
      } else {
        alert('生成失敗：' + result.error)
      }
    } catch (error) {
      alert('生成失敗：' + error.message)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'REVISION_REQUIRED': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScriptTypeColor = (type: string) => {
    switch (type) {
      case 'TEXT': return 'bg-blue-100 text-blue-800'
      case 'TEMPLATE': return 'bg-purple-100 text-purple-800'
      case 'DYNAMIC': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">回應腳本管理系統</h1>
        <p className="text-gray-600">完整的知識庫工作流程管理 - WEN 1.4.0</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="question-types">問題類型</TabsTrigger>
          <TabsTrigger value="response-scripts">回應腳本</TabsTrigger>
          <TabsTrigger value="script-reviews">腳本審核</TabsTrigger>
          <TabsTrigger value="knowledge-base">知識庫</TabsTrigger>
        </TabsList>

        {/* 問題類型管理 */}
        <TabsContent value="question-types" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">問題類型管理</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>新增問題類型</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>新增問題類型</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">類型名稱</label>
                      <Input
                        value={newQuestionType.type_name}
                        onChange={(e) => setNewQuestionType({...newQuestionType, type_name: e.target.value})}
                        placeholder="例如：美食推薦"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">描述</label>
                      <Textarea
                        value={newQuestionType.description}
                        onChange={(e) => setNewQuestionType({...newQuestionType, description: e.target.value})}
                        placeholder="問題類型的詳細描述"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">分類</label>
                        <select
                          value={newQuestionType.category}
                          onChange={(e) => setNewQuestionType({...newQuestionType, category: e.target.value})}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="FOOD">美食</option>
                          <option value="ENGLISH_LEARNING">英語學習</option>
                          <option value="PARKING">停車</option>
                          <option value="GENERAL">一般</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">優先級</label>
                        <Input
                          type="number"
                          value={newQuestionType.priority}
                          onChange={(e) => setNewQuestionType({...newQuestionType, priority: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">關鍵字 (用逗號分隔)</label>
                      <Input
                        value={newQuestionType.keywords.join(', ')}
                        onChange={(e) => setNewQuestionType({...newQuestionType, keywords: e.target.value.split(',').map(k => k.trim())})}
                        placeholder="美食, 餐廳, 吃飯"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">意圖模式</label>
                      <Input
                        value={newQuestionType.intent_pattern}
                        onChange={(e) => setNewQuestionType({...newQuestionType, intent_pattern: e.target.value})}
                        placeholder="FOOD"
                      />
                    </div>
                    <Button onClick={handleCreateQuestionType} className="w-full">
                      創建問題類型
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {questionTypes.map((type) => (
                <Card key={type.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{type.type_name}</h3>
                      <p className="text-gray-600 text-sm">{type.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{type.category}</Badge>
                        <Badge variant="outline">優先級: {type.priority}</Badge>
                        <Badge className={type.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {type.is_active ? '啟用' : '停用'}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">關鍵字: </span>
                        {type.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="mr-1">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* 回應腳本管理 */}
        <TabsContent value="response-scripts" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">回應腳本管理</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>新增回應腳本</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>新增回應腳本</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">腳本名稱</label>
                        <Input
                          value={newResponseScript.script_name}
                          onChange={(e) => setNewResponseScript({...newResponseScript, script_name: e.target.value})}
                          placeholder="例如：美食推薦標準回應"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">問題類型</label>
                        <select
                          value={newResponseScript.question_type_id}
                          onChange={(e) => setNewResponseScript({...newResponseScript, question_type_id: e.target.value})}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">選擇問題類型</option>
                          {questionTypes.map((type) => (
                            <option key={type.id} value={type.id}>{type.type_name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">腳本類型</label>
                      <select
                        value={newResponseScript.script_type}
                        onChange={(e) => setNewResponseScript({...newResponseScript, script_type: e.target.value as any})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="TEXT">純文字</option>
                        <option value="TEMPLATE">模板</option>
                        <option value="DYNAMIC">動態</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">腳本內容</label>
                      <Textarea
                        value={newResponseScript.script_content}
                        onChange={(e) => setNewResponseScript({...newResponseScript, script_content: e.target.value})}
                        placeholder="輸入回應腳本內容..."
                        rows={8}
                      />
                    </div>
                    <Button onClick={handleCreateResponseScript} className="w-full">
                      創建回應腳本
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {responseScripts.map((script) => (
                <Card key={script.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{script.script_name}</h3>
                        <Badge className={getScriptTypeColor(script.script_type)}>
                          {script.script_type}
                        </Badge>
                        <Badge variant="outline">v{script.version}</Badge>
                        <Badge className={script.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {script.is_active ? '啟用' : '停用'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        問題類型: {script.question_types?.type_name} ({script.question_types?.category})
                      </p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>使用次數: {script.usage_count}</span>
                        <span>成功率: {script.success_rate}%</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">成功率:</span>
                          <Progress value={script.success_rate} className="flex-1" />
                          <span className="text-sm text-gray-500">{script.success_rate}%</span>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {script.script_content.substring(0, 200)}
                          {script.script_content.length > 200 && '...'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateTrainingData(script.id)}
                      >
                        生成訓練資料
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateScriptReview()}
                      >
                        提交審核
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* 腳本審核管理 */}
        <TabsContent value="script-reviews" className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">腳本審核管理</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>新增審核</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>新增腳本審核</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">選擇腳本</label>
                      <select
                        value={newReview.script_id}
                        onChange={(e) => setNewReview({...newReview, script_id: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">選擇要審核的腳本</option>
                        {responseScripts.map((script) => (
                          <option key={script.id} value={script.id}>{script.script_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">審核狀態</label>
                      <select
                        value={newReview.review_status}
                        onChange={(e) => setNewReview({...newReview, review_status: e.target.value as any})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="PENDING">待審核</option>
                        <option value="APPROVED">已通過</option>
                        <option value="REJECTED">已拒絕</option>
                        <option value="REVISION_REQUIRED">需要修改</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">審核分數 (1-5)</label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={newReview.review_score}
                        onChange={(e) => setNewReview({...newReview, review_score: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">審核備註</label>
                      <Textarea
                        value={newReview.review_notes}
                        onChange={(e) => setNewReview({...newReview, review_notes: e.target.value})}
                        placeholder="輸入審核意見..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">建議修改</label>
                      <Textarea
                        value={newReview.suggested_changes}
                        onChange={(e) => setNewReview({...newReview, suggested_changes: e.target.value})}
                        placeholder="輸入建議修改內容..."
                      />
                    </div>
                    <Button onClick={handleCreateScriptReview} className="w-full">
                      提交審核
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {scriptReviews.map((review) => (
                <Card key={review.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {review.response_scripts?.script_name}
                        </h3>
                        <Badge className={getStatusColor(review.review_status)}>
                          {review.review_status}
                        </Badge>
                        <Badge variant="outline">
                          分數: {review.review_score}/5
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        問題類型: {review.response_scripts?.question_types?.type_name} 
                        ({review.response_scripts?.question_types?.category})
                      </p>
                      <p className="text-gray-500 text-sm mb-2">
                        審核者: {review.auth?.users?.email || '未知'}
                      </p>
                      <p className="text-gray-500 text-sm mb-2">
                        審核時間: {new Date(review.reviewed_at).toLocaleString()}
                      </p>
                      {review.review_notes && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-md">
                          <p className="text-sm text-blue-800">
                            <strong>審核備註:</strong> {review.review_notes}
                          </p>
                        </div>
                      )}
                      {review.suggested_changes && (
                        <div className="mt-2 p-3 bg-yellow-50 rounded-md">
                          <p className="text-sm text-yellow-800">
                            <strong>建議修改:</strong> {review.suggested_changes}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      {review.review_status === 'PENDING' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateReview(review.id, 'APPROVED')}
                          >
                            通過
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateReview(review.id, 'REJECTED')}
                          >
                            拒絕
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* 知識庫管理 */}
        <TabsContent value="knowledge-base" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">知識庫管理</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-4 text-center">
                <h3 className="text-lg font-semibold mb-2">問題類型總數</h3>
                <p className="text-3xl font-bold text-blue-600">{questionTypes.length}</p>
              </Card>
              <Card className="p-4 text-center">
                <h3 className="text-lg font-semibold mb-2">回應腳本總數</h3>
                <p className="text-3xl font-bold text-green-600">{responseScripts.length}</p>
              </Card>
              <Card className="p-4 text-center">
                <h3 className="text-lg font-semibold mb-2">待審核腳本</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {scriptReviews.filter(r => r.review_status === 'PENDING').length}
                </p>
              </Card>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">系統統計</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">腳本使用統計</h4>
                  <div className="space-y-2">
                    {responseScripts.slice(0, 5).map((script) => (
                      <div key={script.id} className="flex justify-between items-center">
                        <span className="text-sm">{script.script_name}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={script.success_rate} className="w-20" />
                          <span className="text-sm text-gray-500">{script.success_rate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold mb-2">審核狀態分佈</h4>
                  <div className="space-y-2">
                    {['PENDING', 'APPROVED', 'REJECTED', 'REVISION_REQUIRED'].map((status) => {
                      const count = scriptReviews.filter(r => r.review_status === status).length
                      return (
                        <div key={status} className="flex justify-between items-center">
                          <Badge className={getStatusColor(status)}>{status}</Badge>
                          <span className="text-sm text-gray-500">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}