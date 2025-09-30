/**
 * 調試回應結構
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE';

async function debugResponse() {
  console.log('🔍 調試回應結構...\n');

  const testQuery = '我想找藥局';
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/claude-chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        message: { content: testQuery },
        session_id: `debug-${Date.now()}`
      })
    });

    console.log(`📊 回應狀態: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ 錯誤: ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log(`✅ 原始回應結構:`);
    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.log(`❌ 異常: ${error.message}`);
  }
}

// 執行調試
debugResponse().catch(console.error);
