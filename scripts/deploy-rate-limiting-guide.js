/**
 * Rate Limiting 部署指導
 */

console.log('🚀 Rate Limiting 功能部署指導')
console.log('=' .repeat(50))

console.log('\n✅ 第一步已完成：')
console.log('- 查詢快取功能 ✅')
console.log('- FAQ 同義詞功能 ✅')
console.log('- 分類統計視圖 ✅')
console.log('- 快取統計視圖 ✅')
console.log('')

console.log('📋 第二步：執行 Rate Limiting SQL')
console.log('1. 開啟 Supabase Dashboard')
console.log('   👉 https://supabase.com/dashboard')
console.log('')
console.log('2. 進入您的專案')
console.log('   👉 選擇 "wenwen-ai" 專案')
console.log('')
console.log('3. 進入 SQL Editor')
console.log('   👉 左側選單 → SQL Editor')
console.log('')
console.log('4. 執行 Rate Limiting SQL 腳本')
console.log('   👉 複製 scripts/add-rate-limiting.sql 的內容')
console.log('   👉 貼上到 SQL Editor')
console.log('   👉 點擊 "Run" 執行')
console.log('   👉 等待執行完成')
console.log('')

console.log('🔧 Rate Limiting 功能包含：')
console.log('- 創建 rate_limits 追蹤表')
console.log('- 實現 check_rate_limit 函數')
console.log('- 創建清理過期記錄的函數')
console.log('- 創建統計視圖')
console.log('')

console.log('✅ 預期效果：')
console.log('- 防止 API 濫用')
console.log('- 每 IP/Session 限制 5 req/10s')
console.log('- 自動清理過期記錄')
console.log('- 提供統計監控')
console.log('')

console.log('⏭️  請執行 Rate Limiting SQL 腳本...')
