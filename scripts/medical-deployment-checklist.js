console.log('🚀 MEDICAL 子分類與統計修復 - 上線清單');
console.log('=============================================\n');

console.log('📋 1. Intent 層修改 ✅');
console.log('   - 已在 IntentLanguageLayer.classifyIntent 加入 MEDICAL 子分類偵測');
console.log('   - 支援 藥局/藥妝/診所/牙醫 四種子分類');
console.log('   - confidence 提升至 0.85，避免被 FAQ 覆蓋\n');

console.log('📋 2. Recommendation 層修改 ✅');
console.log('   - 已在 fetchStoresByIntent MEDICAL case 套用子分類嚴格過濾');
console.log('   - 使用 features.secondary_category 與 tags 進行精準匹配');
console.log('   - 保留品牌名過濾與智能醫療標籤匹配\n');

console.log('📋 3. Tone 層修改 ✅');
console.log('   - 已在 generateServiceResponseContentOnly 加入子分類提示');
console.log('   - MEDICAL 回應會顯示子分類標籤');
console.log('   - 視覺標籤：藥局/藥妝/診所/牙醫\n');

console.log('📋 4. 資料庫修復 ⚠️ 需要執行');
console.log('   執行以下 SQL 腳本:');
console.log('   📄 scripts/fix-coverage-stats.sql');
console.log('   - 檢查/建欄位 & 修正 null');
console.log('   - 建必要索引（features GIN, category BTREE）');
console.log('   - 驗證統計數據不為 0\n');

console.log('📋 5. 驗收測試 ⚠️ 需要執行');
console.log('   執行以下測試腳本:');
console.log('   📄 scripts/test-medical-subcategory.js');
console.log('   - 8 項測試案例涵蓋所有子分類');
console.log('   - 包含回歸測試（食物/停車）');
console.log('   - 統計查詢驗證\n');

console.log('🎯 部署步驟:');
console.log('');
console.log('1️⃣ 執行資料庫修復');
console.log('   📍 前往 Supabase Dashboard → SQL Editor');
console.log('   📍 執行 scripts/fix-coverage-stats.sql');
console.log('   📍 確認統計數據不為 0\n');

console.log('2️⃣ 部署 Edge Function');
console.log('   📍 前往 Supabase Dashboard → Edge Functions → claude-chat');
console.log('   📍 複製 supabase/functions/claude-chat/index.ts 全部內容');
console.log('   📍 貼上並點擊 Deploy\n');

console.log('3️⃣ 執行驗收測試');
console.log('   📍 執行: node scripts/test-medical-subcategory.js');
console.log('   📍 確認 8/8 測試通過\n');

console.log('🔍 驗收重點:');
console.log('✅ MEDICAL 意圖能正確識別子分類');
console.log('✅ 推薦商家符合子分類（藥局/藥妝/診所/牙醫）');
console.log('✅ COVERAGE_STATS 統計數據不為 0');
console.log('✅ 品牌查詢（屈臣氏）走 MEDICAL 池');
console.log('✅ 回歸測試正常（食物/停車）\n');

console.log('🚨 風險控管:');
console.log('✅ 僅修改 Intent/Recommendation/Tone 三層');
console.log('✅ 不動資料層 API 介面');
console.log('✅ 有 Fallback 機制，不會空回');
console.log('✅ 可快速回退到原版本\n');

console.log('📞 問題排查:');
console.log('- 統計為 0 → 檢查資料庫欄位與數據');
console.log('- 子分類不準 → 檢查 features.secondary_category 與 tags');
console.log('- 意圖錯判 → 檢查關鍵字匹配邏輯');
console.log('- 回應錯誤 → 檢查 Tone 層修改\n');

console.log('🎉 完成後系統將具備:');
console.log('✨ 精準的 MEDICAL 子分類識別');
console.log('✨ 正確的統計數據顯示');
console.log('✨ 優化的醫療回應語氣');
console.log('✨ 完整的回歸測試覆蓋\n');

console.log('準備執行部署！🚀');
