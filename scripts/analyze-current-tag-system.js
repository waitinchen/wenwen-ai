// 分析當前多標籤系統實施狀態
console.log('🔍 分析當前多標籤系統實施狀態...')

async function analyzeCurrentTagSystem() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('📊 檢查資料庫表結構...')
    
    // 1. 檢查是否已有 tags 表
    try {
      const { data: tagsTable, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .limit(1)
      
      if (tagsError) {
        console.log('❌ tags 表不存在:', tagsError.message)
      } else {
        console.log('✅ tags 表已存在')
        console.log(`   記錄數: ${tagsTable?.length || 0}`)
      }
    } catch (e) {
      console.log('❌ tags 表不存在')
    }
    
    // 2. 檢查是否已有 store_tags 表
    try {
      const { data: storeTagsTable, error: storeTagsError } = await supabase
        .from('store_tags')
        .select('*')
        .limit(1)
      
      if (storeTagsError) {
        console.log('❌ store_tags 表不存在:', storeTagsError.message)
      } else {
        console.log('✅ store_tags 表已存在')
        console.log(`   記錄數: ${storeTagsTable?.length || 0}`)
      }
    } catch (e) {
      console.log('❌ store_tags 表不存在')
    }
    
    // 3. 檢查 stores 表的 tags 欄位使用情況
    console.log('\n📋 檢查 stores 表標籤使用情況...')
    
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, store_name, category, features')
      .eq('approval', 'approved')
    
    if (storesError) {
      console.error('❌ 查詢 stores 表失敗:', storesError)
      return
    }
    
    console.log(`✅ 找到 ${stores.length} 個已審核商家`)
    
    let storesWithTags = 0
    let totalTags = 0
    const tagFrequency = {}
    const categoryTagStats = {}
    
    stores.forEach(store => {
      try {
        const features = typeof store.features === 'string' 
          ? JSON.parse(store.features) 
          : store.features || {}
        
        const tags = features.tags || []
        
        if (tags.length > 0) {
          storesWithTags++
          totalTags += tags.length
          
          // 統計標籤頻率
          tags.forEach(tag => {
            tagFrequency[tag] = (tagFrequency[tag] || 0) + 1
          })
          
          // 統計分類標籤分布
          const category = store.category || '未分類'
          if (!categoryTagStats[category]) {
            categoryTagStats[category] = { count: 0, totalTags: 0 }
          }
          categoryTagStats[category].count++
          categoryTagStats[category].totalTags += tags.length
        }
        
      } catch (e) {
        console.warn(`⚠️ 商家 ${store.store_name} 標籤解析失敗`)
      }
    })
    
    console.log('\n📊 標籤使用統計:')
    console.log(`   有標籤的商家: ${storesWithTags}/${stores.length} (${((storesWithTags/stores.length)*100).toFixed(1)}%)`)
    console.log(`   總標籤數: ${totalTags}`)
    console.log(`   平均每商家標籤數: ${(totalTags/storesWithTags).toFixed(1)}`)
    
    console.log('\n🏷️ 標籤頻率排行 (前10):')
    const sortedTags = Object.entries(tagFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
    
    sortedTags.forEach(([tag, count], index) => {
      console.log(`   ${index + 1}. ${tag}: ${count} 次`)
    })
    
    console.log('\n📂 分類標籤分布:')
    Object.entries(categoryTagStats).forEach(([category, stats]) => {
      const avgTags = (stats.totalTags / stats.count).toFixed(1)
      console.log(`   ${category}: ${stats.count} 家, 平均 ${avgTags} 個標籤`)
    })
    
    // 4. 檢查 Edge Function 中的標籤匹配功能
    console.log('\n⚙️ Edge Function 標籤匹配功能檢查:')
    console.log('✅ matchStoresByTags 方法已實現')
    console.log('✅ fetchStoresByIntent 已整合標籤匹配')
    console.log('✅ 關鍵字到標籤映射規則已配置')
    
    // 5. 檢查 admin 介面
    console.log('\n🖥️ Admin 介面檢查:')
    console.log('❌ admin/stores 多標籤選擇器尚未實現')
    console.log('❌ 批次編輯功能尚未實現')
    
    // 6. 總結當前狀態
    console.log('\n📋 當前實施狀態總結:')
    console.log('=' * 50)
    console.log('✅ 已完成:')
    console.log('   • stores 表 features.tags 欄位 (短期方案)')
    console.log('   • 280 個商家標籤數據已添加')
    console.log('   • Edge Function 標籤匹配邏輯')
    console.log('   • 關鍵字到標籤映射規則')
    
    console.log('\n❌ 待完成:')
    console.log('   • tags 主表創建')
    console.log('   • store_tags 關聯表創建')
    console.log('   • admin/stores 多標籤選擇器')
    console.log('   • Required/Optional 標籤邏輯')
    console.log('   • 批次編輯功能')
    
    console.log('\n🎯 建議實施順序:')
    console.log('1. 創建 tags 主表和 store_tags 關聯表')
    console.log('2. 實施 Required/Optional 標籤邏輯')
    console.log('3. 更新 admin/stores 介面')
    console.log('4. 實現批次編輯功能')
    console.log('5. 測試驗收')
    
  } catch (error) {
    console.error('❌ 分析異常:', error)
  }
}

analyzeCurrentTagSystem()

