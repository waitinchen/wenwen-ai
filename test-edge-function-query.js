import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vqcuwjfxoxjgsrueqodj.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
);

async function testQuery() {
  console.log('🔍 測試 Edge Function 查詢邏輯...');
  
  // 測試 1: 基本查詢
  const { data: basicData, error: basicError } = await supabase
    .from('stores')
    .select('id, store_name, category, approval')
    .eq('approval', 'approved')
    .limit(5);
  
  console.log('基本查詢結果:', basicData?.length || 0, '個商家');
  if (basicError) console.log('基本查詢錯誤:', basicError);
  
  // 測試 2: 餐飲美食查詢
  const { data: foodData, error: foodError } = await supabase
    .from('stores')
    .select('id, store_name, category, approval, features')
    .eq('approval', 'approved')
    .eq('category', '餐飲美食')
    .limit(10);
  
  console.log('餐飲美食查詢結果:', foodData?.length || 0, '個商家');
  if (foodError) console.log('餐飲美食查詢錯誤:', foodError);
  
  // 測試 3: 日式料理查詢
  const { data: japaneseData, error: japaneseError } = await supabase
    .from('stores')
    .select('id, store_name, category, approval, features')
    .eq('approval', 'approved')
    .eq('category', '餐飲美食')
    .limit(20);
  
  console.log('日式料理查詢結果:', japaneseData?.length || 0, '個商家');
  if (japaneseError) console.log('日式料理查詢錯誤:', japaneseError);
  
  // 顯示前 3 個商家的 features
  if (japaneseData && japaneseData.length > 0) {
    console.log('前 3 個商家的 features:');
    japaneseData.slice(0, 3).forEach((store, i) => {
      console.log(`${i+1}. ${store.store_name}: ${store.features}`);
    });
  }
}

testQuery().catch(console.error);
