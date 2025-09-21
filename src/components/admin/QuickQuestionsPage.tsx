import React, { useCallback, useEffect, useMemo, useState } from 'react'
import QuickQuestionsManager from './QuickQuestionsManager'
import type { QuickQuestionInput, QuickQuestionRecord } from '@/lib/api'
import { useQuickQuestions } from '@/hooks/useQuickQuestions'

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!error) return fallback
  if (error instanceof Error) {
    return error.message || fallback
  }
  if (typeof error === 'string') return error
  try {
    return JSON.stringify(error)
  } catch {
    return fallback
  }
}

const createInitialFormState = (nextDisplayOrder: number): QuickQuestionInput => ({
  question: '',
  display_order: Math.max(1, nextDisplayOrder),
  is_enabled: true
})

const QuickQuestionsPage = () => {
  const {
    questions,
    isLoading,
    isRefreshing,
    error: queryError,
    createQuickQuestion,
    updateQuickQuestion,
    deleteQuickQuestion,
    isMutating
  } = useQuickQuestions()

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [editingItem, setEditingItem] = useState<QuickQuestionRecord | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const nextDisplayOrder = useMemo(() => questions.length + 1, [questions.length])

  const [formData, setFormData] = useState<QuickQuestionInput>(createInitialFormState(nextDisplayOrder))

  useEffect(() => {
    if (queryError) {
      setError(getErrorMessage(queryError, '載入快速問題失敗'))
    }
  }, [queryError])

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

  useEffect(() => {
    if (!showAddForm && !editingItem) {
      setFormData(createInitialFormState(nextDisplayOrder))
    }
  }, [editingItem, nextDisplayOrder, showAddForm])

  const resetEditorState = useCallback(() => {
    setEditingItem(null)
    setShowAddForm(false)
    setFormData(createInitialFormState(nextDisplayOrder))
  }, [nextDisplayOrder])

  const handleSave = useCallback(async () => {
    if (!formData.question.trim()) {
      setError('快速問題內容不能為空')
      return
    }

    try {
      setError('')
      if (editingItem) {
        await updateQuickQuestion(editingItem.id, formData)
        setSuccess('快速問題更新成功')
      } else {
        await createQuickQuestion(formData)
        setSuccess('快速問題新增成功')
      }
      resetEditorState()
    } catch (err) {
      setError(getErrorMessage(err, '儲存失敗'))
    }
  }, [createQuickQuestion, editingItem, formData, resetEditorState, updateQuickQuestion])

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm('確定要刪除此快速問題嗎？')) {
        return
      }

      try {
        setError('')
        await deleteQuickQuestion(id)
        setSuccess('快速問題刪除成功')
      } catch (err) {
        setError(getErrorMessage(err, '刪除失敗'))
      }
    },
    [deleteQuickQuestion]
  )

  const handleStartEdit = useCallback((item: QuickQuestionRecord) => {
    setEditingItem(item)
    setShowAddForm(false)
    setFormData({
      question: item.question,
      display_order: item.display_order,
      is_enabled: item.is_enabled
    })
  }, [])

  const handleStartAdd = useCallback(() => {
    setEditingItem(null)
    setShowAddForm(true)
    setFormData(createInitialFormState(nextDisplayOrder))
  }, [nextDisplayOrder])

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

      {isRefreshing && !isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#06C755]" />
          正在同步最新的快速問題資料...
        </div>
      )}

      {isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-sm text-gray-500">
          正在載入快速問題...
        </div>
      )}

      <QuickQuestionsManager
        questions={questions}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showAddForm={showAddForm}
        editingItem={editingItem}
        formData={formData}
        setFormData={setFormData}
        handleSave={handleSave}
        handleDelete={handleDelete}
        loading={isMutating}
        onStartAdd={handleStartAdd}
        onStartEdit={handleStartEdit}
        onCloseEditor={resetEditorState}
        isRefreshing={isRefreshing}
      />
    </div>
  )
}

export default QuickQuestionsPage