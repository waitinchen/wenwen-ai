// 測試修復後的 Edge Function
console.log('🧪 測試修復後的 Edge Function...')

async function testFixedVersion() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('📊 測試統計查詢...')
    
    const { data, error } = await supabase.functions.invoke('claude-chat', {
      body: {
        session_id: `test-fixed-${Date.now()}`,
        message: { role: 'user', content: '你的商家資料有多少資料？' },
        user_meta: { external_id: 'test-user' }
      }
    })
    
    if (error) {
      console.error('❌ 修復版本測試失敗:', error)
      console.error('狀態碼:', error.context?.status)
      console.error('錯誤訊息:', error.message)
      return false
    }
    
    if (data && data.data) {
      const result = data.data
      console.log('✅ 修復版本測試成功！')
      console.log(`意圖: ${result.intent}`)
      console.log(`信心度: ${result.confidence}`)
      console.log(`回應長度: ${result.response?.length} 字`)
      
      // 檢查是否為統計回應
      if (result.intent === 'COVERAGE_STATS' && result.response.includes('商家資料庫統計')) {
        console.log('🎉 統計查詢修復成功！')
        console.log('✅ 正確識別為 COVERAGE_STATS 意圖')
        console.log('✅ 回應包含統計數據')
        console.log('✅ 不再出現 AI 幻覺')
        
        console.log('\n📝 完整回應:')
        console.log(result.response)
        
        return true
      } else {
        console.log('❌ 統計查詢未正確識別')
        console.log(`實際意圖: ${result.intent}`)
        console.log('實際回應:', result.response)
        return false
      }
    } else {
      console.log('❌ 無回應數據')
      return false
    }
    
  } catch (error) {
    console.error('❌ 測試異常:', error)
    return false
  }
}

testFixedVersion()

