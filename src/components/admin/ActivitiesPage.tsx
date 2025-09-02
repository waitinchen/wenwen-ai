import React, { useState, useEffect } from 'react'
import ActivitiesManager from './ActivitiesManager'
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity
} from '@/lib/api'

interface Activity {
  id: number
  title: string
  description: string
  content: string
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

const ActivitiesPage = () => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // 搜索和編輯狀態
  const [searchTerm, setSearchTerm] = useState('')
  const [editingItem, setEditingItem] = useState<Activity | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  
  // 表單數據
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    start_date: '',
    end_date: '',
    is_active: true
  })

  useEffect(() => {
    loadActivities()
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

  const loadActivities = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getActivities()
      setActivities(data || [])
    } catch (err: any) {
      setError(err.message || '載入活動失敗')
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
        await updateActivity(editingItem.id, formData)
        setSuccess('活動更新成功')
        setEditingItem(null)
      } else {
        // 新增
        await createActivity(formData)
        setSuccess('活動新增成功')
        setShowAddForm(false)
      }
      
      // 重新載入資料
      await loadActivities()
      
      // 重置表單
      setFormData({
        title: '',
        description: '',
        content: '',
        start_date: '',
        end_date: '',
        is_active: true
      })
    } catch (err: any) {
      setError(err.message || '儲存失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除此活動嗎？')) {
      return
    }
    
    try {
      setLoading(true)
      setError('')
      await deleteActivity(id)
      setSuccess('活動刪除成功')
      await loadActivities()
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
          <h1 className="text-2xl font-bold text-gray-900">活動管理</h1>
          <p className="mt-2 text-gray-600">管理商圈活動和優惠資訊</p>
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
    </div>
  )
}

export default ActivitiesPage