/**
 * 檢查停車資訊FAQ的具體問題
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkParkingFAQIssues() {
  console.log('🅿️ 檢查停車資訊FAQ的具體問題...')
  
  try {
    // 獲取停車資訊FAQ
    const { data: parkingFAQs, error: faqsError } = await supabase
      .from('faqs')
      .select('id, question, answer, category')
      .eq('category', '停車資訊')

    if (faqsError) {
      console.error('FAQ查詢錯誤:', faqsError)
      return
    }

    // 獲取停車場商家
    const { data: parkingStores, error: storesError } = await supabase
      .from('stores')
      .select('id, store_name, category, address, phone, features, rating, approval')
      .eq('category', '停車場')
      .eq('approval', 'approved')

    if (storesError) {
      console.error('商家查詢錯誤:', storesError)
      return
    }

    console.log(`\n📊 停車資訊數據:`)
    console.log(`FAQ數量: ${parkingFAQs.length}`)
    console.log(`停車場數量: ${parkingStores.length}`)

    console.log('\n🏪 實際停車場清單:')
    parkingStores.forEach((store, index) => {
      console.log(`${index + 1}. ${store.store_name}`)
    })

    console.log('\n🔍 逐個檢查停車資訊FAQ答案:')
    
    parkingFAQs.forEach((faq, index) => {
      console.log(`\n${index + 1}. 問題: ${faq.question}`)
      console.log(`   答案: ${faq.answer.substring(0, 200)}...`)
      
      // 檢查答案中提到的停車場是否在數據庫中
      const mentionedStores = []
      const notFoundStores = []
      
      // 從答案中提取停車場名稱
      const answerWords = faq.answer.split(/[，。、\s]+/)
      
      answerWords.forEach(word => {
        if (word.length > 3) {
          const matchingStore = parkingStores.find(store => 
            store.store_name.includes(word) || word.includes(store.store_name)
          )
          
          if (matchingStore) {
            mentionedStores.push(matchingStore.store_name)
          } else if (word.includes('停車場') || word.includes('停車')) {
            notFoundStores.push(word)
          }
        }
      })
      
      if (mentionedStores.length > 0) {
        console.log(`   ✅ 找到的停車場: ${mentionedStores.join(', ')}`)
      }
      
      if (notFoundStores.length > 0) {
        console.log(`   ❌ 未找到的停車場: ${notFoundStores.join(', ')}`)
      }
      
      // 檢查是否為誠實告知不存在的服務
      const isHonestResponse = faq.answer.includes('抱歉') || 
                             faq.answer.includes('目前沒有') || 
                             faq.answer.includes('建議您到其他區域')
      
      if (isHonestResponse) {
        console.log(`   ✅ 誠實告知不存在的服務`)
      } else if (mentionedStores.length === 0) {
        console.log(`   ⚠️ 可能不準確的答案`)
      }
    })

  } catch (error) {
    console.error('檢查異常:', error)
  }
}

checkParkingFAQIssues()


