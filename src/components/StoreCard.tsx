import React from 'react'
import { MapPin, Phone, Clock, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Store } from '@/lib/supabase'

interface StoreCardProps {
  store: Store
  className?: string
}

const StoreCard: React.FC<StoreCardProps> = ({ store, className }) => {
  return (
    <div className={cn(
      'bg-white border border-gray-200 rounded-xl p-4 shadow-sm',
      'hover:shadow-md transition-shadow duration-200',
      className
    )}>
      {/* 店名和標籤 */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-lg leading-tight">
          {store.store_name}
        </h3>
        <div className="flex gap-1 ml-2 flex-shrink-0">
          {store.is_safe_store && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              安心店家
            </span>
          )}
          {store.has_member_discount && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              會員折扣
            </span>
          )}
        </div>
      </div>

      {/* 類別和角色 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
          {store.category || '未分類'}
        </span>
        {store.role && (
          <span className="px-2 py-1 bg-[#06C755]/10 text-[#06C755] text-xs rounded">
            {store.role}
          </span>
        )}
      </div>

      {/* 地址 */}
      {store.address && (
        <div className="flex items-start gap-2 mb-2">
          <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-600 leading-relaxed">
            {store.address}
          </span>
        </div>
      )}

      {/* 電話 */}
      {store.phone && store.phone !== '請查詢' && (
        <div className="flex items-center gap-2 mb-2">
          <Phone size={16} className="text-gray-400" />
          <a 
            href={`tel:${store.phone}`}
            className="text-sm text-[#06C755] hover:underline"
          >
            {store.phone}
          </a>
        </div>
      )}

      {/* 營業時間 */}
      {store.business_hours && store.business_hours !== '請電洽確認' && (
        <div className="flex items-start gap-2 mb-3">
          <Clock size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-600 leading-relaxed">
            {store.business_hours}
          </span>
        </div>
      )}

      {/* 主要服務 */}
      {store.services && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Star size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">主要服務</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed ml-6">
            {store.services}
          </p>
        </div>
      )}

      {/* 特色 */}
      {store.features && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-700 leading-relaxed">
            {store.features}
          </p>
        </div>
      )}

      {/* 社群連結 */}
      <div className="flex gap-2 mt-3">
        {store.facebook_url && (
          <a 
            href={store.facebook_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs rounded-full hover:bg-blue-100 transition-colors"
          >
            Facebook
          </a>
        )}
        {store.website_url && (
          <a 
            href={store.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs rounded-full hover:bg-gray-100 transition-colors"
          >
            官網
          </a>
        )}
      </div>
    </div>
  )
}

export default StoreCard