import { createClient } from '@supabase/supabase-js';

// 使用硬編碼的 Supabase 配置（從現有腳本複製）
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

// 模擬 Edge Function 調用
async function testEnglishLearning() {
  console.log('🎓 測試英語學習推薦...');
  
  // 模擬 Edge Function 邏輯
  const messageContent = '我想學英語';
  
  const englishKeywords = ['美語', '英語', '英文', '學美語', '學英語', '英文學習', '語言學習', '補習', '教學', '老師', '學生', '學校', '教育機構', '我想學', '想要學', '補習班推薦'];
  const isEnglishRelated = englishKeywords.some(keyword => messageContent.includes(keyword)) && 
                          !messageContent.includes('美食') && 
                          !messageContent.includes('餐廳') && 
                          !messageContent.includes('傢俱') && 
                          !messageContent.includes('家具') && 
                          !messageContent.includes('停車') && 
                          !messageContent.includes('購物') && 
                          !messageContent.includes('服飾') && 
                          !messageContent.includes('美容') && 
                          !messageContent.includes('醫療') && 
                          !messageContent.includes('銀行') && 
                          !messageContent.includes('便利商店');

  console.log('關鍵詞檢測結果:', isEnglishRelated);
  console.log('包含的關鍵詞:', englishKeywords.filter(keyword => messageContent.includes(keyword)));
}

async function testParkingInfo() {
  console.log('\n🅿️ 測試停車資訊...');
  
  const messageContent = '停車資訊';
  const isParkingRelated = messageContent.includes('停車') || messageContent.includes('停車場') || messageContent.includes('車位');
  
  console.log('停車場檢測結果:', isParkingRelated);
}

// 執行測試
testEnglishLearning().then(() => {
  return testParkingInfo();
}).then(() => {
  console.log('\n✅ 測試完成！');
}).catch(console.error);
