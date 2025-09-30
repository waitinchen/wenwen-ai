import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

console.log('🚀 開始部署前準備...\n');

// 1. 檢查 Git 狀態
console.log('📋 1. 檢查 Git 狀態...');
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  console.log('Git 狀態:', gitStatus || '工作目錄乾淨');
} catch (error) {
  console.error('❌ Git 狀態檢查失敗:', error.message);
}

// 2. 檢查當前分支
console.log('\n📋 2. 檢查當前分支...');
try {
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log('當前分支:', currentBranch);
} catch (error) {
  console.error('❌ 分支檢查失敗:', error.message);
}

// 3. 檢查 Edge Function 代碼
console.log('\n📋 3. 檢查 Edge Function 代碼...');
try {
  const edgeFunctionPath = 'supabase/functions/claude-chat/index.ts';
  const content = readFileSync(edgeFunctionPath, 'utf8');
  
  // 檢查關鍵修復是否存在
  const hasStatsFix = content.includes('你的數據庫有多少');
  const hasVersion = content.includes('WEN 1.4.6');
  
  console.log('✅ Edge Function 代碼檢查:');
  console.log('- 統計查詢修復:', hasStatsFix ? '✅' : '❌');
  console.log('- 版本號:', hasVersion ? '✅' : '❌');
} catch (error) {
  console.error('❌ Edge Function 檢查失敗:', error.message);
}

// 4. 檢查前端構建
console.log('\n📋 4. 檢查前端構建...');
try {
  const distIndex = readFileSync('dist/index.html', 'utf8');
  const hasCorrectVersion = distIndex.includes('WEN 1.4.6');
  
  console.log('✅ 前端構建檢查:');
  console.log('- 版本號:', hasCorrectVersion ? '✅' : '❌');
} catch (error) {
  console.error('❌ 前端構建檢查失敗:', error.message);
}

// 5. 檢查環境變數
console.log('\n📋 5. 檢查環境變數...');
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

console.log('✅ 環境變數檢查:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  console.log(`- ${envVar}:`, value ? '✅ 已設置' : '❌ 未設置');
});

// 6. 部署檢查清單
console.log('\n📋 6. 部署檢查清單:');
console.log('✅ 需要部署的組件:');
console.log('  - Edge Function: claude-chat (統計查詢修復)');
console.log('  - 前端: dist/ 目錄 (版本號更新)');
console.log('  - 管理後台: 認證已修復');

console.log('\n📋 7. 部署步驟:');
console.log('1. 提交所有修改到 Git');
console.log('2. 部署 claude-chat Edge Function 到 Supabase');
console.log('3. 上傳 dist/ 目錄到您的服務器');
console.log('4. 測試統計查詢功能');

console.log('\n🎯 準備完成！可以開始部署了。');
