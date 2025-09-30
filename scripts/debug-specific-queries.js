/**
 * 調試特定查詢的意圖識別
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE';

async function debugSpecificQueries() {
  console.log('🔍 調試特定查詢的意圖識別...\n');

  const testQueries = [
    '推薦藥妝店',
    '推薦中式料理', 
    '推薦日式料理',
    '哪裡可以停車？'
  ];

  for (const query of testQueries) {
    console.log(`📋 測試查詢: "${query}"`);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/claude-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY
        },
        body: JSON.stringify({
          message: { content: query },
          session_id: `debug-${Date.now()}`
        })
      });

      if (!response.ok) {
        console.log(`   ❌ HTTP錯誤: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const responseData = data.data || data;
      
      console.log(`   🎯 識別意圖: ${responseData.intent}`);
      console.log(`   💬 回應長度: ${responseData.response?.length || 0} 字元`);
      console.log(`   📝 回應預覽: ${responseData.response?.substring(0, 80)}...`);
      console.log('');

    } catch (error) {
      console.log(`   ❌ 異常: ${error.message}`);
      console.log('');
    }
  }
}

// 執行調試
debugSpecificQueries().catch(console.error);
