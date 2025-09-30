import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

// 新的啟動詞配置
const newQuickQuestions = [
  {
    question: '告訴我妳的服務範圍',
    display_order: 1,
    is_enabled: true
  },
  {
    question: '請推薦鳳山區美食情報',
    display_order: 2,
    is_enabled: true
  },
  {
    question: '查詢鳳山區停車資訊',
    display_order: 3,
    is_enabled: true
  }
]

async function updateQuickQuestions() {
  console.log('🔧 開始更新快速問題為新的啟動詞...')
  
  try {
    // 1. 先清空現有的快速問題
    console.log('\n1. 清空現有快速問題...')
    const { data: existingQuestions, error: fetchError } = await supabase
      .from('quick_questions')
      .select('*')
    
    if (fetchError) {
      console.error('❌ 獲取現有問題失敗:', fetchError.message)
      return
    }
    
    console.log(`   找到 ${existingQuestions.length} 個現有問題`)
    
    // 刪除所有現有問題
    for (const question of existingQuestions) {
      const { error: deleteError } = await supabase
        .from('quick_questions')
        .delete()
        .eq('id', question.id)
      
      if (deleteError) {
        console.error(`❌ 刪除問題失敗 (ID: ${question.id}):`, deleteError.message)
      } else {
        console.log(`✅ 刪除: ${question.question}`)
      }
    }
    
    // 2. 新增新的啟動詞
    console.log('\n2. 新增新的啟動詞...')
    let successCount = 0
    let errorCount = 0
    
    for (const newQuestion of newQuickQuestions) {
      const { data: insertData, error: insertError } = await supabase
        .from('quick_questions')
        .insert({
          question: newQuestion.question,
          display_order: newQuestion.display_order,
          is_enabled: newQuestion.is_enabled,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
      
      if (insertError) {
        console.error(`❌ 新增失敗: ${newQuestion.question}`, insertError.message)
        errorCount++
      } else {
        console.log(`✅ 新增成功: ${newQuestion.question}`)
        console.log(`   排序: ${newQuestion.display_order}, 狀態: ${newQuestion.is_enabled ? '啟用' : '禁用'}`)
        successCount++
      }
    }
    
    console.log(`\n📊 更新結果: 成功 ${successCount} 題，失敗 ${errorCount} 題`)
    
    // 3. 驗證更新結果
    console.log('\n3. 驗證更新結果...')
    const { data: finalQuestions, error: verifyError } = await supabase
      .from('quick_questions')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (verifyError) {
      console.error('❌ 驗證失敗:', verifyError.message)
    } else {
      console.log(`✅ 驗證成功，目前有 ${finalQuestions.length} 個快速問題:`)
      finalQuestions.forEach((q, index) => {
        console.log(`   ${index + 1}. [${q.is_enabled ? '啟用' : '禁用'}] ${q.question}`)
      })
    }
    
    if (successCount === newQuickQuestions.length) {
      console.log('\n🎉 快速問題更新完成！')
      console.log('📝 新的啟動詞:')
      console.log('   1. 告訴我妳的服務範圍')
      console.log('   2. 請推薦鳳山區美食情報')
      console.log('   3. 查詢鳳山區停車資訊')
      console.log('\n✨ 這些啟動詞將引導用戶了解高文文的核心服務功能')
    }
    
  } catch (error) {
    console.error('❌ 更新過程發生錯誤:', error)
  }
}

// 執行更新
updateQuickQuestions()


