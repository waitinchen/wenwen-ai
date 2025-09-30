/**
 * 修復購物消費FAQ的不準確答案
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 修復購物消費FAQ答案
const shoppingFAQFixes = [
  {
    question: '藥局位置',
    answer: '文山特區有4家藥局：赤山健保藥局、青年新高橋藥局、鳳山啤木鳥藥局、丁丁連鎖藥局 鳳山自由店等，提供藥品和健康用品，方便購買日常藥品。'
  }
]

async function fixShoppingFAQs() {
  console.log('🛒 開始修復購物消費FAQ答案...')
  
  try {
    let successCount = 0
    let errorCount = 0
    
    for (const faqFix of shoppingFAQFixes) {
      try {
        const { data, error } = await supabase
          .from('faqs')
          .update({ answer: faqFix.answer })
          .eq('question', faqFix.question)
          .eq('category', '購物消費')
          .select()
        
        if (error) {
          console.error(`❌ 更新失敗: ${faqFix.question}`, error.message)
          errorCount++
        } else if (data && data.length > 0) {
          console.log(`✅ 更新成功: ${faqFix.question}`)
          successCount++
        } else {
          console.log(`⚠️ 未找到: ${faqFix.question}`)
          errorCount++
        }
      } catch (err) {
        console.error(`❌ 更新異常: ${faqFix.question}`, err.message)
        errorCount++
      }
      
      // 避免過快請求
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log('\n📊 修復結果統計:')
    console.log(`✅ 成功修復: ${successCount} 題`)
    console.log(`❌ 修復失敗: ${errorCount} 題`)
    console.log(`📈 成功率: ${((successCount / shoppingFAQFixes.length) * 100).toFixed(1)}%`)
    
    if (successCount > 0) {
      console.log('\n🎉 購物消費FAQ答案修復完成！')
    }
    
  } catch (error) {
    console.error('💥 修復過程發生錯誤:', error)
  }
}

// 執行修復
fixShoppingFAQs()
  .then(() => {
    console.log('\n✨ 修復任務完成！')
  })
  .catch((error) => {
    console.error('💥 修復失敗:', error.message)
    process.exit(1)
  })


