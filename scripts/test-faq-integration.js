/**
 * 測試FAQ整合功能
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFAQIntegration() {
  console.log('🧪 測試FAQ整合功能...')
  
  try {
    // 測試FAQ查詢
    const testQuestions = [
      '有藥局嗎？',
      '有書店嗎？',
      '停車場推薦',
      '有日式料理嗎？',
      '公園在哪裡？'
    ]

    console.log('\n🔍 測試FAQ查詢:')
    
    for (const question of testQuestions) {
      console.log(`\n❓ 問題: "${question}"`)
      
      try {
        // 精確匹配測試
        const { data: exactMatch, error: exactError } = await supabase
          .from('faqs')
          .select('*')
          .eq('question', question)
          .eq('is_active', true)
          .single()
        
        if (exactMatch) {
          console.log(`   ✅ 精確匹配: "${exactMatch.question}"`)
          console.log(`   📝 分類: ${exactMatch.category}`)
          console.log(`   💬 答案: ${exactMatch.answer.substring(0, 80)}...`)
        } else {
          console.log(`   ❌ 精確匹配失敗`)
          
          // 模糊匹配測試
          const { data: allFAQs, error: allError } = await supabase
            .from('faqs')
            .select('*')
            .eq('is_active', true)
          
          if (allFAQs) {
            const fuzzyMatch = allFAQs.find(f => 
              f.question.includes(question) || 
              question.includes(f.question)
            )
            
            if (fuzzyMatch) {
              console.log(`   🔍 模糊匹配: "${fuzzyMatch.question}"`)
              console.log(`   📝 分類: ${fuzzyMatch.category}`)
              console.log(`   💬 答案: ${fuzzyMatch.answer.substring(0, 80)}...`)
            } else {
              console.log(`   ❌ 無匹配結果`)
            }
          }
        }
      } catch (error) {
        console.log(`   ❌ 查詢錯誤: ${error.message}`)
      }
    }

    // 測試Edge Function調用
    console.log('\n🚀 測試Edge Function調用:')
    
    const testMessage = '有藥局嗎？'
    console.log(`\n📤 發送消息: "${testMessage}"`)
    
    try {
      const { data, error } = await supabase.functions.invoke('claude-chat', {
        body: {
          message: testMessage,
          session_id: 'test-faq-session',
          user_meta: {
            user_id: 'test-user',
            platform: 'test'
          }
        }
      })
      
      if (error) {
        console.log(`   ❌ Edge Function錯誤: ${error.message}`)
      } else {
        console.log(`   ✅ Edge Function回應:`)
        console.log(`      - 回應: ${data.response}`)
        console.log(`      - 意圖: ${data.intent}`)
        console.log(`      - 信心度: ${data.confidence}`)
        console.log(`      - 版本: ${data.version}`)
        
        if (data.intent === 'FAQ') {
          console.log(`   🎉 FAQ功能正常工作！`)
        } else {
          console.log(`   ⚠️ FAQ功能可能未生效，意圖為: ${data.intent}`)
        }
      }
    } catch (error) {
      console.log(`   ❌ Edge Function調用異常: ${error.message}`)
    }

    console.log('\n✅ FAQ整合測試完成！')

  } catch (error) {
    console.error('測試異常:', error)
  }
}

testFAQIntegration()


