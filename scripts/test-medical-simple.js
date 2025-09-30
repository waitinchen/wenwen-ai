// 簡單的 MEDICAL 子分類測試
const EDGE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/claude-chat';
const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
};

async function testMedicalSubcategory() {
  try {
    console.log('🔍 測試 MEDICAL 子分類...');
    
    const response = await fetch(EDGE_URL, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        session_id: 'medical-test-001',
        message: { content: '我想找藥局' }
      })
    });
    
    const result = await response.json();
    const data = result.data || result;
    
    console.log('📊 完整回應:', JSON.stringify(data, null, 2));
    
    console.log('\n🔍 重點檢查:');
    console.log(`- 意圖: ${data.intent}`);
    console.log(`- 子分類: ${data.recommendation_logic?.subcategory || 'undefined'}`);
    console.log(`- 推薦商家數: ${data.recommended_stores?.length || 0}`);
    
    if (data.recommended_stores && data.recommended_stores.length > 0) {
      console.log('- 商家列表:', data.recommended_stores.map(s => s.name).join(', '));
    }
    
  } catch (error) {
    console.error('❌ 測試失敗:', error);
  }
}

testMedicalSubcategory();
