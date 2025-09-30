/**
 * 檢查購物消費FAQ的具體問題
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkShoppingFAQIssues() {
  console.log('🛒 檢查購物消費FAQ的具體問題...')
  
  try {
    // 獲取購物消費FAQ
    const { data: shoppingFAQs, error: faqsError } = await supabase
      .from('faqs')
      .select('id, question, answer, category')
      .eq('category', '購物消費')

    if (faqsError) {
      console.error('FAQ查詢錯誤:', faqsError)
      return
    }

    // 獲取購物消費商家
    const { data: shoppingStores, error: storesError } = await supabase
      .from('stores')
      .select('id, store_name, category, address, phone, features, rating, approval')
      .eq('category', '購物消費')
      .eq('approval', 'approved')

    if (storesError) {
      console.error('商家查詢錯誤:', storesError)
      return
    }

    console.log(`\n📊 購物消費數據:`)
    console.log(`FAQ數量: ${shoppingFAQs.length}`)
    console.log(`購物商家數量: ${shoppingStores.length}`)

    console.log('\n🛒 實際購物商家清單:')
    shoppingStores.slice(0, 20).forEach((store, index) => {
      console.log(`${index + 1}. ${store.store_name}`)
    })

    console.log('\n🔍 逐個檢查購物消費FAQ答案:')
    
    shoppingFAQs.forEach((faq, index) => {
      console.log(`\n${index + 1}. 問題: ${faq.question}`)
      console.log(`   答案: ${faq.answer.substring(0, 150)}...`)
      
      // 檢查答案中提到的商家是否在數據庫中
      const mentionedStores = []
      const notFoundStores = []
      
      // 從答案中提取商家名稱
      const answerWords = faq.answer.split(/[，。、\s]+/)
      
      answerWords.forEach(word => {
        if (word.length > 3) {
          const matchingStore = shoppingStores.find(store => 
            store.store_name.includes(word) || word.includes(store.store_name)
          )
          
          if (matchingStore) {
            mentionedStores.push(matchingStore.store_name)
          } else if (word.length > 4 && !word.includes('抱歉') && !word.includes('目前沒有')) {
            // 檢查是否為可能的商家名稱但未找到
            notFoundStores.push(word)
          }
        }
      })
      
      if (mentionedStores.length > 0) {
        console.log(`   ✅ 找到的商家: ${mentionedStores.join(', ')}`)
      }
      
      if (notFoundStores.length > 0) {
        console.log(`   ❌ 未找到的商家: ${notFoundStores.slice(0, 3).join(', ')}`)
      }
      
      // 檢查是否為誠實告知不存在的服務
      const isHonestResponse = faq.answer.includes('抱歉') || 
                             faq.answer.includes('目前沒有') || 
                             faq.answer.includes('建議您到其他區域')
      
      if (isHonestResponse) {
        console.log(`   ✅ 誠實告知不存在的服務`)
      } else if (mentionedStores.length === 0 && notFoundStores.length > 0) {
        console.log(`   ⚠️ 可能不準確的答案`)
      }
    })

  } catch (error) {
    console.error('檢查異常:', error)
  }
}

checkShoppingFAQIssues()


