#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuickQuestionsCRUD() {
    console.log('🧪 開始測試快速問題管理 CRUD 功能...\n');

    let testId = null;

    try {
        // 1. 測試讀取功能 (READ)
        console.log('📖 1. 測試讀取功能');
        const { data: initialQuestions, error: readError } = await supabase
            .from('quick_questions')
            .select('*')
            .order('display_order', { ascending: true });

        if (readError) {
            console.error('❌ 讀取失敗:', readError);
        } else {
            console.log(`✅ 成功讀取 ${initialQuestions.length} 筆快速問題`);
            initialQuestions.forEach((q, i) => {
                console.log(`   ${i + 1}. "${q.question}" (順序: ${q.display_order}, 狀態: ${q.is_enabled ? '啟用' : '禁用'})`);
            });
        }

        // 2. 測試新增功能 (CREATE)
        console.log('\n➕ 2. 測試新增功能');
        const testQuestion = {
            question: '測試快速問題 - 自動化測試',
            display_order: 999,
            is_enabled: true
        };

        const { data: createdQuestion, error: createError } = await supabase
            .from('quick_questions')
            .insert([testQuestion])
            .select()
            .single();

        if (createError) {
            console.error('❌ 新增失敗:', createError);
        } else {
            testId = createdQuestion.id;
            console.log('✅ 新增成功');
            console.log(`   ID: ${createdQuestion.id}`);
            console.log(`   問題: ${createdQuestion.question}`);
            console.log(`   排序: ${createdQuestion.display_order}`);
            console.log(`   狀態: ${createdQuestion.is_enabled ? '啟用' : '禁用'}`);
        }

        // 3. 測試更新功能 (UPDATE)
        if (testId) {
            console.log('\n✏️ 3. 測試更新功能');
            const updateData = {
                question: '測試快速問題 - 已更新',
                display_order: 888,
                is_enabled: false
            };

            const { data: updatedQuestion, error: updateError } = await supabase
                .from('quick_questions')
                .update(updateData)
                .eq('id', testId)
                .select()
                .single();

            if (updateError) {
                console.error('❌ 更新失敗:', updateError);
            } else {
                console.log('✅ 更新成功');
                console.log(`   問題: ${updatedQuestion.question}`);
                console.log(`   排序: ${updatedQuestion.display_order}`);
                console.log(`   狀態: ${updatedQuestion.is_enabled ? '啟用' : '禁用'}`);
            }
        }

        // 4. 測試搜索功能
        console.log('\n🔍 4. 測試搜索功能');
        const { data: searchResults, error: searchError } = await supabase
            .from('quick_questions')
            .select('*')
            .ilike('question', '%測試%');

        if (searchError) {
            console.error('❌ 搜索失敗:', searchError);
        } else {
            console.log(`✅ 搜索結果: 找到 ${searchResults.length} 筆包含"測試"的問題`);
            searchResults.forEach(q => {
                console.log(`   - "${q.question}"`);
            });
        }

        // 5. 測試排序功能
        console.log('\n📊 5. 測試排序功能');
        const { data: sortedQuestions, error: sortError } = await supabase
            .from('quick_questions')
            .select('*')
            .order('display_order', { ascending: false })
            .limit(5);

        if (sortError) {
            console.error('❌ 排序失敗:', sortError);
        } else {
            console.log('✅ 排序測試成功 (按顯示順序倒序, 前5筆):');
            sortedQuestions.forEach((q, i) => {
                console.log(`   ${i + 1}. "${q.question}" (順序: ${q.display_order})`);
            });
        }

        // 6. 測試啟用/禁用功能
        if (testId) {
            console.log('\n🔄 6. 測試啟用/禁用功能');

            // 切換狀態
            const { data: toggledQuestion, error: toggleError } = await supabase
                .from('quick_questions')
                .update({ is_enabled: true })
                .eq('id', testId)
                .select()
                .single();

            if (toggleError) {
                console.error('❌ 狀態切換失敗:', toggleError);
            } else {
                console.log(`✅ 狀態切換成功: ${toggledQuestion.is_enabled ? '啟用' : '禁用'}`);
            }
        }

        // 7. 測試批量操作
        console.log('\n📦 7. 測試批量新增');
        const batchQuestions = [
            { question: '批量測試問題 1', display_order: 1001, is_enabled: true },
            { question: '批量測試問題 2', display_order: 1002, is_enabled: true },
            { question: '批量測試問題 3', display_order: 1003, is_enabled: false }
        ];

        const { data: batchResult, error: batchError } = await supabase
            .from('quick_questions')
            .insert(batchQuestions)
            .select();

        let batchIds = [];
        if (batchError) {
            console.error('❌ 批量新增失敗:', batchError);
        } else {
            batchIds = batchResult.map(q => q.id);
            console.log(`✅ 批量新增成功: ${batchResult.length} 筆問題`);
            batchResult.forEach(q => {
                console.log(`   - ID ${q.id}: "${q.question}"`);
            });
        }

        // 8. 清理測試數據 (DELETE)
        console.log('\n🗑️ 8. 清理測試數據');

        const idsToDelete = [testId, ...batchIds].filter(id => id !== null);

        if (idsToDelete.length > 0) {
            const { error: deleteError } = await supabase
                .from('quick_questions')
                .delete()
                .in('id', idsToDelete);

            if (deleteError) {
                console.error('❌ 刪除失敗:', deleteError);
            } else {
                console.log(`✅ 成功刪除 ${idsToDelete.length} 筆測試數據`);
                console.log(`   刪除的 IDs: [${idsToDelete.join(', ')}]`);
            }
        }

        // 9. 最終確認
        console.log('\n✔️ 9. 最終確認');
        const { data: finalQuestions, error: finalError } = await supabase
            .from('quick_questions')
            .select('*')
            .order('display_order');

        if (finalError) {
            console.error('❌ 最終確認失敗:', finalError);
        } else {
            console.log(`✅ 測試完成! 當前共有 ${finalQuestions.length} 筆快速問題`);
        }

    } catch (error) {
        console.error('❌ 測試過程中發生錯誤:', error);
    }

    console.log('\n🏁 快速問題管理 CRUD 測試完成!');
}

// 測試數據庫連接
async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('quick_questions')
            .select('id')
            .limit(1);

        if (error) {
            console.error('❌ 數據庫連接失敗:', error);
            return false;
        }

        console.log('✅ 數據庫連接成功');
        return true;
    } catch (error) {
        console.error('❌ 數據庫連接測試失敗:', error);
        return false;
    }
}

// 主函數
async function main() {
    console.log('🚀 快速問題管理系統測試開始\n');

    const connected = await testConnection();
    if (!connected) {
        console.log('❌ 無法連接到數據庫，測試終止');
        return;
    }

    await testQuickQuestionsCRUD();
}

main();