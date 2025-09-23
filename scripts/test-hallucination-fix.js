#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testHallucinationFix() {
    console.log('🧪 測試幻覺修復...');
    
    const testCases = [
        {
            query: '有什麼美食推薦?',
            expected: '不應該推薦肯塔基美語',
            category: '美食推薦'
        },
        {
            query: '有沒有在賣傢俱的',
            expected: '不應該推薦肯塔基美語',
            category: '傢俱推薦'
        },
        {
            query: '我想學美語',
            expected: '應該推薦肯塔基美語',
            category: '英語學習'
        },
        {
            query: '推薦補習班',
            expected: '應該推薦肯塔基美語',
            category: '補習班推薦'
        },
        {
            query: '文山特區有哪些推薦餐廳?',
            expected: '不應該推薦肯塔基美語',
            category: '餐廳推薦'
        }
    ];

    let successCount = 0;
    let totalTests = testCases.length;

    for (const [index, testCase] of testCases.entries()) {
        console.log(`\n📝 測試 ${index + 1}: "${testCase.query}" (${testCase.category})`);
        
        try {
            const { data, error } = await supabase.functions.invoke('claude-chat', {
                body: { message: testCase.query }
            });

            if (error) {
                console.error('❌ Edge Function 錯誤:', error);
                continue;
            }

            const responseContent = data.data.response;
            console.log('✅ 回應:', responseContent.substring(0, 100) + '...');

            // 檢查是否正確處理
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
        console.log('🎉 幻覺修復成功！高文文不再產生錯誤推薦！');
    } else {
        console.log('❌ 仍有問題需要修復');
    }
}

testHallucinationFix();
