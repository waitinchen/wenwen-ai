import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugClaudeChat() {
  console.log('🔍 調試 claude-chat Edge Function...')
  
  try {
    console.log('📋 發送測試請求...')
    
    const response = await fetch(`${supabaseUrl}/functions/v1/claude-chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session_id: 'debug-test',
        message: { role: 'user', content: '測試' },
        user_meta: { external_id: 'debug-user' }
      })
    })
    
    console.log(`狀態碼: ${response.status}`)
    console.log(`狀態文本: ${response.statusText}`)
    
    const responseText = await response.text()
    console.log('原始回應:')
    console.log(responseText)
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText)
        console.log('\n解析後的JSON:')
        console.log(JSON.stringify(data, null, 2))
      } catch (parseError) {
        console.log('\nJSON解析失敗:', parseError.message)
      }
    } else {
      console.log('\n❌ Edge Function 回應錯誤')
    }
    
  } catch (error) {
    console.log('❌ 請求失敗:', error.message)
  }
}

debugClaudeChat()


