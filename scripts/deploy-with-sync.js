#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

async function deployWithSync() {
    console.log('🚀 開始部署流程（包含訓練資料同步）...');
    
    try {
        // 1. 同步訓練資料
        console.log('\n📊 步驟 1: 同步訓練資料...');
        execSync('node scripts/sync-training-data.js', { stdio: 'inherit' });
        console.log('✅ 訓練資料同步完成');
        
        // 2. 檢查同步結果
        if (fs.existsSync('scripts/sync-report.json')) {
            const report = JSON.parse(fs.readFileSync('scripts/sync-report.json', 'utf8'));
            console.log(`📋 同步摘要: ${report.totalTrainingData} 筆資料, ${report.categoriesCount} 個類別`);
        }
        
        // 3. 生成部署說明
        console.log('\n📝 步驟 2: 生成部署說明...');
        const deployInstructions = `
# 訓練資料同步後的部署說明

## 已完成的步驟：
✅ 訓練資料已同步到 Edge Function
✅ 原始文件已備份
✅ 同步報告已生成

## 下一步操作：
1. 複製 scripts/index.ts 的內容
2. 前往 Supabase Dashboard > Edge Functions > claude-chat
3. 貼上更新後的代碼
4. 點擊 "Deploy" 按鈕

## 驗證步驟：
1. 測試英語相關問題
2. 確認推薦內容與訓練資料一致
3. 檢查地址資訊是否正確

## 備份文件：
${fs.existsSync('scripts/sync-report.json') ? 
  JSON.parse(fs.readFileSync('scripts/sync-report.json', 'utf8')).backupFile : '無'}

## 同步時間：
${new Date().toISOString()}
        `;
        
        fs.writeFileSync('scripts/deploy-instructions.md', deployInstructions);
        console.log('✅ 部署說明已生成: scripts/deploy-instructions.md');
        
        // 4. 顯示部署說明
        console.log('\n📋 部署說明:');
        console.log(deployInstructions);
        
        console.log('\n🎉 準備完成！請按照上述說明進行部署。');
        
    } catch (error) {
        console.error('❌ 部署流程失敗:', error.message);
        process.exit(1);
    }
}

deployWithSync();
