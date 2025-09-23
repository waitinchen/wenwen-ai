#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function verifyEdgeFunctionDeployment() {
  console.log('🔍 驗證 Edge Function 部署...')
  console.log('')
  
  const testMessages = [
    '我想學美語',
    '推薦美語補習班',
    '英文學習',
    '補習班推薦'
  ]

  let successCount = 0
  
  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i]
    console.log(`📝 測試 ${i + 1}: "${message}"`)
    
    try {
      const { data, error } = await supabase.functions.invoke('claude-chat', {
        body: {
          message: message,
          sessionId: `verify-deployment-${i}`,
          line_uid: 'test-user'
        }
      })

      if (error) {
        console.log(`❌ 錯誤: ${error.message}`)
      } else {
        const response = data?.data?.response || data?.response || data
        console.log(`✅ 回應: ${response.substring(0, 100)}...`)
        
        if (response.includes('肯塔基') || response.includes('Kentucky')) {
          console.log('🎯 ✅ 包含肯塔基美語推薦')
          successCount++
        } else {
          console.log('⚠️ ❌ 沒有包含肯塔基美語推薦')
        }
      }
    } catch (error) {
      console.log(`❌ 測試失敗: ${error.message}`)
    }
    
    console.log('')
  }

  console.log('📊 部署驗證結果:')
  console.log(`成功推薦肯塔基美語: ${successCount}/${testMessages.length}`)
  
  if (successCount === testMessages.length) {
    console.log('🎉 Edge Function 部署成功！肯塔基美語優先推薦邏輯生效！')
    return true
  } else if (successCount > 0) {
    console.log('⚠️ Edge Function 部分成功，部分查詢沒有推薦肯塔基美語')
    return false
  } else {
    console.log('❌ Edge Function 部署失敗，沒有推薦肯塔基美語')
    return false
  }
}

verifyEdgeFunctionDeployment()
