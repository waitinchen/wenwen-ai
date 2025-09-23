#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function deployEdgeFunction() {
  console.log('🚀 準備 Edge Function 部署...')
  console.log('')

  try {
    // 1. 讀取 Edge Function 程式碼
    const edgeFunctionPath = path.join(__dirname, '..', 'supabase', 'functions', 'claude-chat', 'index.ts')
    
    if (!fs.existsSync(edgeFunctionPath)) {
      console.log('❌ Edge Function 檔案不存在:', edgeFunctionPath)
      return
    }

    const edgeFunctionCode = fs.readFileSync(edgeFunctionPath, 'utf8')
    console.log('✅ Edge Function 程式碼已讀取')
    console.log('📝 檔案大小:', edgeFunctionCode.length, '字元')

    // 2. 檢查關鍵邏輯是否存在
    const hasKentuckyLogic = edgeFunctionCode.includes('檢測到英語相關問題，強制推薦肯塔基美語')
    const hasEnglishKeywords = edgeFunctionCode.includes('englishKeywords')
    const hasForcedPrompt = edgeFunctionCode.includes('強制指令 - 絕對不能違反')

    console.log('')
    console.log('🔍 程式碼檢查結果:')
    console.log('  - 肯塔基美語強制推薦邏輯:', hasKentuckyLogic ? '✅' : '❌')
    console.log('  - 英語關鍵字檢測:', hasEnglishKeywords ? '✅' : '❌')
    console.log('  - 強制指令提示詞:', hasForcedPrompt ? '✅' : '❌')

    if (hasKentuckyLogic && hasEnglishKeywords && hasForcedPrompt) {
      console.log('✅ Edge Function 程式碼正確')
    } else {
      console.log('❌ Edge Function 程式碼有問題')
      return
    }

    // 3. 生成部署指令
    console.log('')
    console.log('🔧 部署指令:')
    console.log('')
    console.log('方法 1: 使用 Supabase Dashboard')
    console.log('1. 前往: https://supabase.com/dashboard/project/vqcuwjfxoxjgsrueqodj/functions')
    console.log('2. 找到 claude-chat 函數')
    console.log('3. 點擊 "Deploy" 按鈕')
    console.log('4. 確認部署成功')
    console.log('')
    console.log('方法 2: 使用 Supabase CLI')
    console.log('npm install -g supabase')
    console.log('supabase login')
    console.log('supabase functions deploy claude-chat')
    console.log('')
    console.log('方法 3: 手動複製程式碼')
    console.log('1. 前往 Supabase Dashboard > Edge Functions > claude-chat')
    console.log('2. 複製以下程式碼到編輯器:')
    console.log('3. 點擊 "Deploy" 按鈕')

    // 4. 顯示程式碼前 500 字元作為確認
    console.log('')
    console.log('📝 程式碼預覽 (前 500 字元):')
    console.log('─'.repeat(50))
    console.log(edgeFunctionCode.substring(0, 500))
    console.log('─'.repeat(50))
    console.log('... (完整程式碼請查看檔案)')

    // 5. 創建部署驗證腳本
    const verifyScript = `#!/usr/bin/env node

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
`

    fs.writeFileSync(path.join(__dirname, 'verify-deployment.js'), verifyScript)
    console.log('')
    console.log('✅ 部署驗證腳本已創建: scripts/verify-deployment.js')
    console.log('📝 部署完成後執行: node scripts/verify-deployment.js')

  } catch (error) {
    console.log('❌ 部署準備失敗:', error.message)
  }
}

deployEdgeFunction()
