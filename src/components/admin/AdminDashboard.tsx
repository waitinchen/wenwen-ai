import React, { useState, useEffect } from 'react'
import { 
  Store, 
  Brain, 
  GraduationCap, 
  HelpCircle, 
  BarChart3, 
  Users,
  MessageCircle,
  TrendingUp,
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  Shield,
  Settings,
  Calendar,
  Activity,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,

} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import {
  getStores,
  getAIConfigs,
  getTrainingData,
  getAllFAQs,
  getChatAnalytics,
  createStore,
  updateStore,
  deleteStore,
  createTrainingData,
  updateTrainingData,
  deleteTrainingData,
  updateAIConfig,
  // 新增功能API
  getQuickQuestions,
  createQuickQuestion,
  updateQuickQuestion,
  deleteQuickQuestion,
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getInteractionFilters,
  createInteractionFilter,
  updateInteractionFilter,
  deleteInteractionFilter,
  getPersonalityConfigs,
  createPersonalityConfig,
  updatePersonalityConfig,
  deletePersonalityConfig,
  activatePersonalityConfig,
  getDashboardStats,
  // FAQ管理API
  createFAQ,
  updateFAQ,
  deleteFAQ,
  toggleFAQStatus
} from '@/lib/api'
import QuickQuestionsManager from './QuickQuestionsManager'
import ActivitiesManager from './ActivitiesManager'
import FaqManagement from './FaqManagement'
import InteractionFilterPage from './InteractionFilterPage'
import PersonalityManager from './PersonalityManager'
import StoreManagement from './StoreManagement'
import TrainingDataManagement from './TrainingDataManagement'
import AIConfigManagement from './AIConfigManagement'
import ContentWarningManager from './ContentWarningManager'

interface AdminDashboardProps {
  activeTab?: string
}

const AdminDashboard = ({ activeTab = 'overview' }: AdminDashboardProps) => {
  const { admin } = useAdminAuth() // 獲取當前管理員信息
  const [currentTab, setCurrentTab] = useState(activeTab)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 數據狀態
  const [stores, setStores] = useState<any[]>([])
  const [aiConfigs, setAIConfigs] = useState<any[]>([])
  const [trainingData, setTrainingData] = useState<any[]>([])
  const [faqs, setFAQs] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any[]>([])
  
  // 新功能數據狀態
  const [quickQuestions, setQuickQuestions] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [interactionFilters, setInteractionFilters] = useState<any[]>([])
  const [personalityConfigs, setPersonalityConfigs] = useState<any[]>([])  
  
  // 基本統計數據（僅用於概覽頁面）
  const [dashboardStats, setDashboardStats] = useState<any>({})

  // 編輯狀態
  const [editingItem, setEditingItem] = useState<any>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [searchTerm, setSearchTerm] = useState('')

  // 根據管理員角色過濾標籤頁
  const allTabs = [
    { id: 'overview', label: '概覽', icon: BarChart3, allowedRoles: ['super_admin', 'admin'] },
    { id: 'stores', label: '商家管理', icon: Store, allowedRoles: ['super_admin', 'admin'] },
    { id: 'quick-questions', label: '快速問題', icon: MessageCircle, allowedRoles: ['super_admin', 'admin'] },
    { id: 'activities', label: '活動管理', icon: Calendar, allowedRoles: ['super_admin', 'admin'] },
    { id: 'content-warnings', label: '內容合理性', icon: AlertTriangle, allowedRoles: ['super_admin', 'admin'] },
    { id: 'interaction-filter', label: '互動攔截', icon: Shield, allowedRoles: ['super_admin', 'admin'] },
    { id: 'personality', label: '人格管理', icon: Brain, allowedRoles: ['super_admin'] }, // 只有超級管理員可以存取
    { id: 'ai-config', label: 'AI配置', icon: Settings, allowedRoles: ['super_admin'] }, // 只有超級管理員可以存取
    { id: 'training', label: '訓練資料', icon: GraduationCap, allowedRoles: ['super_admin', 'admin'] },
    { id: 'faqs', label: '常見問題', icon: HelpCircle, allowedRoles: ['super_admin', 'admin'] }
  ]

  // 根據當前管理員角色過濾標籤頁
  const tabs = allTabs.filter(tab => 
    admin?.role && tab.allowedRoles.includes(admin.role)
  )

  useEffect(() => {
    setCurrentTab(activeTab)
  }, [activeTab])

  useEffect(() => {
    loadData()
  }, [currentTab])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const dateRange = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T00:00:00Z',
        end: new Date().toISOString().split('T')[0] + 'T23:59:59Z'
      }

      switch (currentTab) {
        case 'stores':
          const storesData = await getStores()
          setStores(storesData || [])
          break
        case 'quick-questions':
          const quickData = await getQuickQuestions()
          setQuickQuestions(quickData || [])
          break
        case 'activities':
          const activitiesData = await getActivities()
          setActivities(activitiesData || [])
          break
        case 'interaction-filter':
          const filtersData = await getInteractionFilters()
          setInteractionFilters(filtersData || [])
          break
        case 'personality':
          const personalityData = await getPersonalityConfigs()
          setPersonalityConfigs(personalityData || [])
          break
        case 'ai-config':
          const aiConfigsData = await getAIConfigs()
          setAIConfigs(aiConfigsData || [])
          break
        case 'training':
          const trainingDataResult = await getTrainingData()
          setTrainingData(trainingDataResult || [])
          break
        case 'faqs':
          const faqsData = await getAllFAQs()
          setFAQs(faqsData || [])
          break
        case 'overview':
        default:
          const [overviewStores, overviewStats] = await Promise.all([
            getStores(),
            getDashboardStats(dateRange)
          ])
          setStores(overviewStores || [])
          setDashboardStats(overviewStats || {})
          break
      }
    } catch (err: any) {
      setError(err.message || '載入數據失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      
      const saveActions: { [key: string]: () => Promise<any> } = {
        'stores': async () => {
          if (editingItem) {
            await updateStore(editingItem.id, formData)
          } else {
            await createStore(formData)
          }
        },
        'quick-questions': async () => {
          if (editingItem) {
            await updateQuickQuestion(editingItem.id, formData)
          } else {
            await createQuickQuestion(formData)
          }
        },
        'activities': async () => {
          if (editingItem) {
            await updateActivity(editingItem.id, formData)
          } else {
            await createActivity(formData)
          }
        },
        'interaction-filter': async () => {
          if (editingItem) {
            await updateInteractionFilter(editingItem.id, formData)
          } else {
            await createInteractionFilter(formData)
          }
        },
        'personality': async () => {
          if (editingItem) {
            await updatePersonalityConfig(editingItem.id, formData)
          } else {
            await createPersonalityConfig(formData)
          }
        },
        'training': async () => {
          if (editingItem) {
            await updateTrainingData(editingItem.id, formData)
          } else {
            await createTrainingData(formData)
          }
        },
        'ai-config': async () => {
          if (editingItem) {
            await updateAIConfig(editingItem.id, formData)
          }
        },
        'faqs': async () => {
          if (editingItem) {
            await updateFAQ(editingItem.id, formData)
          } else {
            await createFAQ(formData)
          }
        }
      }
      
      if (saveActions[currentTab]) {
        await saveActions[currentTab]()
      }
      
      setEditingItem(null)
      setShowAddForm(false)
      setFormData({})
      await loadData()
    } catch (err: any) {
      setError(err.message || '保存失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除這個項目嗎？')) return
    
    try {
      setLoading(true)
      
      const deleteActions: { [key: string]: () => Promise<any> } = {
        'stores': () => deleteStore(id),
        'quick-questions': () => deleteQuickQuestion(id),
        'activities': () => deleteActivity(id),
        'interaction-filter': () => deleteInteractionFilter(id),
        'personality': () => deletePersonalityConfig(id),
        'training': () => deleteTrainingData(id),
        'faqs': () => deleteFAQ(id)
      }
      
      if (deleteActions[currentTab]) {
        await deleteActions[currentTab]()
      }
      
      await loadData()
    } catch (err: any) {
      setError(err.message || '刪除失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshData = () => {
    loadData()
  }



  const filteredData = () => {
    const dataSources: { [key: string]: any[] } = {
      'stores': stores,
      'quick-questions': quickQuestions,
      'activities': activities,
      'interaction-filter': interactionFilters,
      'personality': personalityConfigs,
      'training': trainingData,
      'faqs': faqs
    }
    
    const data = dataSources[currentTab] || []
    
    if (!searchTerm) return data
    
    return data.filter((item: any) => 
      Object.values(item).some((value: any) => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }

  // 渲染概覽頁面
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">商家總數</p>
              <p className="text-2xl font-bold text-gray-900">{stores.length}</p>
            </div>
            <Store className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">總對話數</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalConversations || 0}</p>
            </div>
            <MessageCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">活躍用戶</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.uniqueUsers || 0}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">攔截問題</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.blockedQuestions || 0}</p>
            </div>
            <Shield className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>
    </div>
  )

  // 渲染快速問題管理
  const renderQuickQuestions = () => (
    <QuickQuestionsManager
      questions={quickQuestions}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      showAddForm={showAddForm}
      setShowAddForm={setShowAddForm}
      editingItem={editingItem}
      setEditingItem={setEditingItem}
      formData={formData}
      setFormData={setFormData}
      handleSave={handleSave}
      handleDelete={handleDelete}
      loading={loading}
    />
  )

  // 渲染活動管理
  const renderActivities = () => (
    <ActivitiesManager
      activities={activities}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      showAddForm={showAddForm}
      setShowAddForm={setShowAddForm}
      editingItem={editingItem}
      setEditingItem={setEditingItem}
      formData={formData}
      setFormData={setFormData}
      handleSave={handleSave}
      handleDelete={handleDelete}
      loading={loading}
    />
  )

  // 渲染商家管理
  const renderStores = () => (
    <StoreManagement />
  )

  // 渲染FAQ管理
  const renderFAQs = () => (
    <FaqManagement />
  )
  
  // 渲染互動攔截管理
  const renderInteractionFilter = () => (
    <InteractionFilterPage />
  )

  // 渲染內容合理性管理
  const renderContentWarnings = () => (
    <ContentWarningManager />
  )
  
  // 渲染人格管理
  const renderPersonalityManagement = () => (
    <PersonalityManager />
  )

  // 渲染AI配置管理
  const renderAIConfig = () => (
    <AIConfigManagement />
  )

  // 渲染訓練資料管理
  const renderTrainingData = () => (
    <TrainingDataManagement />
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 標頭 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">管理後台</h1>
              <p className="mt-1 text-sm text-gray-500">文山特區客服機器人管理系統</p>
            </div>
            
            {/* 右上角快速工具 */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefreshData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="重新載入數據"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                重新載入
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab 導航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm',
                    currentTab === tab.id
                      ? 'border-[#06C755] text-[#06C755]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* 內容區域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">錯誤</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#06C755]"></div>
              <span>載入中...</span>
            </div>
          </div>
        ) : (
          <div>
            {currentTab === 'content-warnings' && renderContentWarnings()}
            {currentTab === 'overview' && renderOverview()}
            {currentTab === 'quick-questions' && renderQuickQuestions()}
            {currentTab === 'activities' && renderActivities()}
            {currentTab === 'stores' && renderStores()}
            {currentTab === 'interaction-filter' && renderInteractionFilter()}
            {currentTab === 'personality' && renderPersonalityManagement()}
            {currentTab === 'faqs' && renderFAQs()}
            {currentTab === 'ai-config' && renderAIConfig()}
            {currentTab === 'training' && renderTrainingData()}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
