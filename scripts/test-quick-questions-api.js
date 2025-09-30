import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testQuickQuestionsAPI() {
  console.log('🔍 測試快速問題API...')
  
  try {
    // 測試 Edge Function 調用
    console.log('\n1. 測試 Edge Function 調用...')
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('admin-management', {
      body: {
        action: 'list',
        table: 'quick_questions',
        filters: { orderBy: 'display_order', orderDirection: 'asc' },
        token: 'test-token' // 需要有效的管理員 token
      }
    })
    
    if (edgeError) {
      console.log('❌ Edge Function 錯誤:', edgeError.message)
      console.log('   這表示需要有效的管理員 token 或環境變數問題')
    } else {
      console.log('✅ Edge Function 成功:', edgeData)
    }
    
    // 測試直接資料庫存取
    console.log('\n2. 測試直接資料庫存取...')
    const { data: dbData, error: dbError } = await supabase
      .from('quick_questions')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (dbError) {
      console.log('❌ 資料庫錯誤:', dbError.message)
    } else {
      console.log('✅ 資料庫成功，目前有', dbData.length, '個快速問題:')
      dbData.forEach((q, index) => {
        console.log(`   ${index + 1}. [${q.is_enabled ? '啟用' : '禁用'}] ${q.question}`)
      })
    }
    
    // 測試新增功能
    console.log('\n3. 測試新增功能...')
    const testQuestion = {
      question: '測試問題 - 請刪除',
      display_order: 999,
      is_enabled: true
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('quick_questions')
      .insert(testQuestion)
      .select()
    
    if (insertError) {
      console.log('❌ 新增失敗:', insertError.message)
    } else {
      console.log('✅ 新增成功:', insertData[0])
      
      // 立即刪除測試資料
      const { error: deleteError } = await supabase
        .from('quick_questions')
        .delete()
        .eq('id', insertData[0].id)
      
      if (deleteError) {
        console.log('⚠️ 刪除測試資料失敗:', deleteError.message)
      } else {
        console.log('✅ 測試資料已刪除')
      }
    }
    
  } catch (error) {
    console.error('❌ 測試過程發生錯誤:', error)
  }
}

testQuickQuestionsAPI()


