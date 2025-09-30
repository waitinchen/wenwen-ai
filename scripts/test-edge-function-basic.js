#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEdgeFunctionBasic() {
    console.log('🔍 測試 Edge Function 基本功能...');
    
    try {
        // 測試 1: 簡單的 hello 請求
        console.log('\n📝 測試 1: 簡單 hello 請求');
        const { data, error } = await supabase.functions.invoke('claude-chat', {
            body: {
                session_id: 'basic-test-' + Date.now(),
                message: { role: 'user', content: '你好' },
                user_meta: {
                    external_id: 'basic-test-user',
                    display_name: '基本測試用戶'
                }
            }
        });
        
        console.log('錯誤:', error);
        console.log('資料:', JSON.stringify(data, null, 2));
        
        if (error) {
            console.error('❌ Edge Function 調用失敗:', error.message);
            return false;
        }
        
        if (!data) {
            console.error('❌ Edge Function 沒有返回資料');
            return false;
        }
        
        if (data.error) {
            console.error('❌ Edge Function 返回錯誤:', data.error);
            return false;
        }
        
        console.log('✅ Edge Function 基本功能正常');
        console.log('回應:', data.response?.substring(0, 100) + '...');
        
        return true;
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error.message);
        return false;
    }
}

testEdgeFunctionBasic();
