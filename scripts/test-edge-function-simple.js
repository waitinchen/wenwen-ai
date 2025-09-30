/**
 * 簡單測試 Edge Function 是否正常運行
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE';

async function testEdgeFunction() {
  console.log('🔍 測試 Edge Function 連接...\n');

  const testQuery = '你好';
  
  try {
    console.log(`📤 發送測試查詢: "${testQuery}"`);
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/claude-chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        message: { content: testQuery },
        session_id: `test-${Date.now()}`
      })
    });

    console.log(`📊 回應狀態: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ 錯誤詳情: ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log(`✅ 成功獲取回應!`);
    console.log(`📝 回應長度: ${JSON.stringify(data).length} 字元`);
    
    if (data.response) {
      console.log(`💬 回應預覽: ${data.response.substring(0, 100)}...`);
    }
    
    if (data.intent) {
      console.log(`🎯 識別意圖: ${data.intent}`);
    }
    
    if (data.version) {
      console.log(`📦 版本: ${data.version}`);
    }

  } catch (error) {
    console.log(`❌ 測試異常: ${error.message}`);
  }
}

// 執行測試
testEdgeFunction().catch(console.error);
