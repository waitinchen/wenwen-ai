#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

async function deployEdgeFunction() {
    console.log('🚀 準備 Edge Function 部署...');
    
    try {
        // 1. 讀取 WEN 1.0.8 代碼
        const edgeFunctionCode = fs.readFileSync('scripts/complete-edge-function-code-wen108.ts', 'utf8');
        
        // 2. 複製到剪貼板（Windows）
        try {
            execSync(`powershell "Get-Content scripts\\complete-edge-function-code-wen108.ts | Set-Clipboard"`, { stdio: 'inherit' });
            console.log('✅ 代碼已複製到剪貼板！');
        } catch (error) {
            console.log('⚠️  無法自動複製到剪貼板，請手動複製');
        }
        
        // 3. 顯示部署指引
        console.log('\n📋 部署步驟：');
        console.log('1. 前往：https://supabase.com/dashboard/project/vqcuwjfxoxjgsrueqodj/functions');
        console.log('2. 找到 claude-chat 函數並點擊「編輯」');
        console.log('3. 全選舊代碼並刪除');
        console.log('4. 貼上剪貼板中的新代碼（Ctrl+V）');
        console.log('5. 點擊「部署更新」');
        console.log('6. 等待部署完成');
        
        // 4. 顯示代碼前 10 行確認
        console.log('\n📝 代碼預覽（前 10 行）：');
        const lines = edgeFunctionCode.split('\n');
        lines.slice(0, 10).forEach((line, index) => {
            console.log(`${index + 1}: ${line}`);
        });
        
        console.log('\n🎯 部署完成後執行：npm run test:kentucky');
        
    } catch (error) {
        console.error('❌ 準備部署時發生錯誤:', error.message);
    }
}

deployEdgeFunction();
