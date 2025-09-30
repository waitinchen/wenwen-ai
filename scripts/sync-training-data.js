#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncTrainingData() {
    console.log('🔄 開始同步訓練資料到 Edge Function...');
    
    try {
        // 1. 從資料庫獲取所有啟用的訓練資料
        console.log('\n📊 1. 獲取訓練資料...');
        const { data: trainingData, error } = await supabase
            .from('training_data')
            .select('*')
            .eq('is_verified', true)
            .order('confidence_score', { ascending: false });
        
        if (error) {
            console.error('❌ 獲取訓練資料失敗:', error.message);
            return false;
        }
        
        console.log(`✅ 找到 ${trainingData.length} 筆訓練資料`);
        
        // 2. 按類別分組訓練資料
        const groupedData = {};
        trainingData.forEach(item => {
            const category = item.category || '其他';
            if (!groupedData[category]) {
                groupedData[category] = [];
            }
            groupedData[category].push(item);
        });
        
        // 3. 生成 System Prompt 片段
        console.log('\n📝 2. 生成 System Prompt 片段...');
        let trainingDataSection = '\n\n**訓練資料知識庫：**\n';
        
        Object.keys(groupedData).forEach(category => {
            trainingDataSection += `\n**${category}相關問題：**\n`;
            groupedData[category].forEach(item => {
                trainingDataSection += `- 問題：「${item.question}」\n`;
                trainingDataSection += `  答案：「${item.answer}」\n`;
                if (item.keywords && item.keywords.length > 0) {
                    trainingDataSection += `  關鍵詞：${item.keywords.join(', ')}\n`;
                }
                trainingDataSection += `  優先級：${item.confidence_score}\n\n`;
            });
        });
        
        // 4. 讀取現有的 Edge Function 代碼
        console.log('\n📖 3. 讀取 Edge Function 代碼...');
        const edgeFunctionPath = 'scripts/index.ts';
        let edgeFunctionCode = fs.readFileSync(edgeFunctionPath, 'utf8');
        
        // 5. 找到 System Prompt 的位置並更新
        console.log('\n✏️ 4. 更新 System Prompt...');
        const systemPromptStart = edgeFunctionCode.indexOf('const systemPrompt = `');
        const systemPromptEnd = edgeFunctionCode.indexOf('`;', systemPromptStart);
        
        if (systemPromptStart === -1 || systemPromptEnd === -1) {
            console.error('❌ 找不到 System Prompt 的位置');
            return false;
        }
        
        // 提取現有的 System Prompt
        const existingSystemPrompt = edgeFunctionCode.substring(systemPromptStart, systemPromptEnd + 2);
        
        // 檢查是否已經包含訓練資料部分
        if (existingSystemPrompt.includes('**訓練資料知識庫：**')) {
            console.log('⚠️ System Prompt 已經包含訓練資料，跳過更新');
            return true;
        }
        
        // 在 System Prompt 末尾添加訓練資料
        const newSystemPrompt = existingSystemPrompt.slice(0, -2) + trainingDataSection + '`;';
        
        // 6. 更新 Edge Function 代碼
        const newEdgeFunctionCode = edgeFunctionCode.substring(0, systemPromptStart) + 
                                   newSystemPrompt + 
                                   edgeFunctionCode.substring(systemPromptEnd + 2);
        
        // 7. 備份原始文件
        const backupPath = `scripts/index.ts.backup.${Date.now()}`;
        fs.writeFileSync(backupPath, edgeFunctionCode);
        console.log(`✅ 已備份原始文件: ${backupPath}`);
        
        // 8. 寫入更新後的代碼
        fs.writeFileSync(edgeFunctionPath, newEdgeFunctionCode);
        console.log('✅ 已更新 Edge Function 代碼');
        
        // 9. 生成同步報告
        const syncReport = {
            timestamp: new Date().toISOString(),
            totalTrainingData: trainingData.length,
            categories: Object.keys(groupedData),
            categoriesCount: Object.keys(groupedData).length,
            backupFile: backupPath,
            status: 'success'
        };
        
        fs.writeFileSync('scripts/sync-report.json', JSON.stringify(syncReport, null, 2));
        console.log('✅ 已生成同步報告: scripts/sync-report.json');
        
        console.log('\n🎉 訓練資料同步完成！');
        console.log('📋 同步摘要:');
        console.log(`   - 總共 ${trainingData.length} 筆訓練資料`);
        console.log(`   - 涵蓋 ${Object.keys(groupedData).length} 個類別`);
        console.log(`   - 備份文件: ${backupPath}`);
        console.log('\n💡 下一步: 重新部署 Edge Function 以應用更新');
        
        return true;
        
    } catch (error) {
        console.error('❌ 同步過程中發生錯誤:', error.message);
        return false;
    }
}

// 執行同步
syncTrainingData().then(success => {
    if (success) {
        console.log('\n✅ 同步成功完成！');
        process.exit(0);
    } else {
        console.log('\n❌ 同步失敗！');
        process.exit(1);
    }
});
