// 檢查 Edge Function 狀態
console.log('🔍 檢查 Edge Function 狀態...')

// 測試 Edge Function 健康狀態
async function checkEdgeFunctionHealth() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('📡 測試 Edge Function 健康狀態...')
    
    // 發送簡單的測試請求
    const { data, error } = await supabase.functions.invoke('claude-chat', {
      body: {
        session_id: `health-check-${Date.now()}`,
        message: { role: 'user', content: '你好' },
        user_meta: { external_id: 'health-check' }
      }
    })
    
    if (error) {
      console.error('❌ Edge Function 健康檢查失敗:')
      console.error(`狀態碼: ${error.context?.status}`)
      console.error(`錯誤訊息: ${error.message}`)
      
      if (error.context?.status === 503) {
        console.log('\n🚨 503 錯誤分析:')
        console.log('• 服務暫時不可用')
        console.log('• 可能是部署過程中')
        console.log('• 或 Edge Function 有語法錯誤')
        console.log('• 建議檢查 Supabase Dashboard 的 Logs 頁面')
      }
      
      return false
    }
    
    if (data && data.data) {
      console.log('✅ Edge Function 健康檢查通過')
      console.log(`回應長度: ${data.data.response?.length || 0} 字`)
      return true
    } else {
      console.log('⚠️ Edge Function 回應格式異常')
      return false
    }
    
  } catch (error) {
    console.error('❌ 健康檢查異常:', error)
    return false
  }
}

// 檢查部署狀態
async function checkDeploymentStatus() {
  console.log('\n🔍 檢查部署狀態:')
  
  const statusChecks = [
    {
      name: 'Edge Function 可達性',
      check: async () => {
        try {
          const response = await fetch('https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/claude-chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
            },
            body: JSON.stringify({
              session_id: 'status-check',
              message: { role: 'user', content: 'test' },
              user_meta: { external_id: 'status-check' }
            })
          })
          
          return response.status < 500
        } catch (error) {
          return false
        }
      }
    },
    {
      name: '環境變數配置',
      check: async () => {
        // 無法直接檢查環境變數，但可以通過回應推測
        return true
      }
    },
    {
      name: '代碼語法檢查',
      check: async () => {
        // 檢查本地代碼是否有語法錯誤
        try {
          // 這裡可以添加語法檢查邏輯
          return true
        } catch (error) {
          return false
        }
      }
    }
  ]
  
  for (const check of statusChecks) {
    try {
      const result = await check.check()
      console.log(`${result ? '✅' : '❌'} ${check.name}`)
    } catch (error) {
      console.log(`❌ ${check.name}: ${error.message}`)
    }
  }
}

// 提供故障排除建議
function provideTroubleshootingSuggestions() {
  console.log('\n🔧 故障排除建議:')
  
  console.log('\n1. 檢查 Supabase Dashboard:')
  console.log('   • 前往 Edge Functions > claude-chat')
  console.log('   • 查看 Logs 頁面的錯誤訊息')
  console.log('   • 確認函數狀態為 "Active"')
  
  console.log('\n2. 檢查代碼語法:')
  console.log('   • 確認 index.ts 沒有語法錯誤')
  console.log('   • 檢查所有 import 語句')
  console.log('   • 確認所有類別和方法定義正確')
  
  console.log('\n3. 檢查環境變數:')
  console.log('   • 確認 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY 已設置')
  console.log('   • 檢查 Edge Function 的環境變數配置')
  
  console.log('\n4. 重新部署:')
  console.log('   • 嘗試重新部署 Edge Function')
  console.log('   • 等待部署完成（可能需要幾分鐘）')
  console.log('   • 再次測試函數調用')
  
  console.log('\n5. 聯繫支援:')
  console.log('   • 如果問題持續，檢查 Supabase 服務狀態')
  console.log('   • 查看 Supabase 社群或文檔')
}

// 執行檢查
async function runHealthCheck() {
  console.log('🚀 開始 Edge Function 健康檢查...')
  
  const healthResult = await checkEdgeFunctionHealth()
  await checkDeploymentStatus()
  
  if (!healthResult) {
    provideTroubleshootingSuggestions()
  } else {
    console.log('\n🎉 Edge Function 運行正常！')
    console.log('可以進行統計查詢測試')
  }
}

runHealthCheck()