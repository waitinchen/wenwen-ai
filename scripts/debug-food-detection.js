/**
 * 調試美食識別問題
 * 檢查實際的查詢和匹配過程
 */

async function debugFoodDetection() {
  console.log('🔍 調試美食識別問題');
  console.log('==========================================');

  const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 獲取所有餐飲商家
    console.log('\n📊 獲取所有餐飲商家...');
    const { data: allStores, error } = await supabase
      .from('stores')
      .select('*')
      .eq('approval', 'approved')
      .like('category', '%餐飲%');
    
    if (error) {
      console.log('❌ 查詢失敗:', error.message);
      return;
    }
    
    console.log(`✅ 找到 ${allStores.length} 個餐飲商家`);
    
    // 測試日式料理識別
    console.log('\n🎯 測試日式料理識別...');
    const japaneseStores = allStores.filter(store => {
      const storeName = (store.store_name || '').toLowerCase();
      const category = (store.category || '').toLowerCase();
      const features = (store.features || '').toLowerCase();
      
      // 解析 secondary_category
      let secondaryCategory = '';
      try {
        if (store.features) {
          const featuresObj = JSON.parse(store.features);
          secondaryCategory = (featuresObj.secondary_category || '').toLowerCase();
        }
      } catch (e) {
        // 忽略 JSON 解析錯誤
      }
      
      const isJapanese = storeName.includes('日') || 
                        category.includes('日') || 
                        features.includes('日') ||
                        storeName.includes('壽司') ||
                        storeName.includes('拉麵') ||
                        storeName.includes('和食') ||
                        storeName.includes('天婦羅') ||
                        storeName.includes('居酒屋') ||
                        storeName.includes('燒肉') ||
                        storeName.includes('丼飯') ||
                        storeName.includes('壽司郎') ||
                        features.includes('壽司') ||
                        features.includes('拉麵') ||
                        features.includes('和食') ||
                        secondaryCategory.includes('壽司') ||
                        secondaryCategory.includes('日式') ||
                        secondaryCategory.includes('居酒屋') ||
                        secondaryCategory.includes('丼飯');
      
      if (isJapanese) {
        console.log(`  ✅ 日式料理: ${store.store_name}`);
        console.log(`     🏷️ 類別: ${store.category}`);
        console.log(`     🔍 特徵: ${store.features}`);
        console.log(`     📝 解析的 secondary_category: ${secondaryCategory}`);
        console.log('');
      }
      
      return isJapanese;
    });
    
    console.log(`📊 日式料理商家總數: ${japaneseStores.length}`);
    
    // 測試韓式料理識別
    console.log('\n🎯 測試韓式料理識別...');
    const koreanStores = allStores.filter(store => {
      const storeName = (store.store_name || '').toLowerCase();
      const category = (store.category || '').toLowerCase();
      const features = (store.features || '').toLowerCase();
      
      // 解析 secondary_category
      let secondaryCategory = '';
      try {
        if (store.features) {
          const featuresObj = JSON.parse(store.features);
          secondaryCategory = (featuresObj.secondary_category || '').toLowerCase();
        }
      } catch (e) {
        // 忽略 JSON 解析錯誤
      }
      
      const isKorean = storeName.includes('韓') || 
                      category.includes('韓') || 
                      features.includes('韓') ||
                      storeName.includes('烤肉') ||
                      storeName.includes('泡菜') ||
                      storeName.includes('石鍋') ||
                      storeName.includes('韓國') ||
                      storeName.includes('玉豆腐') ||
                      features.includes('烤肉') ||
                      features.includes('泡菜') ||
                      features.includes('石鍋') ||
                      secondaryCategory.includes('韓式') ||
                      secondaryCategory.includes('烤肉') ||
                      secondaryCategory.includes('韓國');
      
      if (isKorean) {
        console.log(`  ✅ 韓式料理: ${store.store_name}`);
        console.log(`     🏷️ 類別: ${store.category}`);
        console.log(`     🔍 特徵: ${store.features}`);
        console.log(`     📝 解析的 secondary_category: ${secondaryCategory}`);
        console.log('');
      }
      
      return isKorean;
    });
    
    console.log(`📊 韓式料理商家總數: ${koreanStores.length}`);
    
    // 測試實際的 Edge Function 調用
    console.log('\n🎯 測試實際的 Edge Function 調用...');
    
    const testMessage = '我想吃日料';
    console.log(`📝 測試訊息: "${testMessage}"`);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/claude-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        session_id: `debug-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        message: { content: testMessage },
        user_meta: { external_id: 'debug-user', display_name: '調試用戶' }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.log(`❌ API 調用失敗: ${response.status} - ${errorData}`);
      return;
    }
    
    const data = await response.json();
    const result = data.data;
    
    console.log(`📊 Edge Function 結果:`);
    console.log(`   版本: ${result.version}`);
    console.log(`   意圖: ${result.intent}`);
    console.log(`   推薦商家數: ${result.recommended_stores?.length || 0}`);
    console.log(`   處理時間: ${result.processing_time}ms`);
    
    if (result.recommended_stores && result.recommended_stores.length > 0) {
      console.log(`   🏪 推薦商家:`);
      result.recommended_stores.forEach((store, index) => {
        console.log(`      ${index + 1}. ${store.name} (${store.category})`);
      });
    } else {
      console.log(`   📝 回應內容: ${result.response}`);
    }
    
    // 分析問題
    console.log('\n🔍 問題分析:');
    if (japaneseStores.length > 0 && result.recommended_stores?.length === 0) {
      console.log('❌ 問題確認: 資料庫中有日式料理商家，但 Edge Function 沒有推薦');
      console.log('   可能原因:');
      console.log('   1. Edge Function 沒有重新部署');
      console.log('   2. 查詢邏輯仍有問題');
      console.log('   3. 資料庫查詢條件不匹配');
    } else if (result.recommended_stores?.length > 0) {
      console.log('✅ 問題已解決: Edge Function 正常推薦商家');
    }
    
  } catch (error) {
    console.log('❌ 調試過程異常:', error.message);
  }
}

// 執行調試
debugFoodDetection()
  .then(() => {
    console.log('\n✅ 調試完成');
  })
  .catch(error => {
    console.error('調試執行失敗:', error);
  });





