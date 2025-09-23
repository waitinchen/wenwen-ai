#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWenwenDebugSprint() {
    console.log('🚀 測試高文文調試衝刺修復...');
    
    const testCases = [
        {
            name: '新 API 格式測試',
            body: {
                session_id: 'test-session-001',
                message: { 
                    role: 'user', 
                    content: '我想學美語' 
                },
                user_meta: {
                    external_id: 'user-123',
                    display_name: '測試用戶',
                    avatar_url: 'https://example.com/avatar.jpg'
                }
            },
            expected: '應該推薦肯塔基美語'
        },
        {
            name: '連續對話測試',
            body: {
                session_id: 'test-session-001', // 使用相同的 session_id
                message: { 
                    role: 'user', 
                    content: '有什麼推薦的餐廳嗎？' 
                },
                user_meta: {
                    external_id: 'user-123',
                    display_name: '測試用戶',
                    avatar_url: 'https://example.com/avatar.jpg'
                }
            },
            expected: '不應該推薦肯塔基美語'
        }
    ];

    let successCount = 0;
    let totalTests = testCases.length;

    for (const [index, testCase] of testCases.entries()) {
        console.log(`\n📝 測試 ${index + 1}: ${testCase.name}`);
        console.log('請求格式:', JSON.stringify(testCase.body, null, 2));
        
        try {
            const { data, error } = await supabase.functions.invoke('claude-chat', {
                body: testCase.body
            });

            if (error) {
                console.error('❌ Edge Function 錯誤:', error);
                continue;
            }

            const responseContent = data.data.response;
            console.log('✅ 回應:', responseContent.substring(0, 100) + '...');
            console.log('📋 Session ID:', data.data.sessionId);

            // 檢查預期結果
            if (testCase.expected === '應該推薦肯塔基美語') {
                if (responseContent.includes('肯塔基美語')) {
                    console.log('✅ 正確推薦肯塔基美語');
                    successCount++;
                } else {
                    console.log('❌ 沒有推薦肯塔基美語');
                }
            } else {
                if (!responseContent.includes('肯塔基美語')) {
                    console.log('✅ 正確沒有推薦肯塔基美語');
                    successCount++;
                } else {
                    console.log('❌ 錯誤推薦肯塔基美語');
                }
            }

        } catch (error) {
            console.error('❌ 測試失敗:', error.message);
        }
    }

    console.log('\n📊 測試結果:');
    console.log(`成功: ${successCount}/${totalTests}`);
    
    if (successCount === totalTests) {
        console.log('🎉 高文文調試衝刺修復成功！');
    } else {
        console.log('❌ 仍有問題需要修復');
    }

    // 測試特約商家功能
    console.log('\n🏪 測試特約商家功能...');
    try {
        const { data: storesData, error: storesError } = await supabase
            .from('stores')
            .select('id, store_name, is_partner_store')
            .limit(5);

        if (storesError) {
            console.error('❌ 查詢商家失敗:', storesError);
        } else {
            console.log('✅ 商家查詢成功');
            storesData.forEach(store => {
                console.log(`  - ${store.store_name}: is_partner_store = ${store.is_partner_store} (${typeof store.is_partner_store})`);
            });
        }
    } catch (error) {
        console.error('❌ 商家測試失敗:', error.message);
    }
}

testWenwenDebugSprint();
