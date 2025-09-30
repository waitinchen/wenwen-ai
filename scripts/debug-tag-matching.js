// 調試標籤匹配功能
console.log('🔍 調試標籤匹配功能...')

async function debugTagMatching() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('📊 檢查商家標籤數據...')
    
    // 查詢幾個有標籤的商家
    const { data: stores, error } = await supabase
      .from('stores')
      .select('*')
      .eq('approval', 'approved')
      .limit(5)
    
    if (error) {
      console.error('❌ 查詢失敗:', error)
      return
    }
    
    console.log(`✅ 找到 ${stores.length} 個商家`)
    
    // 檢查標籤數據
    stores.forEach((store, index) => {
      console.log(`\n🏪 商家 ${index + 1}: ${store.store_name}`)
      
      try {
        const features = typeof store.features === 'string' 
          ? JSON.parse(store.features) 
          : store.features || {}
        
        const tags = features.tags || []
        console.log(`   標籤: ${tags.join(', ')}`)
        
        if (tags.length === 0) {
          console.log(`   ⚠️ 無標籤數據`)
        }
        
      } catch (e) {
        console.log(`   ❌ 標籤解析失敗: ${e.message}`)
      }
    })
    
    console.log('\n🧪 測試簡單查詢...')
    
    // 測試一個簡單的查詢
    const { data, error: testError } = await supabase.functions.invoke('claude-chat', {
      body: {
        session_id: `debug-test-${Date.now()}`,
        message: { role: 'user', content: '推薦咖啡廳' },
        user_meta: { external_id: 'test-user' }
      }
    })
    
    if (testError) {
      console.error('❌ 測試查詢失敗:', testError)
      return
    }
    
    if (data && data.data) {
      const result = data.data
      console.log(`✅ 查詢成功`)
      console.log(`   意圖: ${result.intent}`)
      console.log(`   推薦商家數: ${result.recommended_stores?.length || 0}`)
      
      if (result.recommended_stores && result.recommended_stores.length > 0) {
        console.log(`📝 推薦商家:`)
        result.recommended_stores.slice(0, 3).forEach((store, index) => {
          console.log(`   ${index + 1}. ${store.name}`)
          if (store.matchedTags) {
            console.log(`      匹配標籤: ${store.matchedTags.join(', ')}`)
          }
        })
      }
      
      console.log(`📄 回應長度: ${result.response?.length || 0} 字`)
      
    } else {
      console.log('❌ 無回應數據')
    }
    
  } catch (error) {
    console.error('❌ 調試異常:', error)
  }
}

debugTagMatching()

