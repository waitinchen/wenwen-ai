#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

async function deployToProduction() {
    console.log('🚀 開始部署到正式環境...');
    console.log('📍 目標: https://ai.linefans.cc');
    console.log('📅 部署時間:', new Date().toLocaleString());
    
    // 檢查建置文件
    if (!fs.existsSync('dist')) {
        console.log('❌ dist 目錄不存在，請先執行建置');
        console.log('📝 執行命令: npm run build:production');
        return false;
    }

    // 顯示部署指南
    console.log('\n📋 部署步驟指南:');
    console.log('\n1️⃣ 資料庫更新 (Supabase Dashboard):');
    console.log('   🔗 https://supabase.com/dashboard/project/vqcuwjfxoxjgsrueqodj/sql');
    console.log('   📝 執行 SQL:');
    console.log('      ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_partner_store BOOLEAN NOT NULL DEFAULT false;');
    console.log('      ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS user_meta TEXT;');

    console.log('\n2️⃣ Edge Function 部署 (Supabase Dashboard):');
    console.log('   🔗 https://supabase.com/dashboard/project/vqcuwjfxoxjgsrueqodj/functions');
    console.log('   📝 複製 scripts/complete-edge-function-code.ts 內容');
    console.log('   📝 貼到 claude-chat 函數編輯器');
    console.log('   📝 點擊「部署更新」');

    console.log('\n3️⃣ 前端文件上傳 (FileZilla):');
    console.log('   📁 本機路徑: C:\\Users\\waiti\\wenwen-ai\\dist\\');
    console.log('   📁 伺服器路徑: /www/wwwroot/ai.linefans.cc/');
    console.log('   📝 上傳所有 dist 目錄內容');

    console.log('\n4️⃣ 驗證部署:');
    console.log('   🔗 https://ai.linefans.cc');
    console.log('   📝 執行驗收測試: npm run eval:quick');
    console.log('   📝 執行驗收測試: npm run eval:partner');
    console.log('   📝 執行驗收測試: npm run eval:parking');

    // 顯示建置文件清單
    console.log('\n📦 待上傳文件清單:');
    try {
        const distFiles = fs.readdirSync('dist');
        distFiles.forEach(file => {
            const filePath = path.join('dist', file);
            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                console.log(`   📁 ${file}/ (目錄)`);
            } else {
                console.log(`   📄 ${file} (${Math.round(stats.size / 1024)}KB)`);
            }
        });
    } catch (error) {
        console.log('❌ 無法讀取 dist 目錄:', error.message);
    }

    // 生成部署檢查清單
    const checklist = {
        timestamp: new Date().toISOString(),
        steps: [
            '資料庫結構更新',
            'Edge Function 部署',
            '前端文件上傳',
            '功能驗證測試'
        ],
        files: fs.existsSync('dist') ? fs.readdirSync('dist') : [],
        verification: [
            'npm run eval:quick',
            'npm run eval:partner', 
            'npm run eval:parking'
        ]
    };

    fs.writeFileSync('deployment-checklist.json', JSON.stringify(checklist, null, 2));
    console.log('\n✅ 部署檢查清單已生成: deployment-checklist.json');

    console.log('\n🎯 部署準備完成！');
    console.log('📋 請按照上述步驟執行部署');
    console.log('🔍 部署完成後執行驗收測試確認功能正常');

    return true;
}

deployToProduction();
