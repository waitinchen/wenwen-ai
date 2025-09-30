/**
 * 最終驗證FAQ與商家數據的對照
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function finalVerification() {
  console.log('🔍 最終驗證FAQ與商家數據對照...')
  
  try {
    // 獲取所有商家數據
    const { data: allStores, error: storesError } = await supabase
      .from('stores')
      .select('id, store_name, category, approval')
      .eq('approval', 'approved')

    if (storesError) {
      console.error('商家查詢錯誤:', storesError)
      return
    }

    // 獲取所有FAQ數據
    const { data: allFAQs, error: faqsError } = await supabase
      .from('faqs')
      .select('id, question, answer, category')

    if (faqsError) {
      console.error('FAQ查詢錯誤:', faqsError)
      return
    }

    console.log('\n📊 數據統計:')
    console.log(`商家總數: ${allStores.length}`)
    console.log(`FAQ總數: ${allFAQs.length}`)

    // 創建商家名稱映射
    const storeNameMap = new Map()
    allStores.forEach(store => {
      storeNameMap.set(store.store_name, store)
      // 也添加部分匹配的鍵
      const words = store.store_name.split(/[\s\-_]+/)
      words.forEach(word => {
        if (word.length > 2) {
          storeNameMap.set(word, store)
        }
      })
    })

    console.log('\n🎯 檢查FAQ答案中的商家名稱準確性...')
    
    let totalMentions = 0
    let accurateMentions = 0
    let inaccurateMentions = 0
    const hallucinatedStores = new Set()
    const accurateStores = new Set()

    allFAQs.forEach(faq => {
      if (faq.answer) {
        // 提取答案中可能的商家名稱（更精確的方法）
        const sentences = faq.answer.split(/[。！？]/)
        
        sentences.forEach(sentence => {
          // 查找包含商家名稱的模式
          const storePatterns = [
            /([A-Za-z0-9\u4e00-\u9fff]+(?:店|館|中心|醫院|診所|藥局|停車場|公園|夜市|書院|城堡|觀景台))/g,
            /([A-Za-z0-9\u4e00-\u9fff]+(?:\s+[A-Za-z0-9\u4e00-\u9fff]+)*)/g
          ]
          
          storePatterns.forEach(pattern => {
            const matches = sentence.match(pattern)
            if (matches) {
              matches.forEach(match => {
                const cleanMatch = match.trim()
                if (cleanMatch.length > 2 && !cleanMatch.includes('抱歉') && !cleanMatch.includes('目前沒有')) {
                  totalMentions++
                  
                  // 檢查是否為真實商家
                  const foundStore = storeNameMap.get(cleanMatch)
                  if (foundStore) {
                    accurateMentions++
                    accurateStores.add(cleanMatch)
                  } else {
                    // 檢查是否為常見詞彙
                    const commonWords = [
                      '文山特區', '鳳山', '高雄', '台灣', '提供', '服務', '推薦', '選擇', '等', '包括', '各種', '不錯', '優質', '專業', '連鎖', '大型', '小型', '地方', '特色', '美食', '餐廳', '咖啡', '書店', '超市', '藥局', '診所', '醫院', '停車場', '公園', '夜市', '景點', '購物', '中心', '館', '店', '等', '提供', '各種', '服務', '推薦', '選擇', '不錯', '優質', '專業', '連鎖', '大型', '小型', '地方', '特色', '美食', '餐廳', '咖啡', '書店', '超市', '藥局', '診所', '醫院', '停車場', '公園', '夜市', '景點', '購物', '中心', '館', '店', '等', '提供', '各種', '服務', '推薦', '選擇', '不錯', '優質', '專業', '連鎖', '大型', '小型', '地方', '特色', '美食', '餐廳', '咖啡', '書店', '超市', '藥局', '診所', '醫院', '停車場', '公園', '夜市', '景點', '購物', '中心', '館', '店'
                    ]
                    
                    if (!commonWords.includes(cleanMatch) && cleanMatch.length > 3) {
                      inaccurateMentions++
                      hallucinatedStores.add(cleanMatch)
                    }
                  }
                }
              })
            }
          })
        })
      }
    })

    console.log(`\n📈 商家名稱提及統計:`)
    console.log(`總提及次數: ${totalMentions}`)
    console.log(`準確提及: ${accurateMentions}`)
    console.log(`不準確提及: ${inaccurateMentions}`)
    console.log(`準確率: ${((accurateMentions / totalMentions) * 100).toFixed(1)}%`)

    if (hallucinatedStores.size > 0) {
      console.log(`\n❌ 發現 ${hallucinatedStores.size} 個可能的幻覺商家:`)
      Array.from(hallucinatedStores).slice(0, 20).forEach(store => {
        console.log(`  - ${store}`)
      })
    } else {
      console.log('\n✅ 未發現幻覺商家')
    }

    console.log(`\n✅ 準確的商家提及 (${accurateStores.size}個):`)
    Array.from(accurateStores).slice(0, 20).forEach(store => {
      console.log(`  - ${store}`)
    })

    // 檢查各分類的準確性
    console.log('\n📊 各分類準確性檢查:')
    
    const categories = ['美食推薦', '停車資訊', '購物消費', '生活服務', '醫療保健', '休閒娛樂', '教育培訓']
    
    categories.forEach(category => {
      const categoryFAQs = allFAQs.filter(faq => faq.category === category)
      const categoryStores = allStores.filter(store => {
        const mapping = {
          '美食推薦': '餐飲美食',
          '停車資訊': '停車場',
          '購物消費': '購物消費',
          '生活服務': '生活服務',
          '醫療保健': '醫療保健',
          '休閒娛樂': '休閒娛樂',
          '教育培訓': '教育培訓'
        }
        return store.category === mapping[category]
      })
      
      console.log(`\n${category}:`)
      console.log(`  FAQ數量: ${categoryFAQs.length}`)
      console.log(`  商家數量: ${categoryStores.length}`)
      
      if (categoryFAQs.length > 0) {
        let categoryAccurate = 0
        let categoryInaccurate = 0
        
        categoryFAQs.forEach(faq => {
          if (faq.answer) {
            const isHonestResponse = faq.answer.includes('抱歉') || 
                                   faq.answer.includes('目前沒有') || 
                                   faq.answer.includes('建議您到其他區域')
            
            if (isHonestResponse) {
              categoryAccurate++
            } else {
              // 檢查是否包含真實商家
              const hasRealStore = categoryStores.some(store => 
                faq.answer.includes(store.store_name)
              )
              
              if (hasRealStore) {
                categoryAccurate++
              } else {
                categoryInaccurate++
              }
            }
          }
        })
        
        const accuracy = ((categoryAccurate / categoryFAQs.length) * 100).toFixed(1)
        console.log(`  準確率: ${accuracy}% (${categoryAccurate}/${categoryFAQs.length})`)
        
        if (categoryInaccurate > 0) {
          console.log(`  ⚠️ 不準確答案: ${categoryInaccurate} 個`)
        }
      }
    })

    console.log('\n✅ 最終驗證完成！')

  } catch (error) {
    console.error('驗證異常:', error)
  }
}

finalVerification()


