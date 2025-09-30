/**
 * 詳細檢查分類匹配問題
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function detailedCategoryCheck() {
  console.log('🔍 詳細檢查分類匹配問題...')
  
  try {
    // 獲取所有商家數據
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, store_name, category, address, phone, features, is_partner_store, rating, approval')
      .eq('approval', 'approved')
      .order('category', { ascending: true })

    if (storesError) {
      console.error('商家查詢錯誤:', storesError)
      return
    }

    console.log('\n📊 商家分類詳細統計:')
    const categoryStats = {}
    stores.forEach(store => {
      categoryStats[store.category] = (categoryStats[store.category] || 0) + 1
    })
    
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 家`)
    })

    // 檢查美食相關商家
    console.log('\n🍽️ 美食相關商家檢查:')
    const foodStores = stores.filter(store => 
      store.category === '餐飲美食' || 
      store.store_name.toLowerCase().includes('餐廳') ||
      store.store_name.toLowerCase().includes('咖啡') ||
      store.store_name.toLowerCase().includes('美食')
    )
    console.log(`餐飲美食分類: ${foodStores.length} 家`)
    foodStores.slice(0, 10).forEach(store => {
      console.log(`  - ${store.store_name} (${store.category})`)
    })

    // 檢查停車相關商家
    console.log('\n🅿️ 停車相關商家檢查:')
    const parkingStores = stores.filter(store => 
      store.category === '停車場' || 
      store.store_name.toLowerCase().includes('停車')
    )
    console.log(`停車場分類: ${parkingStores.length} 家`)
    parkingStores.slice(0, 10).forEach(store => {
      console.log(`  - ${store.store_name} (${store.category})`)
    })

    // 檢查FAQ分類與商家分類的對應關係
    console.log('\n🔄 FAQ分類與商家分類對應關係:')
    const faqToStoreMapping = {
      '美食推薦': '餐飲美食',
      '停車資訊': '停車場',
      '購物消費': '購物消費',
      '生活服務': '生活服務',
      '醫療保健': '醫療保健',
      '休閒娛樂': '休閒娛樂',
      '教育培訓': '教育培訓'
    }

    Object.entries(faqToStoreMapping).forEach(([faqCategory, storeCategory]) => {
      const matchingStores = stores.filter(store => store.category === storeCategory)
      console.log(`  ${faqCategory} → ${storeCategory}: ${matchingStores.length} 家`)
    })

    // 檢查是否有分類不匹配的問題
    console.log('\n⚠️ 分類不匹配問題:')
    
    const faqCategories = ['美食推薦', '停車資訊', '購物消費', '生活服務', '醫療保健', '休閒娛樂', '教育培訓']
    const storeCategories = Object.keys(categoryStats)
    
    console.log('FAQ分類:', faqCategories.join(', '))
    console.log('商家分類:', storeCategories.join(', '))
    
    const unmatchedFaqCategories = faqCategories.filter(faqCat => {
      const mapping = faqToStoreMapping[faqCat]
      return !storeCategories.includes(mapping)
    })
    
    if (unmatchedFaqCategories.length > 0) {
      console.log('❌ 不匹配的FAQ分類:', unmatchedFaqCategories)
    } else {
      console.log('✅ 所有FAQ分類都有對應的商家分類')
    }

    // 檢查具體的商家名稱匹配
    console.log('\n🔍 具體商家名稱匹配檢查:')
    
    // 獲取FAQ數據
    const { data: faqs, error: faqsError } = await supabase
      .from('faqs')
      .select('id, question, answer, category')
      .eq('category', '美食推薦')
      .limit(5)

    if (faqsError) {
      console.error('FAQ查詢錯誤:', faqsError)
      return
    }

    console.log('\n🍽️ 美食推薦FAQ答案檢查:')
    faqs.forEach((faq, index) => {
      console.log(`\n${index + 1}. ${faq.question}`)
      console.log(`   答案: ${faq.answer.substring(0, 100)}...`)
      
      // 檢查答案中提到的商家是否在數據庫中
      const mentionedStores = []
      foodStores.forEach(store => {
        if (faq.answer.includes(store.store_name)) {
          mentionedStores.push(store.store_name)
        }
      })
      
      if (mentionedStores.length > 0) {
        console.log(`   ✅ 提到的商家: ${mentionedStores.join(', ')}`)
      } else {
        console.log(`   ❌ 未找到匹配的商家`)
      }
    })

  } catch (error) {
    console.error('詳細檢查異常:', error)
  }
}

detailedCategoryCheck()


