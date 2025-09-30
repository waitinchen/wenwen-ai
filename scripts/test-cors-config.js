/**
 * 測試縮小後的 CORS 配置
 */

async function testCorsConfig() {
  console.log('🔧 測試縮小後的 CORS 配置')
  console.log('=' .repeat(60))
  
  // 測試不同的 HTTP 方法
  const testMethods = [
    {
      method: 'POST',
      description: 'POST 請求 (應該允許)',
      expectedResult: '應該成功'
    },
    {
      method: 'GET',
      description: 'GET 請求 (應該允許)',
      expectedResult: '應該成功'
    },
    {
      method: 'OPTIONS',
      description: 'OPTIONS 請求 (應該允許)',
      expectedResult: '應該成功'
    },
    {
      method: 'PUT',
      description: 'PUT 請求 (應該被拒絕)',
      expectedResult: '應該被拒絕'
    },
    {
      method: 'DELETE',
      description: 'DELETE 請求 (應該被拒絕)',
      expectedResult: '應該被拒絕'
    },
    {
      method: 'PATCH',
      description: 'PATCH 請求 (應該被拒絕)',
      expectedResult: '應該被拒絕'
    }
  ]
  
  let passedTests = 0
  let totalTests = testMethods.length
  
  for (const test of testMethods) {
    console.log(`\n📝 測試: ${test.description}`)
    console.log(`   方法: ${test.method}`)
    console.log(`   預期: ${test.expectedResult}`)
    
    try {
      const response = await fetch('https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/claude-chat', {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
        },
        body: test.method === 'POST' ? JSON.stringify({
          message: {
            content: "測試 CORS 配置"
          },
          session_id: `test-cors-${Date.now()}`,
          user_meta: {
            external_id: 'test-user',
            display_name: '測試用戶'
          }
        }) : undefined
      })

      const status = response.status
      const statusText = response.statusText
      
      // 檢查 CORS 標頭
      const corsOrigin = response.headers.get('Access-Control-Allow-Origin')
      const corsMethods = response.headers.get('Access-Control-Allow-Methods')
      const corsHeaders = response.headers.get('Access-Control-Allow-Headers')
      
      console.log(`   📊 狀態: ${status} ${statusText}`)
      console.log(`   🌐 CORS Origin: ${corsOrigin}`)
      console.log(`   🔧 CORS Methods: ${corsMethods}`)
      console.log(`   📋 CORS Headers: ${corsHeaders}`)
      
      // 判斷測試結果
      if (['POST', 'GET', 'OPTIONS'].includes(test.method)) {
        if (status === 200 || status === 204) {
          console.log(`   ✅ 成功: 允許的方法正常通過`)
          passedTests++
        } else {
          console.log(`   ❌ 失敗: 允許的方法被拒絕`)
        }
      } else {
        if (status === 405 || status === 400) {
          console.log(`   ✅ 成功: 不允許的方法被正確拒絕`)
          passedTests++
        } else {
          console.log(`   ❌ 失敗: 不允許的方法意外通過`)
        }
      }
      
    } catch (error) {
      console.log(`   ❌ 測試失敗: ${error.message}`)
    }
    
    // 等待一秒避免過於頻繁的請求
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('\n' + '=' .repeat(60))
  console.log('📊 CORS 配置測試結果')
  console.log('=' .repeat(60))
  console.log(`✅ 通過測試: ${passedTests}/${totalTests}`)
  console.log(`📈 成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  if (passedTests === totalTests) {
    console.log('\n🎉 CORS 配置縮小化成功！')
    console.log('✅ 只允許必要的 HTTP 方法')
    console.log('✅ 禁止了不必要的 HTTP 方法')
    console.log('✅ 提高了安全性')
  } else {
    console.log('\n⚠️  CORS 配置需要進一步調整')
  }
  
  console.log('\n🔧 CORS 縮小化改進：')
  console.log('1. 移除了 PUT, DELETE, PATCH 方法')
  console.log('2. 只保留 POST, GET, OPTIONS')
  console.log('3. 減少了攻擊面')
  console.log('4. 提高了安全性')
  console.log('5. 符合最小權限原則')
}

testCorsConfig()
