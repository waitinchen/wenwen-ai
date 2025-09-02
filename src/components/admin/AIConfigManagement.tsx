import React, { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Save,
  X,
  Settings,
  Brain,
  Sliders,
  FileText,
  TestTube,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Copy,
  RotateCcw,
  Eye,
  EyeOff,
  Key,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getAIConfigs,
  createAIConfig,
  updateAIConfig,
  adminManagement
} from '@/lib/api'

interface ApiKey {
  id: number
  key_name: string
  key_type: string
  encrypted_key: string
  is_active: boolean
  is_verified: boolean
  last_used_at?: string
  validation_result?: string
  created_at: string
  updated_at: string
}

const AIConfigManagement = () => {
  const [aiConfigs, setAIConfigs] = useState<any[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showApiKeyForm, setShowApiKeyForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [testMode, setTestMode] = useState(false)
  const [testInput, setTestInput] = useState('')
  const [testOutput, setTestOutput] = useState('')
  const [activeTab, setActiveTab] = useState('configs') // 'configs' | 'apikeys'
  const [formData, setFormData] = useState<any>({
    config_name: '',
    system_prompt: '',
    temperature: 0.7,
    max_tokens: 1000,
    response_style: 'friendly',
    is_active: true
  })
  const [apiKeyFormData, setApiKeyFormData] = useState({
    key_name: '',
    encrypted_key: ''
  })
  const [showApiKey, setShowApiKey] = useState(false)
  const [testingKeyId, setTestingKeyId] = useState<number | null>(null)

  const responseStyles = [
    { value: 'friendly', label: '友善親切', description: '溫暖、友好的對話風格' },
    { value: 'professional', label: '專業正式', description: '正式、商務的對話風格' },
    { value: 'casual', label: '輕鬆隨意', description: '輕鬆、非正式的對話風格' },
    { value: 'helpful', label: '樂於助人', description: '積極主動提供幫助' },
    { value: 'concise', label: '簡潔明瞭', description: '簡短、直接的回答風格' }
  ]

  const defaultPrompts = {
    wenshan: `你是高文文，文山特區商圈的AI客服助手。你的任務是協助用戶了解文山特區的商家資訊、活動、營業時間等。

基本設定：
- 使用繁體中文回答
- 語氣友善親切，就像在地的朋友
- 提供準確、實用的商圈資訊
- 當不確定答案時，請誠實告知並建議聯絡相關店家
- 主動推薦相關的商家或活動

回答風格：
- 開頭可以用「嗨～」或「您好」等親切問候
- 適度使用台灣本地用語
- 在適當時候提供實用的建議或推薦
- 結尾可以詢問是否還需要其他協助`,
    
    customer_service: `你是一位專業的客服代表，專門協助用戶解決問題和提供服務資訊。

職責：
- 耐心回答用戶的各種問題
- 提供準確的產品或服務資訊
- 協助解決用戶遇到的困難
- 在無法解決時，適當地轉接給人工客服

原則：
- 始終保持禮貌和專業
- 提供清晰、準確的資訊
- 同理心對待用戶的困擾
- 積極尋找解決方案`,
    
    general: `你是一個樂於助人的AI助手，致力於為用戶提供有用的資訊和協助。

特點：
- 友善、耐心、專業
- 提供準確、有幫助的回答
- 承認不知道的事情，不編造資訊
- 在適當時候提供相關的建議或資源`
  }

  useEffect(() => {
    loadAIConfigs()
    if (activeTab === 'apikeys') {
      loadApiKeys()
    }
  }, [activeTab])

  const loadAIConfigs = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAIConfigs()
      setAIConfigs(data || [])
    } catch (err: any) {
      setError(err.message || '載入AI配置失敗')
    } finally {
      setLoading(false)
    }
  }

  const loadApiKeys = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await adminManagement('list', 'api_keys', null, null, {
        orderBy: 'created_at',
        orderDirection: 'desc'
      })
      setApiKeys(response.data || [])
    } catch (err: any) {
      setError(err.message || '載入API密鑰失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      if (editingItem) {
        await updateAIConfig(editingItem.id, formData)
      } else {
        await createAIConfig(formData)
      }

      setShowAddForm(false)
      setEditingItem(null)
      setFormData({
        config_name: '',
        system_prompt: '',
        temperature: 0.7,
        max_tokens: 1000,
        response_style: 'friendly',
        is_active: true
      })
      await loadAIConfigs()
    } catch (err: any) {
      setError(err.message || '保存失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveApiKey = async () => {
    try {
      setLoading(true)
      await adminManagement('create', 'api_keys', {
        key_name: apiKeyFormData.key_name,
        key_type: 'claude',
        encrypted_key: apiKeyFormData.encrypted_key,
        is_active: false
      })
      setShowApiKeyForm(false)
      setApiKeyFormData({ key_name: '', encrypted_key: '' })
      await loadApiKeys()
    } catch (err: any) {
      setError(err.message || '保存API密鑰失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleTestApiKey = async (keyId: number) => {
    try {
      setTestingKeyId(keyId)
      const response = await adminManagement('test_claude_key', 'api_keys', null, keyId)
      if (response.data.success) {
        setError('')
      } else {
        setError(response.data.message || 'API密鑰測試失敗')
      }
      await loadApiKeys()
    } catch (err: any) {
      setError(err.message || 'API密鑰測試失敗')
    } finally {
      setTestingKeyId(null)
    }
  }

  const handleActivateApiKey = async (keyId: number) => {
    try {
      setLoading(true)
      await adminManagement('activate_claude_key', 'api_keys', null, keyId)
      await loadApiKeys()
    } catch (err: any) {
      setError(err.message || 'API密鑰啟用失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteApiKey = async (keyId: number) => {
    if (!confirm('確定要刪除此API密鑰嗎？')) return
    
    try {
      setLoading(true)
      await adminManagement('delete', 'api_keys', null, keyId)
      await loadApiKeys()
    } catch (err: any) {
      setError(err.message || '刪除API密鑰失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      config_name: item.config_name || '',
      system_prompt: item.system_prompt || '',
      temperature: item.temperature || 0.7,
      max_tokens: item.max_tokens || 1000,
      response_style: item.response_style || 'friendly',
      is_active: item.is_active !== false
    })
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingItem(null)
    setFormData({
      config_name: '',
      system_prompt: '',
      temperature: 0.7,
      max_tokens: 1000,
      response_style: 'friendly',
      is_active: true
    })
  }

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
  }

  const toggleStatus = async (item: any) => {
    try {
      setLoading(true)
      
      // 如果要啟用這個配置，先停用其他所有配置
      if (!item.is_active) {
        for (const config of aiConfigs) {
          if (config.id !== item.id && config.is_active) {
            await updateAIConfig(config.id, { ...config, is_active: false })
          }
        }
      }
      
      await updateAIConfig(item.id, {
        ...item,
        is_active: !item.is_active
      })
      await loadAIConfigs()
    } catch (err: any) {
      setError(err.message || '更新狀態失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleTestConfig = async () => {
    if (!testInput.trim()) return
    
    try {
      setLoading(true)
      setTestOutput(`[測試回應] 根據當前配置，對於「${testInput}」的回應將會是...\n\n注意：這是配置測試模式，實際部署後會連接Claude API。`)
    } catch (err: any) {
      setError(err.message || '測試失敗')
    } finally {
      setLoading(false)
    }
  }

  const maskApiKey = (key: string) => {
    if (!key || key.length < 10) return key
    return key.substring(0, 8) + '...' + key.substring(key.length - 8)
  }

  return (
    <div className="space-y-6">
      {/* 標題和操作欄 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI配置管理</h2>
          <p className="text-gray-600 mt-1">管理AI聊天機器人的參數設定、人格配置和Claude API密鑰</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-xs text-yellow-600">僅超級管理員可存取此功能</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {activeTab === 'configs' && (
            <>
              <button
                onClick={() => setTestMode(!testMode)}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  testMode
                    ? "text-white bg-blue-600 hover:bg-blue-700"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                )}
              >
                <TestTube className="w-4 h-4" />
                {testMode ? '退出測試' : '測試模式'}
              </button>
              
              <button
                onClick={() => setShowAddForm(true)}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#06C755] rounded-lg hover:bg-[#05B04D] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                新增配置
              </button>
            </>
          )}
          
          {activeTab === 'apikeys' && (
            <button
              onClick={() => setShowApiKeyForm(true)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#06C755] rounded-lg hover:bg-[#05B04D] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              新增API密鑰
            </button>
          )}
        </div>
      </div>

      {/* 標籤頁 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('configs')}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === 'configs'
                ? "border-[#06C755] text-[#06C755]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            <Brain className="w-4 h-4 inline mr-2" />
            AI配置管理
          </button>
          <button
            onClick={() => setActiveTab('apikeys')}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === 'apikeys'
                ? "border-[#06C755] text-[#06C755]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            <Key className="w-4 h-4 inline mr-2" />
            Claude API密鑰管理
          </button>
        </nav>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* AI配置管理內容 */}
      {activeTab === 'configs' && (
        <>
          {/* 測試模式 */}
          {testMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                配置測試模式
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-2">
                    測試輸入
                  </label>
                  <textarea
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="輸入測試問題..."
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                  />
                  <button
                    onClick={handleTestConfig}
                    disabled={loading || !testInput.trim()}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4" />
                    )}
                    執行測試
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-2">
                    測試輸出
                  </label>
                  <div className="bg-white border border-blue-300 rounded-lg p-3 min-h-[120px] text-sm text-gray-700 whitespace-pre-wrap">
                    {testOutput || '在左側輸入測試問題，然後點擊「執行測試」查看AI回應效果。'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI配置列表 */}
          <div className="grid gap-6">
            {loading && aiConfigs.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-[#06C755] mx-auto mb-4" />
                <p className="text-gray-500">載入AI配置中...</p>
              </div>
            ) : aiConfigs.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">尚未建立AI配置</h3>
                <p className="text-gray-500 mb-4">開始建立您的第一個AI配置，自訂機器人的對話風格和參數。</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#06C755] rounded-lg hover:bg-[#05B04D]"
                >
                  <Plus className="w-4 h-4" />
                  新增配置
                </button>
              </div>
            ) : (
              aiConfigs.map((config) => (
                <div key={config.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          config.is_active ? "bg-green-400" : "bg-gray-300"
                        )}></div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {config.config_name}
                        </h3>
                        {config.is_active && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3" />
                            使用中
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleStatus(config)}
                          disabled={loading}
                          className={cn(
                            "inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors",
                            config.is_active
                              ? "text-red-700 bg-red-50 hover:bg-red-100"
                              : "text-green-700 bg-green-50 hover:bg-green-100"
                          )}
                        >
                          {config.is_active ? (
                            <><EyeOff className="w-4 h-4" />停用</>
                          ) : (
                            <><Eye className="w-4 h-4" />啟用</>
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleEdit(config)}
                          disabled={loading}
                          className="text-[#06C755] hover:text-[#05B04D] disabled:opacity-50"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">系統提示詞</h4>
                        <div className="relative">
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 max-h-32 overflow-y-auto whitespace-pre-wrap">
                            {config.system_prompt || '尚未設定系統提示詞'}
                          </div>
                          {config.system_prompt && (
                            <button
                              onClick={() => handleCopyPrompt(config.system_prompt)}
                              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 bg-white rounded border border-gray-200"
                              title="複製提示詞"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">溫度參數</h4>
                            <div className="flex items-center gap-2">
                              <Sliders className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{config.temperature}</span>
                              <span className="text-xs text-gray-500">
                                ({config.temperature <= 0.3 ? '保守' : 
                                  config.temperature <= 0.7 ? '平衡' : '創意'})
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">最大回復長度</h4>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{config.max_tokens}</span>
                              <span className="text-xs text-gray-500">tokens</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">回覆風格</h4>
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {responseStyles.find(s => s.value === config.response_style)?.label || config.response_style}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {responseStyles.find(s => s.value === config.response_style)?.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500">
                    最後更新：{new Date(config.updated_at).toLocaleString('zh-TW')}
                    {config.created_by && ` • 建立者：管理員`}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Claude API密鑰管理內容 */}
      {activeTab === 'apikeys' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-600" />
              <h3 className="text-sm font-semibold text-yellow-800">安全提醒</h3>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              API密鑰將以加密形式存储，僅顯示部分字元。請妥善保管您的完整密鑰。
            </p>
          </div>

          <div className="grid gap-6">
            {loading && apiKeys.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-[#06C755] mx-auto mb-4" />
                <p className="text-gray-500">載入API密鑰中...</p>
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">尚未配置API密鑰</h3>
                <p className="text-gray-500 mb-4">添加您的Claude API密鑰以啟用AI聊天功能。</p>
                <button
                  onClick={() => setShowApiKeyForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#06C755] rounded-lg hover:bg-[#05B04D]"
                >
                  <Plus className="w-4 h-4" />
                  新增API密鑰
                </button>
              </div>
            ) : (
              apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          apiKey.is_active ? "bg-green-400" : "bg-gray-300"
                        )}></div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {apiKey.key_name}
                        </h3>
                        {apiKey.is_active && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3" />
                            使用中
                          </span>
                        )}
                        {apiKey.is_verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <CheckCircle2 className="w-3 h-3" />
                            已驗證
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTestApiKey(apiKey.id)}
                          disabled={testingKeyId === apiKey.id || loading}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50"
                        >
                          {testingKeyId === apiKey.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <TestTube className="w-4 h-4" />
                          )}
                          {testingKeyId === apiKey.id ? '測試中...' : '測試'}
                        </button>
                        
                        {!apiKey.is_active && (
                          <button
                            onClick={() => handleActivateApiKey(apiKey.id)}
                            disabled={loading}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50"
                          >
                            <Eye className="w-4 h-4" />
                            啟用
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteApiKey(apiKey.id)}
                          disabled={loading || apiKey.is_active}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">API密鑰</h4>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 font-mono">
                          {maskApiKey(apiKey.encrypted_key)}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">類型</h4>
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900 capitalize">{apiKey.key_type}</span>
                          </div>
                        </div>
                        
                        {apiKey.validation_result && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">驗證結果</h4>
                            <div className={cn(
                              "text-sm p-2 rounded border",
                              apiKey.is_verified
                                ? "text-green-700 bg-green-50 border-green-200"
                                : "text-red-700 bg-red-50 border-red-200"
                            )}>
                              {apiKey.validation_result}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500">
                    建立時間：{new Date(apiKey.created_at).toLocaleString('zh-TW')}
                    {apiKey.last_used_at && (
                      <> • 最後使用：{new Date(apiKey.last_used_at).toLocaleString('zh-TW')}</>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 新增/編輯AI配置表單 */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingItem ? '編輯AI配置' : '新增AI配置'}
                </h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  配置名稱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.config_name}
                  onChange={(e) => setFormData({ ...formData, config_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                  placeholder="例如：文山特區客服配置"
                  required
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    系統提示詞 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, system_prompt: defaultPrompts.wenshan })}
                      className="text-xs text-[#06C755] hover:text-[#05B04D] underline"
                    >
                      文山特區模板
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, system_prompt: defaultPrompts.customer_service })}
                      className="text-xs text-[#06C755] hover:text-[#05B04D] underline"
                    >
                      客服模板
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, system_prompt: defaultPrompts.general })}
                      className="text-xs text-[#06C755] hover:text-[#05B04D] underline"
                    >
                      通用模板
                    </button>
                  </div>
                </div>
                <textarea
                  value={formData.system_prompt}
                  onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                  rows={8}
                  placeholder="定義AI助手的角色、個性和行為準則..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    溫度參數 ({formData.temperature})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>保守 (0.0)</span>
                    <span>平衡 (0.7)</span>
                    <span>創意 (1.0)</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最大回復長度 (tokens)
                  </label>
                  <select
                    value={formData.max_tokens}
                    onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                  >
                    <option value={500}>500 tokens (短)</option>
                    <option value={1000}>1000 tokens (中)</option>
                    <option value={2000}>2000 tokens (長)</option>
                    <option value={4000}>4000 tokens (超長)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  回覆風格
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {responseStyles.map((style) => (
                    <label key={style.value} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="response_style"
                        value={style.value}
                        checked={formData.response_style === style.value}
                        onChange={(e) => setFormData({ ...formData, response_style: e.target.value })}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{style.label}</div>
                        <div className="text-sm text-gray-500">{style.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-[#06C755] focus:ring-[#06C755]"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  啟用此配置（會停用其他配置）
                </label>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !formData.config_name || !formData.system_prompt}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#06C755] rounded-lg hover:bg-[#05B04D] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingItem ? '更新配置' : '創建配置'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新增API密鑰表單 */}
      {showApiKeyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">新增Claude API密鑰</h3>
                <button
                  onClick={() => setShowApiKeyForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密鑰名稱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={apiKeyFormData.key_name}
                  onChange={(e) => setApiKeyFormData({ ...apiKeyFormData, key_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                  placeholder="例如：主要Claude API密鑰"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API密鑰 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKeyFormData.encrypted_key}
                    onChange={(e) => setApiKeyFormData({ ...apiKeyFormData, encrypted_key: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent font-mono text-sm"
                    placeholder="sk-ant-api03-..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">
                    請輸入完整的Claude API密鑰，密鑰將以加密方式安全存储。
                  </p>
                  <p className="text-xs text-blue-600">
                    密鑰格式：sk-ant-api03-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowApiKeyForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSaveApiKey}
                disabled={loading || !apiKeyFormData.key_name || !apiKeyFormData.encrypted_key}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#06C755] rounded-lg hover:bg-[#05B04D] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                保存密鑰
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIConfigManagement