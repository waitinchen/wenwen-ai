import React from 'react'
import { Plus, Search, Edit, Trash2, Save, X } from 'lucide-react'
import type { QuickQuestionInput, QuickQuestionRecord } from '@/lib/api'

interface QuickQuestionsManagerProps {
  questions: QuickQuestionRecord[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  showAddForm: boolean
  editingItem: QuickQuestionRecord | null
  formData: QuickQuestionInput
  setFormData: React.Dispatch<React.SetStateAction<QuickQuestionInput>>
  handleSave: () => void
  handleDelete: (id: number) => void
  loading: boolean
  onStartAdd: () => void
  onStartEdit: (item: QuickQuestionRecord) => void
  onCloseEditor: () => void
  isRefreshing: boolean
}

const QuickQuestionsManager = ({
  questions,
  searchTerm,
  setSearchTerm,
  showAddForm,
  editingItem,
  formData,
  setFormData,
  handleSave,
  handleDelete,
  loading,
  onStartAdd,
  onStartEdit,
  onCloseEditor,
  isRefreshing
}: QuickQuestionsManagerProps) => {
  const filteredQuestions = questions.filter(q =>
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCloseEditor = () => {
    onCloseEditor()
  }

  return (
    <div className="space-y-6">
      {/* 操作列 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索快速問題..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
            />
          </div>
        </div>
        <button
          onClick={onStartAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#06C755] text-white rounded-lg hover:bg-[#04A047] transition-colors"
        >
          <Plus size={20} />
          新增快速問題
        </button>
      </div>

      {/* 快速問題列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">問題內容</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排序</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredQuestions.map((question) => (
              <tr key={question.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{question.question}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {question.display_order}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      question.is_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {question.is_enabled ? '啟用' : '禁用'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onStartEdit(question)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingItem ? '編輯快速問題' : '新增快速問題'}
              </h3>
              <button onClick={handleCloseEditor} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">問題內容</label>
                <input
                  type="text"
                  value={formData.question || ''}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#06C755]"
                  placeholder="輸入快速問題內容..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">顯示順序</label>
                <input
                  type="number"
                  value={formData.display_order || 1}
                  onChange={(e) => {
                    const parsedValue = parseInt(e.target.value, 10)
                    const displayOrder = Number.isNaN(parsedValue) ? 1 : Math.max(1, parsedValue)
                    setFormData({ ...formData, display_order: displayOrder })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#06C755]"
                  min={1}
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_enabled || false}
                    onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
                    className="rounded border-gray-300 text-[#06C755] focus:ring-[#06C755]"
                  />
                  <span className="text-sm font-medium text-gray-700">啟用此快速問題</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCloseEditor}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !formData.question}
                className="px-4 py-2 bg-[#06C755] text-white rounded-md hover:bg-[#04A047] disabled:bg-gray-300 flex items-center gap-2"
              >
                {(loading || isRefreshing) && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                )}
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

export default QuickQuestionsManager
