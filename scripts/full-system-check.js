import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fullSystemCheck() {
  console.log('🔍 開始全系統檢查...')
  console.log('=' * 60)
  
  let totalChecks = 0
  let passedChecks = 0
  let failedChecks = 0
  
  // 1. 檢查Edge Functions
  console.log('\n1️⃣ Edge Functions 檢查')
  console.log('-' * 40)
  
  const edgeFunctions = ['claude-chat', 'admin-management', 'admin-auth']
  
  for (const func of edgeFunctions) {
    totalChecks++
    try {
      console.log(`📋 測試 ${func}...`)
      const { data, error } = await supabase.functions.invoke(func, {
        body: { test: true }
      })
      
      if (error) {
        console.log(`   ❌ ${func}: ${error.message}`)
        failedChecks++
      } else {
        console.log(`   ✅ ${func}: 正常運作`)
        passedChecks++
      }
    } catch (err) {
      console.log(`   ❌ ${func}: ${err.message}`)
      failedChecks++
    }
  }
  
  // 2. 檢查資料庫完整性
  console.log('\n2️⃣ 資料庫完整性檢查')
  console.log('-' * 40)
  
  const tables = ['stores', 'faqs', 'quick_questions', 'admin_sessions', 'admins']
  
  for (const table of tables) {
    totalChecks++
    try {
      console.log(`📋 檢查 ${table} 表...`)
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1)
      
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`)
        failedChecks++
      } else {
        console.log(`   ✅ ${table}: ${count || 0} 筆記錄`)
        passedChecks++
      }
    } catch (err) {
      console.log(`   ❌ ${table}: ${err.message}`)
      failedChecks++
    }
  }
  
  // 3. 檢查商家數據品質
  console.log('\n3️⃣ 商家數據品質檢查')
  console.log('-' * 40)
  
  totalChecks++
  try {
    console.log('📋 檢查商家數據統計...')
    const { data: stores, error } = await supabase
      .from('stores')
      .select('category, approval, is_trusted')
      .eq('approval', 'approved')
    
    if (error) {
      console.log(`   ❌ 商家數據檢查失敗: ${error.message}`)
      failedChecks++
    } else {
      const categoryCount = stores.reduce((acc, store) => {
        acc[store.category] = (acc[store.category] || 0) + 1
        return acc
      }, {})
      
      console.log('   ✅ 商家數據統計:')
      Object.entries(categoryCount).forEach(([category, count]) => {
        console.log(`      ${category}: ${count} 家`)
      })
      console.log(`   總計: ${stores.length} 家已審核商家`)
      passedChecks++
    }
  } catch (err) {
    console.log(`   ❌ 商家數據檢查失敗: ${err.message}`)
    failedChecks++
  }
  
  // 4. 檢查FAQ數據
  console.log('\n4️⃣ FAQ數據檢查')
  console.log('-' * 40)
  
  totalChecks++
  try {
    console.log('📋 檢查FAQ數據...')
    const { data: faqs, error } = await supabase
      .from('faqs')
      .select('category, is_active')
      .eq('is_active', true)
    
    if (error) {
      console.log(`   ❌ FAQ數據檢查失敗: ${error.message}`)
      failedChecks++
    } else {
      const categoryCount = faqs.reduce((acc, faq) => {
        acc[faq.category] = (acc[faq.category] || 0) + 1
        return acc
      }, {})
      
      console.log('   ✅ FAQ數據統計:')
      Object.entries(categoryCount).forEach(([category, count]) => {
        console.log(`      ${category}: ${count} 題`)
      })
      console.log(`   總計: ${faqs.length} 題活躍FAQ`)
      passedChecks++
    }
  } catch (err) {
    console.log(`   ❌ FAQ數據檢查失敗: ${err.message}`)
    failedChecks++
  }
  
  // 5. 檢查快速問題
  console.log('\n5️⃣ 快速問題檢查')
  console.log('-' * 40)
  
  totalChecks++
  try {
    console.log('📋 檢查快速問題...')
    const { data: quickQuestions, error } = await supabase
      .from('quick_questions')
      .select('*')
      .eq('is_enabled', true)
    
    if (error) {
      console.log(`   ❌ 快速問題檢查失敗: ${error.message}`)
      failedChecks++
    } else {
      console.log('   ✅ 快速問題統計:')
      quickQuestions.forEach((q, index) => {
        console.log(`      ${index + 1}. ${q.question}`)
      })
      console.log(`   總計: ${quickQuestions.length} 題啟用快速問題`)
      passedChecks++
    }
  } catch (err) {
    console.log(`   ❌ 快速問題檢查失敗: ${err.message}`)
    failedChecks++
  }
  
  // 6. 測試核心聊天功能
  console.log('\n6️⃣ 核心聊天功能測試')
  console.log('-' * 40)
  
  const testQuestions = [
    '告訴我妳的服務範圍',
    '請推薦鳳山區美食情報',
    '查詢鳳山區停車資訊'
  ]
  
  for (const question of testQuestions) {
    totalChecks++
    try {
      console.log(`📋 測試問題: "${question}"`)
      const { data, error } = await supabase.functions.invoke('claude-chat', {
        body: {
          session_id: 'test-session',
          message: { role: 'user', content: question },
          user_meta: { external_id: 'test-user' }
        }
      })
      
      if (error) {
        console.log(`   ❌ "${question}": ${error.message}`)
        failedChecks++
      } else if (data && data.response) {
        console.log(`   ✅ "${question}": 回應正常 (${data.response.length} 字元)`)
        passedChecks++
      } else {
        console.log(`   ❌ "${question}": 無回應`)
        failedChecks++
      }
    } catch (err) {
      console.log(`   ❌ "${question}": ${err.message}`)
      failedChecks++
    }
  }
  
  // 7. 檢查前端建置
  console.log('\n7️⃣ 前端建置檢查')
  console.log('-' * 40)
  
  totalChecks++
  try {
    console.log('📋 檢查前端建置文件...')
    const fs = await import('fs')
    const path = await import('path')
    
    const distPath = path.join(process.cwd(), 'dist')
    const indexPath = path.join(distPath, 'index.html')
    
    if (fs.existsSync(distPath) && fs.existsSync(indexPath)) {
      console.log('   ✅ dist 目錄存在')
      console.log('   ✅ index.html 存在')
      passedChecks++
    } else {
      console.log('   ❌ dist 目錄或 index.html 不存在')
      console.log('   💡 請運行: npm run build')
      failedChecks++
    }
  } catch (err) {
    console.log(`   ❌ 前端建置檢查失敗: ${err.message}`)
    failedChecks++
  }
  
  // 總結報告
  console.log('\n' + '=' * 60)
  console.log('📊 全系統檢查結果')
  console.log('=' * 60)
  console.log(`總檢查項目: ${totalChecks}`)
  console.log(`✅ 通過: ${passedChecks}`)
  console.log(`❌ 失敗: ${failedChecks}`)
  console.log(`📈 成功率: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`)
  
  if (failedChecks === 0) {
    console.log('\n🎉 全系統檢查通過！準備部署到正式環境')
    console.log('✅ 所有核心功能正常運作')
    console.log('✅ 資料庫完整性良好')
    console.log('✅ 前端建置完成')
  } else {
    console.log('\n⚠️ 發現問題需要修復:')
    console.log(`   ${failedChecks} 個檢查項目失敗`)
    console.log('💡 請修復失敗項目後重新檢查')
  }
  
  console.log('\n🚀 部署準備狀態:')
  if (failedChecks === 0) {
    console.log('   ✅ 系統就緒，可以部署')
  } else {
    console.log('   ❌ 需要修復問題後再部署')
  }
}

// 執行全系統檢查
fullSystemCheck()


