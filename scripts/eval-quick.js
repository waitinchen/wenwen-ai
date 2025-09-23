#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function evalQuick() {
    console.log('🚀 快速驗收測試：Greeting 不重覆、Intent 正確');
    
    const testCases = [
        {
            name: '初次問候測試',
            message: '你好',
            expectedIntent: 'greeting',
            shouldHaveIntro: false, // 不應該有完整自介
            sessionId: 'eval-quick-001'
        },
        {
            name: '連續問候測試',
            message: '嗨',
            expectedIntent: 'greeting',
            shouldHaveIntro: false,
            sessionId: 'eval-quick-001' // 使用相同 session
        },
        {
            name: '美食推薦測試',
            message: '有什麼好吃的餐廳嗎？',
            expectedIntent: 'food_recommendation',
            shouldHaveIntro: false,
            sessionId: 'eval-quick-001'
        },
        {
            name: '特約商家查詢',
            message: '推薦特約商家',
            expectedIntent: 'partner_store',
            shouldHaveIntro: false,
            sessionId: 'eval-quick-001'
        }
    ];

    let passCount = 0;
    let totalTests = testCases.length;

    for (const [index, testCase] of testCases.entries()) {
        console.log(`\n📝 測試 ${index + 1}: ${testCase.name}`);
        console.log('訊息:', testCase.message);
        
        try {
            const { data, error } = await supabase.functions.invoke('claude-chat', {
                body: {
                    session_id: testCase.sessionId,
                    message: { 
                        role: 'user', 
                        content: testCase.message 
                    },
                    user_meta: {
                        external_id: 'eval-user-001',
                        display_name: '驗收測試用戶'
                    }
                }
            });

            if (error) {
                console.error('❌ Edge Function 錯誤:', error);
                continue;
            }

            const response = data.data.response;
            console.log('✅ 回應:', response.substring(0, 150) + '...');

            // 檢查 intent 正確性
            let intentCheck = false;
            switch (testCase.expectedIntent) {
                case 'greeting':
                    intentCheck = response.includes('哈囉') || response.includes('你好') || response.includes('嗨');
                    break;
                case 'food_recommendation':
                    intentCheck = response.includes('餐廳') || response.includes('美食') || response.includes('推薦');
                    break;
                case 'partner_store':
                    intentCheck = response.includes('特約') || response.includes('合作');
                    break;
            }

            // 檢查是否重複自介
            const hasLongIntro = response.length > 200 && (
                response.includes('我是高文文，23歲') || 
                response.includes('高雄女孩') ||
                response.includes('文山特區商圈的專屬客服助理')
            );

            if (testCase.shouldHaveIntro) {
                if (hasLongIntro) {
                    console.log('✅ 正確顯示自介');
                    passCount++;
                } else {
                    console.log('❌ 應該顯示自介但沒有');
                }
            } else {
                if (!hasLongIntro) {
                    console.log('✅ 正確沒有重複自介');
                    if (intentCheck) {
                        console.log('✅ Intent 識別正確');
                        passCount++;
                    } else {
                        console.log('❌ Intent 識別錯誤');
                    }
                } else {
                    console.log('❌ 不應該重複自介');
                }
            }

        } catch (error) {
            console.error('❌ 測試失敗:', error.message);
        }

        // 等待一秒避免請求過快
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n📊 快速驗收結果:');
    console.log(`通過: ${passCount}/${totalTests}`);
    
    if (passCount === totalTests) {
        console.log('🎉 快速驗收 PASS！Greeting 不重覆、Intent 正確');
    } else {
        console.log('❌ 快速驗收 FAIL，需要修復');
    }

    return passCount === totalTests;
}

evalQuick();
