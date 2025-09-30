/**
 * 測試統計查詢修復
 * 驗證統計數據是否正確回傳
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.J6yGXKJzXKJzXKJzXKJzXKJzXKJzXKJzXKJzXKJzXK';

async function testStatsFix() {
  console.log('🧪 測試統計查詢修復...\n');
  
  const testQuery = '你的商家資料有多少資料?';
  console.log(`📝 測試查詢: "${testQuery}"`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/claude-chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: { content: testQuery },
        session_id: 'test-session-' + Date.now()
      })
    });
    
    if (!response.ok) {
      console.log(`❌ HTTP ${response.status}: ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    const aiResponse = data.data?.response || data.response || '';
    
    console.log('📄 AI 回應:');
    console.log(aiResponse);
    console.log('');
    
    // 檢查是否包含統計數據
    const hasStats = aiResponse.includes('📊') && 
                    aiResponse.includes('商家總數') && 
                    aiResponse.includes('安心店家');
    
    if (hasStats) {
      console.log('✅ 成功回傳統計數據');
      
      // 提取數字
      const totalMatch = aiResponse.match(/商家總數.*?(\d+)/);
      const verifiedMatch = aiResponse.match(/安心店家.*?(\d+)/);
      const discountMatch = aiResponse.match(/優惠店家.*?(\d+)/);
      const partnerMatch = aiResponse.match(/特約商家.*?(\d+)/);
      const categoriesMatch = aiResponse.match(/分類數.*?(\d+)/);
      
      console.log('\n📊 統計數據:');
      if (totalMatch) console.log(`   商家總數: ${totalMatch[1]}`);
      if (verifiedMatch) console.log(`   安心店家: ${verifiedMatch[1]}`);
      if (discountMatch) console.log(`   優惠店家: ${discountMatch[1]}`);
      if (partnerMatch) console.log(`   特約商家: ${partnerMatch[1]}`);
      if (categoriesMatch) console.log(`   分類數: ${categoriesMatch[1]}`);
      
      // 檢查是否與 admin 頁面數據一致
      const expectedTotal = 280;
      const actualTotal = totalMatch ? parseInt(totalMatch[1]) : 0;
      
      if (actualTotal === expectedTotal) {
        console.log('\n🎉 統計數據與 admin 頁面一致！');
      } else {
        console.log(`\n⚠️ 統計數據不一致：預期 ${expectedTotal}，實際 ${actualTotal}`);
      }
      
    } else {
      console.log('❌ 未回傳統計數據');
      console.log('回應內容:', aiResponse.substring(0, 200));
    }
    
  } catch (error) {
    console.log(`❌ 請求失敗: ${error.message}`);
  }
  
  console.log('\n🎯 測試完成！');
}

// 執行測試
testStatsFix().catch(console.error);
