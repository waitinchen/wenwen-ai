#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testKentuckyIntegration() {
    console.log('🎯 肯塔基美語整合測試開始...');
    
    const testCases = [
        {
            name: 'A. 英語意圖測試',
            message: '想找美語補習班',
            expected: {
                hasKentucky: true,
                totalCount: '2-3',
                hasPartnerTag: true
            }
        },
        {
            name: 'B. 一般美食測試',
            message: '推薦晚餐餐廳',
            expected: {
                hasKentucky: false,
                totalCount: '≤3',
                hasPartnerTag: false
            }
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
                    session_id: `test-kentucky-${index + 1}`,
                    message: { 
                        role: 'user', 
                        content: testCase.message 
                    },
                    user_meta: {
                        external_id: `test-user-${index + 1}`,
                        display_name: '肯塔基測試用戶'
                    }
                }
            });

            if (error) {
                console.error('❌ Edge Function 錯誤:', error);
                continue;
            }

            const response = data.data.response;
            const recommendation = data.data.recommendation || [];
            
            console.log('✅ 回應:', response.substring(0, 100) + '...');
            console.log('📋 推薦清單:', recommendation.length, '家');
            recommendation.forEach((rec, i) => {
                console.log(`  ${i + 1}. ${rec.name} ${rec.is_partner_store ? '[特約商家]' : ''}`);
            });

            // 檢查預期結果
            let testPassed = true;

            if (testCase.name.includes('英語意圖')) {
                // A. 英語意圖測試
                const hasKentucky = recommendation.some(r => r.name.includes('肯塔基美語'));
                const hasPartnerTag = recommendation.some(r => r.is_partner_store);
                const totalCount = recommendation.length;

                if (hasKentucky) {
                    console.log('✅ 必含「肯塔基美語」');
                } else {
                    console.log('❌ 缺少「肯塔基美語」');
                    testPassed = false;
                }

                if (totalCount >= 2 && totalCount <= 3) {
                    console.log('✅ 推薦總數 2-3 家');
                } else {
                    console.log('❌ 推薦總數不符合 (2-3家)');
                    testPassed = false;
                }

                if (hasPartnerTag) {
                    console.log('✅ 有特約商家標記');
                } else {
                    console.log('❌ 沒有特約商家標記');
                    testPassed = false;
                }

            } else {
                // B. 一般美食測試
                const hasKentucky = recommendation.some(r => r.name.includes('肯塔基美語'));
                const totalCount = recommendation.length;

                if (!hasKentucky) {
                    console.log('✅ 不會硬插肯塔基');
                } else {
                    console.log('❌ 錯誤插入了肯塔基');
                    testPassed = false;
                }

                if (totalCount <= 3) {
                    console.log('✅ 推薦總數 ≤ 3 家');
                } else {
                    console.log('❌ 推薦總數超過 3 家');
                    testPassed = false;
                }
            }

            if (testPassed) {
                console.log('✅ 測試通過');
                passCount++;
            } else {
                console.log('❌ 測試失敗');
            }

        } catch (error) {
            console.error('❌ 測試失敗:', error.message);
        }

        // 等待一秒避免請求過快
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n📊 肯塔基整合測試結果:');
    console.log(`通過: ${passCount}/${totalTests}`);
    
    if (passCount === totalTests) {
        console.log('🎉 肯塔基美語整合測試 PASS！');
    } else {
        console.log('❌ 肯塔基美語整合測試 FAIL，需要修復');
    }

    return passCount === totalTests;
}

testKentuckyIntegration();
