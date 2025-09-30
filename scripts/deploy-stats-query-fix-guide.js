/**
 * 部署統計查詢修復指南
 * 修復統計查詢條件過於嚴格的問題
 */

console.log(`
🔧 部署統計查詢修復指南
======================

📋 問題分析:
❌ 統計查詢條件過於嚴格
   - 原本限制 approval = 'approved'
   - 但實際資料庫中 approval 欄位值可能不同
   - 導致查詢結果為 0

✅ 修復內容:
✅ 移除過於嚴格的 approval 條件
✅ 直接查詢所有商家資料
✅ 保持容錯機制

🎯 預期結果:
- 商家總數: 280 (與 admin 頁面一致)
- 安心店家: 16
- 優惠店家: 18
- 特約商家: 1
- 分類數: 11

🚀 部署步驟:

1. 登入 Supabase Dashboard
   https://supabase.com/dashboard
   
2. 進入您的專案
   選擇 "wenwen-ai" 專案
   
3. 進入 Edge Functions 頁面
   左側選單 → Edge Functions
   
4. 找到 claude-chat 函數
   點擊 claude-chat 函數
   
5. 部署新代碼
   點擊 "Deploy" 或 "Redeploy" 按鈕
   
6. 等待部署完成
   看到 "Deployed" 狀態
   
7. 測試修復效果
   運行: node scripts/test-stats-fix.js

✅ 完成！

📝 修復說明:
- 問題: 統計查詢條件過於嚴格，導致查詢結果為 0
- 原因: approval = 'approved' 條件不匹配實際資料
- 解決: 移除 approval 限制，直接查詢所有商家

🧪 驗收測試:
- 「你的商家資料有多少資料？」→ 正確回傳 280/16/18/1/11
- 統計數據與 admin/stores 頁面一致
- 不再顯示全部為 0 的統計數據

`);
