/**
 * 檢查部署狀態和版本
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE';

async function checkDeploymentStatus() {
  console.log('🔍 檢查部署狀態...\n');

  const testQuery = '你好';
  
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
        session_id: `status-check-${Date.now()}`
      })
    });

    if (!response.ok) {
      console.log(`❌ HTTP錯誤: ${response.status}`);
      return;
    }

    const data = await response.json();
    const responseData = data.data || data;
    
    console.log(`✅ Edge Function 正常運行`);
    console.log(`📦 版本: ${responseData.version || '未知'}`);
    console.log(`💬 回應長度: ${responseData.response?.length || 0} 字元`);
    
    // 檢查是否有我們的修改標識
    if (responseData.response?.includes('藥妝')) {
      console.log(`✅ 檢測到醫療關鍵字擴展`);
    }
    
    if (responseData.response?.includes('FAQ_ALLOWED')) {
      console.log(`✅ 檢測到FAQ類別閘門`);
    }
    
    console.log(`📝 回應預覽: ${responseData.response?.substring(0, 100)}...`);

  } catch (error) {
    console.log(`❌ 異常: ${error.message}`);
  }
}

// 執行檢查
checkDeploymentStatus().catch(console.error);
