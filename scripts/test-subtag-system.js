/**
 * 測試子標籤系統
 * 驗證增強版美食識別邏輯
 */

async function testSubtagSystem() {
  console.log('🧪 測試子標籤系統');
  console.log('==========================================');

  const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

  const testCases = [
    {
      name: '日式料理識別測試',
      message: '我想吃日料',
      expectedCuisine: '日式料理',
      expectedResult: 'should_find_stores'
    },
    {
      name: '韓式料理識別測試',
      message: '推薦韓式餐廳',
      expectedCuisine: '韓式料理',
      expectedResult: 'should_find_stores'
    },
    {
      name: '壽司專用測試',
      message: '有壽司店嗎？',
      expectedCuisine: '日式料理',
      expectedResult: 'should_find_stores'
    },
    {
      name: '烤肉專用測試',
      message: '推薦烤肉店',
      expectedCuisine: '韓式料理',
      expectedResult: 'should_find_stores'
    },
    {
      name: '一般美食測試',
      message: '有什麼美食推薦？',
      expectedCuisine: null,
      expectedResult: 'should_find_general_food'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🎯 測試: ${testCase.name}`);
    console.log(`📝 輸入: "${testCase.message}"`);
    console.log(`🎯 預期料理類型: ${testCase.expectedCuisine || '無特定類型'}`);

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/claude-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          session_id: `test-subtag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          message: { content: testCase.message },
          user_meta: { external_id: 'test-user', display_name: '測試用戶' }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.log(`❌ API 調用失敗: ${response.status} - ${errorData}`);
        continue;
      }

      const data = await response.json();
      const result = data.data;

      console.log(`📊 實際結果:`);
      console.log(`   意圖: ${result.intent}`);
      console.log(`   推薦商家數: ${result.recommended_stores?.length || 0}`);
      console.log(`   處理時間: ${result.processing_time}ms`);
      
      // 顯示推薦的商家
      if (result.recommended_stores && result.recommended_stores.length > 0) {
        console.log(`   🏪 推薦商家:`);
        result.recommended_stores.forEach((store, index) => {
          console.log(`      ${index + 1}. ${store.name} (${store.category})`);
        });
      } else {
        console.log(`   📝 回應內容: ${result.response.substring(0, 100)}...`);
      }

      // 驗證結果
      let testPassed = false;
      
      if (testCase.expectedResult === 'should_find_stores') {
        // 應該找到特定料理的商家
        testPassed = result.recommended_stores && result.recommended_stores.length > 0;
      } else if (testCase.expectedResult === 'should_find_general_food') {
        // 應該找到一般美食商家
        testPassed = result.recommended_stores && result.recommended_stores.length > 0;
      }
      
      if (testPassed) {
        console.log('✅ 測試通過');
      } else {
        console.log('❌ 測試失敗 - 沒有找到預期的商家');
      }

    } catch (error) {
      console.log(`❌ 測試異常: ${error.message}`);
    }

    console.log('---');
  }

  console.log('\n📋 子標籤系統測試完成');
  console.log('==========================================');
  
  // 額外測試：檢查資料庫中的實際商家
  console.log('\n🔍 檢查資料庫中的餐飲商家...');
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: stores, error } = await supabase
      .from('stores')
      .select('*')
      .eq('approval', 'approved')
      .like('category', '%餐飲%');
    
    if (error) {
      console.log('❌ 查詢商家失敗:', error.message);
    } else {
      console.log(`📊 找到 ${stores.length} 個餐飲商家:`);
      stores.forEach((store, index) => {
        console.log(`${index + 1}. ${store.store_name}`);
        console.log(`   🏷️ 類別: ${store.category}`);
        console.log(`   🔍 特徵: ${store.features || 'N/A'}`);
        
        // 分析可能的料理類型
        const storeText = `${store.store_name} ${store.category} ${store.features || ''}`.toLowerCase();
        const possibleCuisines = [];
        
        if (storeText.includes('日') || storeText.includes('壽司') || storeText.includes('拉麵')) {
          possibleCuisines.push('日式料理');
        }
        if (storeText.includes('韓') || storeText.includes('烤肉') || storeText.includes('泡菜')) {
          possibleCuisines.push('韓式料理');
        }
        if (storeText.includes('泰') || storeText.includes('咖喱')) {
          possibleCuisines.push('泰式料理');
        }
        if (storeText.includes('義') || storeText.includes('披薩') || storeText.includes('義大利')) {
          possibleCuisines.push('義式料理');
        }
        
        if (possibleCuisines.length > 0) {
          console.log(`   🎯 可能料理類型: ${possibleCuisines.join(', ')}`);
        }
        console.log('');
      });
    }
  } catch (error) {
    console.log('❌ 檢查商家資料失敗:', error.message);
  }
}

// 執行測試
testSubtagSystem()
  .then(() => {
    console.log('\n✅ 子標籤系統測試完成');
  })
  .catch(error => {
    console.error('測試執行失敗:', error);
  });
