/**
 * 測試回應重複修復
 * 驗證 "有什麼美食推薦?" 不再重複開頭語
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.J6yGXKJzXKJzXKJzXKJzXKJzXKJzXKJzXKJzXKJzXK';

async function testResponseDuplicationFix() {
  console.log('🧪 測試回應重複修復...\n');
  
  const testQueries = [
    '有什麼美食推薦?',
    '我想查 日料',
    '推薦韓式料理',
    '附近有什麼好吃的？'
  ];
  
  for (const query of testQueries) {
    console.log(`📝 測試查詢: "${query}"`);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/claude-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: { content: query },
          session_id: 'test-session-' + Date.now()
        })
      });
      
      if (!response.ok) {
        console.log(`❌ HTTP ${response.status}: ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      const aiResponse = data.data?.response || data.response || '';
      
      // 檢查重複的開頭語
      const lines = aiResponse.split('\n');
      const openingLines = lines.filter(line => 
        line.includes('嘿！文山特區有很多美食選擇呢～我為你推薦幾家不錯的：') ||
        line.includes('嘿！我為你找到了一些不錯的') ||
        line.includes('文山特區有很多不錯的選擇呢～我為你推薦：')
      );
      
      if (openingLines.length > 1) {
        console.log(`❌ 發現重複開頭語 (${openingLines.length} 次)`);
        openingLines.forEach((line, i) => {
          console.log(`   重複 ${i + 1}: ${line}`);
        });
      } else {
        console.log(`✅ 沒有重複開頭語`);
      }
      
      // 檢查回應長度
      const responseLength = aiResponse.length;
      console.log(`📏 回應長度: ${responseLength} 字元`);
      
      // 顯示回應預覽
      const preview = aiResponse.substring(0, 200) + (aiResponse.length > 200 ? '...' : '');
      console.log(`📄 回應預覽: ${preview}\n`);
      
    } catch (error) {
      console.log(`❌ 請求失敗: ${error.message}\n`);
    }
  }
  
  console.log('🎯 測試完成！');
  console.log('\n📋 修復說明:');
  console.log('✅ 分離了開頭語生成和內容生成邏輯');
  console.log('✅ 創建了 generateOriginalResponseContentOnly 方法');
  console.log('✅ 創建了 buildStoreListResponseContentOnly 方法');
  console.log('✅ 避免在結構化回應中重複開頭語');
}

// 執行測試
testResponseDuplicationFix().catch(console.error);