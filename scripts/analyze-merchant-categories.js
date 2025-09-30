#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeMerchantCategories() {
    console.log('🔍 分析現有商家分類資料...');
    
    try {
        // 1. 獲取所有商家資料
        console.log('\n📊 1. 獲取商家資料...');
        const { data: merchants, error } = await supabase
            .from('stores')
            .select('id, store_name, category, is_partner_store, is_safe_store, has_member_discount');
        
        if (error) {
            console.error('❌ 獲取商家資料失敗:', error.message);
            return false;
        }
        
        console.log(`✅ 找到 ${merchants.length} 家商家`);
        
        // 2. 分析分類分布
        console.log('\n📋 2. 分類分布分析...');
        const categoryStats = {};
        const categoryExamples = {};
        
        merchants.forEach(merchant => {
            const category = merchant.category || '未分類';
            
            if (!categoryStats[category]) {
                categoryStats[category] = {
                    count: 0,
                    partner: 0,
                    safe: 0,
                    discount: 0,
                    examples: []
                };
            }
            
            categoryStats[category].count++;
            if (merchant.is_partner_store) categoryStats[category].partner++;
            if (merchant.is_safe_store) categoryStats[category].safe++;
            if (merchant.has_member_discount) categoryStats[category].discount++;
            
            if (categoryStats[category].examples.length < 3) {
                categoryStats[category].examples.push(merchant.store_name);
            }
        });
        
        // 3. 顯示分類統計
        console.log('\n📊 分類統計結果:');
        console.log('=' * 80);
        
        const sortedCategories = Object.keys(categoryStats).sort((a, b) => 
            categoryStats[b].count - categoryStats[a].count
        );
        
        sortedCategories.forEach(category => {
            const stats = categoryStats[category];
            console.log(`\n🏷️ ${category}:`);
            console.log(`   總數: ${stats.count} 家`);
            console.log(`   特約: ${stats.partner} 家`);
            console.log(`   安心: ${stats.safe} 家`);
            console.log(`   優惠: ${stats.discount} 家`);
            console.log(`   範例: ${stats.examples.join(', ')}`);
        });
        
        // 4. 分析分類問題
        console.log('\n🔍 3. 分類問題分析...');
        
        // 檢查是否有重複或相似的分類
        const similarCategories = [];
        const categoryKeys = Object.keys(categoryStats);
        
        for (let i = 0; i < categoryKeys.length; i++) {
            for (let j = i + 1; j < categoryKeys.length; j++) {
                const cat1 = categoryKeys[i];
                const cat2 = categoryKeys[j];
                
                // 檢查是否包含相似詞彙
                if (cat1.includes('餐飲') && cat2.includes('餐飲')) {
                    similarCategories.push([cat1, cat2, '都包含餐飲']);
                } else if (cat1.includes('美食') && cat2.includes('美食')) {
                    similarCategories.push([cat1, cat2, '都包含美食']);
                } else if (cat1.includes('料理') && cat2.includes('料理')) {
                    similarCategories.push([cat1, cat2, '都包含料理']);
                } else if (cat1.includes('餐廳') && cat2.includes('餐廳')) {
                    similarCategories.push([cat1, cat2, '都包含餐廳']);
                }
            }
        }
        
        if (similarCategories.length > 0) {
            console.log('\n⚠️ 發現相似分類:');
            similarCategories.forEach(([cat1, cat2, reason]) => {
                console.log(`   ${cat1} vs ${cat2} (${reason})`);
            });
        }
        
        // 5. 檢查未分類的商家
        const uncategorized = merchants.filter(m => !m.category || m.category.trim() === '');
        if (uncategorized.length > 0) {
            console.log(`\n❌ 發現 ${uncategorized.length} 家未分類的商家:`);
            uncategorized.slice(0, 5).forEach(merchant => {
                console.log(`   - ${merchant.store_name}`);
            });
            if (uncategorized.length > 5) {
                console.log(`   ... 還有 ${uncategorized.length - 5} 家`);
            }
        }
        
        // 6. 生成建議
        console.log('\n💡 4. 分類整理建議:');
        
        // 統計餐飲相關分類
        const foodCategories = categoryKeys.filter(cat => 
            cat.includes('餐飲') || cat.includes('美食') || cat.includes('料理') || 
            cat.includes('餐廳') || cat.includes('咖啡') || cat.includes('小吃')
        );
        
        if (foodCategories.length > 0) {
            console.log('\n🍽️ 餐飲相關分類:');
            foodCategories.forEach(cat => {
                console.log(`   - ${cat} (${categoryStats[cat].count} 家)`);
            });
            console.log(`   💡 建議合併為「餐飲美食」大分類`);
        }
        
        // 統計購物相關分類
        const shoppingCategories = categoryKeys.filter(cat => 
            cat.includes('購物') || cat.includes('商店') || cat.includes('服飾') || 
            cat.includes('3C') || cat.includes('電子') || cat.includes('生活用品')
        );
        
        if (shoppingCategories.length > 0) {
            console.log('\n🛍️ 購物相關分類:');
            shoppingCategories.forEach(cat => {
                console.log(`   - ${cat} (${categoryStats[cat].count} 家)`);
            });
            console.log(`   💡 建議合併為「購物消費」大分類`);
        }
        
        // 統計服務相關分類
        const serviceCategories = categoryKeys.filter(cat => 
            cat.includes('服務') || cat.includes('美容') || cat.includes('美髮') || 
            cat.includes('洗衣') || cat.includes('修繕') || cat.includes('銀行')
        );
        
        if (serviceCategories.length > 0) {
            console.log('\n🔧 服務相關分類:');
            serviceCategories.forEach(cat => {
                console.log(`   - ${cat} (${categoryStats[cat].count} 家)`);
            });
            console.log(`   💡 建議合併為「生活服務」大分類`);
        }
        
        // 7. 生成分析報告
        const analysisReport = {
            timestamp: new Date().toISOString(),
            totalMerchants: merchants.length,
            totalCategories: categoryKeys.length,
            categoryStats: categoryStats,
            similarCategories: similarCategories,
            uncategorizedCount: uncategorized.length,
            foodCategories: foodCategories,
            shoppingCategories: shoppingCategories,
            serviceCategories: serviceCategories
        };
        
        // 寫入分析報告
        const fs = await import('fs');
        fs.writeFileSync('scripts/merchant-category-analysis.json', JSON.stringify(analysisReport, null, 2));
        console.log('\n✅ 分析報告已保存: scripts/merchant-category-analysis.json');
        
        return true;
        
    } catch (error) {
        console.error('❌ 分析過程中發生錯誤:', error.message);
        return false;
    }
}

// 執行分析
analyzeMerchantCategories().then(success => {
    if (success) {
        console.log('\n🎉 商家分類分析完成！');
        process.exit(0);
    } else {
        console.log('\n❌ 分析失敗！');
        process.exit(1);
    }
});
