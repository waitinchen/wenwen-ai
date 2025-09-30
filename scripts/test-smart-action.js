/**
 * 測試 smart-action Edge Function
 */

const SMART_ACTION_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/smart-action';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

async function testSmartAction() {
  console.log('🧪 測試 smart-action Edge Function\n');
  console.log(`🔗 URL: ${SMART_ACTION_URL}\n`);

  const testCases = [
    {
      name: '基本測試',
      description: '測試基本 POST 請求',
      method: 'POST',
      body: {
        action: 'test',
        message: 'Hello smart-action'
      }
    },
    {
      name: 'OPTIONS 請求測試',
      description: '測試 CORS 預檢請求',
      method: 'OPTIONS'
    },
    {
      name: 'GET 請求測試',
      description: '測試 GET 請求',
      method: 'GET'
    }
  ];

  for (const testCase of testCases) {
    console.log(`📋 測試: ${testCase.name}`);
    console.log(`📝 描述: ${testCase.description}`);
    console.log(`🔧 方法: ${testCase.method}`);
    
    try {
      const options = {
        method: testCase.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      };

      if (testCase.body) {
        options.body = JSON.stringify(testCase.body);
      }

      const response = await fetch(SMART_ACTION_URL, options);
      
      console.log(`📊 狀態碼: ${response.status} ${response.statusText}`);
      console.log(`📋 標頭:`, Object.fromEntries(response.headers.entries()));
      
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`📄 回應內容:`, JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        console.log(`📄 回應內容: ${text}`);
      }
      
      if (response.ok) {
        console.log('✅ 測試通過');
      } else {
        console.log('❌ 測試失敗');
      }
      
    } catch (error) {
      console.log('❌ 測試異常');
      console.log(`   錯誤: ${error.message}`);
    }
    
    console.log('─'.repeat(60));
  }
}

async function testWithWenV2Format() {
  console.log('\n🔗 測試與 wen-v2 相容的格式\n');
  
  const testMessage = {
    session_id: `test-session-${Date.now()}`,
    message: {
      role: 'user',
      content: '有什麼美食推薦？'
    },
    user_meta: {
      external_id: 'test-user',
      display_name: '測試用戶',
      avatar_url: ''
    }
  };

  try {
    console.log('📤 發送測試請求...');
    console.log('📄 請求內容:', JSON.stringify(testMessage, null, 2));
    
    const response = await fetch(SMART_ACTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(testMessage)
    });
    
    console.log(`📊 狀態碼: ${response.status} ${response.statusText}`);
    
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`📄 回應內容:`, JSON.stringify(data, null, 2));
      
      // 檢查是否為 wen-v2 格式
      if (data.response && data.session_id && data.intent) {
        console.log('✅ 檢測到 wen-v2 相容格式');
        console.log(`🎯 意圖: ${data.intent}`);
        console.log(`🏪 推薦商家數量: ${data.recommended_stores?.length || 0}`);
        console.log(`🔧 引擎版本: ${data.version || '未知'}`);
      }
    } else {
      const text = await response.text();
      console.log(`📄 回應內容: ${text}`);
    }
    
  } catch (error) {
    console.log('❌ 測試異常');
    console.log(`   錯誤: ${error.message}`);
  }
}

async function runFullTest() {
  console.log('🚀 開始 smart-action Edge Function 完整測試\n');
  
  // 基本功能測試
  await testSmartAction();
  
  // wen-v2 格式測試
  await testWithWenV2Format();
  
  console.log('\n🎯 測試完成！');
  console.log('📝 總結:');
  console.log('- 如果 smart-action 是 wen-v2 的別名，前端可以正常使用');
  console.log('- 如果不是，需要確認正確的 Edge Function 名稱');
  console.log('- 建議使用 wen-v2 作為標準名稱');
}

// 執行測試
runFullTest().catch(console.error);
