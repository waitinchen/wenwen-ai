import React from 'react'
import { Plus, Search, Edit, Trash2, Save, X, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

interface ActivitiesManagerProps {
  activities: any[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  showAddForm: boolean
  setShowAddForm: (show: boolean) => void
  editingItem: any
  setEditingItem: (item: any) => void
  formData: any
  setFormData: (data: any) => void
  handleSave: () => void
  handleDelete: (id: number) => void
  loading: boolean
}

const ActivitiesManager = ({
  activities,
  searchTerm,
  setSearchTerm,
  showAddForm,
  setShowAddForm,
  editingItem,
  setEditingItem,
  formData,
  setFormData,
  handleSave,
  handleDelete,
  loading
}: ActivitiesManagerProps) => {
  const startEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description,
      content: item.content,
      start_date: item.start_date?.split('T')[0] || '',
      end_date: item.end_date?.split('T')[0] || '',
      applicable_stores: item.applicable_stores || [],
      activity_tags: item.activity_tags || [],
      status: item.status
    })
  }

  const startAdd = () => {
    setShowAddForm(true)
    const today = new Date().toISOString().split('T')[0]
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    setFormData({
      title: '',
      description: '',
      content: '',
      start_date: today,
      end_date: nextWeek,
      applicable_stores: [],
      activity_tags: [],
      status: 'draft'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: '草稿', color: 'bg-gray-100 text-gray-800', icon: Edit },
      active: { label: '進行中', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      expired: { label: '已過期', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      disabled: { label: '禁用', color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    )
  }

  const filteredActivities = activities.filter(activity => 
    activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* 操作列 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索活動..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
            />
          </div>
        </div>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#06C755] text-white rounded-lg hover:bg-[#04A047] transition-colors"
        >
          <Plus size={20} />
          新增活動
        </button>
      </div>

      {/* 活動列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">活動名稱</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">時間</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">標籤</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredActivities.map((activity) => (
              <tr key={activity.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                  <div className="text-sm text-gray-500">{activity.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{new Date(activity.start_date).toLocaleDateString('zh-TW')}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    至 {new Date(activity.end_date).toLocaleDateString('zh-TW')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(activity.status)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {activity.activity_tags?.slice(0, 3).map((tag: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))}
                    {activity.activity_tags?.length > 3 && (
                      <span className="text-xs text-gray-500">+{activity.activity_tags.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(activity)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(activity.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 編輯/新增表單 */}
      {(showAddForm || editingItem) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingItem ? '編輯活動' : '新增活動'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setEditingItem(null)
                  setFormData({})
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">活動標題</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#06C755]"
                  placeholder="輸入活動標題..."
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">活動描述</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#06C755]"
                  rows={3}
                  placeholder="輸入活動描述..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">開始日期</label>
                <input
                  type="date"
                  value={formData.start_date || ''}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#06C755]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">結束日期</label>
                <input
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#06C755]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">活動狀態</label>
                <select
                  value={formData.status || 'draft'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#06C755]"
                >
                  <option value="draft">草稿</option>
                  <option value="active">進行中</option>
                  <option value="disabled">禁用</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">活動標籤</label>
                <input
                  type="text"
                  value={formData.activity_tags?.join(', ') || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    activity_tags: e.target.value.split(',').map((tag: string) => tag.trim()).filter(Boolean)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#06C755]"
                  placeholder="優惠, 特賣, 節日 (用逗號分隔)"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">活動內容</label>
                <textarea
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#06C755]"
                  rows={4}
                  placeholder="輸入活動詳細內容..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setEditingItem(null)
                  setFormData({})
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !formData.title || !formData.start_date || !formData.end_date}
                className="px-4 py-2 bg-[#06C755] text-white rounded-md hover:bg-[#04A047] disabled:bg-gray-300 flex items-center gap-2"
              >
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <Save size={16} />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivitiesManager
