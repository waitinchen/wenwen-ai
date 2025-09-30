/**
 * 檢查景點資料
 * 查看資料庫中是否有景點相關的商家資料
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE';

async function checkAttractionsData() {
  console.log('🔍 檢查景點資料...\n');
  
  try {
    // 檢查所有商家資料
    const allStoresResponse = await fetch(`${SUPABASE_URL}/rest/v1/stores?select=*&limit=50`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!allStoresResponse.ok) {
      console.log(`❌ 無法查詢商家資料: ${allStoresResponse.status}`);
      return;
    }
    
    const allStores = await allStoresResponse.json();
    console.log(`📊 總商家數量: ${allStores.length}`);
    
    // 檢查分類
    const categories = [...new Set(allStores.map(store => store.category))];
    console.log(`📋 所有分類:`, categories);
    
    // 檢查景點相關分類
    const attractionKeywords = ['景點', '觀光', '旅遊', '公園', '廟宇', '古蹟', '文化', '博物館', '展覽'];
    const potentialAttractions = allStores.filter(store => {
      const name = (store.store_name || '').toLowerCase();
      const category = (store.category || '').toLowerCase();
      const features = typeof store.features === 'string' ? store.features.toLowerCase() : '';
      
      return attractionKeywords.some(keyword => 
        name.includes(keyword) || 
        category.includes(keyword) || 
        features.includes(keyword)
      );
    });
    
    console.log(`\n🎯 可能的景點商家 (${potentialAttractions.length} 個):`);
    potentialAttractions.forEach((store, index) => {
      console.log(`${index + 1}. ${store.store_name}`);
      console.log(`   分類: ${store.category}`);
      console.log(`   地址: ${store.address || '無'}`);
      console.log(`   特色: ${typeof store.features === 'string' ? store.features : JSON.stringify(store.features)}`);
      console.log('');
    });
    
    // 檢查特定分類
    console.log('📂 按分類統計:');
    const categoryCount = {};
    allStores.forEach(store => {
      const cat = store.category || '未分類';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} 個`);
    });
    
    // 檢查是否有景點相關的商家名稱
    console.log('\n🔍 搜尋景點關鍵詞:');
    attractionKeywords.forEach(keyword => {
      const matches = allStores.filter(store => 
        (store.store_name || '').toLowerCase().includes(keyword) ||
        (store.category || '').toLowerCase().includes(keyword)
      );
      if (matches.length > 0) {
        console.log(`   "${keyword}": ${matches.length} 個匹配`);
        matches.forEach(store => {
          console.log(`     - ${store.store_name} (${store.category})`);
        });
      }
    });
    
  } catch (error) {
    console.log(`❌ 查詢失敗: ${error.message}`);
  }
}

// 執行檢查
checkAttractionsData().catch(console.error);
