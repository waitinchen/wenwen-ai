#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function quickTest() {
    console.log('🚀 快速功能測試...');
    
    // 測試 1: 英語查詢
    console.log('\n📝 測試英語查詢...');
    try {
        const { data, error } = await supabase.functions.invoke('claude-chat', {
            body: {
                session_id: 'quick-test-english',
                message: { role: 'user', content: '我想學美語' },
                user_meta: { external_id: 'test-user', display_name: '測試用戶' }
            }
        });
        
        if (error) {
            console.error('❌ 錯誤:', error.message);
        } else {
            console.log('✅ 調用成功');
            const response = data?.response || data?.data?.response || '無回應';
            const recommendations = data?.recommendation || data?.data?.recommendation || [];
            
            console.log('📝 AI 回應:', response.substring(0, 80) + '...');
            console.log('📋 推薦數量:', recommendations.length);
            
            if (recommendations.length > 0) {
                console.log('✅ 推薦清單不為空');
                recommendations.forEach((rec, i) => {
                    console.log(`  ${i + 1}. ${rec.name} ${rec.is_partner_store ? '[特約]' : ''}`);
                });
                
                const hasKentucky = recommendations.some(r => r.name?.includes('肯塔基'));
                if (hasKentucky) {
                    console.log('✅ 包含肯塔基美語');
                } else {
                    console.log('❌ 缺少肯塔基美語');
                }
            } else {
                console.log('❌ 推薦清單為空');
            }
        }
    } catch (err) {
        console.error('❌ 測試失敗:', err.message);
    }
    
    // 測試 2: 一般查詢
    console.log('\n📝 測試一般查詢...');
    try {
        const { data, error } = await supabase.functions.invoke('claude-chat', {
            body: {
                session_id: 'quick-test-general',
                message: { role: 'user', content: '推薦美食' },
                user_meta: { external_id: 'test-user2', display_name: '美食愛好者' }
            }
        });
        
        if (error) {
            console.error('❌ 錯誤:', error.message);
        } else {
            console.log('✅ 調用成功');
            const response = data?.response || data?.data?.response || '無回應';
            const recommendations = data?.recommendation || data?.data?.recommendation || [];
            
            console.log('📝 AI 回應:', response.substring(0, 80) + '...');
            console.log('📋 推薦數量:', recommendations.length);
            
            if (recommendations.length > 0) {
                console.log('✅ 推薦清單不為空');
                recommendations.forEach((rec, i) => {
                    console.log(`  ${i + 1}. ${rec.name} ${rec.is_partner_store ? '[特約]' : ''}`);
                });
            } else {
                console.log('❌ 推薦清單為空');
            }
        }
    } catch (err) {
        console.error('❌ 測試失敗:', err.message);
    }
    
    // 測試 3: 檢查對話記錄
    console.log('\n📝 檢查對話記錄...');
    try {
        const { data: sessions, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .limit(3);
        
        if (error) {
            console.error('❌ 查詢失敗:', error.message);
        } else {
            console.log(`✅ 找到 ${sessions.length} 筆會話記錄`);
            if (sessions.length > 0) {
                console.log('✅ 對話記錄功能正常');
            } else {
                console.log('❌ 沒有對話記錄');
            }
        }
    } catch (err) {
        console.error('❌ 測試失敗:', err.message);
    }
    
    console.log('\n🎉 快速測試完成！');
}

quickTest();
