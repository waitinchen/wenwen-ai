/**
 * 查詢實際的停車場資料
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function getParkingStores() {
  console.log('🅿️ 查詢實際的停車場資料...')
  
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('id, store_name, category, address, phone, features, is_partner_store, rating')
      .eq('category', '停車場')
      .eq('approval', 'approved')
      .order('rating', { ascending: false })

    if (error) {
      console.error('查詢錯誤:', error)
      return
    }

    console.log('📊 停車場統計:')
    console.log('總數量:', data.length)
    
    console.log('\n🅿️ 停車場清單:')
    data.forEach((store, index) => {
      let features = ''
      try {
        if (store.features) {
          const parsedFeatures = JSON.parse(store.features)
          features = parsedFeatures.description || ''
        }
      } catch (e) {
        // 忽略 JSON 解析錯誤
      }
      console.log(`${index + 1}. ${store.store_name}`)
      console.log(`   地址: ${store.address || 'N/A'}`)
      console.log(`   電話: ${store.phone || 'N/A'}`)
      console.log(`   特色: ${features || 'N/A'}`)
      console.log(`   評分: ${store.rating || 'N/A'}`)
      console.log('')
    })

    return data

  } catch (error) {
    console.error('查詢異常:', error)
  }
}

getParkingStores()


