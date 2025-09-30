/**
 * 完整對照admin/faqs數據與admin/stores數據
 * 檢查是否有幻覺或商家資料不存在的狀況
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyFAQsVsStores() {
  console.log('🔍 開始對照FAQ數據與商家數據...')
  
  try {
    // 獲取所有FAQ數據
    const { data: faqs, error: faqsError } = await supabase
      .from('faqs')
      .select('id, question, answer, category')
      .order('category', { ascending: true })

    if (faqsError) {
      console.error('FAQ查詢錯誤:', faqsError)
      return
    }

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

    console.log('\n📊 數據統計:')
    console.log(`FAQ總數: ${faqs.length}`)
    console.log(`商家總數: ${stores.length}`)

    // 按分類統計FAQ
    const faqCategoryStats = {}
    faqs.forEach(faq => {
      faqCategoryStats[faq.category] = (faqCategoryStats[faq.category] || 0) + 1
    })

    // 按分類統計商家
    const storeCategoryStats = {}
    stores.forEach(store => {
      storeCategoryStats[store.category] = (storeCategoryStats[store.category] || 0) + 1
    })

    console.log('\n📂 FAQ分類統計:')
    Object.entries(faqCategoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 題`)
    })

    console.log('\n🏪 商家分類統計:')
    Object.entries(storeCategoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 家`)
    })

    // 檢查FAQ答案中提到的商家名稱
    console.log('\n🔍 檢查FAQ答案中的商家名稱...')
    
    const mentionedStores = new Set()
    const storeNames = stores.map(store => store.store_name.toLowerCase())
    
    // 從FAQ答案中提取商家名稱
    faqs.forEach(faq => {
      if (faq.answer) {
        // 簡單的商家名稱提取（基於已知的商家名稱）
        storeNames.forEach(storeName => {
          if (faq.answer.toLowerCase().includes(storeName)) {
            mentionedStores.add(storeName)
          }
        })
      }
    })

    console.log(`\n📝 FAQ答案中提到的商家數量: ${mentionedStores.size}`)
    console.log('提到的商家:', Array.from(mentionedStores).slice(0, 10).join(', '))

    // 檢查每個FAQ分類的答案準確性
    console.log('\n🎯 各分類FAQ答案準確性檢查:')
    
    const categories = ['美食推薦', '停車資訊', '購物消費', '生活服務', '醫療保健', '休閒娛樂', '教育培訓']
    
    for (const category of categories) {
      const categoryFAQs = faqs.filter(faq => faq.category === category)
      const categoryStores = stores.filter(store => store.category === category)
      
      console.log(`\n📋 ${category}:`)
      console.log(`  FAQ數量: ${categoryFAQs.length}`)
      console.log(`  商家數量: ${categoryStores.length}`)
      
      if (categoryFAQs.length > 0 && categoryStores.length > 0) {
        // 檢查FAQ答案是否基於實際商家
        let accurateAnswers = 0
        let inaccurateAnswers = 0
        
        categoryFAQs.forEach(faq => {
          if (faq.answer) {
            // 檢查答案是否包含實際商家名稱
            const hasRealStore = categoryStores.some(store => 
              faq.answer.includes(store.store_name)
            )
            
            if (hasRealStore) {
              accurateAnswers++
            } else {
              // 檢查是否為誠實告知不存在的服務
              const isHonestResponse = faq.answer.includes('抱歉') || 
                                     faq.answer.includes('目前沒有') || 
                                     faq.answer.includes('建議您到其他區域')
              
              if (isHonestResponse) {
                accurateAnswers++
              } else {
                inaccurateAnswers++
              }
            }
          }
        })
        
        const accuracy = ((accurateAnswers / categoryFAQs.length) * 100).toFixed(1)
        console.log(`  準確答案: ${accurateAnswers}/${categoryFAQs.length} (${accuracy}%)`)
        console.log(`  不準確答案: ${inaccurateAnswers}`)
        
        if (inaccurateAnswers > 0) {
          console.log(`  ⚠️ 發現 ${inaccurateAnswers} 個可能不準確的答案`)
        }
      }
    }

    // 檢查是否有幻覺商家（FAQ中提到但商家數據中不存在的）
    console.log('\n🚨 幻覺商家檢查:')
    
    const allStoreNames = stores.map(store => store.store_name)
    const mentionedInFAQs = new Set()
    
    faqs.forEach(faq => {
      if (faq.answer) {
        allStoreNames.forEach(storeName => {
          if (faq.answer.includes(storeName)) {
            mentionedInFAQs.add(storeName)
          }
        })
      }
    })
    
    const hallucinatedStores = []
    mentionedInFAQs.forEach(mentionedStore => {
      if (!allStoreNames.includes(mentionedStore)) {
        hallucinatedStores.push(mentionedStore)
      }
    })
    
    if (hallucinatedStores.length > 0) {
      console.log(`❌ 發現 ${hallucinatedStores.length} 個幻覺商家:`)
      hallucinatedStores.forEach(store => console.log(`  - ${store}`))
    } else {
      console.log('✅ 未發現幻覺商家')
    }

    // 檢查是否有遺漏的商家（商家存在但FAQ中未提到）
    console.log('\n📋 遺漏商家檢查:')
    
    const mentionedStoreNames = Array.from(mentionedInFAQs)
    const missingStores = allStoreNames.filter(storeName => 
      !mentionedStoreNames.includes(storeName)
    )
    
    console.log(`📊 商家總數: ${allStoreNames.length}`)
    console.log(`📝 FAQ中提到的商家: ${mentionedStoreNames.length}`)
    console.log(`❓ 未在FAQ中提到的商家: ${missingStores.length}`)
    
    if (missingStores.length > 0) {
      console.log('未提到的商家範例:')
      missingStores.slice(0, 10).forEach(store => console.log(`  - ${store}`))
    }

    console.log('\n✅ 對照檢查完成！')

  } catch (error) {
    console.error('對照檢查異常:', error)
  }
}

verifyFAQsVsStores()


