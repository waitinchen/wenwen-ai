import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  FileText,
  Upload,
  Download,
  Eye,
  EyeOff,
  Tag,
  AlertTriangle,
  CheckCircle,
  Filter,
  RefreshCw,
  MoreVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getTrainingData,
  createTrainingData,
  updateTrainingData,
  deleteTrainingData
} from '@/lib/api'

const TrainingDataManagement = () => {
  const [trainingData, setTrainingData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState<any>({
    category: '',
    question: '',
    answer: '',
    keywords: [],
    priority: 1,
    is_active: true
  })
  const [keywordInput, setKeywordInput] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // 分類選項
  const categories = [
    '商家資訊',
    'FAQ',
    '活動資訊',
    '營業時間',
    '聯絡方式',
    '交通資訊',
    '優惠資訊',
    '其他'
  ]

  useEffect(() => {
    loadTrainingData()
  }, [])

  const loadTrainingData = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getTrainingData()
      setTrainingData(data || [])
    } catch (err: any) {
      setError(err.message || '載入訓練資料失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      
      const dataToSave = {
        ...formData,
        keywords: keywordInput.split(',').map(k => k.trim()).filter(k => k)
      }

      if (editingItem) {
        await updateTrainingData(editingItem.id, dataToSave)
      } else {
        await createTrainingData(dataToSave)
      }

      setShowAddForm(false)
      setEditingItem(null)
      setFormData({
        category: '',
        question: '',
        answer: '',
        keywords: [],
        priority: 1,
        is_active: true
      })
      setKeywordInput('')
      await loadTrainingData()
    } catch (err: any) {
      setError(err.message || '保存失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      category: item.category || '',
      question: item.question || '',
      answer: item.answer || '',
      keywords: item.keywords || [],
      priority: item.priority || 1,
      is_active: item.is_active !== false
    })
    setKeywordInput((item.keywords || []).join(', '))
    setShowAddForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除這個訓練資料嗎？')) return

    try {
      setLoading(true)
      await deleteTrainingData(id)
      await loadTrainingData()
    } catch (err: any) {
      setError(err.message || '刪除失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingItem(null)
    setFormData({
      category: '',
      question: '',
      answer: '',
      keywords: [],
      priority: 1,
      is_active: true
    })
    setKeywordInput('')
  }

  const toggleStatus = async (item: any) => {
    try {
      setLoading(true)
      await updateTrainingData(item.id, {
        ...item,
        is_active: !item.is_active
      })
      await loadTrainingData()
    } catch (err: any) {
      setError(err.message || '更新狀態失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = () => {
    // 創建文件輸入元素
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,.csv,.txt'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = async (event) => {
          try {
            const content = event.target?.result as string
            let importData = []
            
            if (file.name.endsWith('.json')) {
              importData = JSON.parse(content)
            } else if (file.name.endsWith('.csv')) {
              // 簡單CSV解析
              const lines = content.split('\n')
              const headers = lines[0].split(',')
              importData = lines.slice(1).map(line => {
                const values = line.split(',')
                return headers.reduce((obj: any, header: string, index: number) => {
                  obj[header.trim()] = values[index]?.trim() || ''
                  return obj
                }, {})
              })
            } else {
              // 文字檔案格式：每行一個Q&A，用|分隔
              const lines = content.split('\n')
              importData = lines.filter(line => line.includes('|')).map(line => {
                const [question, answer] = line.split('|')
                return {
                  category: '其他',
                  question: question.trim(),
                  answer: answer.trim(),
                  keywords: [],
                  priority: 1,
                  is_active: true
                }
              })
            }
            
            // 批量創建訓練資料
            setLoading(true)
            for (const data of importData) {
              await createTrainingData(data)
            }
            await loadTrainingData()
            alert(`成功匯入 ${importData.length} 筆訓練資料`)
          } catch (err: any) {
            setError(`匯入失敗：${err.message}`)
          } finally {
            setLoading(false)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleExport = () => {
    const exportData = JSON.stringify(filteredData, null, 2)
    const blob = new Blob([exportData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `training_data_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 過濾和分頁數據
  const filteredData = trainingData.filter(item => {
    const matchesSearch = searchTerm === '' ||
      item.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.keywords || []).some((keyword: string) => 
        keyword.toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    const matchesCategory = selectedCategory === '' || item.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-6">
      {/* 標題和操作欄 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">訓練資料管理</h2>
          <p className="text-gray-600 mt-1">管理AI聊天機器人的訓練資料和知識庫</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleImport}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            匯入
          </button>
          
          <button
            onClick={handleExport}
            disabled={loading || filteredData.length === 0}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            匯出
          </button>
          
          <button
            onClick={() => setShowAddForm(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#06C755] rounded-lg hover:bg-[#05B04D] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            新增資料
          </button>
        </div>
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

      {/* 搜尋和篩選 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋問題、答案或關鍵詞..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent min-w-[150px]"
        >
          <option value="">所有分類</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* 訓練資料列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分類
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  問題
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  關鍵詞
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  優先級
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#06C755] mr-2" />
                      <span className="text-gray-500">載入中...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || selectedCategory ? '沒有符合條件的訓練資料' : '尚未建立任何訓練資料'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Tag className="w-3 h-3" />
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.question}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {item.answer}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(item.keywords || []).slice(0, 3).map((keyword: string, index: number) => (
                          <span key={index} className="inline-flex px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                            {keyword}
                          </span>
                        ))}
                        {(item.keywords || []).length > 3 && (
                          <span className="inline-flex px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                            +{(item.keywords || []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                        item.priority >= 3 ? "bg-red-100 text-red-800" :
                        item.priority === 2 ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      )}>
                        {item.priority >= 3 ? '高' : item.priority === 2 ? '中' : '低'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(item)}
                        disabled={loading}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                          item.is_active
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        )}
                      >
                        {item.is_active ? (
                          <><CheckCircle className="w-3 h-3" />啟用</>
                        ) : (
                          <><EyeOff className="w-3 h-3" />停用</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          disabled={loading}
                          className="text-[#06C755] hover:text-[#05B04D] disabled:opacity-50"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* 分頁 */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                顯示 {startIndex + 1} 到 {Math.min(startIndex + itemsPerPage, filteredData.length)} 筆，
                共 {filteredData.length} 筆資料
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一頁
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一頁
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 新增/編輯表單 */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingItem ? '編輯訓練資料' : '新增訓練資料'}
                </h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分類 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                  required
                >
                  <option value="">請選擇分類</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  問題 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                  rows={3}
                  placeholder="輸入訓練問題..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  答案 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                  rows={5}
                  placeholder="輸入標準答案..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  關鍵詞（用逗號分隔）
                </label>
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                  placeholder="例如：營業時間, 電話, 地址"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    優先級
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                  >
                    <option value={1}>低 (1)</option>
                    <option value={2}>中 (2)</option>
                    <option value={3}>高 (3)</option>
                    <option value={4}>極高 (4)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    狀態
                  </label>
                  <select
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                  >
                    <option value="true">啟用</option>
                    <option value="false">停用</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || !formData.category || !formData.question || !formData.answer}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#06C755] rounded-lg hover:bg-[#05B04D] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editingItem ? '更新' : '新增'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrainingDataManagement