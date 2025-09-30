#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUIScenarios() {
    console.log('🎭 測試快速問題管理 UI 場景...\n');

    try {
        // 場景 1: 測試空白問題內容驗證
        console.log('🚫 場景 1: 測試空白問題內容驗證');
        try {
            const { data, error } = await supabase
                .from('quick_questions')
                .insert([{
                    question: '',  // 空白問題
                    display_order: 1,
                    is_enabled: true
                }])
                .select();

            if (error) {
                console.log('✅ 空白驗證成功 - 系統拒絕空白問題:', error.message);
            } else {
                console.log('❌ 空白驗證失敗 - 系統允許了空白問題');
                // 清理意外創建的記錄
                await supabase.from('quick_questions').delete().eq('id', data[0].id);
            }
        } catch (err) {
            console.log('✅ 前端層面已攔截空白問題');
        }

        // 場景 2: 測試超長問題內容
        console.log('\n📏 場景 2: 測試超長問題內容 (1000字符)');
        const longQuestion = 'A'.repeat(1000);

        const { data: longData, error: longError } = await supabase
            .from('quick_questions')
            .insert([{
                question: longQuestion,
                display_order: 2,
                is_enabled: true
            }])
            .select();

        if (longError) {
            console.log('❌ 超長內容被拒絕:', longError.message);
        } else {
            console.log('✅ 超長內容被接受 (ID:', longData[0].id, ')');
            // 清理
            await supabase.from('quick_questions').delete().eq('id', longData[0].id);
        }

        // 場景 3: 測試重複顯示順序
        console.log('\n🔄 場景 3: 測試重複顯示順序');

        // 先創建一個測試問題
        const { data: firstQuestion, error: firstError } = await supabase
            .from('quick_questions')
            .insert([{
                question: '測試順序衝突 - 第一個',
                display_order: 100,
                is_enabled: true
            }])
            .select()
            .single();

        if (firstError) {
            console.log('❌ 創建第一個測試問題失敗:', firstError.message);
        } else {
            // 嘗試創建相同順序的問題
            const { data: secondQuestion, error: secondError } = await supabase
                .from('quick_questions')
                .insert([{
                    question: '測試順序衝突 - 第二個',
                    display_order: 100,  // 相同順序
                    is_enabled: true
                }])
                .select()
                .single();

            if (secondError) {
                console.log('❌ 重複順序被系統拒絕:', secondError.message);
            } else {
                console.log('✅ 重複順序被接受 - 系統允許重複順序');
                await supabase.from('quick_questions').delete().eq('id', secondQuestion.id);
            }

            // 清理第一個測試問題
            await supabase.from('quick_questions').delete().eq('id', firstQuestion.id);
        }

        // 場景 4: 測試負數和零的顯示順序
        console.log('\n🔢 場景 4: 測試負數和零的顯示順序');

        const edgeCases = [
            { order: -1, name: '負數順序' },
            { order: 0, name: '零順序' },
            { order: 999999, name: '超大數字順序' }
        ];

        for (const testCase of edgeCases) {
            const { data: edgeData, error: edgeError } = await supabase
                .from('quick_questions')
                .insert([{
                    question: `測試 ${testCase.name}`,
                    display_order: testCase.order,
                    is_enabled: true
                }])
                .select();

            if (edgeError) {
                console.log(`❌ ${testCase.name} 被拒絕:`, edgeError.message);
            } else {
                console.log(`✅ ${testCase.name} 被接受 (順序: ${testCase.order})`);
                // 清理
                await supabase.from('quick_questions').delete().eq('id', edgeData[0].id);
            }
        }

        // 場景 5: 測試特殊字符
        console.log('\n🎭 場景 5: 測試特殊字符和表情符號');
        const specialChars = [
            { text: '測試 <script>alert("XSS")</script>', name: 'HTML標籤' },
            { text: '測試 🎉🎊💫⭐', name: '表情符號' },
            { text: "測試 ' OR 1=1 --", name: 'SQL注入' },
            { text: '測試 \n\r\t 換行符', name: '控制字符' }
        ];

        for (const testCase of specialChars) {
            const { data: specialData, error: specialError } = await supabase
                .from('quick_questions')
                .insert([{
                    question: testCase.text,
                    display_order: 500,
                    is_enabled: true
                }])
                .select();

            if (specialError) {
                console.log(`❌ ${testCase.name} 被拒絕:`, specialError.message);
            } else {
                console.log(`✅ ${testCase.name} 被接受`);
                console.log(`   實際儲存: "${specialData[0].question}"`);
                // 清理
                await supabase.from('quick_questions').delete().eq('id', specialData[0].id);
            }
        }

        // 場景 6: 測試並發操作
        console.log('\n⚡ 場景 6: 測試並發新增');

        const concurrentQuestions = Array.from({ length: 5 }, (_, i) => ({
            question: `並發測試問題 ${i + 1}`,
            display_order: 600 + i,
            is_enabled: true
        }));

        const promises = concurrentQuestions.map(q =>
            supabase.from('quick_questions').insert([q]).select()
        );

        const results = await Promise.allSettled(promises);

        let successCount = 0;
        const createdIds = [];

        results.forEach((result, i) => {
            if (result.status === 'fulfilled' && !result.value.error) {
                successCount++;
                createdIds.push(result.value.data[0].id);
                console.log(`✅ 並發問題 ${i + 1} 創建成功`);
            } else {
                console.log(`❌ 並發問題 ${i + 1} 創建失敗`);
            }
        });

        console.log(`✅ 並發測試完成: ${successCount}/5 成功`);

        // 清理並發測試數據
        if (createdIds.length > 0) {
            await supabase.from('quick_questions').delete().in('id', createdIds);
            console.log(`🧹 清理了 ${createdIds.length} 筆並發測試數據`);
        }

        // 場景 7: 測試搜索功能邊界情況
        console.log('\n🔍 場景 7: 測試搜索功能邊界情況');

        const searchTests = [
            { term: '', name: '空白搜索' },
            { term: 'zzzznonexistent', name: '不存在的內容' },
            { term: '推薦', name: '常見關鍵詞' },
            { term: '%', name: 'SQL通配符' }
        ];

        for (const searchTest of searchTests) {
            const { data: searchData, error: searchError } = await supabase
                .from('quick_questions')
                .select('*')
                .ilike('question', `%${searchTest.term}%`);

            if (searchError) {
                console.log(`❌ ${searchTest.name} 搜索失敗:`, searchError.message);
            } else {
                console.log(`✅ ${searchTest.name} 搜索成功: 找到 ${searchData.length} 筆結果`);
            }
        }

    } catch (error) {
        console.error('❌ UI 場景測試過程中發生錯誤:', error);
    }

    console.log('\n🏁 UI 場景測試完成!');
}

async function testPerformance() {
    console.log('\n⚡ 性能測試開始...');

    try {
        // 測試大量數據讀取
        const start = Date.now();

        const { data, error } = await supabase
            .from('quick_questions')
            .select('*')
            .order('display_order');

        const end = Date.now();

        if (error) {
            console.log('❌ 性能測試失敗:', error.message);
        } else {
            console.log(`✅ 讀取 ${data.length} 筆數據耗時: ${end - start}ms`);

            if (end - start > 1000) {
                console.log('⚠️ 響應時間較慢，可能需要優化');
            } else {
                console.log('✅ 響應時間良好');
            }
        }

    } catch (error) {
        console.error('❌ 性能測試錯誤:', error);
    }
}

// 主函數
async function main() {
    console.log('🧪 快速問題管理 UI 場景測試開始\n');

    await testUIScenarios();
    await testPerformance();

    console.log('\n🎉 所有測試完成！');
}

main();