// 實施商家多標籤系統資料庫結構
console.log('🗄️ 實施商家多標籤系統資料庫結構...')

async function implementDatabaseSchema() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('📊 讀取 SQL 腳本...')
    
    // 讀取 SQL 腳本
    const fs = await import('fs')
    const path = await import('path')
    
    const sqlScript = fs.readFileSync(
      path.join(process.cwd(), 'scripts', 'design-database-schema.sql'), 
      'utf8'
    )
    
    console.log('✅ SQL 腳本讀取成功')
    console.log(`📝 腳本長度: ${sqlScript.length} 字`)
    
    console.log('\n🚀 執行資料庫結構創建...')
    
    // 將 SQL 腳本分割成單獨的語句執行
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📋 找到 ${statements.length} 個 SQL 語句`)
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      if (statement.length < 10) continue // 跳過太短的語句
      
      try {
        console.log(`\n🔧 執行語句 ${i + 1}/${statements.length}...`)
        console.log(`📝 語句預覽: ${statement.substring(0, 100)}...`)
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.error(`❌ 語句 ${i + 1} 執行失敗:`, error.message)
          errorCount++
        } else {
          console.log(`✅ 語句 ${i + 1} 執行成功`)
          successCount++
        }
        
      } catch (error) {
        console.error(`❌ 語句 ${i + 1} 執行異常:`, error.message)
        errorCount++
      }
      
      // 避免請求過於頻繁
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log(`\n🎉 資料庫結構創建完成！`)
    console.log(`📊 執行結果:`)
    console.log(`   成功: ${successCount} 個語句`)
    console.log(`   失敗: ${errorCount} 個語句`)
    console.log(`   成功率: ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%`)
    
    if (errorCount > 0) {
      console.log('\n⚠️ 注意: 某些語句執行失敗，可能是因為:')
      console.log('   • 表已存在')
      console.log('   • 權限不足')
      console.log('   • 語法錯誤')
      console.log('   建議手動檢查 Supabase Dashboard 中的表結構')
    }
    
    // 驗證表是否創建成功
    console.log('\n🔍 驗證表結構...')
    
    const tablesToCheck = ['tags', 'store_tags', 'tag_groups']
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ ${tableName} 表不存在或無權限訪問`)
        } else {
          console.log(`✅ ${tableName} 表創建成功`)
        }
      } catch (e) {
        console.log(`❌ ${tableName} 表檢查失敗: ${e.message}`)
      }
    }
    
    console.log('\n📋 下一步建議:')
    console.log('1. 檢查 Supabase Dashboard 中的表結構')
    console.log('2. 手動執行失敗的 SQL 語句')
    console.log('3. 驗證權限設置')
    console.log('4. 開始遷移現有標籤數據')
    
  } catch (error) {
    console.error('❌ 實施異常:', error)
    console.log('\n💡 替代方案:')
    console.log('1. 手動在 Supabase Dashboard 中執行 SQL 腳本')
    console.log('2. 使用 Supabase CLI 執行')
    console.log('3. 分步驟創建表和數據')
  }
}

implementDatabaseSchema()

