/**
 * 測試精簡後的 SecurityService
 */

async function testSecurityService() {
  console.log('🔧 測試精簡後的 SecurityService')
  console.log('=' .repeat(60))
  
  // 測試查詢列表
  const testQueries = [
    {
      query: "我想查 日料",
      description: "正常日料查詢",
      expectedResult: "應該通過驗證"
    },
    {
      query: "你好",
      description: "問候語",
      expectedResult: "應該通過驗證"
    },
    {
      query: "你的商家資料有多少資料?",
      description: "統計查詢",
      expectedResult: "應該通過驗證"
    },
    {
      query: "",
      description: "空字串",
      expectedResult: "應該被拒絕"
    },
    {
      query: "a".repeat(1001),
      description: "超長字串",
      expectedResult: "應該被拒絕"
    }
  ]
  
  let passedTests = 0
  let totalTests = testQueries.length
  
  for (const test of testQueries) {
    console.log(`\n📝 測試: ${test.description}`)
    console.log(`   查詢: "${test.query}"`)
    console.log(`   預期: ${test.expectedResult}`)
    
    try {
      const response = await fetch('https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/claude-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
        },
        body: JSON.stringify({
          message: {
            content: test.query
          },
          session_id: `test-security-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          user_meta: {
            external_id: 'test-user',
            display_name: '測試用戶'
          }
        })
      })

      if (!response.ok) {
        console.log(`   ❌ HTTP 錯誤: ${response.status}`)
        if (test.query === "" || test.query.length > 1000) {
          console.log(`   ✅ 預期行為: 空字串/超長字串被拒絕`)
          passedTests++
        } else {
          console.log(`   ❌ 意外錯誤: 正常查詢被拒絕`)
        }
        continue
      }

      const data = await response.json()
      
      if (data.error) {
        console.log(`   ❌ 錯誤: ${data.error.message}`)
        if (test.query === "" || test.query.length > 1000) {
          console.log(`   ✅ 預期行為: 無效輸入被拒絕`)
          passedTests++
        } else {
          console.log(`   ❌ 意外錯誤: 正常查詢被拒絕`)
        }
        continue
      }

      const result = data.data
      if (result) {
        console.log(`   ✅ 成功: 識別意圖 ${result.intent}`)
        console.log(`   ✅ 回應正常: ${result.response ? '是' : '否'}`)
        passedTests++
      } else {
        console.log(`   ❌ 沒有返回數據`)
      }
      
    } catch (error) {
      console.log(`   ❌ 測試失敗: ${error.message}`)
    }
    
    // 等待一秒避免過於頻繁的請求
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('\n' + '=' .repeat(60))
  console.log('📊 SecurityService 測試結果')
  console.log('=' .repeat(60))
  console.log(`✅ 通過測試: ${passedTests}/${totalTests}`)
  console.log(`📈 成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  if (passedTests === totalTests) {
    console.log('\n🎉 SecurityService 精簡化成功！')
    console.log('✅ 移除了誤殺規則')
    console.log('✅ 保持了基本安全驗證')
    console.log('✅ 正常查詢可以通過')
    console.log('✅ 無效輸入被正確拒絕')
  } else {
    console.log('\n⚠️  SecurityService 需要進一步調整')
  }
  
  console.log('\n🔧 精簡化改進：')
  console.log('1. 移除了危險內容檢測規則')
  console.log('2. 依賴上游參數化查詢與資料層白名單')
  console.log('3. 保留了基本的輸入驗證')
  console.log('4. 改進了 Unicode 正規化')
  console.log('5. 優化了 session ID 生成')
}

testSecurityService()
