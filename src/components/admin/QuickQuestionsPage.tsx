import React, { useState, useEffect } from 'react'
import QuickQuestionsManager from './QuickQuestionsManager'
import {
  getQuickQuestions,
  createQuickQuestion,
  updateQuickQuestion,
  deleteQuickQuestion,
  bulkUpdateQuickQuestions,
  QuickQuestion
} from '@/lib/api'

// QuickQuestion interface is now imported from @/lib/api

const QuickQuestionsPage = () => {
  const [questions, setQuestions] = useState<QuickQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // 搜索和編輯狀態
  const [searchTerm, setSearchTerm] = useState('')
  const [editingItem, setEditingItem] = useState<QuickQuestion | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  
  // 表單數據
  const [formData, setFormData] = useState({
    question: '',
    display_order: 1,
    is_enabled: true
  })

  useEffect(() => {
    loadQuestions()
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

  const loadQuestions = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getQuickQuestions()
      setQuestions(data || [])
    } catch (err: any) {
      setError(err.message || '載入快速問題失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError('')
      
      if (editingItem) {
        // 更新
        await updateQuickQuestion(editingItem.id, formData)
        setSuccess('快速問題更新成功')
        setEditingItem(null)
      } else {
        // 新增
        await createQuickQuestion(formData)
        setSuccess('快速問題新增成功')
        setShowAddForm(false)
      }
      
      // 重新載入資料
      await loadQuestions()
      
      // 重置表單
      setFormData({
        question: '',
        display_order: 1,
        is_enabled: true
      })
    } catch (err: any) {
      setError(err.message || '儲存失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此快速問題嗎？')) {
      return
    }
    
    try {
      setLoading(true)
      setError('')
      await deleteQuickQuestion(id)
      setSuccess('快速問題刪除成功')
      await loadQuestions()
    } catch (err: any) {
      setError(err.message || '刪除失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">快速問題管理</h1>
          <p className="mt-2 text-gray-600">管理聊天界面的快速問題選項</p>
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
      
      <QuickQuestionsManager
        questions={questions}
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
    </div>
  )
}

export default QuickQuestionsPage