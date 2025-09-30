/**
 * 檢查不準確的FAQ答案
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkInaccurateAnswers() {
  console.log('🔍 檢查不準確的FAQ答案...')
  
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
      .select('id, store_name, category, address, phone, features, is_partner_store, rating, approval')
      .eq('category', '購物消費')
      .eq('approval', 'approved')

    if (storesError) {
      console.error('商家查詢錯誤:', storesError)
      return
    }

    console.log(`\n📊 購物消費數據:`)
    console.log(`FAQ數量: ${shoppingFAQs.length}`)
    console.log(`商家數量: ${shoppingStores.length}`)

    console.log('\n🔍 逐個檢查購物消費FAQ答案:')
    
    shoppingFAQs.forEach((faq, index) => {
      console.log(`\n${index + 1}. 問題: ${faq.question}`)
      console.log(`   答案: ${faq.answer.substring(0, 150)}...`)
      
      // 檢查答案中提到的商家是否在數據庫中
      const mentionedStores = []
      const notFoundStores = []
      
      // 從答案中提取可能的商家名稱（簡單匹配）
      const answerWords = faq.answer.split(/[，。、\s]+/)
      
      answerWords.forEach(word => {
        if (word.length > 2) { // 過濾太短的詞
          const matchingStore = shoppingStores.find(store => 
            store.store_name.includes(word) || word.includes(store.store_name)
          )
          
          if (matchingStore) {
            mentionedStores.push(matchingStore.store_name)
          } else if (word.length > 3 && !word.includes('抱歉') && !word.includes('目前沒有')) {
            // 檢查是否為可能的商家名稱但未找到
            notFoundStores.push(word)
          }
        }
      })
      
      if (mentionedStores.length > 0) {
        console.log(`   ✅ 找到的商家: ${mentionedStores.join(', ')}`)
      }
      
      if (notFoundStores.length > 0) {
        console.log(`   ❓ 可能未找到的商家: ${notFoundStores.slice(0, 3).join(', ')}`)
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

    // 檢查所有FAQ中是否有幻覺商家
    console.log('\n🚨 檢查所有FAQ中的幻覺商家...')
    
    const { data: allFAQs, error: allFAQsError } = await supabase
      .from('faqs')
      .select('id, question, answer, category')

    if (allFAQsError) {
      console.error('所有FAQ查詢錯誤:', allFAQsError)
      return
    }

    const { data: allStores, error: allStoresError } = await supabase
      .from('stores')
      .select('id, store_name, category, approval')
      .eq('approval', 'approved')

    if (allStoresError) {
      console.error('所有商家查詢錯誤:', allStoresError)
      return
    }

    const allStoreNames = allStores.map(store => store.store_name)
    const hallucinatedStores = new Set()
    
    allFAQs.forEach(faq => {
      if (faq.answer) {
        // 提取答案中可能的商家名稱
        const words = faq.answer.split(/[，。、\s（）()]+/)
        words.forEach(word => {
          if (word.length > 3 && !word.includes('抱歉') && !word.includes('目前沒有')) {
            // 檢查是否為商家名稱但不在數據庫中
            const isStoreName = allStoreNames.some(storeName => 
              storeName.includes(word) || word.includes(storeName)
            )
            
            if (!isStoreName && word.length > 4) {
              // 進一步檢查是否為常見詞彙
              const commonWords = ['文山特區', '鳳山', '高雄', '台灣', '提供', '服務', '推薦', '選擇', '等', '包括', '各種', '不錯', '優質', '專業', '連鎖', '大型', '小型', '地方', '特色', '美食', '餐廳', '咖啡', '書店', '超市', '藥局', '診所', '醫院', '停車場', '公園', '夜市', '景點']
              
              if (!commonWords.includes(word)) {
                hallucinatedStores.add(word)
              }
            }
          }
        })
      }
    })

    if (hallucinatedStores.size > 0) {
      console.log(`❌ 發現 ${hallucinatedStores.size} 個可能的幻覺商家:`)
      Array.from(hallucinatedStores).slice(0, 10).forEach(store => {
        console.log(`  - ${store}`)
      })
    } else {
      console.log('✅ 未發現幻覺商家')
    }

    console.log('\n✅ 檢查完成！')

  } catch (error) {
    console.error('檢查異常:', error)
  }
}

checkInaccurateAnswers()


