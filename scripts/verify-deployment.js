#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function verifyDeployment() {
  console.log('🔍 驗證 Edge Function 部署...')
  
  try {
    const { data, error } = await supabase.functions.invoke('claude-chat', {
      body: {
        message: '我想學美語',
        sessionId: 'verify-deployment',
        line_uid: 'test-user'
      }
    })

    if (error) {
      console.log('❌ 部署驗證失敗:', error.message)
    } else {
      const response = data?.data?.response || data?.response || data
      console.log('✅ Edge Function 回應正常')
      
      if (response.includes('肯塔基') || response.includes('Kentucky')) {
        console.log('🎯 ✅ 肯塔基美語優先推薦邏輯生效！')
        console.log('📝 回應:', response.substring(0, 200) + '...')
      } else {
        console.log('⚠️ ❌ 肯塔基美語優先推薦邏輯未生效')
        console.log('📝 回應:', response.substring(0, 200) + '...')
      }
    }
  } catch (error) {
    console.log('❌ 驗證失敗:', error.message)
  }
}

verifyDeployment()
