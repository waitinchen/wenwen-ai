#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function preDeploymentCheck() {
    console.log('🔍 部署前檢查開始...');
    console.log('📍 目標環境: https://ai.linefans.cc (正式環境)');
    console.log('📅 檢查時間:', new Date().toLocaleString());
    
    let checkResults = {
        codeStatus: false,
        databaseStatus: false,
        edgeFunctionStatus: false,
        environmentStatus: false
    };

    // 1. 檢查代碼完整性
    console.log('\n📋 1. 檢查代碼完整性...');
    const requiredFiles = [
        'scripts/complete-edge-function-code.ts',
        'scripts/eval-quick.js',
        'scripts/eval-partner.js', 
        'scripts/eval-parking.js',
        'src/lib/api.ts',
        'src/components/ChatInterface.tsx',
        'src/components/admin/ConversationHistoryManager.tsx'
    ];

    let missingFiles = [];
    requiredFiles.forEach(file => {
        if (!fs.existsSync(file)) {
            missingFiles.push(file);
        }
    });

    if (missingFiles.length === 0) {
        console.log('✅ 所有必要文件存在');
        checkResults.codeStatus = true;
    } else {
        console.log('❌ 缺少文件:', missingFiles.join(', '));
    }

    // 2. 檢查資料庫結構
    console.log('\n📊 2. 檢查資料庫結構...');
    try {
        // 檢查 stores 表是否有 is_partner_store 欄位
        const { data: storesData, error: storesError } = await supabase
            .from('stores')
            .select('is_partner_store')
            .limit(1);

        if (storesError && storesError.message.includes('column "is_partner_store" does not exist')) {
            console.log('⚠️  需要添加 is_partner_store 欄位');
            console.log('📝 SQL 命令:');
            console.log('   ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_partner_store BOOLEAN NOT NULL DEFAULT false;');
        } else if (storesError) {
            console.log('❌ 資料庫查詢錯誤:', storesError.message);
        } else {
            console.log('✅ is_partner_store 欄位存在');
            checkResults.databaseStatus = true;
        }

        // 檢查 chat_sessions 表是否有 user_meta 欄位
        const { data: sessionsData, error: sessionsError } = await supabase
            .from('chat_sessions')
            .select('user_meta')
            .limit(1);

        if (sessionsError && sessionsError.message.includes('column "user_meta" does not exist')) {
            console.log('⚠️  需要添加 user_meta 欄位');
            console.log('📝 SQL 命令:');
            console.log('   ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS user_meta TEXT;');
        } else if (sessionsError) {
            console.log('❌ chat_sessions 查詢錯誤:', sessionsError.message);
        } else {
            console.log('✅ user_meta 欄位存在');
        }

    } catch (error) {
        console.log('❌ 資料庫檢查失敗:', error.message);
    }

    // 3. 檢查 Edge Function 狀態
    console.log('\n⚡ 3. 檢查 Edge Function 狀態...');
    try {
        const { data, error } = await supabase.functions.invoke('claude-chat', {
            body: {
                session_id: 'pre-deployment-test',
                message: { 
                    role: 'user', 
                    content: '測試連接' 
                },
                user_meta: {
                    external_id: 'pre-deploy-test',
                    display_name: '部署前測試'
                }
            }
        });

        if (error) {
            console.log('❌ Edge Function 錯誤:', error.message);
            console.log('📝 需要重新部署 Edge Function');
        } else {
            console.log('✅ Edge Function 正常回應');
            checkResults.edgeFunctionStatus = true;
        }
    } catch (error) {
        console.log('❌ Edge Function 測試失敗:', error.message);
    }

    // 4. 檢查環境變數
    console.log('\n🔧 4. 檢查環境變數...');
    const envFile = '.env.local';
    if (fs.existsSync(envFile)) {
        console.log('✅ .env.local 文件存在');
        checkResults.environmentStatus = true;
    } else {
        console.log('⚠️  .env.local 文件不存在');
        console.log('📝 需要確保環境變數正確設置');
    }

    // 5. 檢查建置狀態
    console.log('\n🏗️  5. 檢查建置狀態...');
    const distDir = 'dist';
    if (fs.existsSync(distDir)) {
        const files = fs.readdirSync(distDir);
        console.log(`✅ dist 目錄存在，包含 ${files.length} 個文件`);
    } else {
        console.log('⚠️  dist 目錄不存在，需要執行建置');
        console.log('📝 執行命令: npm run build');
    }

    // 總結
    console.log('\n📊 部署前檢查總結:');
    console.log(`代碼完整性: ${checkResults.codeStatus ? '✅' : '❌'}`);
    console.log(`資料庫結構: ${checkResults.databaseStatus ? '✅' : '⚠️ '}`);
    console.log(`Edge Function: ${checkResults.edgeFunctionStatus ? '✅' : '❌'}`);
    console.log(`環境變數: ${checkResults.environmentStatus ? '✅' : '⚠️ '}`);

    const allReady = Object.values(checkResults).every(status => status === true);
    
    if (allReady) {
        console.log('\n🎉 部署前檢查通過！可以開始部署');
        return true;
    } else {
        console.log('\n⚠️  部署前檢查未完全通過，請修復問題後再部署');
        return false;
    }
}

preDeploymentCheck();
