import React from 'react'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Shield,
  CheckCircle,
  AlertCircle,
  Key,
  Ban,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface InteractionFilter {
  id: number
  filter_name: string
  filter_type: string
  keywords?: string[]
  whitelist_keywords?: string[]
  blacklist_keywords?: string[]
  rejection_template: string
  is_enabled: boolean
  created_at: string
  updated_at: string
}

interface InteractionFilterManagerProps {
  filters: InteractionFilter[]
  loading: boolean
  error: string
  success: string
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedType: string
  setSelectedType: (type: string) => void
  showActiveOnly: boolean
  setShowActiveOnly: (show: boolean) => void
  editingItem: InteractionFilter | null
  showAddForm: boolean
  formData: any
  setFormData: (data: any) => void
  keywordInput: any
  handleSave: () => void
  handleEdit: (filter: InteractionFilter) => void
  handleDelete: (id: number) => void
  handleCancel: () => void
  handleAddNew: () => void
  handleKeywordInputChange: (field: string, value: string) => void
  className?: string
}

const InteractionFilterManager = ({
  filters,
  loading,
  error,
  success,
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  showActiveOnly,
  setShowActiveOnly,
  editingItem,
  showAddForm,
  formData,
  setFormData,
  keywordInput,
  handleSave,
  handleEdit,
  handleDelete,
  handleCancel,
  handleAddNew,
  handleKeywordInputChange,
  className
}: InteractionFilterManagerProps) => {

  // 過濾器類型選項
  const filterTypes = [
    { value: 'keyword', label: '關鍵詞過濾' },
    { value: 'topic', label: '話題過濾' },
    { value: 'intent', label: '意圖過濾' }
  ]

  // 預設拒絕模板
  const defaultTemplates = [
    '哈囉！不好意思呢，我是文山特區的專屬客服高文文，主要是幫大家介紹我們這裡的美食、商家和活動資訊哦～如果有關於文山特區的問題，我會很開心為你解答的！',
    '嗨嗨～我主要負責文山特區相關的諮詢服務，關於其他方面的問題可能無法為你解答呢！有什麼想知道文山特區的美食或店家資訊嗎？',
    '抱歉哦～我專門介紹文山特區的商圈資訊，這個問題我可能幫不上忙！不如問問我們這裡有什麼好吃好玩的吧～'
  ]

  const applyTemplate = (template: string) => {
    setFormData({ ...formData, rejection_template: template })
  }

  // 過濾數據
  const filteredFilters = filters.filter(filter => {
    const matchesSearch = !searchTerm || 
      filter.filter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      filter.rejection_template.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (filter.blacklist_keywords || []).some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = selectedType === 'all' || filter.filter_type === selectedType
    const matchesStatus = !showActiveOnly || filter.is_enabled
    
    return matchesSearch && matchesType && matchesStatus
  })

  const stats = {
    total: filters.length,
    active: filters.filter(f => f.is_enabled).length,
    inactive: filters.filter(f => !f.is_enabled).length,
    keyword: filters.filter(f => f.filter_type === 'keyword').length,
    topic: filters.filter(f => f.filter_type === 'topic').length,
    intent: filters.filter(f => f.filter_type === 'intent').length
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* 標題區域 */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-red-500" />
            互動攔截管理
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            管理話題過濾規則，自動攔截與文山特區無關的問題
          </p>
        </div>
        <button
          onClick={handleAddNew}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增攔截規則
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">規則總數</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">啟用中</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">已禁用</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">關鍵詞</p>
              <p className="text-2xl font-bold text-purple-600">{stats.keyword}</p>
            </div>
            <Key className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">話題</p>
              <p className="text-2xl font-bold text-orange-600">{stats.topic}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">意圖</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.intent}</p>
            </div>
            <Ban className="w-8 h-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* 篩選和搜索區域 */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索過濾器名稱、拒絕模板或關鍵詞..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* 類型篩選 */}
          <div className="sm:w-48">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">所有類型</option>
              {filterTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          {/* 狀態篩選 */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="rounded border-gray-300 text-red-500 focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">僅顯示啟用</span>
            </label>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>顯示 {filteredFilters.length} / {filters.length} 個規則</span>
        </div>
      </div>

      {/* 新增/編輯表單 */}
      {(showAddForm || editingItem) && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingItem ? '編輯攔截規則' : '新增攔截規則'}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  規則名稱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.filter_name}
                  onChange={(e) => setFormData({ ...formData, filter_name: e.target.value })}
                  placeholder="請輸入規則名稱"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  過濾類型
                </label>
                <select
                  value={formData.filter_type}
                  onChange={(e) => setFormData({ ...formData, filter_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {filterTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  黑名單關鍵詞 <span className="text-sm text-gray-500">(逗號分隔)</span>
                </label>
                <textarea
                  value={keywordInput.blacklist_keywords}
                  onChange={(e) => handleKeywordInputChange('blacklist_keywords', e.target.value)}
                  placeholder="例如：政治, 股票, 投資, 醫療"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  包含這些關鍵詞的問題將被攔截
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  白名單關鍵詞 <span className="text-sm text-gray-500">(逗號分隔，可選)</span>
                </label>
                <textarea
                  value={keywordInput.whitelist_keywords}
                  onChange={(e) => handleKeywordInputChange('whitelist_keywords', e.target.value)}
                  placeholder="例如：文山, 美食, 商圈"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  包含這些關鍵詞的問題不會被攔截
                </p>
              </div>
              
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_enabled}
                    onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
                    className="rounded border-gray-300 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">啟用此規則</span>
                </label>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  拒絕回應模板 <span className="text-red-500">*</span>
                </label>
                <div className="mb-2">
                  <p className="text-xs text-gray-500 mb-2">快速選擇模板：</p>
                  <div className="space-y-1">
                    {defaultTemplates.map((template, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => applyTemplate(template)}
                        className="w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border text-gray-700 transition-colors"
                      >
                        {template.substring(0, 60)}...
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={formData.rejection_template}
                  onChange={(e) => setFormData({ ...formData, rejection_template: e.target.value })}
                  placeholder="請輸入當問題被攔截時的回應內容..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  這段文字將在攔截無關問題時回復給用戶
                </p>
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <Save className="w-4 h-4" />
              {editingItem ? '更新' : '儲存'}
            </button>
          </div>
        </div>
      )}

      {/* 規則列表 */}
      <div className="bg-white rounded-lg shadow border">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
              <span>載入中...</span>
            </div>
          </div>
        ) : filteredFilters.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到攔截規則</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedType !== 'all' ? '嘗試調整搜索條件或篩選器' : '開始新增第一個攔截規則吧'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredFilters.map((filter) => (
              <div key={filter.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{filter.filter_name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        filter.is_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {filter.is_enabled ? '啟用' : '禁用'}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {filterTypes.find(t => t.value === filter.filter_type)?.label || filter.filter_type}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {filter.rejection_template}
                    </p>
                    
                    {filter.blacklist_keywords && filter.blacklist_keywords.length > 0 && (
                      <div className="mb-2">
                        <span className="text-xs font-medium text-gray-500 mr-2">黑名單關鍵詞：</span>
                        <div className="inline-flex flex-wrap gap-1">
                          {filter.blacklist_keywords.slice(0, 5).map((keyword, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">
                              {keyword}
                            </span>
                          ))}
                          {filter.blacklist_keywords.length > 5 && (
                            <span className="text-xs text-gray-500">+{filter.blacklist_keywords.length - 5} 更多</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {filter.whitelist_keywords && filter.whitelist_keywords.length > 0 && (
                      <div className="mb-2">
                        <span className="text-xs font-medium text-gray-500 mr-2">白名單關鍵詞：</span>
                        <div className="inline-flex flex-wrap gap-1">
                          {filter.whitelist_keywords.slice(0, 5).map((keyword, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                              {keyword}
                            </span>
                          ))}
                          {filter.whitelist_keywords.length > 5 && (
                            <span className="text-xs text-gray-500">+{filter.whitelist_keywords.length - 5} 更多</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>創建：{new Date(filter.created_at).toLocaleDateString('zh-TW')}</span>
                      <span>更新：{new Date(filter.updated_at).toLocaleDateString('zh-TW')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(filter)}
                      disabled={loading}
                      className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="編輯"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(filter.id)}
                      disabled={loading}
                      className="p-2 text-gray-600 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="刪除"
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

export default InteractionFilterManager