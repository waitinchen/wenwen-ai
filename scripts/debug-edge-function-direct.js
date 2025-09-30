#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugEdgeFunction() {
    console.log('🔍 直接診斷 Edge Function 問題...');
    
    try {
        // 嘗試不同的調用方式
        console.log('\n📝 測試 1: 基本調用');
        const response1 = await fetch(`${supabaseUrl}/functions/v1/claude-chat`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                session_id: 'debug-test',
                message: { role: 'user', content: '測試' },
                user_meta: {
                    external_id: 'debug-user',
                    display_name: '調試用戶'
                }
            })
        });
        
        console.log('狀態碼:', response1.status);
        console.log('狀態文字:', response1.statusText);
        
        const responseText = await response1.text();
        console.log('回應內容:', responseText);
        
        if (response1.ok) {
            console.log('✅ Edge Function 基本調用成功');
            return true;
        } else {
            console.log('❌ Edge Function 調用失敗');
            
            // 嘗試解析錯誤
            try {
                const errorData = JSON.parse(responseText);
                console.log('錯誤詳情:', JSON.stringify(errorData, null, 2));
            } catch (e) {
                console.log('無法解析錯誤回應');
            }
            
            return false;
        }
        
    } catch (error) {
        console.error('❌ 診斷過程中發生錯誤:', error.message);
        return false;
    }
}

debugEdgeFunction();
