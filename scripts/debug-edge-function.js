// 診斷 Edge Function 基本功能
const EDGE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/claude-chat';
const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
};

async function testBasicFunction() {
  try {
    console.log('🔍 測試 Edge Function 基本功能...');
    
    const response = await fetch(EDGE_URL, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        session_id: 'debug-test-001',
        message: { content: '你好' }
      })
    });
    
    console.log('📊 回應狀態:', response.status);
    console.log('📊 回應標頭:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.text();
    console.log('📊 原始回應:', result);
    
    try {
      const parsed = JSON.parse(result);
      console.log('📊 解析後的 JSON:', JSON.stringify(parsed, null, 2));
    } catch (parseError) {
      console.log('❌ JSON 解析失敗:', parseError.message);
    }
    
  } catch (error) {
    console.error('❌ 測試失敗:', error);
  }
}

testBasicFunction();