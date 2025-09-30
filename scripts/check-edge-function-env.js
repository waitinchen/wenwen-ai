import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkEdgeFunctionEnvironment() {
  console.log('🔍 檢查Edge Function環境變數問題...')
  
  // 測試claude-chat Edge Function
  console.log('\n📋 測試 claude-chat Edge Function...')
  
  try {
    const { data, error } = await supabase.functions.invoke('claude-chat', {
      body: {
        session_id: 'test-env-check',
        message: { role: 'user', content: '環境測試' },
        user_meta: { external_id: 'test-user' }
      }
    })
    
    if (error) {
      console.log('❌ claude-chat 錯誤:', error.message)
      
      // 檢查是否為環境變數問題
      if (error.message.includes('SUPABASE_URL') || 
          error.message.includes('SUPABASE_SERVICE_ROLE_KEY') ||
          error.message.includes('ANTHROPIC_API_KEY')) {
        console.log('🔧 診斷: 環境變數問題')
        console.log('💡 解決方案: 需要在Supabase Dashboard設置環境變數')
      }
    } else {
      console.log('✅ claude-chat 正常')
    }
  } catch (err) {
    console.log('❌ claude-chat 異常:', err.message)
  }
  
  // 測試admin-management Edge Function
  console.log('\n📋 測試 admin-management Edge Function...')
  
  try {
    const { data, error } = await supabase.functions.invoke('admin-management', {
      body: {
        action: 'list',
        table: 'stores',
        filters: { limit: 1 }
      }
    })
    
    if (error) {
      console.log('❌ admin-management 錯誤:', error.message)
    } else {
      console.log('✅ admin-management 正常')
    }
  } catch (err) {
    console.log('❌ admin-management 異常:', err.message)
  }
  
  // 測試admin-auth Edge Function
  console.log('\n📋 測試 admin-auth Edge Function...')
  
  try {
    const { data, error } = await supabase.functions.invoke('admin-auth', {
      body: {
        action: 'test'
      }
    })
    
    if (error) {
      console.log('❌ admin-auth 錯誤:', error.message)
    } else {
      console.log('✅ admin-auth 正常')
    }
  } catch (err) {
    console.log('❌ admin-auth 異常:', err.message)
  }
  
  console.log('\n🔧 修復建議:')
  console.log('1. 前往 Supabase Dashboard > Edge Functions')
  console.log('2. 檢查各Edge Function的環境變數設置')
  console.log('3. 確保以下環境變數已設置:')
  console.log('   - SUPABASE_URL')
  console.log('   - SUPABASE_SERVICE_ROLE_KEY')
  console.log('   - ANTHROPIC_API_KEY (for claude-chat)')
  console.log('4. 重新部署受影響的Edge Functions')
}

checkEdgeFunctionEnvironment()