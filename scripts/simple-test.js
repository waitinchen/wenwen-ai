// 簡單測試 Edge Function
console.log('🔍 簡單測試 Edge Function...')

async function simpleTest() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('📡 發送簡單測試請求...')
    
    const { data, error } = await supabase.functions.invoke('claude-chat', {
      body: {
        session_id: `test-${Date.now()}`,
        message: { role: 'user', content: '你好' },
        user_meta: { external_id: 'test-user' }
      }
    })
    
    if (error) {
      console.error('❌ 錯誤:', error)
      console.error('狀態碼:', error.context?.status)
      console.error('錯誤訊息:', error.message)
      
      // 嘗試讀取錯誤詳情
      if (error.context?.body) {
        try {
          const errorBody = await error.context.body.text()
          console.error('錯誤詳情:', errorBody)
        } catch (e) {
          console.error('無法讀取錯誤詳情:', e.message)
        }
      }
      
      return false
    }
    
    if (data) {
      console.log('✅ 成功！')
      console.log('回應:', data)
      return true
    } else {
      console.log('⚠️ 無回應數據')
      return false
    }
    
  } catch (error) {
    console.error('❌ 測試異常:', error)
    return false
  }
}

simpleTest()

