// 檢查當前 stores 表的結構
console.log('🔍 檢查當前 stores 表的結構...')

async function checkStoresSchema() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('📊 查詢 stores 表結構...')
    
    // 查詢 stores 表的前幾筆資料來了解結構
    const { data: stores, error } = await supabase
      .from('stores')
      .select('*')
      .limit(3)
    
    if (error) {
      console.error('❌ 查詢失敗:', error)
      return
    }
    
    if (stores && stores.length > 0) {
      console.log('✅ 當前 stores 表結構:')
      console.log('=' * 50)
      
      const firstStore = stores[0]
      console.log('📋 現有欄位:')
      Object.keys(firstStore).forEach(key => {
        const value = firstStore[key]
        const type = typeof value
        console.log(`  • ${key}: ${type} ${value ? `(範例: ${JSON.stringify(value).substring(0, 50)})` : '(null)'}`)
      })
      
      console.log('\n📝 範例資料:')
      stores.forEach((store, index) => {
        console.log(`\n商家 ${index + 1}:`)
        console.log(`  名稱: ${store.store_name}`)
        console.log(`  分類: ${store.category}`)
        console.log(`  地址: ${store.address}`)
        console.log(`  特色: ${store.features}`)
      })
      
      console.log('\n🔍 分析結果:')
      
      // 檢查是否已有 tags 相關欄位
      const hasTagsField = Object.keys(firstStore).some(key => 
        key.toLowerCase().includes('tag') || 
        key.toLowerCase().includes('label') ||
        key.toLowerCase().includes('keyword')
      )
      
      if (hasTagsField) {
        console.log('✅ 發現現有標籤相關欄位')
      } else {
        console.log('❌ 未發現標籤相關欄位，需要新增')
        console.log('💡 建議新增欄位: tags (text[] 或 jsonb)')
      }
      
      // 檢查 features 欄位的結構
      if (firstStore.features) {
        try {
          const features = typeof firstStore.features === 'string' 
            ? JSON.parse(firstStore.features) 
            : firstStore.features
          
          console.log('\n📊 features 欄位分析:')
          console.log(`  類型: ${typeof features}`)
          console.log(`  內容: ${JSON.stringify(features, null, 2)}`)
          
          if (typeof features === 'object' && features !== null) {
            console.log('💡 features 欄位可能可以用來存儲標籤')
          }
        } catch (e) {
          console.log('⚠️ features 欄位不是有效的 JSON')
        }
      }
      
    } else {
      console.log('⚠️ stores 表為空或無資料')
    }
    
  } catch (error) {
    console.error('❌ 檢查異常:', error)
  }
}

checkStoresSchema()

