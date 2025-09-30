#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSimpleEdgeFunction() {
    console.log('🔍 測試簡化的 Edge Function 調用...');
    
    try {
        // 發送一個簡單的測試請求
        const { data, error } = await supabase.functions.invoke('claude-chat', {
            body: {
                session_id: 'simple-test-' + Date.now(),
                message: { role: 'user', content: '你好' },
                user_meta: {
                    external_id: 'simple-test-user',
                    display_name: '簡單測試用戶'
                }
            }
        });
        
        if (error) {
            console.error('❌ Edge Function 調用失敗:', error.message);
            return false;
        }
        
        console.log('✅ Edge Function 調用成功');
        console.log('完整回應:', JSON.stringify(data, null, 2));
        
        // 檢查是否有 debug 資訊
        if (data?.data?.debug) {
            console.log('🔍 Debug 資訊:', data.data.debug);
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error.message);
        return false;
    }
}

testSimpleEdgeFunction();
