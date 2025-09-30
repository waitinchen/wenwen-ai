import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vqcuwjfxoxjgsrueqodj.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
);

// 模擬 Edge Function 的邏輯
function detectCuisineFromMessage(message) {
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('日料') || messageLower.includes('日式') || 
      messageLower.includes('壽司') || messageLower.includes('拉麵') ||
      messageLower.includes('和食') || messageLower.includes('天婦羅') ||
      messageLower.includes('居酒屋') || messageLower.includes('燒肉') ||
      messageLower.includes('丼飯') || messageLower.includes('日本料理')) {
    return '日式料理';
  }
  
  return null;
}

function matchStoreToCuisine(store, cuisineType) {
  if (!store) return false;
  
  const storeName = (store.store_name || '').toLowerCase();
  const category = (store.category || '').toLowerCase();
  const features = (store.features || '').toLowerCase();
  
  // 解析 features JSON 中的 secondary_category
  let secondaryCategory = '';
  try {
    if (store.features) {
      const featuresObj = JSON.parse(store.features);
      secondaryCategory = (featuresObj.secondary_category || '').toLowerCase();
    }
  } catch (e) {
    // 忽略 JSON 解析錯誤
  }
  
  if (cuisineType === '日式料理') {
    return storeName.includes('日') || 
           category.includes('日') || 
           features.includes('日') ||
           storeName.includes('壽司') ||
           storeName.includes('拉麵') ||
           storeName.includes('和食') ||
           storeName.includes('天婦羅') ||
           storeName.includes('居酒屋') ||
           storeName.includes('燒肉') ||
           storeName.includes('丼飯') ||
           features.includes('壽司') ||
           features.includes('拉麵') ||
           features.includes('和食') ||
           secondaryCategory.includes('壽司') ||
           secondaryCategory.includes('日式') ||
           secondaryCategory.includes('居酒屋') ||
           secondaryCategory.includes('丼飯');
  }
  
  return false;
}

async function testEdgeFunctionLogic() {
  console.log('🔍 詳細測試 Edge Function 邏輯...');
  
  const message = "我想吃日料";
  console.log(`📝 測試訊息: "${message}"`);
  
  // Step 1: 檢測料理類型
  const detectedSubcategory = detectCuisineFromMessage(message);
  console.log(`🎯 檢測到的料理類型: ${detectedSubcategory}`);
  
  // Step 2: 獲取所有餐飲商家
  const { data: allFoodStores, error } = await supabase
    .from('stores')
    .select('id, store_name, category, approval, features, is_partner_store, sponsorship_tier, rating, store_code')
    .eq('approval', 'approved')
    .eq('category', '餐飲美食')
    .limit(20);
  
  if (error) {
    console.log('❌ 查詢錯誤:', error);
    return;
  }
  
  console.log(`📊 找到 ${allFoodStores.length} 個餐飲商家`);
  
  // Step 3: 應用篩選邏輯
  if (detectedSubcategory) {
    console.log(`🔍 應用 ${detectedSubcategory} 篩選邏輯...`);
    
    const filteredStores = allFoodStores.filter(store => 
      matchStoreToCuisine(store, detectedSubcategory)
    );
    
    console.log(`✅ 篩選後找到 ${filteredStores.length} 個匹配商家`);
    
    // 顯示前 5 個匹配的商家
    filteredStores.slice(0, 5).forEach((store, i) => {
      console.log(`${i+1}. ${store.store_name}`);
      try {
        const featuresObj = JSON.parse(store.features);
        console.log(`   secondary_category: ${featuresObj.secondary_category}`);
      } catch (e) {
        console.log('   features 解析失敗');
      }
    });
  } else {
    console.log('❌ 沒有檢測到料理類型');
  }
}

testEdgeFunctionLogic().catch(console.error);


