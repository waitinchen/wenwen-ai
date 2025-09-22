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
  Store,
  MapPin,
  Phone,
  Clock,
  Globe,
  Facebook,
  CheckCircle,
  AlertCircle,
  Star,
  Shield,
  Tag,
  Users,
  Eye,
  EyeOff,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getStores,
  createStore,
  updateStore,
  deleteStore
} from '@/lib/api'

interface Store {
  id: number
  store_name: string
  owner: string
  role: string
  category: string
  address: string
  phone: string
  business_hours: string
  services: string
  features: string
  is_safe_store: boolean
  has_member_discount: boolean
  is_partner_store: boolean
  facebook_url: string
  website_url: string
  created_at: string
  updated_at: string
}

interface StoreManagementProps {
  className?: string
}

const StoreManagement = ({ className }: StoreManagementProps) => {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // 搜索和過濾狀態
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showSafeStoresOnly, setShowSafeStoresOnly] = useState(false)
  const [showDiscountStoresOnly, setShowDiscountStoresOnly] = useState(false)
  const [showPartnerStoresOnly, setShowPartnerStoresOnly] = useState(false)
  
  // 編輯狀態
  const [editingItem, setEditingItem] = useState<Store | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  
  // 表單數據
  const [formData, setFormData] = useState({
    store_name: '',
    owner: '',
    role: '',
    category: '',
    address: '',
    phone: '',
    business_hours: '',
    services: '',
    features: '',
    is_safe_store: false,
    has_member_discount: false,
    is_partner_store: false,
    facebook_url: '',
    website_url: ''
  })

  // 預設分類選項
  const defaultCategories = [
    '餐飲美食',
    '居家生活', 
    '教育育樂',
    '運動休閒',
    '美容服務',
    '醫療健康',
    '汽車服務',
    '3C電子',
    '服飾配件',
    '其他'
  ]

  // 角色選項
  const roleOptions = [
    '理事長',
    '副理事長',
    '理事',
    '監事',
    '店主',
    '負責人',
    '教練',
    '安心店家',
    '會員店家'
  ]

  useEffect(() => {
    loadStores()
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

  const loadStores = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getStores()
      setStores(data || [])
    } catch (err: any) {
      setError(err.message || '載入商家資料失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    console.log('handleSave called')
    console.log('formData:', formData)
    console.log('editingItem:', editingItem)
    
    if (!formData.store_name.trim()) {
      setError('商家名稱不能為空')
      return
    }

    try {
      setLoading(true)
      setError('')
      console.log('Starting save process...')
      
      const storeData = {
        ...formData,
        created_at: editingItem ? editingItem.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('Saving store data:', storeData)
      console.log('is_partner_store value:', storeData.is_partner_store)
      
      let savedStore
      if (editingItem) {
        savedStore = await updateStore(editingItem.id, storeData)
        setSuccess('商家資料更新成功！')
      } else {
        savedStore = await createStore(storeData)
        setSuccess('商家資料新增成功！')
      }
      
      console.log('Saved store result:', savedStore)
      
      setEditingItem(null)
      setShowAddForm(false)
      resetFormData()
      
      // 強制重新載入數據
      await loadStores()
      
      console.log('Save completed successfully')
    } catch (err: any) {
      console.error('Save failed with error:', err)
      setError(err.message || '保存失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (store: Store) => {
    setEditingItem(store)
    setFormData({
      store_name: store.store_name,
      owner: store.owner || '',
      role: store.role || '',
      category: store.category || '',
      address: store.address || '',
      phone: store.phone || '',
      business_hours: store.business_hours || '',
      services: store.services || '',
      features: store.features || '',
      is_safe_store: store.is_safe_store || false,
      has_member_discount: store.has_member_discount || false,
      is_partner_store: store.is_partner_store || false,
      facebook_url: store.facebook_url || '',
      website_url: store.website_url || ''
    })
    setShowAddForm(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除這家商家嗎？此操作無法撤銷。')) return
    
    try {
      setLoading(true)
      setError('')
      await deleteStore(id)
      setSuccess('商家刪除成功！')
      await loadStores()
    } catch (err: any) {
      setError(err.message || '刪除失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingItem(null)
    setShowAddForm(false)
    resetFormData()
  }

  const resetFormData = () => {
    setFormData({
      store_name: '',
      owner: '',
      role: '',
      category: '',
      address: '',
      phone: '',
      business_hours: '',
      services: '',
      features: '',
      is_safe_store: false,
      has_member_discount: false,
      is_partner_store: false,
      facebook_url: '',
      website_url: ''
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

  const toggleBulkSafeStores = async (ids: number[], isSafe: boolean) => {
    try {
      setLoading(true)
      setError('')
      
      const promises = ids.map(id => {
        const store = stores.find(s => s.id === id)
        if (store) {
          return updateStore(id, { ...store, is_safe_store: isSafe, updated_at: new Date().toISOString() })
        }
        return Promise.resolve()
      })
      
      await Promise.all(promises)
      setSuccess(`已批量${isSafe ? '設為' : '取消'}安心店家`)
      await loadStores()
    } catch (err: any) {
      setError(err.message || '批量操作失敗')
    } finally {
      setLoading(false)
    }
  }

  // 獲取所有唯一的分類
  const categories = [...new Set(stores.map(store => store.category).filter(Boolean))]
  const allCategories = [...new Set([...defaultCategories, ...categories])]

  // 過濾商家數據
  const filteredStores = stores.filter(store => {
    const matchesSearch = !searchTerm || 
      store.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (store.owner || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (store.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (store.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (store.services || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || store.category === selectedCategory
    const matchesSafeStore = !showSafeStoresOnly || store.is_safe_store
    const matchesDiscount = !showDiscountStoresOnly || store.has_member_discount
    const matchesPartner = !showPartnerStoresOnly || store.is_partner_store
    
    return matchesSearch && matchesCategory && matchesSafeStore && matchesDiscount && matchesPartner
  })

  const stats = {
    total: stores.length,
    safeStores: stores.filter(store => store.is_safe_store).length,
    discountStores: stores.filter(store => store.has_member_discount).length,
    partnerStores: stores.filter(store => store.is_partner_store).length,
    categories: categories.length
  }

  // 調試信息
  console.log('=== 商家管理調試信息 ===')
  console.log('Stores data length:', stores.length)
  console.log('Stores data:', stores)
  console.log('Partner stores count:', stores.filter(store => store.is_partner_store).length)
  console.log('Partner stores:', stores.filter(store => store.is_partner_store))
  console.log('All is_partner_store values:', stores.map(store => ({ id: store.id, name: store.store_name, is_partner_store: store.is_partner_store })))
  console.log('Stats:', stats)
  console.log('=== 調試信息結束 ===')

  return (
    <div className={cn("space-y-6", className)}>
      {/* 標題區域 */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-7 h-7 text-blue-500" />
            商家管理
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            管理文山特區的所有合作商家資料
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true)
            setEditingItem(null)
            resetFormData()
          }}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#06C755] text-white rounded-lg hover:bg-[#05B34A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增商家
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">商家總數</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Store className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">安心店家</p>
              <p className="text-2xl font-bold text-green-600">{stats.safeStores}</p>
            </div>
            <Shield className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">優惠店家</p>
              <p className="text-2xl font-bold text-purple-600">{stats.discountStores}</p>
            </div>
            <Star className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">特約商家</p>
              <p className="text-2xl font-bold text-blue-600">{stats.partnerStores}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">分類數</p>
              <p className="text-2xl font-bold text-orange-600">{stats.categories}</p>
            </div>
            <Tag className="w-8 h-8 text-orange-500" />
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
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="搜索商家名稱、負責人、分類或地址..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
              />
            </div>
          </div>
          
          {/* 分類篩選 */}
          <div className="lg:w-48">
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
          
          {/* 篩選選項 */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showSafeStoresOnly}
                onChange={(e) => setShowSafeStoresOnly(e.target.checked)}
                className="rounded border-gray-300 text-[#06C755] focus:ring-[#06C755]"
              />
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">安心店家</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showDiscountStoresOnly}
                onChange={(e) => setShowDiscountStoresOnly(e.target.checked)}
                className="rounded border-gray-300 text-[#06C755] focus:ring-[#06C755]"
              />
              <Star className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-700">優惠店家</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPartnerStoresOnly}
                onChange={(e) => setShowPartnerStoresOnly(e.target.checked)}
                className="rounded border-gray-300 text-[#06C755] focus:ring-[#06C755]"
              />
              <CheckCircle className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-700">特約商家</span>
            </label>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>顯示 {filteredStores.length} / {stores.length} 家商家</span>
        </div>
      </div>

      {/* 新增/編輯表單 */}
      {(showAddForm || editingItem) && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingItem ? '編輯商家資料' : '新增商家'}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 基本資訊 */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-700 border-b pb-2">基本資訊</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商家名稱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.store_name}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                  placeholder="請輸入商家名稱"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  負責人
                </label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="請輸入負責人姓名"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  角色/職位
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                >
                  <option value="">選擇角色</option>
                  {roleOptions.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商家分類
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
                  聯絡電話
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="請輸入聯絡電話"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                />
              </div>
            </div>
            
            {/* 詳細資訊 */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-700 border-b pb-2">詳細資訊</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商家地址
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="請輸入完整地址"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  營業時間
                </label>
                <textarea
                  value={formData.business_hours}
                  onChange={(e) => setFormData({ ...formData, business_hours: e.target.value })}
                  placeholder="請輸入營業時間"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  服務項目
                </label>
                <textarea
                  value={formData.services}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                  placeholder="請輸入主要服務項目"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  特色亮點
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="請輸入商家特色"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          {/* 連結資訊和設定 */}
          <div className="mt-6 space-y-4">
            <h4 className="text-md font-medium text-gray-700 border-b pb-2">連結和設定</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook 網址
                </label>
                <input
                  type="url"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  placeholder="https://www.facebook.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  官方網站
                </label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06C755] focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_safe_store}
                  onChange={(e) => setFormData({ ...formData, is_safe_store: e.target.checked })}
                  className="rounded border-gray-300 text-[#06C755] focus:ring-[#06C755]"
                />
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">安心店家</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.has_member_discount}
                  onChange={(e) => setFormData({ ...formData, has_member_discount: e.target.checked })}
                  className="rounded border-gray-300 text-[#06C755] focus:ring-[#06C755]"
                />
                <Star className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-700">提供會員優惠</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_partner_store || false}
                  onChange={(e) => setFormData({ ...formData, is_partner_store: e.target.checked })}
                  className="rounded border-gray-300 text-[#06C755] focus:ring-[#06C755]"
                />
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700">特約商家</span>
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

      {/* 商家列表 */}
      <div className="bg-white rounded-lg shadow border">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#06C755]"></div>
              <span>載入中...</span>
            </div>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-12">
            <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到商家</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory !== 'all' ? '嘗試調整搜索條件或篩選器' : 
               '還沒有新增任何商家，點擊「新增商家」按鈕開始新增'}
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <button
                onClick={() => {
                  setShowAddForm(true)
                  setEditingItem(null)
                  resetFormData()
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#06C755] text-white rounded-lg hover:bg-[#05B34A] transition-colors"
              >
                <Plus className="w-4 h-4" />
                新增商家
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredStores.map((store) => {
              const isExpanded = expandedItems.has(store.id)
              return (
                <div key={store.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{store.store_name}</h3>
                        <div className="flex items-center gap-2">
                          {store.is_safe_store && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              <Shield className="w-3 h-3" />
                              安心店家
                            </span>
                          )}
                          {store.has_member_discount && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                              <Star className="w-3 h-3" />
                              會員優惠
                            </span>
                          )}
                          {store.is_partner_store && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              特約商家
                            </span>
                          )}
                          {store.category && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              <Tag className="w-3 h-3" />
                              {store.category}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="space-y-1">
                          {store.owner && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>{store.owner} ({store.role})</span>
                            </div>
                          )}
                          {store.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{store.phone}</span>
                            </div>
                          )}
                          {store.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span className="line-clamp-1">{store.address}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          {store.business_hours && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span className="line-clamp-1">{store.business_hours}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            {store.facebook_url && (
                              <a 
                                href={store.facebook_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Facebook className="w-4 h-4" />
                              </a>
                            )}
                            {store.website_url && (
                              <a 
                                href={store.website_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-800"
                              >
                                <Globe className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="space-y-3 text-sm">
                            {store.services && (
                              <div>
                                <h4 className="font-medium text-gray-700 mb-1">服務項目</h4>
                                <p className="text-gray-600 leading-relaxed">{store.services}</p>
                              </div>
                            )}
                            {store.features && (
                              <div>
                                <h4 className="font-medium text-gray-700 mb-1">特色亮點</h4>
                                <p className="text-gray-600 leading-relaxed">{store.features}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => toggleExpanded(store.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title={isExpanded ? '收起詳情' : '展開詳情'}
                      >
                        {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(store)}
                        disabled={loading}
                        className="p-2 text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="編輯商家"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(store.id)}
                        disabled={loading}
                        className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="刪除商家"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default StoreManagement
