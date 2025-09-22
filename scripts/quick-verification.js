// 快速驗收腳本 - 檢查部署準備狀態
import fs from 'fs';
import path from 'path';

console.log('🔍 開始快速驗收檢查...\n');

// 檢查項目
const checks = [
  {
    name: '版本號更新',
    check: () => {
      const versionFile = path.join(process.cwd(), 'src/config/version.ts');
      const content = fs.readFileSync(versionFile, 'utf8');
      return content.includes('WEN 1.0.1') && content.includes('20250122-008');
    }
  },
  {
    name: '構建檔案存在',
    check: () => {
      const distPath = path.join(process.cwd(), 'dist');
      return fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'));
    }
  },
  {
    name: '停車場資料載入',
    check: () => {
      const parkingFile = path.join(process.cwd(), 'src/data/parkingLots.json');
      if (!fs.existsSync(parkingFile)) return false;
      const data = JSON.parse(fs.readFileSync(parkingFile, 'utf8'));
      return data.length > 0;
    }
  },
  {
    name: 'flows 配置檔案',
    check: () => {
      const flowsFile = path.join(process.cwd(), 'flows/policies.json');
      if (!fs.existsSync(flowsFile)) return false;
      const data = JSON.parse(fs.readFileSync(flowsFile, 'utf8'));
      return data.branching && data.branching.parking_query;
    }
  },
  {
    name: 'FAQ 更新',
    check: () => {
      const faqFile = path.join(process.cwd(), 'faq/transport.jsonl');
      if (!fs.existsSync(faqFile)) return false;
      const content = fs.readFileSync(faqFile, 'utf8');
      return content.includes('parking_query') && content.includes('停車場');
    }
  },
  {
    name: 'AI 提示詞更新',
    check: () => {
      const aiFile = path.join(process.cwd(), 'supabase/functions/claude-chat/index.ts');
      const content = fs.readFileSync(aiFile, 'utf8');
      return content.includes('停車場推薦功能') && content.includes('導航選項');
    }
  }
];

// 執行檢查
let passedChecks = 0;
let totalChecks = checks.length;

console.log('📋 檢查項目:');
checks.forEach((check, index) => {
  try {
    const result = check.check();
    console.log(`${index + 1}. ${check.name}: ${result ? '✅ 通過' : '❌ 失敗'}`);
    if (result) passedChecks++;
  } catch (error) {
    console.log(`${index + 1}. ${check.name}: ❌ 錯誤 - ${error.message}`);
  }
});

// 檢查 dist 目錄大小
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath, { recursive: true });
  console.log(`\n📊 構建檔案統計:`);
  console.log(`- 總檔案數: ${files.length}`);
  console.log(`- 主要檔案: index.html, assets/ 目錄`);
}

// 檢查停車場資料統計
const parkingFile = path.join(process.cwd(), 'src/data/parkingLots.json');
if (fs.existsSync(parkingFile)) {
  const data = JSON.parse(fs.readFileSync(parkingFile, 'utf8'));
  console.log(`\n🚗 停車場資料統計:`);
  console.log(`- 總停車場數: ${data.length}`);
  console.log(`- 公有停車場: ${data.filter(lot => lot.type === 'public').length}`);
  console.log(`- 民營停車場: ${data.filter(lot => lot.type === 'private').length}`);
  console.log(`- 24小時停車場: ${data.filter(lot => lot.is24Hours).length}`);
}

// 驗收結果
console.log('\n🎯 驗收結果:');
console.log(`✅ 通過: ${passedChecks}/${totalChecks}`);
console.log(`❌ 失敗: ${totalChecks - passedChecks}/${totalChecks}`);
console.log(`📈 成功率: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`);

if (passedChecks === totalChecks) {
  console.log('\n🎉 所有檢查通過！準備部署到正式環境！');
  console.log('\n📋 下一步:');
  console.log('1. 使用 FileZilla 上傳 dist/ 目錄到 GCP');
  console.log('2. 訪問 https://ai.linefans.cc 驗證');
  console.log('3. 測試高文文停車場功能');
  console.log('4. 檢查管理後台正常運作');
} else {
  console.log('\n⚠️ 部分檢查失敗，請修正後重新部署。');
}

console.log('\n💡 部署檢查清單已生成: DEPLOYMENT_CHECKLIST.md');
