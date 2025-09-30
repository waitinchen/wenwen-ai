/**
 * 查詢實際的購物消費商家資料
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function getShoppingStores() {
  console.log('🛒 查詢實際的購物消費商家資料...')
  
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id, store_name, category, address, phone, features, is_partner_store, rating')
      .in('category', ['購物消費', '生活服務', '醫療保健'])
      .eq('approval', 'approved')
      .order('rating', { ascending: false })

    if (error) {
      console.error('查詢錯誤:', error)
      return
    }

    console.log('📊 購物消費相關商家統計:')
    console.log('總數量:', data.length)
    
    // 按分類統計
    const categoryStats = {}
    data.forEach(store => {
      categoryStats[store.category] = (categoryStats[store.category] || 0) + 1
    })
    
    console.log('\n📂 分類統計:')
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 家`)
    })
    
    console.log('\n🛒 購物消費相關商家清單:')
    data.forEach((store, index) => {
      let subcategory = '未分類'
      try {
        if (store.features) {
          const features = JSON.parse(store.features)
          subcategory = features.secondary_category || '未分類'
        }
      } catch (e) {
        // 忽略 JSON 解析錯誤
      }
      console.log(`${index + 1}. ${store.store_name} - ${store.category} - ${subcategory} - 評分:${store.rating || 'N/A'}`)
    })

    return data

  } catch (error) {
    console.error('查詢異常:', error)
  }
}

getShoppingStores()


