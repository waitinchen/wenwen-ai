#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBasicFunction() {
    console.log('🔍 測試最簡化 Edge Function...');
    
    try {
        const { data, error } = await supabase.functions.invoke('claude-chat', {
            body: {
                test: true
            }
        });
        
        if (error) {
            console.error('❌ 最簡化測試失敗:', error);
            return false;
        }
        
        console.log('✅ 最簡化測試成功！');
        console.log('回應資料:', JSON.stringify(data, null, 2));
        
        return true;
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error.message);
        return false;
    }
}

testBasicFunction();
