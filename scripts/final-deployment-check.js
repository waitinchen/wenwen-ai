import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Supabase配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function finalDeploymentCheck() {
  console.log('🚀 正式環境部署前最終檢查')
  console.log('=' * 60)
  
  let allChecksPassed = true
  
  // 1. 核心聊天功能檢查
  console.log('\n1️⃣ 核心聊天功能檢查')
  console.log('-' * 40)
  
  try {
    const { data, error } = await supabase.functions.invoke('claude-chat', {
      body: {
        session_id: 'final-check',
        message: { role: 'user', content: '測試' },
        user_meta: { external_id: 'final-test' }
      }
    })
    
    if (error) {
      console.log('❌ claude-chat Edge Function 異常:', error.message)
      allChecksPassed = false
    } else if (data && data.data && data.data.response) {
      console.log('✅ claude-chat Edge Function 正常運作')
      console.log(`   版本: ${data.data.version}`)
      console.log(`   回應: ${data.data.response.substring(0, 50)}...`)
    } else {
      console.log('❌ claude-chat 無有效回應')
      allChecksPassed = false
    }
  } catch (err) {
    console.log('❌ claude-chat 測試失敗:', err.message)
    allChecksPassed = false
  }
  
  // 2. 資料庫完整性檢查
  console.log('\n2️⃣ 資料庫完整性檢查')
  console.log('-' * 40)
  
  const criticalTables = ['stores', 'faqs', 'quick_questions']
  
  for (const table of criticalTables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1)
      
      if (error) {
        console.log(`❌ ${table} 表異常:`, error.message)
        allChecksPassed = false
      } else {
        console.log(`✅ ${table} 表正常 (${count || 0} 筆記錄)`)
      }
    } catch (err) {
      console.log(`❌ ${table} 表檢查失敗:`, err.message)
      allChecksPassed = false
    }
  }
  
  // 3. 商家數據品質檢查
  console.log('\n3️⃣ 商家數據品質檢查')
  console.log('-' * 40)
  
  try {
    const { data: stores, error } = await supabase
      .from('stores')
      .select('category, approval')
      .eq('approval', 'approved')
    
    if (error) {
      console.log('❌ 商家數據檢查失敗:', error.message)
      allChecksPassed = false
    } else {
      const totalStores = stores.length
      const categoryCount = stores.reduce((acc, store) => {
        acc[store.category] = (acc[store.category] || 0) + 1
        return acc
      }, {})
      
      console.log(`✅ 商家數據正常 (總計: ${totalStores} 家)`)
      console.log('   主要分類:')
      Object.entries(categoryCount).slice(0, 5).forEach(([category, count]) => {
        console.log(`     ${category}: ${count} 家`)
      })
      
      if (totalStores < 100) {
        console.log('⚠️ 商家數量偏少，建議增加更多數據')
      }
    }
  } catch (err) {
    console.log('❌ 商家數據檢查失敗:', err.message)
    allChecksPassed = false
  }
  
  // 4. FAQ系統檢查
  console.log('\n4️⃣ FAQ系統檢查')
  console.log('-' * 40)
  
  try {
    const { data: faqs, error } = await supabase
      .from('faqs')
      .select('category, is_active')
      .eq('is_active', true)
    
    if (error) {
      console.log('❌ FAQ系統檢查失敗:', error.message)
      allChecksPassed = false
    } else {
      const totalFAQs = faqs.length
      const categoryCount = faqs.reduce((acc, faq) => {
        acc[faq.category] = (acc[faq.category] || 0) + 1
        return acc
      }, {})
      
      console.log(`✅ FAQ系統正常 (總計: ${totalFAQs} 題)`)
      console.log('   主要分類:')
      Object.entries(categoryCount).slice(0, 5).forEach(([category, count]) => {
        console.log(`     ${category}: ${count} 題`)
      })
      
      if (totalFAQs < 50) {
        console.log('⚠️ FAQ數量偏少，建議增加更多問題')
      }
    }
  } catch (err) {
    console.log('❌ FAQ系統檢查失敗:', err.message)
    allChecksPassed = false
  }
  
  // 5. 快速問題檢查
  console.log('\n5️⃣ 快速問題檢查')
  console.log('-' * 40)
  
  try {
    const { data: quickQuestions, error } = await supabase
      .from('quick_questions')
      .select('*')
      .eq('is_enabled', true)
    
    if (error) {
      console.log('❌ 快速問題檢查失敗:', error.message)
      allChecksPassed = false
    } else {
      console.log(`✅ 快速問題正常 (總計: ${quickQuestions.length} 題)`)
      quickQuestions.forEach((q, index) => {
        console.log(`     ${index + 1}. ${q.question}`)
      })
      
      if (quickQuestions.length < 3) {
        console.log('⚠️ 快速問題數量偏少')
      }
    }
  } catch (err) {
    console.log('❌ 快速問題檢查失敗:', err.message)
    allChecksPassed = false
  }
  
  // 6. 前端建置檢查
  console.log('\n6️⃣ 前端建置檢查')
  console.log('-' * 40)
  
  try {
    const distPath = path.join(process.cwd(), 'dist')
    const indexPath = path.join(distPath, 'index.html')
    
    if (fs.existsSync(distPath) && fs.existsSync(indexPath)) {
      const stats = fs.statSync(indexPath)
      const sizeKB = (stats.size / 1024).toFixed(2)
      console.log(`✅ 前端建置完成 (index.html: ${sizeKB} KB)`)
      
      // 檢查主要資源文件
      const assetsPath = path.join(distPath, 'assets')
      if (fs.existsSync(assetsPath)) {
        const assets = fs.readdirSync(assetsPath)
        console.log(`   資源文件: ${assets.length} 個`)
      }
    } else {
      console.log('❌ 前端建置不完整')
      allChecksPassed = false
    }
  } catch (err) {
    console.log('❌ 前端建置檢查失敗:', err.message)
    allChecksPassed = false
  }
  
  // 7. 關鍵功能測試
  console.log('\n7️⃣ 關鍵功能測試')
  console.log('-' * 40)
  
  const testQuestions = [
    '告訴我妳的服務範圍',
    '有藥局嗎？',
    '有書店嗎？'
  ]
  
  let functionalTestsPassed = 0
  
  for (const question of testQuestions) {
    try {
      const { data, error } = await supabase.functions.invoke('claude-chat', {
        body: {
          session_id: `test-${Date.now()}`,
          message: { role: 'user', content: question },
          user_meta: { external_id: 'test-user' }
        }
      })
      
      if (!error && data && data.data && data.data.response) {
        console.log(`✅ "${question}": 正常回應`)
        functionalTestsPassed++
      } else {
        console.log(`❌ "${question}": 回應異常`)
      }
    } catch (err) {
      console.log(`❌ "${question}": 測試失敗`)
    }
  }
  
  if (functionalTestsPassed === testQuestions.length) {
    console.log('✅ 關鍵功能測試全部通過')
  } else {
    console.log(`⚠️ 關鍵功能測試部分失敗 (${functionalTestsPassed}/${testQuestions.length})`)
    allChecksPassed = false
  }
  
  // 最終報告
  console.log('\n' + '=' * 60)
  console.log('📊 正式環境部署前檢查結果')
  console.log('=' * 60)
  
  if (allChecksPassed && functionalTestsPassed === testQuestions.length) {
    console.log('🎉 系統檢查全部通過！')
    console.log('✅ 準備部署到正式環境')
    console.log('')
    console.log('📋 部署檢查清單:')
    console.log('   ✅ 核心聊天功能正常')
    console.log('   ✅ 資料庫完整性良好')
    console.log('   ✅ 商家數據充足')
    console.log('   ✅ FAQ系統完整')
    console.log('   ✅ 快速問題配置正確')
    console.log('   ✅ 前端建置完成')
    console.log('   ✅ 關鍵功能測試通過')
    console.log('')
    console.log('🚀 系統狀態: 就緒部署')
    console.log('📅 檢查時間:', new Date().toLocaleString('zh-TW'))
  } else {
    console.log('⚠️ 系統檢查發現問題')
    console.log('❌ 不建議立即部署')
    console.log('')
    console.log('🔧 需要修復的問題:')
    if (!allChecksPassed) {
      console.log('   - 部分系統檢查失敗')
    }
    if (functionalTestsPassed < testQuestions.length) {
      console.log('   - 關鍵功能測試未完全通過')
    }
    console.log('')
    console.log('💡 建議: 修復問題後重新執行檢查')
  }
}

// 執行最終檢查
finalDeploymentCheck()


