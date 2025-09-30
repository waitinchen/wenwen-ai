/**
 * 測試 COVERAGE_STATS 意圖修復
 * 驗證「你商家資料有多少?」正確回傳統計數據
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.J6yGXKJzXKJzXKJzXKJzXKJzXKJzXKJzXKJzXKJzXK';

async function testClaudeChat(query, description) {
  console.log(`\n🧪 測試: ${description}`);
  console.log(`📝 查詢: "${query}"`);
  
  try {
    const startTime = Date.now();
    const response = await fetch(`${SUPABASE_URL}/functions/v1/claude-chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: { content: query },
        session_id: 'test-session-' + Date.now()
      })
    });
    
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      console.log(`❌ HTTP ${response.status}: ${response.statusText}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    const data = await response.json();
    const aiResponse = data.data?.response || data.response || '';
    
    console.log(`⏱️ 響應時間: ${responseTime}ms`);
    console.log(`📄 回應內容:`);
    console.log(aiResponse);
    
    return { 
      success: true, 
      response: aiResponse, 
      responseTime
    };
    
  } catch (error) {
    console.log(`❌ 請求失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testCoverageStatsFix() {
  console.log('🎯 測試 COVERAGE_STATS 意圖修復');
  console.log('=================================');
  
  const tests = [
    {
      query: '你商家資料有多少?',
      description: '統計查詢 - 應回統計數據而非具體商家',
      shouldContain: ['📊', '文山特區商家資料庫統計', '商家總數', '安心店家', '優惠店家', '特約商家', '分類數'],
      shouldNotContain: ['肯塔基美語', '保亭鳳山行政停車場', '寶盛鳳山中山東路停車場', '3筆']
    },
    {
      query: '你的商家資料有多少資料?',
      description: '統計查詢變體 - 應回統計數據',
      shouldContain: ['📊', '統計', '280', '16', '18', '1', '11'],
      shouldNotContain: ['肯塔基美語', '停車場']
    },
    {
      query: '文山特區有多少家商家？',
      description: '商家數量查詢 - 應回統計數據',
      shouldContain: ['📊', '商家總數', '280'],
      shouldNotContain: ['肯塔基美語', '停車場']
    },
    {
      query: '資料庫統計',
      description: '統計查詢關鍵詞 - 應回統計數據',
      shouldContain: ['📊', '統計'],
      shouldNotContain: ['肯塔基美語', '停車場']
    },
    {
      query: '推薦美食',
      description: '美食推薦 - 應回店家清單（正常功能不受影響）',
      shouldContain: ['美食', '推薦', '店家'],
      shouldNotContain: ['📊', '統計', '商家總數']
    }
  ];
  
  let passCount = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    const result = await testClaudeChat(test.query, test.description);
    
    if (result.success) {
      let testPassed = true;
      let issues = [];
      
      // 檢查應該包含的內容
      if (test.shouldContain) {
        for (const content of test.shouldContain) {
          if (!result.response.includes(content)) {
            testPassed = false;
            issues.push(`缺少預期內容: ${content}`);
          }
        }
      }
      
      // 檢查不應該包含的內容
      if (test.shouldNotContain) {
        for (const content of test.shouldNotContain) {
          if (result.response.includes(content)) {
            testPassed = false;
            issues.push(`包含不預期內容: ${content}`);
          }
        }
      }
      
      if (testPassed) {
        console.log('✅ 測試通過');
        passCount++;
      } else {
        console.log('❌ 測試失敗');
        issues.forEach(issue => console.log(`   - ${issue}`));
      }
      
    } else {
      console.log('❌ 測試失敗');
      console.log(`   - ${result.error}`);
    }
    
    // 避免請求過於頻繁
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 測試結果摘要');
  console.log('================');
  console.log(`✅ 通過: ${passCount}/${totalTests} (${Math.round(passCount/totalTests*100)}%)`);
  console.log(`❌ 失敗: ${totalTests - passCount}/${totalTests}`);
  
  if (passCount === totalTests) {
    console.log('\n🎉 所有測試通過！COVERAGE_STATS 意圖修復成功！');
  } else {
    console.log('\n⚠️ 部分測試失敗，需要檢查修復');
  }
  
  console.log('\n🎯 修復驗證完成！');
}

// 執行測試
testCoverageStatsFix().catch(console.error);