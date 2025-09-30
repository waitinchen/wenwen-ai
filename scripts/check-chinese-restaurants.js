/**
 * 檢查數據庫中的中式料理餐廳
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkChineseRestaurants() {
  console.log('=== 檢查數據庫中的中式料理餐廳 ===')
  
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id, store_name, category, features')
      .eq('approval', 'approved')
      .limit(20)

    if (error) {
      console.error('查詢錯誤:', error)
      return
    }

    console.log('總餐廳數量:', data.length)
    console.log('\n所有餐廳:')
    data.forEach((store, index) => {
      console.log(`${index + 1}. ${store.store_name} - ${store.category}`)
      if (store.features) {
        try {
          const features = JSON.parse(store.features)
          console.log('   Features:', features)
        } catch (e) {
          console.log('   Features (raw):', store.features)
        }
      }
    })

    // 檢查是否有中式料理相關的餐廳
    const chineseKeywords = ['中式', '火鍋', '台菜', '川菜', '中華']
    const chineseStores = data.filter(store => {
      const name = store.store_name.toLowerCase()
      const category = store.category.toLowerCase()
      const features = store.features ? store.features.toLowerCase() : ''
      
      return chineseKeywords.some(keyword => 
        name.includes(keyword) || 
        category.includes(keyword) || 
        features.includes(keyword)
      )
    })

    console.log('\n=== 中式料理相關餐廳 ===')
    console.log('找到中式料理餐廳數量:', chineseStores.length)
    chineseStores.forEach((store, index) => {
      console.log(`${index + 1}. ${store.store_name} - ${store.category}`)
    })

  } catch (error) {
    console.error('查詢異常:', error)
  }
}

checkChineseRestaurants()


