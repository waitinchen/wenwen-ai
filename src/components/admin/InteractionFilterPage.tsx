import React, { useState, useEffect } from 'react'
import InteractionFilterManager from './InteractionFilterManager'
import {
  getInteractionFilters,
  createInteractionFilter,
  updateInteractionFilter,
  deleteInteractionFilter
} from '@/lib/api'

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

const InteractionFilterPage = () => {
  const [filters, setFilters] = useState<InteractionFilter[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // 搜索和過濾狀態
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  
  // 編輯狀態
  const [editingItem, setEditingItem] = useState<InteractionFilter | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  
  // 表單數據
  const [formData, setFormData] = useState({
    filter_name: '',
    filter_type: 'keyword',
    keywords: [] as string[],
    whitelist_keywords: [] as string[],
    blacklist_keywords: [] as string[],
    rejection_template: '',
    is_enabled: true
  })
  
  // 關鍵詞輸入狀態
  const [keywordInput, setKeywordInput] = useState({
    keywords: '',
    whitelist_keywords: '',
    blacklist_keywords: ''
  })

  useEffect(() => {
    loadFilters()
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

  const loadFilters = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getInteractionFilters()
      setFilters(data || [])
    } catch (err: any) {
      setError(err.message || '載入互動攔截規則失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.filter_name.trim() || !formData.rejection_template.trim()) {
      setError('過濾器名稱和拒絕模板不能為空')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      if (editingItem) {
        await updateInteractionFilter(editingItem.id, formData)
        setSuccess('互動攔截規則更新成功！')
        setEditingItem(null)
      } else {
        await createInteractionFilter(formData)
        setSuccess('互動攔截規則新增成功！')
        setShowAddForm(false)
      }
      
      // 重置表單
      resetForm()
      
      // 重新載入資料
      await loadFilters()
    } catch (err: any) {
      setError(err.message || '保存失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (filter: InteractionFilter) => {
    setEditingItem(filter)
    setFormData({
      filter_name: filter.filter_name,
      filter_type: filter.filter_type,
      keywords: filter.keywords || [],
      whitelist_keywords: filter.whitelist_keywords || [],
      blacklist_keywords: filter.blacklist_keywords || [],
      rejection_template: filter.rejection_template,
      is_enabled: filter.is_enabled
    })
    setKeywordInput({
      keywords: (filter.keywords || []).join(', '),
      whitelist_keywords: (filter.whitelist_keywords || []).join(', '),
      blacklist_keywords: (filter.blacklist_keywords || []).join(', ')
    })
    setShowAddForm(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除這個互動攔截規則嗎？此操作無法撤銷。')) return
    
    try {
      setLoading(true)
      setError('')
      await deleteInteractionFilter(id)
      setSuccess('互動攔截規則刪除成功！')
      await loadFilters()
    } catch (err: any) {
      setError(err.message || '刪除失敗')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      filter_name: '',
      filter_type: 'keyword',
      keywords: [],
      whitelist_keywords: [],
      blacklist_keywords: [],
      rejection_template: '',
      is_enabled: true
    })
    setKeywordInput({
      keywords: '',
      whitelist_keywords: '',
      blacklist_keywords: ''
    })
  }

  const handleCancel = () => {
    setEditingItem(null)
    setShowAddForm(false)
    resetForm()
  }

  const handleAddNew = () => {
    setEditingItem(null)
    setShowAddForm(true)
    resetForm()
    // 設置預設模板
    setFormData(prev => ({
      ...prev,
      rejection_template: '哈囉！不好意思呢，我是文山特區的專屬客服高文文，主要是幫大家介紹我們這裡的美食、商家和活動資訊哦～如果有關於文山特區的問題，我會很開心為你解答的！'
    }))
  }

  const handleKeywordInputChange = (field: string, value: string) => {
    setKeywordInput({ ...keywordInput, [field]: value })
    // 將逗號分隔的字符串轉換為數組
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0)
    setFormData({ ...formData, [field]: keywords })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">互動攔截管理</h1>
          <p className="mt-2 text-gray-600">管理話題過濾規則，自動攔截與文山特區無關的問題</p>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="text-sm text-green-600">{success}</div>
        </div>
      )}
      
      <InteractionFilterManager
        filters={filters}
        loading={loading}
        error={error}
        success={success}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        showActiveOnly={showActiveOnly}
        setShowActiveOnly={setShowActiveOnly}
        editingItem={editingItem}
        showAddForm={showAddForm}
        formData={formData}
        setFormData={setFormData}
        keywordInput={keywordInput}
        handleSave={handleSave}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleCancel={handleCancel}
        handleAddNew={handleAddNew}
        handleKeywordInputChange={handleKeywordInputChange}
      />
    </div>
  )
}

export default InteractionFilterPage