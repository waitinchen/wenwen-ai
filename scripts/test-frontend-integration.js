/**
 * 測試前端整合 - 使用瀏覽器環境的 supabase.functions.invoke
 */

// 模擬前端環境的測試
const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUwNzUyNzIsImV4cCI6MjA1MDY1MTI3Mn0.2nQ8Y8Q8Y8Q8Y8Q8Y8Q8Y8Q8Y8Q8Y8Q8Y8Q8Y8Q8';

// 模擬 supabase.functions.invoke 的調用
async function simulateSupabaseInvoke(functionName, options) {
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'apikey': SUPABASE_ANON_KEY
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(options.body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

async function testFrontendIntegration() {
  console.log('🧪 測試前端整合');
  console.log('================');
  
  const testCases = [
    {
      functionName: 'allowlist-recommendation',
      message: '我想學英語',
      testName: '允許清單推薦引擎 - 英語學習'
    },
    {
      functionName: 'smart-action',
      message: '我想學英語',
      testName: 'Smart Action - 英語學習'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n=== ${testCase.testName} ===`);
    
    try {
      const { data, error } = await simulateSupabaseInvoke(testCase.functionName, {
        body: {
          session_id: `test-session-${Date.now()}`,
          message: { 
            role: 'user', 
            content: testCase.message 
          },
          user_meta: { 
            external_id: 'test-user',
            display_name: '測試用戶'
          }
        }
      });
      
      if (error) {
        console.log(`❌ 調用失敗: ${error.message}`);
      } else if (data && data.response) {
        console.log('✅ 調用成功');
        console.log('版本:', data.version);
        console.log('意圖:', data.intent);
        console.log('推薦商家數量:', data.recommended_stores?.length || 0);
        console.log('AI 回應:', data.response.substring(0, 100) + '...');
      } else {
        console.log('❌ 回應格式異常:', data);
      }
      
    } catch (error) {
      console.log(`❌ 測試異常: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n================');
  console.log('🏁 前端整合測試完成');
}

// 執行測試
testFrontendIntegration().catch(error => {
  console.error('測試執行失敗:', error);
  process.exit(1);
});