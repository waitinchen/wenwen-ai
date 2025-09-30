import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vqcuwjfxoxjgsrueqodj.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
);

async function findJapaneseStores() {
  console.log('🔍 尋找日式料理商家...');
  
  const { data: allStores, error } = await supabase
    .from('stores')
    .select('id, store_name, category, approval, features')
    .eq('approval', 'approved')
    .eq('category', '餐飲美食')
    .limit(50);
  
  if (error) {
    console.log('查詢錯誤:', error);
    return;
  }
  
  console.log('總共找到', allStores.length, '個餐飲商家');
  
  // 尋找日式料理
  const japaneseStores = allStores.filter(store => {
    const features = store.features || '';
    const storeName = store.store_name || '';
    
    // 檢查 features 中的 secondary_category
    try {
      const featuresObj = JSON.parse(features);
      const secondaryCategory = featuresObj.secondary_category || '';
      
      if (secondaryCategory.includes('壽司') || 
          secondaryCategory.includes('日式') || 
          secondaryCategory.includes('居酒屋') || 
          secondaryCategory.includes('丼飯')) {
        return true;
      }
    } catch (e) {
      // 忽略 JSON 解析錯誤
    }
    
    // 檢查店名
    if (storeName.includes('日') || 
        storeName.includes('壽司') || 
        storeName.includes('拉麵') || 
        storeName.includes('和食') || 
        storeName.includes('天婦羅') || 
        storeName.includes('居酒屋') || 
        storeName.includes('燒肉') || 
        storeName.includes('丼飯')) {
      return true;
    }
    
    return false;
  });
  
  console.log('找到', japaneseStores.length, '個日式料理商家:');
  japaneseStores.forEach((store, i) => {
    console.log(`${i+1}. ${store.store_name}`);
    try {
      const featuresObj = JSON.parse(store.features);
      console.log(`   secondary_category: ${featuresObj.secondary_category}`);
    } catch (e) {
      console.log('   features 解析失敗');
    }
  });
}

findJapaneseStores().catch(console.error);


