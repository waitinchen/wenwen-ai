/**
 * 多標籤系統除錯測試驗收方案
 * 全面檢查系統各個環節的問題
 */

console.log('🔍 多標籤系統除錯測試驗收方案')
console.log('=' .repeat(60))

console.log('\n📋 測試驗收方案')
console.log('我們將從以下幾個層面進行全面檢查：')
console.log('')

console.log('🎯 第一層：意圖識別測試')
console.log('- 檢查 COVERAGE_STATS 意圖是否被正確識別')
console.log('- 驗證統計查詢關鍵字匹配')
console.log('- 確認意圖優先級順序')
console.log('')

console.log('🎯 第二層：資料庫查詢測試')
console.log('- 驗證 getStats() 方法是否正常工作')
console.log('- 檢查統計數據的準確性')
console.log('- 確認資料庫連接狀態')
console.log('')

console.log('🎯 第三層：標籤匹配測試')
console.log('- 檢查商家標籤數據完整性')
console.log('- 驗證 Required/Optional 標籤邏輯')
console.log('- 測試標籤匹配算法')
console.log('')

console.log('🎯 第四層：回應生成測試')
console.log('- 檢查統計回應模板')
console.log('- 驗證雙軌回應機制')
console.log('- 確認版本標識正確性')
console.log('')

console.log('🎯 第五層：端到端整合測試')
console.log('- 完整的用戶查詢流程測試')
console.log('- 檢查日誌記錄完整性')
console.log('- 驗證錯誤處理機制')
console.log('')

console.log('🚀 執行除錯測試：')
console.log('請在終端機中執行以下命令：')
console.log('')
console.log('node scripts/run-debug-tests.js')
console.log('')

console.log('📊 預期結果：')
console.log('- 每個測試都會顯示詳細的診斷信息')
console.log('- 識別具體的問題點')
console.log('- 提供修復建議')
console.log('- 驗證修復效果')
console.log('')

console.log('✅ 驗收標準：')
console.log('- 統計查詢正確識別為 COVERAGE_STATS 意圖')
console.log('- 返回準確的資料庫統計數據')
console.log('- 標籤匹配邏輯正常工作')
console.log('- 回應格式符合預期')
console.log('- 系統穩定無錯誤')
console.log('')

console.log('⚠️  常見問題檢查：')
console.log('1. 意圖識別優先級問題')
console.log('2. 關鍵字匹配邏輯錯誤')
console.log('3. 資料庫查詢失敗')
console.log('4. 標籤數據缺失')
console.log('5. 回應模板問題')
console.log('')

console.log('🔧 除錯工具：')
console.log('- 詳細的日誌輸出')
console.log('- 分步驟診斷')
console.log('- 問題定位和修復建議')
console.log('- 自動化測試驗證')
console.log('')

console.log('📞 需要幫助時：')
console.log('- 提供具體的錯誤訊息')
console.log('- 描述異常行為')
console.log('- 我會協助您分析問題')
console.log('')

console.log('⏭️  準備開始除錯...')
