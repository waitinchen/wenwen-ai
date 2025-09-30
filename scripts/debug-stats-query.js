/**
 * 診斷統計查詢問題
 * 檢查環境變數、資料庫連接、表結構等
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE';

async function debugStatsQuery() {
  console.log('🔍 診斷統計查詢問題...\n');
  
  try {
    // 1. 測試基本連接
    console.log('1️⃣ 測試 Supabase 連接...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/stores?select=count&limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log(`❌ 連接失敗: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log(`錯誤詳情: ${errorText}`);
      return;
    }
    
    console.log('✅ Supabase 連接正常');
    
    // 2. 測試 stores 表結構
    console.log('\n2️⃣ 檢查 stores 表結構...');
    const schemaResponse = await fetch(`${SUPABASE_URL}/rest/v1/stores?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (schemaResponse.ok) {
      const sampleData = await schemaResponse.json();
      if (sampleData.length > 0) {
        console.log('✅ stores 表存在，範例資料欄位:');
        console.log(Object.keys(sampleData[0]));
      } else {
        console.log('⚠️ stores 表存在但無資料');
      }
    } else {
      console.log(`❌ stores 表查詢失敗: ${schemaResponse.status}`);
    }
    
    // 3. 測試統計查詢
    console.log('\n3️⃣ 測試統計查詢...');
    
    // 總數查詢
    const totalResponse = await fetch(`${SUPABASE_URL}/rest/v1/stores?select=id&approval=eq.approved`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });
    
    if (totalResponse.ok) {
      const totalCount = totalResponse.headers.get('content-range')?.split('/')[1] || 'unknown';
      console.log(`✅ 總數查詢成功: ${totalCount}`);
    } else {
      console.log(`❌ 總數查詢失敗: ${totalResponse.status}`);
    }
    
    // 安心店家查詢
    const verifiedResponse = await fetch(`${SUPABASE_URL}/rest/v1/stores?select=id&approval=eq.approved&is_trusted=eq.true`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });
    
    if (verifiedResponse.ok) {
      const verifiedCount = verifiedResponse.headers.get('content-range')?.split('/')[1] || 'unknown';
      console.log(`✅ 安心店家查詢成功: ${verifiedCount}`);
    } else {
      console.log(`❌ 安心店家查詢失敗: ${verifiedResponse.status}`);
    }
    
    // 4. 測試 Edge Function
    console.log('\n4️⃣ 測試 Edge Function...');
    const functionResponse = await fetch(`${SUPABASE_URL}/functions/v1/claude-chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: { content: '你的商家資料有多少資料?' },
        session_id: 'debug-session-' + Date.now()
      })
    });
    
    if (functionResponse.ok) {
      const functionData = await functionResponse.json();
      console.log('✅ Edge Function 回應正常');
      console.log(`意圖: ${functionData.data?.intent}`);
      console.log(`回應預覽: ${(functionData.data?.response || '').substring(0, 100)}...`);
    } else {
      console.log(`❌ Edge Function 失敗: ${functionResponse.status}`);
      const errorText = await functionResponse.text();
      console.log(`錯誤詳情: ${errorText}`);
    }
    
  } catch (error) {
    console.log(`❌ 診斷過程發生錯誤: ${error.message}`);
  }
  
  console.log('\n🎯 診斷完成！');
}

// 執行診斷
debugStatsQuery().catch(console.error);
