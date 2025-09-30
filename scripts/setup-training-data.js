#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTrainingData() {
    console.log('🚀 開始設置訓練資料表...');
    
    try {
        // 1. 讀取 SQL 檔案
        console.log('\n📖 1. 讀取 SQL 檔案...');
        const sqlContent = fs.readFileSync('scripts/create-training-data-table.sql', 'utf8');
        console.log('✅ SQL 檔案讀取完成');
        
        // 2. 分割 SQL 語句
        const sqlStatements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`📝 找到 ${sqlStatements.length} 個 SQL 語句`);
        
        // 3. 執行 SQL 語句
        console.log('\n🔧 2. 執行 SQL 語句...');
        for (let i = 0; i < sqlStatements.length; i++) {
            const sql = sqlStatements[i];
            if (sql.toLowerCase().includes('select')) {
                // 查詢語句，顯示結果
                try {
                    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
                    if (error) {
                        console.log(`⚠️ 查詢語句 ${i + 1} 執行失敗:`, error.message);
                    } else {
                        console.log(`✅ 查詢語句 ${i + 1} 執行成功:`, data);
                    }
                } catch (e) {
                    console.log(`⚠️ 查詢語句 ${i + 1} 執行異常:`, e.message);
                }
            } else {
                // 非查詢語句，直接執行
                try {
                    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
                    if (error) {
                        console.log(`⚠️ SQL 語句 ${i + 1} 執行失敗:`, error.message);
                    } else {
                        console.log(`✅ SQL 語句 ${i + 1} 執行成功`);
                    }
                } catch (e) {
                    console.log(`⚠️ SQL 語句 ${i + 1} 執行異常:`, e.message);
                }
            }
        }
        
        // 4. 驗證表是否創建成功
        console.log('\n🔍 3. 驗證表創建結果...');
        try {
            const { data, error } = await supabase.from('training_data').select('*');
            if (error) {
                console.log('❌ training_data 表創建失敗:', error.message);
                console.log('\n💡 建議手動執行 SQL:');
                console.log('1. 前往 Supabase Dashboard');
                console.log('2. SQL Editor');
                console.log('3. 執行 scripts/create-training-data-table.sql 的內容');
                return false;
            } else {
                console.log(`✅ training_data 表創建成功，共 ${data.length} 筆資料`);
                
                if (data.length > 0) {
                    console.log('\n📋 訓練資料內容:');
                    data.forEach((item, i) => {
                        console.log(`${i + 1}. ${item.question}`);
                        console.log(`   答案: ${item.answer.substring(0, 100)}...`);
                        console.log(`   類別: ${item.category}, 關鍵詞: ${item.keywords?.join(', ')}`);
                        console.log(`   優先級: ${item.confidence_score}, 已驗證: ${item.is_verified}`);
                        console.log('---');
                    });
                }
            }
        } catch (e) {
            console.log('❌ 驗證失敗:', e.message);
            return false;
        }
        
        console.log('\n🎉 訓練資料表設置完成！');
        console.log('📋 下一步: 執行 npm run sync:training-data 同步到 Edge Function');
        
        return true;
        
    } catch (error) {
        console.error('❌ 設置過程中發生錯誤:', error.message);
        console.log('\n💡 建議手動執行 SQL:');
        console.log('1. 前往 Supabase Dashboard');
        console.log('2. SQL Editor');
        console.log('3. 執行 scripts/create-training-data-table.sql 的內容');
        return false;
    }
}

// 執行設置
setupTrainingData().then(success => {
    if (success) {
        console.log('\n✅ 設置成功完成！');
        process.exit(0);
    } else {
        console.log('\n❌ 設置失敗！');
        process.exit(1);
    }
});
