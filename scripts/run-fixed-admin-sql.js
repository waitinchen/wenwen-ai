// 執行修復後的 admin 表 SQL
console.log('🔧 執行修復後的 admin 表 SQL');
console.log('============================================================');

console.log('📝 問題:');
console.log('============================================================');
console.log('❌ 錯誤: column "is_active" does not exist');
console.log('原因: admins 表可能已存在但缺少 is_active 欄位');

console.log('\n📝 解決方案:');
console.log('============================================================');
console.log('✅ 創建了修復版本的 SQL 腳本');
console.log('✅ 會檢查並添加缺失的欄位');
console.log('✅ 會創建所有必要的表和索引');

console.log('\n📝 請執行以下步驟:');
console.log('============================================================');

console.log('1. 在 SQL Editor 中清除之前的內容');
console.log('2. 複製 scripts/fix-admin-tables.sql 的內容');
console.log('3. 貼上到 SQL Editor');
console.log('4. 點擊 "Run" 執行');

console.log('\n📝 修復後的 SQL 腳本特點:');
console.log('============================================================');

console.log('✅ 會檢查 admins 表是否存在');
console.log('✅ 會檢查 is_active 欄位是否存在');
console.log('✅ 如果缺少欄位，會自動添加');
console.log('✅ 會創建所有必要的索引');
console.log('✅ 會創建外鍵約束');
console.log('✅ 會插入預設管理員帳號');
console.log('✅ 會設定 RLS 策略');
console.log('✅ 最後會驗證表結構');

console.log('\n📝 預期結果:');
console.log('============================================================');

console.log('✅ admins 表創建/修復成功');
console.log('✅ admin_sessions 表創建成功');
console.log('✅ is_active 欄位添加成功');
console.log('✅ 所有索引創建成功');
console.log('✅ 預設管理員帳號創建成功');
console.log('✅ RLS 策略設定成功');
console.log('✅ 表結構驗證通過');

console.log('\n============================================================');
console.log('🎯 請執行修復後的 SQL 腳本！');
console.log('這會解決 "is_active" 欄位不存在的問題。');
console.log('============================================================');
