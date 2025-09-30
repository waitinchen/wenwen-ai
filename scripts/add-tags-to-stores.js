// 為現有商家添加標籤
console.log('🏷️ 為現有商家添加標籤...')

async function addTagsToStores() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 獲取所有已審核的商家
    console.log('📊 獲取商家列表...')
    const { data: stores, error } = await supabase
      .from('stores')
      .select('*')
      .eq('approval', 'approved')
    
    if (error) {
      console.error('❌ 獲取商家失敗:', error)
      return
    }
    
    console.log(`✅ 找到 ${stores.length} 個已審核商家`)
    
    // 標籤配置規則
    const tagRules = {
      // 料理類型標籤
      '日式料理': ['日式料理', '壽司', '生魚片', '內用', '外帶', '中等價位', '新鮮現做'],
      '韓式料理': ['韓式料理', '烤肉', '泡菜', '內用', '外帶', '中等價位'],
      '泰式料理': ['泰式料理', '咖喱', '酸辣', '內用', '外帶', '中等價位'],
      '中式料理': ['中式料理', '火鍋', '台菜', '內用', '外帶', '中等價位'],
      '義式料理': ['義式料理', '披薩', '義大利麵', '內用', '外帶', '中等價位'],
      
      // 甜點類標籤
      '蛋糕': ['甜點', '蛋糕', '烘焙', '內用', '外帶', '下午茶', '手作'],
      '咖啡': ['咖啡', '飲品', '內用', '外帶', '下午茶', 'WiFi'],
      '茶飲': ['茶飲', '飲品', '內用', '外帶', '平價'],
      
      // 服務類標籤
      '停車': ['停車', '服務'],
      'WiFi': ['WiFi', '服務'],
      '24小時': ['24小時', '服務'],
      
      // 購物類標籤
      '家居': ['家居用品', '購物', '內用', '停車', 'WiFi', '平價'],
      '文具': ['文具', '辦公用品', '購物', '內用', '平價'],
      
      // 醫療類標籤
      '藥局': ['藥局', '醫療', '服務', '內用', '平價'],
      '診所': ['診所', '醫療', '服務', '預約'],
      
      // 美容類標籤
      '美髮': ['美髮', '美容', '服務', '預約'],
      '美容': ['美容', '服務', '預約'],
      
      // 教育類標籤
      '補習班': ['教育', '學習', '服務', '預約'],
      '美語': ['教育', '美語', '學習', '服務', '預約']
    }
    
    // 為每個商家添加標籤
    let updateCount = 0
    let successCount = 0
    
    for (const store of stores) {
      try {
        // 解析現有的 features
        let features = {}
        if (store.features) {
          try {
            features = typeof store.features === 'string' 
              ? JSON.parse(store.features) 
              : store.features
          } catch (e) {
            console.warn(`⚠️ 商家 ${store.store_name} 的 features 解析失敗`)
            features = {}
          }
        }
        
        // 根據商家名稱和分類生成標籤
        const storeName = store.store_name.toLowerCase()
        const category = store.category
        let tags = []
        
        // 檢查是否已有標籤
        if (features.tags && Array.isArray(features.tags)) {
          tags = [...features.tags]
        }
        
        // 根據商家名稱匹配標籤
        for (const [keyword, tagList] of Object.entries(tagRules)) {
          if (storeName.includes(keyword.toLowerCase())) {
            tags = [...new Set([...tags, ...tagList])] // 去重
          }
        }
        
        // 根據分類添加通用標籤
        switch(category) {
          case '餐飲美食':
            if (!tags.includes('餐飲')) tags.push('餐飲', '美食')
            break
          case '購物消費':
            if (!tags.includes('購物')) tags.push('購物', '消費')
            break
          case '醫療健康':
            if (!tags.includes('醫療')) tags.push('醫療', '健康')
            break
          case '教育培訓':
            if (!tags.includes('教育')) tags.push('教育', '培訓')
            break
          case '美容服務':
            if (!tags.includes('美容')) tags.push('美容', '服務')
            break
        }
        
        // 添加服務標籤
        if (store.is_safe_store) tags.push('安心店家')
        if (store.has_member_discount) tags.push('會員優惠')
        if (store.is_partner_store) tags.push('特約商家')
        if (store.rating && store.rating > 4) tags.push('高評分')
        
        // 去重並排序
        tags = [...new Set(tags)].sort()
        
        // 更新 features
        const updatedFeatures = {
          ...features,
          tags: tags
        }
        
        // 更新資料庫
        const { error: updateError } = await supabase
          .from('stores')
          .update({
            features: JSON.stringify(updatedFeatures),
            updated_at: new Date().toISOString()
          })
          .eq('id', store.id)
        
        if (updateError) {
          console.error(`❌ 更新商家 ${store.store_name} 失敗:`, updateError)
        } else {
          console.log(`✅ 商家 ${store.store_name} 標籤更新成功: ${tags.join(', ')}`)
          successCount++
        }
        
        updateCount++
        
        // 避免請求過於頻繁
        if (updateCount % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
      } catch (error) {
        console.error(`❌ 處理商家 ${store.store_name} 異常:`, error)
      }
    }
    
    console.log(`\n🎉 標籤添加完成！`)
    console.log(`📊 統計結果:`)
    console.log(`   總商家數: ${stores.length}`)
    console.log(`   處理數量: ${updateCount}`)
    console.log(`   成功數量: ${successCount}`)
    console.log(`   成功率: ${((successCount / updateCount) * 100).toFixed(1)}%`)
    
  } catch (error) {
    console.error('❌ 添加標籤異常:', error)
  }
}

addTagsToStores()

