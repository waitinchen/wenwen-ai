#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('🔍 檢查資料庫中的表...');
    
    // 嘗試查詢常見的表
    const tables = ['stores', 'chat_sessions', 'chat_messages', 'user_profiles', 'training_data', 'faqs'];
    
    for (const table of tables) {
        try {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            if (error) {
                console.log(`❌ ${table}: ${error.message}`);
            } else {
                console.log(`✅ ${table}: 存在 (${data.length} 筆資料)`);
            }
        } catch (e) {
            console.log(`❌ ${table}: 查詢異常`);
        }
    }
    
    // 特別檢查訓練資料表
    console.log('\n🔍 特別檢查訓練資料表...');
    try {
        const { data, error } = await supabase.from('training_data').select('*');
        if (error) {
            console.log('❌ training_data 表不存在或無法訪問');
            console.log('💡 建議：需要創建 training_data 表');
        } else {
            console.log(`✅ training_data 表存在，共 ${data.length} 筆資料`);
            if (data.length > 0) {
                console.log('📋 前3筆資料:');
                data.slice(0, 3).forEach((item, i) => {
                    console.log(`  ${i + 1}. ${item.question} -> ${item.answer.substring(0, 50)}...`);
                });
            }
        }
    } catch (e) {
        console.log('❌ training_data 表查詢失敗:', e.message);
    }
}

checkTables();
