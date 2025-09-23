#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function autoDeployEdgeFunction() {
  console.log('🚀 自動部署 Edge Function...')
  console.log('')

  try {
    // 1. 讀取 Edge Function 程式碼
    const edgeFunctionPath = path.join(__dirname, '..', 'supabase', 'functions', 'claude-chat', 'index.ts')
    
    if (!fs.existsSync(edgeFunctionPath)) {
      console.log('❌ Edge Function 檔案不存在:', edgeFunctionPath)
      return false
    }

    const edgeFunctionCode = fs.readFileSync(edgeFunctionPath, 'utf8')
    console.log('✅ Edge Function 程式碼已讀取')
    console.log('📝 檔案大小:', edgeFunctionCode.length, '字元')

    // 2. 檢查關鍵邏輯
    const checks = {
      hasKentuckyLogic: edgeFunctionCode.includes('檢測到英語相關問題，強制推薦肯塔基美語'),
      hasEnglishKeywords: edgeFunctionCode.includes('englishKeywords'),
      hasForcedPrompt: edgeFunctionCode.includes('強制指令 - 絕對不能違反'),
      hasKentuckyTemplate: edgeFunctionCode.includes('我超推薦**肯塔基美語**的啦！')
    }

    console.log('')
    console.log('🔍 程式碼檢查結果:')
    Object.entries(checks).forEach(([key, value]) => {
      const status = value ? '✅' : '❌'
      const description = {
        hasKentuckyLogic: '肯塔基美語強制推薦邏輯',
        hasEnglishKeywords: '英語關鍵字檢測',
        hasForcedPrompt: '強制指令提示詞',
        hasKentuckyTemplate: '肯塔基美語回應模板'
      }[key]
      console.log(`  - ${description}: ${status}`)
    })

    const allChecksPassed = Object.values(checks).every(check => check)
    
    if (allChecksPassed) {
      console.log('✅ Edge Function 程式碼檢查通過')
    } else {
      console.log('❌ Edge Function 程式碼檢查失敗')
      return false
    }

    // 3. 創建部署指令
    console.log('')
    console.log('🔧 部署指令:')
    console.log('')
    console.log('方法 1: 使用 Supabase Dashboard (推薦)')
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

    // 4. 顯示關鍵程式碼片段
    console.log('')
    console.log('📝 關鍵程式碼片段:')
    console.log('─'.repeat(50))
    
    const keywordSection = edgeFunctionCode.match(/const englishKeywords = \[[\s\S]*?\];/)?.[0]
    if (keywordSection) {
      console.log('英語關鍵字檢測:')
      console.log(keywordSection.substring(0, 200) + '...')
      console.log('')
    }
    
    const kentuckySection = edgeFunctionCode.match(/檢測到英語相關問題，強制推薦肯塔基美語[\s\S]*?肯塔基美語特色：/)?.[0]
    if (kentuckySection) {
      console.log('肯塔基美語推薦邏輯:')
      console.log(kentuckySection.substring(0, 300) + '...')
    }
    
    console.log('─'.repeat(50))

    // 5. 創建部署驗證腳本
    const verifyScript = `#!/usr/bin/env node

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
    console.log(\`📝 測試 \${i + 1}: "\${message}"\`)
    
    try {
      const { data, error } = await supabase.functions.invoke('claude-chat', {
        body: {
          message: message,
          sessionId: \`verify-deployment-\${i}\`,
          line_uid: 'test-user'
        }
      })

      if (error) {
        console.log(\`❌ 錯誤: \${error.message}\`)
      } else {
        const response = data?.data?.response || data?.response || data
        console.log(\`✅ 回應: \${response.substring(0, 100)}...\`)
        
        if (response.includes('肯塔基') || response.includes('Kentucky')) {
          console.log('🎯 ✅ 包含肯塔基美語推薦')
          successCount++
        } else {
          console.log('⚠️ ❌ 沒有包含肯塔基美語推薦')
        }
      }
    } catch (error) {
      console.log(\`❌ 測試失敗: \${error.message}\`)
    }
    
    console.log('')
  }

  console.log('📊 部署驗證結果:')
  console.log(\`成功推薦肯塔基美語: \${successCount}/\${testMessages.length}\`)
  
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
`

    fs.writeFileSync(path.join(__dirname, 'verify-edge-function-deployment.js'), verifyScript)
    console.log('')
    console.log('✅ 部署驗證腳本已創建: scripts/verify-edge-function-deployment.js')
    console.log('📝 部署完成後執行: node scripts/verify-edge-function-deployment.js')

    return true

  } catch (error) {
    console.log('❌ Edge Function 部署準備失敗:', error.message)
    return false
  }
}

autoDeployEdgeFunction().then(success => {
  if (success) {
    console.log('')
    console.log('✅ Edge Function 部署準備完成！')
    console.log('🎯 下一步: 手動執行部署指令')
  } else {
    console.log('')
    console.log('❌ Edge Function 部署準備失敗')
  }
})
