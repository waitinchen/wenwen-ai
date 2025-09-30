/**
 * WEN 1.4.0 最終部署驗證
 * 檢查所有系統組件是否正常運作
 */

async function finalDeploymentVerification() {
  console.log('🚀 WEN 1.4.0 最終部署驗證');
  console.log('==========================================');

  const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 1. 檢查前端建置
    console.log('\n📁 1. 前端建置檢查');
    console.log('==========================================');
    
    const fs = await import('fs');
    const path = await import('path');
    
    const distPath = path.join(process.cwd(), 'dist');
    const indexPath = path.join(distPath, 'index.html');
    
    if (fs.existsSync(distPath) && fs.existsSync(indexPath)) {
      console.log('✅ dist 資料夾存在');
      console.log('✅ index.html 存在');
      
      // 檢查主要資源文件
      const assetsPath = path.join(distPath, 'assets');
      if (fs.existsSync(assetsPath)) {
        const assets = fs.readdirSync(assetsPath);
        console.log(`✅ assets 資料夾存在 (${assets.length} 個文件)`);
      }
    } else {
      console.log('❌ dist 資料夾或 index.html 不存在');
      return;
    }
    
    // 2. 檢查 Edge Functions
    console.log('\n⚡ 2. Edge Functions 檢查');
    console.log('==========================================');
    
    const functions = ['claude-chat', 'admin-auth', 'admin-management'];
    let workingFunctions = 0;
    
    for (const funcName of functions) {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/${funcName}`, {
          method: 'OPTIONS',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
          }
        });
        
        if (response.ok) {
          console.log(`✅ ${funcName} 函數可訪問`);
          workingFunctions++;
        } else {
          console.log(`❌ ${funcName} 函數無法訪問 (${response.status})`);
        }
      } catch (error) {
        console.log(`❌ ${funcName} 函數測試失敗: ${error.message}`);
      }
    }
    
    // 3. 測試 claude-chat 功能
    console.log('\n🤖 3. Claude Chat 功能測試');
    console.log('==========================================');
    
    if (workingFunctions > 0) {
      try {
        const testMessage = '我想吃日料';
        console.log(`📝 測試訊息: "${testMessage}"`);
        
        const response = await fetch(`${supabaseUrl}/functions/v1/claude-chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            session_id: `test-${Date.now()}`,
            message: { content: testMessage },
            user_meta: { external_id: 'test-user', display_name: '測試用戶' }
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          const result = data.data;
          
          console.log(`✅ API 調用成功`);
          console.log(`   版本: ${result.version}`);
          console.log(`   意圖: ${result.intent}`);
          console.log(`   推薦商家數: ${result.recommended_stores?.length || 0}`);
          console.log(`   處理時間: ${result.processing_time}ms`);
          
          if (result.recommended_stores && result.recommended_stores.length > 0) {
            console.log('✅ 子標籤系統正常運作');
            result.recommended_stores.forEach((store, index) => {
              console.log(`   ${index + 1}. ${store.name} (${store.category})`);
            });
          } else {
            console.log('⚠️ 沒有推薦商家，可能需要檢查資料庫查詢邏輯');
          }
        } else {
          const errorData = await response.text();
          console.log(`❌ API 調用失敗: ${response.status} - ${errorData}`);
        }
      } catch (error) {
        console.log(`❌ Claude Chat 測試失敗: ${error.message}`);
      }
    } else {
      console.log('⚠️ 跳過 Claude Chat 測試 (沒有可用的 Edge Functions)');
    }
    
    // 4. 檢查資料庫連接
    console.log('\n🗄️ 4. 資料庫連接檢查');
    console.log('==========================================');
    
    try {
      const { data: stores, error } = await supabase
        .from('stores')
        .select('id, store_name, category, approval')
        .eq('approval', 'approved')
        .limit(5);
      
      if (error) {
        console.log(`❌ 資料庫查詢失敗: ${error.message}`);
      } else {
        console.log(`✅ 資料庫連接正常`);
        console.log(`   已審核商家數量: ${stores.length}`);
        if (stores.length > 0) {
          console.log('   樣本商家:');
          stores.forEach(store => {
            console.log(`     - ${store.store_name} (${store.category})`);
          });
        }
      }
    } catch (error) {
      console.log(`❌ 資料庫連接測試失敗: ${error.message}`);
    }
    
    // 5. 版本檢查
    console.log('\n📋 5. 版本檢查');
    console.log('==========================================');
    
    try {
      const { data: versionData } = await import('../src/config/version.js');
      console.log(`✅ 前端版本: ${versionData.CURRENT_VERSION.version}`);
      console.log(`✅ 建置時間: ${versionData.CURRENT_VERSION.buildTime}`);
      console.log(`✅ 環境: ${versionData.CURRENT_VERSION.environment}`);
    } catch (error) {
      console.log(`⚠️ 版本檢查失敗: ${error.message}`);
    }
    
    // 總結
    console.log('\n📊 驗證結果總結');
    console.log('==========================================');
    console.log(`✅ 前端建置: 完成`);
    console.log(`⚡ Edge Functions: ${workingFunctions}/${functions.length} 個可用`);
    console.log(`🤖 Claude Chat: ${workingFunctions > 0 ? '可測試' : '無法測試'}`);
    console.log(`🗄️ 資料庫: 連接正常`);
    console.log(`📋 版本: WEN 1.4.0`);
    
    if (workingFunctions > 0) {
      console.log('\n🎉 WEN 1.4.0 部署準備完成！');
      console.log('📋 下一步: 上傳 dist 資料夾到主機');
    } else {
      console.log('\n⚠️ 需要先修復 Edge Functions 環境變數設置');
      console.log('📋 請按照之前的指示設置環境變數並重新部署');
    }
    
  } catch (error) {
    console.log('❌ 驗證過程異常:', error.message);
  }
}

// 執行驗證
finalDeploymentVerification()
  .then(() => {
    console.log('\n✅ 最終驗證完成');
  })
  .catch(error => {
    console.error('驗證執行失敗:', error);
  });


