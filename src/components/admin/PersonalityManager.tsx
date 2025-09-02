import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Brain,
  CheckCircle,
  AlertCircle,
  Settings,
  User,
  MapPin,
  Heart,
  Smile,
  MessageCircle,
  Star,
  Play
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getPersonalityConfigs,
  createPersonalityConfig,
  updatePersonalityConfig,
  deletePersonalityConfig,
  activatePersonalityConfig
} from '@/lib/api'

interface PersonalityConfig {
  id: number
  config_name: string
  persona_name: string
  persona_age: number
  persona_location: string
  personality_traits: string[]
  formality_level: number
  friendliness_level: number
  emoji_frequency: number
  response_detail_level: number
  custom_responses?: any
  is_active: boolean
  created_at: string
  updated_at: string
}

interface PersonalityManagerProps {
  className?: string
}

const PersonalityManager = ({ className }: PersonalityManagerProps) => {
  const [configs, setConfigs] = useState<PersonalityConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // 搜索和過濾狀態
  const [searchTerm, setSearchTerm] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  
  // 編輯狀態
  const [editingItem, setEditingItem] = useState<PersonalityConfig | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const [testResponse, setTestResponse] = useState('')
  
  // 表單數據
  const [formData, setFormData] = useState({
    config_name: '',
    persona_name: '高文文',
    persona_age: 23,
    persona_location: '高雄',
    personality_traits: [] as string[],
    formality_level: 3,
    friendliness_level: 4,
    emoji_frequency: 3,
    response_detail_level: 3,
    custom_responses: {},
    is_active: false
  })
  
  // 性格特徵輸入狀態
  const [traitInput, setTraitInput] = useState('')

  // 預設性格特徵選項
  const defaultTraits = [
    '活潑', '可愛', '保皖', '親切', '熱情',
    '專業', '有耐心', '幽默', '細心', '負責',
    '溫柔', '堅強', '樂觀', '理性', '創意'
  ]

  // 等級標籤
  const levelLabels = {
    formality: ['非常不正式', '不正式', '中等', '正式', '非常正式'],
    friendliness: ['冷漠', '疑備', '友善', '親切', '非常親切'],
    emoji: ['不使用', '很少', '適中', '經常', '非常频繁'],
    detail: ['簡短', '簡潔', '中等', '詳細', '非常詳細']
  }

  useEffect(() => {
    loadConfigs()
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

  const loadConfigs = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getPersonalityConfigs()
      setConfigs(data || [])
    } catch (err: any) {
      setError(err.message || '載入人格配置失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.config_name.trim() || !formData.persona_name.trim()) {
      setError('配置名稱和人格名稱不能為空')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      if (editingItem) {
        await updatePersonalityConfig(editingItem.id, formData)
        setSuccess('人格配置更新成功！')
      } else {
        await createPersonalityConfig(formData)
        setSuccess('人格配置新增成功！')
      }
      
      handleCancel()
      await loadConfigs()
    } catch (err: any) {
      setError(err.message || '保存失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleActivate = async (config: PersonalityConfig) => {
    if (config.is_active) {
      setError('此配置已經是活躍狀態')
      return
    }

    try {
      setLoading(true)
      setError('')
      await activatePersonalityConfig(config.id)
      setSuccess(`已啟用人格配置：${config.config_name}`)
      await loadConfigs()
    } catch (err: any) {
      setError(err.message || '啟用失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (config: PersonalityConfig) => {
    setEditingItem(config)
    setFormData({
      config_name: config.config_name,
      persona_name: config.persona_name,
      persona_age: config.persona_age,
      persona_location: config.persona_location,
      personality_traits: config.personality_traits || [],
      formality_level: config.formality_level,
      friendliness_level: config.friendliness_level,
      emoji_frequency: config.emoji_frequency,
      response_detail_level: config.response_detail_level,
      custom_responses: config.custom_responses || {},
      is_active: config.is_active
    })
    setTraitInput((config.personality_traits || []).join(', '))
    setShowAddForm(false)
  }

  const handleDelete = async (id: number) => {
    const configToDelete = configs.find(c => c.id === id)
    if (configToDelete?.is_active) {
      setError('無法刪除活躍中的配置，請先啟用其他配置')
      return
    }
    
    if (!confirm('確定要刪除這個人格配置嗎？此操作無法撤銷。')) return
    
    try {
      setLoading(true)
      setError('')
      await deletePersonalityConfig(id)
      setSuccess('人格配置刪除成功！')
      await loadConfigs()
    } catch (err: any) {
      setError(err.message || '刪除失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingItem(null)
    setShowAddForm(false)
    setFormData({
      config_name: '',
      persona_name: '高文文',
      persona_age: 23,
      persona_location: '高雄',
      personality_traits: [],
      formality_level: 3,
      friendliness_level: 4,
      emoji_frequency: 3,
      response_detail_level: 3,
      custom_responses: {},
      is_active: false
    })
    setTraitInput('')
  }

  const handleTraitInputChange = (value: string) => {
    setTraitInput(value)
    const traits = value.split(',').map(t => t.trim()).filter(t => t.length > 0)
    setFormData({ ...formData, personality_traits: traits })
  }

  const addDefaultTrait = (trait: string) => {
    if (!formData.personality_traits.includes(trait)) {
      const newTraits = [...formData.personality_traits, trait]
      setFormData({ ...formData, personality_traits: newTraits })
      setTraitInput(newTraits.join(', '))
    }
  }

  const handleTestPersona = () => {
    // 這裡可以實現一個簡單的測試功能
    // 根據當前設定生成一個示例回應
    const config = editingItem || formData
    const emojiLevel = config.emoji_frequency
    const friendlinessLevel = config.friendliness_level
    const detailLevel = config.response_detail_level
    
    let response = `嗨好！我是${config.persona_name}，${config.persona_age}歲，來自${config.persona_location}！`
    
    if (friendlinessLevel >= 4) {
      response += '很開心能幫你解答問題呢'
    }
    
    if (emojiLevel >= 3) {
      response += emojiLevel >= 4 ? ' 🌟😊' : ' 😊'
    }
    
    if (detailLevel >= 4 && testMessage.includes('美食')) {
      response += '我對文山特區的美食很熟悉哦，有什麼想知道的嗎？'
    }
    
    setTestResponse(response)
  }

  // 過濾數據
  const filteredConfigs = configs.filter(config => {
    const matchesSearch = !searchTerm || 
      config.config_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.persona_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (config.personality_traits || []).some(trait => trait.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = !showActiveOnly || config.is_active
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: configs.length,
    active: configs.filter(c => c.is_active).length,
    inactive: configs.filter(c => !c.is_active).length
  }

  const activeConfig = configs.find(c => c.is_active)

  return (
    <div className={cn("space-y-6", className)}>
      {/* 標題區域 */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-purple-500" />
            高文文人格管理
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            管理AI客服的人格設定，包括性格、語氣和回應風格
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true)
            setEditingItem(null)
            handleCancel()
          }}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增配置
        </button>
      </div>

      {/* 當前活躍配置 */}
      {activeConfig && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-900">當前活躍人格：{activeConfig.config_name}</h3>
              <p className="text-purple-700">
                {activeConfig.persona_name} ・ {activeConfig.persona_age}歲 ・ {activeConfig.persona_location}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-50 rounded-lg p-3">
              <p className="text-xs text-purple-600 mb-1">正式程度</p>
              <p className="text-sm font-medium text-purple-900">
                {levelLabels.formality[activeConfig.formality_level - 1]}
              </p>
            </div>
            <div className="bg-white bg-opacity-50 rounded-lg p-3">
              <p className="text-xs text-purple-600 mb-1">親切程度</p>
              <p className="text-sm font-medium text-purple-900">
                {levelLabels.friendliness[activeConfig.friendliness_level - 1]}
              </p>
            </div>
            <div className="bg-white bg-opacity-50 rounded-lg p-3">
              <p className="text-xs text-purple-600 mb-1">表情符號</p>
              <p className="text-sm font-medium text-purple-900">
                {levelLabels.emoji[activeConfig.emoji_frequency - 1]}
              </p>
            </div>
            <div className="bg-white bg-opacity-50 rounded-lg p-3">
              <p className="text-xs text-purple-600 mb-1">詳細程度</p>
              <p className="text-sm font-medium text-purple-900">
                {levelLabels.detail[activeConfig.response_detail_level - 1]}
              </p>
            </div>
          </div>
          
          {activeConfig.personality_traits && activeConfig.personality_traits.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-purple-700 mb-2">性格特徵：</p>
              <div className="flex flex-wrap gap-2">
                {activeConfig.personality_traits.map((trait, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">配置總數</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Settings className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">活躍配置</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">備用配置</p>
              <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* 成功/錯誤訊息 */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <p className="text-sm font-medium text-green-800">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* 篩選和搜索區域 */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索配置名稱、人格名稱或性格特徵..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* 狀態篩選 */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">僅顯示活躍</span>
            </label>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>顯示 {filteredConfigs.length} / {configs.length} 個配置</span>
        </div>
      </div>

      {/* 新增/編輯表單 */}
      {(showAddForm || editingItem) && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingItem ? '編輯人格配置' : '新增人格配置'}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  配置名稱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.config_name}
                  onChange={(e) => setFormData({ ...formData, config_name: e.target.value })}
                  placeholder="例如：活潑版高文文"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    人格名稱
                  </label>
                  <input
                    type="text"
                    value={formData.persona_name}
                    onChange={(e) => setFormData({ ...formData, persona_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    年齡
                  </label>
                  <input
                    type="number"
                    value={formData.persona_age}
                    onChange={(e) => setFormData({ ...formData, persona_age: parseInt(e.target.value) || 23 })}
                    min={18}
                    max={50}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    所在地
                  </label>
                  <input
                    type="text"
                    value={formData.persona_location}
                    onChange={(e) => setFormData({ ...formData, persona_location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  性格特徵 <span className="text-sm text-gray-500">(逗號分隔)</span>
                </label>
                <textarea
                  value={traitInput}
                  onChange={(e) => handleTraitInputChange(e.target.value)}
                  placeholder="例如：活潑, 可愛, 親切, 專業"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-2">快速選擇：</p>
                  <div className="flex flex-wrap gap-1">
                    {defaultTraits.map(trait => (
                      <button
                        key={trait}
                        type="button"
                        onClick={() => addDefaultTrait(trait)}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          formData.personality_traits.includes(trait)
                            ? 'bg-purple-100 text-purple-800 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        disabled={formData.personality_traits.includes(trait)}
                      >
                        {trait}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  正式程度 <span className="text-sm text-gray-500">({levelLabels.formality[formData.formality_level - 1]})</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={formData.formality_level}
                  onChange={(e) => setFormData({ ...formData, formality_level: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>非常不正式</span>
                  <span>非常正式</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  親切程度 <span className="text-sm text-gray-500">({levelLabels.friendliness[formData.friendliness_level - 1]})</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={formData.friendliness_level}
                  onChange={(e) => setFormData({ ...formData, friendliness_level: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>冷漠</span>
                  <span>非常親切</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  表情符號使用 <span className="text-sm text-gray-500">({levelLabels.emoji[formData.emoji_frequency - 1]})</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={formData.emoji_frequency}
                  onChange={(e) => setFormData({ ...formData, emoji_frequency: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>不使用</span>
                  <span>非常频繁</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  回應詳細程度 <span className="text-sm text-gray-500">({levelLabels.detail[formData.response_detail_level - 1]})</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={formData.response_detail_level}
                  onChange={(e) => setFormData({ ...formData, response_detail_level: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>簡短</span>
                  <span>非常詳細</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowTestDialog(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  預覽效果
                </button>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                    disabled={editingItem?.is_active}
                  />
                  <span className="text-sm text-gray-700">設為活躍配置</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <Save className="w-4 h-4" />
              {editingItem ? '更新' : '儲存'}
            </button>
          </div>
        </div>
      )}

      {/* 測試對話框 */}
      {showTestDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">人格效果預覽</h3>
              <button
                onClick={() => {
                  setShowTestDialog(false)
                  setTestMessage('')
                  setTestResponse('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">測試訊息</label>
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="輸入一個測試問題，例如：你好，請問有什麼美食推薦？"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={handleTestPersona}
                disabled={!testMessage.trim()}
                className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                生成回應
              </button>
              
              {testResponse && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm font-medium text-purple-900 mb-2">{formData.persona_name} 的回應：</p>
                  <p className="text-purple-800">{testResponse}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 配置列表 */}
      <div className="bg-white rounded-lg shadow border">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
              <span>載入中...</span>
            </div>
          </div>
        ) : filteredConfigs.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到人格配置</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? '嘗試調整搜索條件' : '開始新增第一個人格配置吧'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConfigs.map((config) => (
              <div key={config.id} className={cn(
                "p-6",
                config.is_active && "bg-purple-50 border-l-4 border-l-purple-500"
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{config.config_name}</h3>
                      {config.is_active && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <Star className="w-3 h-3 mr-1" />
                          活躍中
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{config.persona_name}</span>
                      </div>
                      <span>{config.persona_age}歲</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{config.persona_location}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-gray-500">正式程度：</span>
                        <span className="ml-1 font-medium">{levelLabels.formality[config.formality_level - 1]}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">親切程度：</span>
                        <span className="ml-1 font-medium">{levelLabels.friendliness[config.friendliness_level - 1]}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">表情使用：</span>
                        <span className="ml-1 font-medium">{levelLabels.emoji[config.emoji_frequency - 1]}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">詳細程度：</span>
                        <span className="ml-1 font-medium">{levelLabels.detail[config.response_detail_level - 1]}</span>
                      </div>
                    </div>
                    
                    {config.personality_traits && config.personality_traits.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm text-gray-500 mr-2">性格特徵：</span>
                        <div className="inline-flex flex-wrap gap-1">
                          {config.personality_traits.map((trait, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>創建：{new Date(config.created_at).toLocaleDateString('zh-TW')}</span>
                      <span>更新：{new Date(config.updated_at).toLocaleDateString('zh-TW')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {!config.is_active && (
                      <button
                        onClick={() => handleActivate(config)}
                        disabled={loading}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="啟用此配置"
                      >
                        <Play className="w-3 h-3" />
                        啟用
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(config)}
                      disabled={loading}
                      className="p-2 text-gray-600 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="編輯"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(config.id)}
                      disabled={loading || config.is_active}
                      className="p-2 text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={config.is_active ? '無法刪除活躍配置' : '刪除'}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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

export default PersonalityManager