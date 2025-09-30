#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseEnv() {
    console.log('🔍 檢查 Supabase 環境設定...');
    
    try {
        // 測試 1: 檢查資料庫連接
        console.log('\n📝 1. 測試資料庫連接...');
        const { data: testData, error: testError } = await supabase
            .from('stores')
            .select('id, store_name')
            .limit(1);
        
        if (testError) {
            console.error('❌ 資料庫連接失敗:', testError.message);
            return false;
        }
        
        console.log('✅ 資料庫連接正常');
        console.log('測試資料:', testData);
        
        // 測試 2: 檢查表是否存在
        console.log('\n📝 2. 檢查必要的表是否存在...');
        
        const tables = ['user_profiles', 'chat_sessions', 'chat_messages'];
        for (const table of tables) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .limit(1);
                
                if (error) {
                    console.error(`❌ 表 ${table} 不存在或無法訪問:`, error.message);
                } else {
                    console.log(`✅ 表 ${table} 存在且可訪問`);
                }
            } catch (e) {
                console.error(`❌ 表 ${table} 檢查失敗:`, e.message);
            }
        }
        
        // 測試 3: 檢查 Service Role Key 權限
        console.log('\n📝 3. 檢查 Service Role Key 權限...');
        console.log('💡 請手動檢查：');
        console.log('1. 前往 Supabase Dashboard > Settings > API');
        console.log('2. 複製 Service Role Key');
        console.log('3. 前往 Edge Functions > claude-chat > Settings');
        console.log('4. 檢查環境變數是否包含：');
        console.log('   - CLAUDE_API_KEY');
        console.log('   - SUPABASE_URL');
        console.log('   - SUPABASE_ANON_KEY');
        console.log('   - SUPABASE_SERVICE_ROLE_KEY');
        
        return true;
        
    } catch (error) {
        console.error('❌ 檢查過程中發生錯誤:', error.message);
        return false;
    }
}

checkSupabaseEnv();
