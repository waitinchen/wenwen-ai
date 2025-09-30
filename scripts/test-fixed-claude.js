#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFixedClaude() {
    console.log('🔍 測試修復後的 Claude API...');
    
    try {
        const { data, error } = await supabase.functions.invoke('claude-chat', {
            body: {
                session_id: 'test-fixed-' + Date.now(),
                message: { role: 'user', content: '你好' },
                user_meta: {
                    external_id: 'test-fixed-user',
                    display_name: '修復測試用戶'
                }
            }
        });
        
        if (error) {
            console.error('❌ 修復測試失敗:', error);
            return false;
        }
        
        console.log('✅ 修復測試成功！');
        console.log('回應:', data?.response?.substring(0, 100) + '...');
        console.log('推薦清單:', data?.recommendation?.length || 0, '家');
        
        return true;
        
    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error.message);
        return false;
    }
}

testFixedClaude();
