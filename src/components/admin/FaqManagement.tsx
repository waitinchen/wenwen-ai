import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Tag,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  toggleFAQStatus
} from '@/lib/api'
import ContentWarningBadge from './ContentWarningBadge'

interface FAQ {
  id: number
  question: string
  answer: string
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface FaqManagementProps {
  className?: string
}

const FaqManagement = ({ className }: FaqManagementProps) => {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // 搜索和過濾狀態
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  
  // 編輯狀態
  const [editingItem, setEditingItem] = useState<FAQ | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  
  // 表單數據
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    is_active: true
  })

  // 預設分類選項
  const defaultCategories = [
    '商家資訊',
    '交通指南', 
    '停車資訊',
    '活動優惠',
    '營業時間',
    '聯絡方式',
    '其他'
  ]

  useEffect(() => {
    loadFAQs()
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

  const loadFAQs = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getAllFAQs()
      setFaqs(data || [])
    } catch (err: any) {
      setError(err.message || '載入常見問題失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      setError('問題和答案不能為空')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      if (editingItem) {
        await updateFAQ(editingItem.id, formData)
        setSuccess('常見問題更新成功！')
      } else {
        await createFAQ(formData)
        setSuccess('常見問題新增成功！')
      }
      
      setEditingItem(null)
      setShowAddForm(false)
      setFormData({
        question: '',
        answer: '',
        category: '',
        is_active: true
      })
      await loadFAQs()
    } catch (err: any) {
      setError(err.message || '保存失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (faq: FAQ) => {
    setEditingItem(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
      is_active: faq.is_active
    })
    setShowAddForm(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除這個常見問題嗎？此操作無法撤銷。')) return
    
    try {
      setLoading(true)
      setError('')
      await deleteFAQ(id)
      setSuccess('常見問題刪除成功！')
      await loadFAQs()
    } catch (err: any) {
      setError(err.message || '刪除失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (faq: FAQ) => {
    try {
      setLoading(true)
      setError('')
      await toggleFAQStatus(faq.id, !faq.is_active)
      setSuccess(`常見問題已${faq.is_active ? '禁用' : '啟用'}！`)
      await loadFAQs()
    } catch (err: any) {
      setError(err.message || '狀態切換失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingItem(null)
    setShowAddForm(false)
    setFormData({
      question: '',
      answer: '',
      category: '',
      is_active: true
    })
  }

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  // 獲取所有唯一的分類
  const categories = [...new Set(faqs.map(faq => faq.category).filter(Boolean))]
  const allCategories = [...new Set([...defaultCategories, ...categories])]

  // 過濾FAQ數據
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = !searchTerm || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faq.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesStatus = !showActiveOnly || faq.is_active
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const stats = {
    total: faqs.length,
    active: faqs.filter(faq => faq.is_active).length,
    inactive: faqs.filter(faq => !faq.is_active).length,
    categories: categories.length
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* 標題區域 */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-blue-500" />
            常見問題管理
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            請先匯入基礎問答並可新增修改刪除常見問題
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true)
            setEditingItem(null)
            setFormData({
              question: '',
              answer: '',
              category: '',
              is_active: true
            })
          }}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#06C755] text-white rounded-lg hover:bg-[#05B34A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增問題
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">問題總數</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <HelpCircle className="w-8 h-8 text-blue-500" />
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
              <p className="text-sm font-medium text-gray-600">分類數</p>
              <p className="text-2xl font-bold text-purple-600">{stats.categories}</p>
            </div>
            <Tag className="w-8 h-8 text-purple-500" />
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
                placeholder="搜索問題、答案或分類..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
              />
            </div>
          </div>
          
          {/* 分類篩選 */}
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
            >
              <option value="all">所有分類</option>
              {allCategories.map(category => (
                <option key={category} value={category}>{category}</option>
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
                className="rounded border-gray-300 text-[#06C755] focus:ring-[#06C755]"
              />
              <span className="text-sm text-gray-700">僅顯示啟用</span>
            </label>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>顯示 {filteredFaqs.length} / {faqs.length} 個問題</span>
        </div>
      </div>

      {/* 新增/編輯表單 */}
      {(showAddForm || editingItem) && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingItem ? '編輯常見問題' : '新增常見問題'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                問題標題 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="請輸入問題標題"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                問題分類
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
              >
                <option value="">選擇分類</option>
                {defaultCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                答案內容 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="請輸入詳細答案內容..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-[#06C755] focus:ring-[#06C755]"
                />
                <span className="text-sm text-gray-700">啟用此問題</span>
              </label>
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
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#06C755] text-white rounded-lg hover:bg-[#05B34A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <Save className="w-4 h-4" />
              {editingItem ? '更新' : '儲存'}
            </button>
          </div>
        </div>
      )}

      {/* FAQ列表 */}
      <div className="bg-white rounded-lg shadow border">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#06C755]"></div>
              <span>載入中...</span>
            </div>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到常見問題</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory !== 'all' ? '嘗試調整搜索條件或篩選器' : '開始新增第一個常見問題吧'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                      {faq.category && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Tag className="w-3 h-3 mr-1" />
                          {faq.category}
                        </span>
                      )}
                      <ContentWarningBadge 
                        sourceTable="faqs" 
                        sourceId={faq.id} 
                        content={`${faq.question} ${faq.answer}`}
                        className="ml-auto"
                      />
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        faq.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {faq.is_active ? '啟用' : '禁用'}
                      </span>
                    </div>
                    
                    <div className={cn(
                      "text-gray-600 transition-all duration-200",
                      expandedItems.has(faq.id) ? "" : "line-clamp-2"
                    )}>
                      {faq.answer}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>創建：{new Date(faq.created_at).toLocaleDateString('zh-TW')}</span>
                      <span>更新：{new Date(faq.updated_at).toLocaleDateString('zh-TW')}</span>
                      <button
                        onClick={() => toggleExpanded(faq.id)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        {expandedItems.has(faq.id) ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            收起
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            展開
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggleStatus(faq)}
                      disabled={loading}
                      className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={faq.is_active ? '禁用' : '啟用'}
                    >
                      {faq.is_active ? (
                        <ToggleRight className="w-5 h-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(faq)}
                      disabled={loading}
                      className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="編輯"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
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

export default FaqManagement