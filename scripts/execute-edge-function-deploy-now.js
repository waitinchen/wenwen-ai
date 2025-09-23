#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function executeEdgeFunctionDeploy() {
  console.log('🚀 執行 Edge Function 部署修復...')
  console.log('')

  try {
    // 1. 測試當前 Edge Function 狀態
    console.log('📋 測試當前 Edge Function 狀態...')
    const { data, error } = await supabase.functions.invoke('claude-chat', {
      body: {
        message: '我想學美語',
        sessionId: 'deploy-test',
        line_uid: 'test-user'
      }
    })

    if (error) {
      console.log('❌ Edge Function 錯誤:', error.message)
      return false
    }

    const response = data?.data?.response || data?.response || data
    console.log('📝 當前回應:', response.substring(0, 150) + '...')
    
    if (response.includes('肯塔基') || response.includes('Kentucky')) {
      console.log('✅ Edge Function 已正確推薦肯塔基美語')
      return true
    } else {
      console.log('❌ Edge Function 沒有推薦肯塔基美語！')
      console.log('')
      console.log('🚨 需要重新部署 Edge Function！')
      console.log('')
      console.log('📋 執行步驟:')
      console.log('1. 前往: https://supabase.com/dashboard/project/vqcuwjfxoxjgsrueqodj/functions')
      console.log('2. 找到 claude-chat 函數')
      console.log('3. 點擊 "Deploy" 按鈕')
      console.log('4. 確認部署成功')
      console.log('')
      console.log('⚠️ 由於權限限制，無法自動部署 Edge Function')
      return false
    }

  } catch (error) {
    console.log('❌ Edge Function 部署執行失敗:', error.message)
    return false
  }
}

executeEdgeFunctionDeploy().then(success => {
  if (success) {
    console.log('')
    console.log('🎉 Edge Function 部署成功！')
    console.log('🎯 下一步: 驗證修復結果')
  } else {
    console.log('')
    console.log('⚠️ Edge Function 部署需要手動執行')
    console.log('🔧 請前往 Supabase Dashboard 重新部署')
    console.log('')
    console.log('📋 部署後請執行: node scripts/verify-edge-function-deployment.js')
  }
})
