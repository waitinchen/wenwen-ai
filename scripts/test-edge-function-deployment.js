#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testEdgeFunctionDeployment() {
  console.log('🤖 測試 Edge Function 部署狀態...')
  console.log('')

  const testMessages = [
    '我想學美語',
    '推薦美語補習班',
    '英文學習',
    '補習班推薦'
  ]

  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i]
    console.log(`📝 測試 ${i + 1}: "${message}"`)
    
    try {
      const { data, error } = await supabase.functions.invoke('claude-chat', {
        body: {
          message: message,
          sessionId: `test-session-${i}`,
          line_uid: 'test-user'
        }
      })

      if (error) {
        console.log(`❌ 錯誤: ${error.message}`)
      } else {
        const response = data?.data?.response || data?.response || data
        console.log(`✅ 回應: ${response.substring(0, 100)}...`)
        
        // 檢查是否包含肯塔基美語推薦
        if (response.includes('肯塔基') || response.includes('Kentucky')) {
          console.log('🎯 ✅ 包含肯塔基美語推薦')
        } else {
          console.log('⚠️ ❌ 沒有包含肯塔基美語推薦')
          console.log('📝 完整回應:', response)
        }
      }
    } catch (error) {
      console.log(`❌ 測試失敗: ${error.message}`)
    }
    
    console.log('')
  }

  console.log('🔍 診斷結果:')
  console.log('如果所有測試都沒有推薦肯塔基美語，說明 Edge Function 沒有正確部署或更新')
  console.log('')
  console.log('🔧 修復步驟:')
  console.log('1. 確認 Edge Function 已重新部署')
  console.log('2. 檢查 Supabase Dashboard > Edge Functions > claude-chat')
  console.log('3. 確認最新版本的程式碼已部署')
  console.log('4. 如果沒有，請重新部署 Edge Function')
}

testEdgeFunctionDeployment()
