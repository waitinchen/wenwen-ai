/**
 * 測試全面關鍵修復
 * 驗證所有修復是否正確運作
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
    console.log(`📄 回應長度: ${aiResponse.length} 字符`);
    
    return { 
      success: true, 
      response: aiResponse, 
      responseTime,
      version: data.data?.version || data.version
    };
    
  } catch (error) {
    console.log(`❌ 請求失敗: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testComprehensiveFixes() {
  console.log('🎯 測試全面關鍵修復');
  console.log('====================');
  
  const tests = [
    {
      query: '你的商家資料有多少資料?',
      description: 'COVERAGE_STATS 統計查詢修復',
      expectedFeatures: ['📊', '商家總數', '安心店家', '優惠店家', '特約商家', '分類數'],
      expectedStats: { total: 280, verified: 16, discount: 18, partner: 1, categories: 11 }
    },
    {
      query: '附近有丁丁藥局嗎?',
      description: '品牌查詢提前偵測修復',
      expectedFeatures: ['丁丁', '藥局', '醫療健康']
    },
    {
      query: '推薦屈臣氏',
      description: '購物品牌查詢修復',
      expectedFeatures: ['屈臣氏', '購物']
    },
    {
      query: '我想吃日式料理',
      description: '餐飲判斷修復',
      expectedFeatures: ['餐飲美食', '日式']
    },
    {
      query: '你好',
      description: '基本問候功能',
      expectedFeatures: ['高文文', 'WEN']
    }
  ];
  
  let passCount = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    const result = await testClaudeChat(test.query, test.description);
    
    if (result.success) {
      let testPassed = true;
      let issues = [];
      
      // 檢查預期特徵
      if (test.expectedFeatures) {
        for (const feature of test.expectedFeatures) {
          if (!result.response.includes(feature)) {
            testPassed = false;
            issues.push(`缺少特徵: ${feature}`);
          }
        }
      }
      
      // 檢查統計數據（針對統計查詢）
      if (test.expectedStats) {
        const stats = test.expectedStats;
        const totalMatch = result.response.match(/商家總數.*?(\d+)/);
        const actualTotal = totalMatch ? parseInt(totalMatch[1]) : 0;
        
        if (actualTotal !== stats.total) {
          testPassed = false;
          issues.push(`統計數據不正確: 預期 ${stats.total}，實際 ${actualTotal}`);
        }
      }
      
      // 檢查版本字串統一
      if (result.version && result.version !== 'WEN 1.4.6') {
        console.log(`⚠️ 版本字串: ${result.version} (應該是 CONFIG.system.version)`);
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
    console.log('\n🎉 所有測試通過！修復成功！');
  } else {
    console.log('\n⚠️ 部分測試失敗，需要檢查部署或修復');
  }
  
  console.log('\n🎯 修復驗證完成！');
}

// 執行測試
testComprehensiveFixes().catch(console.error);
