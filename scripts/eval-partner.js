#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function evalPartner() {
    console.log('🏪 特約商家驗收測試：特約生效且列出多家');
    
    // 首先檢查資料庫中的特約商家
    console.log('\n📊 檢查資料庫中的特約商家...');
    try {
        const { data: storesData, error: storesError } = await supabase
            .from('stores')
            .select('id, store_name, is_partner_store')
            .eq('is_partner_store', true);

        if (storesError) {
            console.error('❌ 查詢特約商家失敗:', storesError);
        } else {
            console.log(`✅ 找到 ${storesData.length} 家特約商家:`);
            storesData.forEach(store => {
                console.log(`  - ${store.store_name} (ID: ${store.id})`);
            });
        }
    } catch (error) {
        console.error('❌ 資料庫查詢失敗:', error.message);
    }

    const testCases = [
        {
            name: '特約商家查詢測試',
            message: '推薦特約商家',
            expectedFeatures: ['特約', '多家推薦', '優先顯示'],
            sessionId: 'eval-partner-001'
        },
        {
            name: '美食推薦含特約測試',
            message: '有什麼好吃的餐廳推薦嗎？',
            expectedFeatures: ['餐廳', '多家推薦', '特約標籤'],
            sessionId: 'eval-partner-001'
        },
        {
            name: '一般商家推薦測試',
            message: '推薦一些商店',
            expectedFeatures: ['商店', '多家推薦', '評分'],
            sessionId: 'eval-partner-001'
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
                        external_id: 'eval-user-002',
                        display_name: '特約驗收測試用戶'
                    }
                }
            });

            if (error) {
                console.error('❌ Edge Function 錯誤:', error);
                continue;
            }

            const response = data.data.response;
            console.log('✅ 回應:', response.substring(0, 200) + '...');

            // 檢查預期功能
            let featureChecks = 0;
            let totalFeatures = testCase.expectedFeatures.length;

            testCase.expectedFeatures.forEach(feature => {
                if (response.includes(feature)) {
                    console.log(`✅ 包含 ${feature}`);
                    featureChecks++;
                } else {
                    console.log(`❌ 缺少 ${feature}`);
                }
            });

            // 檢查是否推薦多家商家
            const hasMultipleRecommendations = (
                response.includes('1.') && response.includes('2.') && response.includes('3.') ||
                response.includes('第一') && response.includes('第二') && response.includes('第三') ||
                response.includes('推薦') && (response.match(/推薦/g) || []).length >= 2
            );

            if (hasMultipleRecommendations) {
                console.log('✅ 推薦多家商家');
                featureChecks++;
            } else {
                console.log('❌ 沒有推薦多家商家');
            }

            // 檢查特約標籤
            if (testCase.name.includes('特約')) {
                if (response.includes('[特約商家]') || response.includes('特約')) {
                    console.log('✅ 正確標註特約商家');
                    featureChecks++;
                } else {
                    console.log('❌ 沒有標註特約商家');
                }
            }

            if (featureChecks >= totalFeatures) {
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

    console.log('\n📊 特約商家驗收結果:');
    console.log(`通過: ${passCount}/${totalTests}`);
    
    if (passCount === totalTests) {
        console.log('🎉 特約商家驗收 PASS！特約生效且列出多家');
    } else {
        console.log('❌ 特約商家驗收 FAIL，需要修復');
    }

    return passCount === totalTests;
}

evalPartner();
