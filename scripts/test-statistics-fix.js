/**
 * 測試統計查詢修正
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const testHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'apikey': SUPABASE_ANON_KEY
};

async function testStatisticsQuery() {
  console.log('🔍 測試統計查詢修正');
  console.log('==================');
  
  const testMessage = '你的資料庫有多少商家?';
  console.log(`測試訊息: "${testMessage}"`);
  
  const url = `${SUPABASE_URL}/functions/v1/claude-chat`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: testHeaders,
      body: JSON.stringify({
        session_id: `stats-test-${Date.now()}`,
        message: { 
          role: 'user', 
          content: testMessage 
        },
        user_meta: { 
          external_id: 'stats-test',
          display_name: '統計測試用戶'
        }
      })
    });

    console.log(`HTTP 狀態: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ 請求失敗: ${errorText}`);
      return false;
    }

    const result = await response.json();
    const data = result.data;
    
    console.log('✅ 請求成功');
    console.log('版本:', data.version);
    console.log('意圖:', data.intent);
    console.log('信心度:', data.confidence);
    
    if (data.intent === 'STATISTICS') {
      console.log('✅ 意圖識別正確：STATISTICS');
    } else {
      console.log(`❌ 意圖識別錯誤：${data.intent} (預期: STATISTICS)`);
    }
    
    console.log('AI 回應:');
    console.log(data.response);
    
    return true;
    
  } catch (error) {
    console.log(`❌ 測試異常: ${error.message}`);
    return false;
  }
}

// 執行測試
testStatisticsQuery().catch(error => {
  console.error('測試執行失敗:', error);
  process.exit(1);
});
