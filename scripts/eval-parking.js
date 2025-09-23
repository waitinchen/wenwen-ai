#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function evalParking() {
    console.log('🅿️ 停車查詢驗收測試：停車查詢 OK');
    
    const testCases = [
        {
            name: '一般停車查詢',
            message: '附近有停車場嗎？',
            expectedFeatures: ['停車場', '地址', '費率', '營業時間'],
            sessionId: 'eval-parking-001'
        },
        {
            name: '24小時停車場查詢',
            message: '有沒有24小時的停車場？',
            expectedFeatures: ['24小時', '停車場', '地址'],
            sessionId: 'eval-parking-001'
        },
        {
            name: '便宜停車場查詢',
            message: '推薦便宜的停車場',
            expectedFeatures: ['便宜', '停車場', '費率'],
            sessionId: 'eval-parking-001'
        },
        {
            name: '公有停車場查詢',
            message: '公有停車場在哪裡？',
            expectedFeatures: ['公有', '停車場', '地址'],
            sessionId: 'eval-parking-001'
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
                        external_id: 'eval-user-003',
                        display_name: '停車驗收測試用戶'
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

            // 檢查是否有導航選項
            if (response.includes('導航') || response.includes('導航到') || response.includes('要不要我幫你導航')) {
                console.log('✅ 提供導航選項');
                featureChecks++;
            } else {
                console.log('❌ 沒有提供導航選項');
            }

            // 檢查是否提供詳細停車場資訊
            const hasDetailedInfo = (
                response.includes('地址') && 
                (response.includes('費率') || response.includes('價格') || response.includes('收費')) &&
                (response.includes('營業時間') || response.includes('開放時間') || response.includes('時間'))
            );

            if (hasDetailedInfo) {
                console.log('✅ 提供詳細停車場資訊');
                featureChecks++;
            } else {
                console.log('❌ 沒有提供詳細停車場資訊');
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

    console.log('\n📊 停車查詢驗收結果:');
    console.log(`通過: ${passCount}/${totalTests}`);
    
    if (passCount === totalTests) {
        console.log('🎉 停車查詢驗收 PASS！停車查詢功能正常');
    } else {
        console.log('❌ 停車查詢驗收 FAIL，需要修復');
    }

    return passCount === totalTests;
}

evalParking();
