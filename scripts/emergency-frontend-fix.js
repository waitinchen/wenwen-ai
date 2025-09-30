#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function emergencyFix() {
    console.log('🚨 緊急修復：前端系統繁忙問題');
    
    // 測試 1: 基本調用
    console.log('\n📝 測試 1: 基本 Edge Function 調用');
    try {
        const { data, error } = await supabase.functions.invoke('claude-chat', {
            body: {
                session_id: 'emergency-test',
                message: { role: 'user', content: '你好' }
            }
        });
        
        console.log('📊 調用結果:');
        console.log('  - 錯誤:', error ? '有' : '無');
        console.log('  - 數據:', data ? '有' : '無');
        
        if (error) {
            console.log('❌ 錯誤詳情:', error.message);
            console.log('錯誤代碼:', error.status);
        }
        
        if (data) {
            console.log('✅ 數據結構:', Object.keys(data));
            if (data.data) {
                console.log('✅ 回應數據:', data.data.response ? '有' : '無');
            }
        }
        
    } catch (err) {
        console.error('❌ 異常:', err.message);
    }
    
    // 測試 2: 完整格式調用
    console.log('\n📝 測試 2: 完整格式調用');
    try {
        const { data, error } = await supabase.functions.invoke('claude-chat', {
            body: {
                session_id: 'emergency-test-full',
                message: { 
                    role: 'user', 
                    content: '有什麼美食推薦?' 
                },
                user_meta: {
                    external_id: 'emergency-user',
                    display_name: '緊急測試用戶',
                    avatar_url: null
                }
            }
        });
        
        console.log('📊 完整調用結果:');
        console.log('  - 錯誤:', error ? '有' : '無');
        console.log('  - 數據:', data ? '有' : '無');
        
        if (error) {
            console.log('❌ 錯誤詳情:', JSON.stringify(error, null, 2));
        }
        
        if (data && data.data) {
            console.log('✅ 回應長度:', data.data.response?.length || 0);
            console.log('✅ 推薦數量:', data.data.recommendation?.length || 0);
        }
        
    } catch (err) {
        console.error('❌ 異常:', err.message);
    }
    
    // 測試 3: 檢查 Edge Function 狀態
    console.log('\n📝 測試 3: 檢查 Edge Function 狀態');
    try {
        const response = await fetch('https://vqcuwjfxoxjgsrueqodj.supabase.co/functions/v1/claude-chat', {
            method: 'OPTIONS',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey
            }
        });
        
        console.log('📊 HTTP 狀態:', response.status);
        console.log('📊 CORS 標頭:', response.headers.get('Access-Control-Allow-Origin'));
        
    } catch (err) {
        console.error('❌ HTTP 測試異常:', err.message);
    }
    
    console.log('\n🔧 建議修復步驟:');
    console.log('1. 檢查 Supabase Dashboard > Functions > claude-chat 日誌');
    console.log('2. 確認環境變數 SUPABASE_SERVICE_ROLE_KEY 已設定');
    console.log('3. 檢查 Edge Function 是否正確部署');
    console.log('4. 重新部署 Edge Function 如果必要');
}

emergencyFix();
