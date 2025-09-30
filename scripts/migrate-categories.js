#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

// 分類映射表
const categoryMapping = {
  "餐飲美食": {
    "main": "餐飲美食",
    "sub": null,
    "id": "food"
  },
  "中式料理": {
    "main": "餐飲美食",
    "sub": "中式料理",
    "id": "chinese"
  },
  "中式": {
    "main": "餐飲美食",
    "sub": "中式料理",
    "id": "chinese"
  },
  "中餐": {
    "main": "餐飲美食",
    "sub": "中式料理",
    "id": "chinese"
  },
  "台菜": {
    "main": "餐飲美食",
    "sub": "中式料理",
    "id": "chinese"
  },
  "台式": {
    "main": "餐飲美食",
    "sub": "中式料理",
    "id": "chinese"
  },
  "日式料理": {
    "main": "餐飲美食",
    "sub": "日式料理",
    "id": "japanese"
  },
  "日式": {
    "main": "餐飲美食",
    "sub": "日式料理",
    "id": "japanese"
  },
  "日料": {
    "main": "餐飲美食",
    "sub": "日式料理",
    "id": "japanese"
  },
  "壽司": {
    "main": "餐飲美食",
    "sub": "日式料理",
    "id": "japanese"
  },
  "拉麵": {
    "main": "餐飲美食",
    "sub": "日式料理",
    "id": "japanese"
  },
  "丼飯": {
    "main": "餐飲美食",
    "sub": "日式料理",
    "id": "japanese"
  },
  "韓式料理": {
    "main": "餐飲美食",
    "sub": "韓式料理",
    "id": "korean"
  },
  "韓式": {
    "main": "餐飲美食",
    "sub": "韓式料理",
    "id": "korean"
  },
  "韓料": {
    "main": "餐飲美食",
    "sub": "韓式料理",
    "id": "korean"
  },
  "韓食": {
    "main": "餐飲美食",
    "sub": "韓式料理",
    "id": "korean"
  },
  "韓燒": {
    "main": "餐飲美食",
    "sub": "韓式料理",
    "id": "korean"
  },
  "西式料理": {
    "main": "餐飲美食",
    "sub": "西式料理",
    "id": "western"
  },
  "西式": {
    "main": "餐飲美食",
    "sub": "西式料理",
    "id": "western"
  },
  "西餐": {
    "main": "餐飲美食",
    "sub": "西式料理",
    "id": "western"
  },
  "義式": {
    "main": "餐飲美食",
    "sub": "西式料理",
    "id": "western"
  },
  "義大利": {
    "main": "餐飲美食",
    "sub": "西式料理",
    "id": "western"
  },
  "美式": {
    "main": "餐飲美食",
    "sub": "西式料理",
    "id": "western"
  },
  "咖啡廳": {
    "main": "餐飲美食",
    "sub": "咖啡廳",
    "id": "cafe"
  },
  "咖啡": {
    "main": "餐飲美食",
    "sub": "咖啡廳",
    "id": "cafe"
  },
  "咖啡店": {
    "main": "餐飲美食",
    "sub": "咖啡廳",
    "id": "cafe"
  },
  "餐廳": {
    "main": "餐飲美食",
    "sub": "餐廳",
    "id": "restaurant"
  },
  "親子餐廳": {
    "main": "餐飲美食",
    "sub": "餐廳",
    "id": "restaurant"
  },
  "茶餐廳": {
    "main": "餐飲美食",
    "sub": "餐廳",
    "id": "restaurant"
  },
  "餐酒館": {
    "main": "餐飲美食",
    "sub": "餐廳",
    "id": "restaurant"
  },
  "早餐店": {
    "main": "餐飲美食",
    "sub": "早餐店",
    "id": "breakfast"
  },
  "早餐": {
    "main": "餐飲美食",
    "sub": "早餐店",
    "id": "breakfast"
  },
  "早午餐": {
    "main": "餐飲美食",
    "sub": "早餐店",
    "id": "breakfast"
  },
  "brunch": {
    "main": "餐飲美食",
    "sub": "早餐店",
    "id": "breakfast"
  },
  "火鍋": {
    "main": "餐飲美食",
    "sub": "火鍋",
    "id": "hotpot"
  },
  "涮涮鍋": {
    "main": "餐飲美食",
    "sub": "火鍋",
    "id": "hotpot"
  },
  "其他餐飲": {
    "main": "餐飲美食",
    "sub": "其他餐飲",
    "id": "other_food"
  },
  "美食": {
    "main": "餐飲美食",
    "sub": "其他餐飲",
    "id": "other_food"
  },
  "餐飲": {
    "main": "餐飲美食",
    "sub": "其他餐飲",
    "id": "other_food"
  },
  "小吃": {
    "main": "餐飲美食",
    "sub": "其他餐飲",
    "id": "other_food"
  },
  "購物消費": {
    "main": "購物消費",
    "sub": null,
    "id": "shopping"
  },
  "超市": {
    "main": "購物消費",
    "sub": "超市",
    "id": "supermarket"
  },
  "全聯": {
    "main": "購物消費",
    "sub": "超市",
    "id": "supermarket"
  },
  "家樂福": {
    "main": "購物消費",
    "sub": "超市",
    "id": "supermarket"
  },
  "便利商店": {
    "main": "購物消費",
    "sub": "便利商店",
    "id": "convenience"
  },
  "7-11": {
    "main": "購物消費",
    "sub": "便利商店",
    "id": "convenience"
  },
  "全家": {
    "main": "購物消費",
    "sub": "便利商店",
    "id": "convenience"
  },
  "服飾店": {
    "main": "購物消費",
    "sub": "服飾店",
    "id": "clothing"
  },
  "服飾": {
    "main": "購物消費",
    "sub": "服飾店",
    "id": "clothing"
  },
  "衣服": {
    "main": "購物消費",
    "sub": "服飾店",
    "id": "clothing"
  },
  "服裝": {
    "main": "購物消費",
    "sub": "服飾店",
    "id": "clothing"
  },
  "電器行": {
    "main": "購物消費",
    "sub": "電器行",
    "id": "electronics"
  },
  "電器": {
    "main": "購物消費",
    "sub": "電器行",
    "id": "electronics"
  },
  "3C": {
    "main": "購物消費",
    "sub": "電器行",
    "id": "electronics"
  },
  "電子": {
    "main": "購物消費",
    "sub": "電器行",
    "id": "electronics"
  },
  "書店": {
    "main": "購物消費",
    "sub": "書店",
    "id": "bookstore"
  },
  "文具": {
    "main": "購物消費",
    "sub": "書店",
    "id": "bookstore"
  },
  "圖書": {
    "main": "教育培訓",
    "sub": "圖書館",
    "id": "library"
  },
  "百貨公司": {
    "main": "購物消費",
    "sub": "百貨公司",
    "id": "department"
  },
  "百貨": {
    "main": "購物消費",
    "sub": "百貨公司",
    "id": "department"
  },
  "商場": {
    "main": "購物消費",
    "sub": "百貨公司",
    "id": "department"
  },
  "其他購物": {
    "main": "購物消費",
    "sub": "其他購物",
    "id": "other_shopping"
  },
  "購物": {
    "main": "購物消費",
    "sub": "其他購物",
    "id": "other_shopping"
  },
  "商店": {
    "main": "購物消費",
    "sub": "其他購物",
    "id": "other_shopping"
  },
  "生活服務": {
    "main": "生活服務",
    "sub": null,
    "id": "services"
  },
  "美容美髮": {
    "main": "生活服務",
    "sub": "美容美髮",
    "id": "beauty"
  },
  "美髮": {
    "main": "生活服務",
    "sub": "美容美髮",
    "id": "beauty"
  },
  "美容": {
    "main": "生活服務",
    "sub": "美容美髮",
    "id": "beauty"
  },
  "沙龍": {
    "main": "生活服務",
    "sub": "美容美髮",
    "id": "beauty"
  },
  "修繕服務": {
    "main": "生活服務",
    "sub": "修繕服務",
    "id": "repair"
  },
  "修車": {
    "main": "生活服務",
    "sub": "修繕服務",
    "id": "repair"
  },
  "修繕": {
    "main": "生活服務",
    "sub": "修繕服務",
    "id": "repair"
  },
  "保養": {
    "main": "生活服務",
    "sub": "修繕服務",
    "id": "repair"
  },
  "健身中心": {
    "main": "生活服務",
    "sub": "健身中心",
    "id": "fitness"
  },
  "健身": {
    "main": "生活服務",
    "sub": "健身中心",
    "id": "fitness"
  },
  "健身房": {
    "main": "生活服務",
    "sub": "健身中心",
    "id": "fitness"
  },
  "運動": {
    "main": "生活服務",
    "sub": "健身中心",
    "id": "fitness"
  },
  "其他服務": {
    "main": "生活服務",
    "sub": "其他服務",
    "id": "other_services"
  },
  "服務": {
    "main": "生活服務",
    "sub": "其他服務",
    "id": "other_services"
  },
  "工作室": {
    "main": "生活服務",
    "sub": "其他服務",
    "id": "other_services"
  },
  "醫療保健": {
    "main": "醫療保健",
    "sub": null,
    "id": "medical"
  },
  "醫院": {
    "main": "醫療保健",
    "sub": "醫院",
    "id": "hospital"
  },
  "綜合醫院": {
    "main": "醫療保健",
    "sub": "醫院",
    "id": "hospital"
  },
  "診所": {
    "main": "醫療保健",
    "sub": "診所",
    "id": "clinic"
  },
  "牙科": {
    "main": "醫療保健",
    "sub": "診所",
    "id": "clinic"
  },
  "眼科": {
    "main": "醫療保健",
    "sub": "診所",
    "id": "clinic"
  },
  "耳鼻喉科": {
    "main": "醫療保健",
    "sub": "診所",
    "id": "clinic"
  },
  "婦產科": {
    "main": "醫療保健",
    "sub": "診所",
    "id": "clinic"
  },
  "中醫": {
    "main": "醫療保健",
    "sub": "診所",
    "id": "clinic"
  },
  "西醫": {
    "main": "醫療保健",
    "sub": "診所",
    "id": "clinic"
  },
  "泌尿科": {
    "main": "醫療保健",
    "sub": "診所",
    "id": "clinic"
  },
  "復健科": {
    "main": "醫療保健",
    "sub": "診所",
    "id": "clinic"
  },
  "藥局": {
    "main": "醫療保健",
    "sub": "藥局",
    "id": "pharmacy"
  },
  "藥房": {
    "main": "醫療保健",
    "sub": "藥局",
    "id": "pharmacy"
  },
  "其他醫療": {
    "main": "醫療保健",
    "sub": "其他醫療",
    "id": "other_medical"
  },
  "醫療": {
    "main": "醫療保健",
    "sub": "其他醫療",
    "id": "other_medical"
  },
  "健康": {
    "main": "醫療保健",
    "sub": "其他醫療",
    "id": "other_medical"
  },
  "教育培訓": {
    "main": "教育培訓",
    "sub": "補習班",
    "id": "cram_school"
  },
  "補習班": {
    "main": "教育培訓",
    "sub": "補習班",
    "id": "cram_school"
  },
  "美語": {
    "main": "教育培訓",
    "sub": "補習班",
    "id": "cram_school"
  },
  "英語": {
    "main": "教育培訓",
    "sub": "補習班",
    "id": "cram_school"
  },
  "學校": {
    "main": "教育培訓",
    "sub": "學校",
    "id": "school"
  },
  "幼兒園": {
    "main": "教育培訓",
    "sub": "學校",
    "id": "school"
  },
  "圖書館": {
    "main": "教育培訓",
    "sub": "圖書館",
    "id": "library"
  },
  "文化中心": {
    "main": "教育培訓",
    "sub": "文化中心",
    "id": "cultural"
  },
  "藝術": {
    "main": "教育培訓",
    "sub": "文化中心",
    "id": "cultural"
  },
  "其他教育": {
    "main": "教育培訓",
    "sub": "其他教育",
    "id": "other_education"
  },
  "教育": {
    "main": "教育培訓",
    "sub": "其他教育",
    "id": "other_education"
  },
  "學習": {
    "main": "教育培訓",
    "sub": "其他教育",
    "id": "other_education"
  },
  "休閒娛樂": {
    "main": "休閒娛樂",
    "sub": null,
    "id": "entertainment"
  },
  "公園": {
    "main": "休閒娛樂",
    "sub": "公園",
    "id": "park"
  },
  "運動園區": {
    "main": "休閒娛樂",
    "sub": "公園",
    "id": "park"
  },
  "觀光景點": {
    "main": "休閒娛樂",
    "sub": "觀光景點",
    "id": "attraction"
  },
  "觀光": {
    "main": "休閒娛樂",
    "sub": "觀光景點",
    "id": "attraction"
  },
  "景點": {
    "main": "休閒娛樂",
    "sub": "觀光景點",
    "id": "attraction"
  },
  "歷史建築": {
    "main": "休閒娛樂",
    "sub": "觀光景點",
    "id": "attraction"
  },
  "休閒中心": {
    "main": "休閒娛樂",
    "sub": "休閒中心",
    "id": "leisure"
  },
  "休閒": {
    "main": "休閒娛樂",
    "sub": "其他休閒",
    "id": "other_entertainment"
  },
  "娛樂": {
    "main": "休閒娛樂",
    "sub": "其他休閒",
    "id": "other_entertainment"
  },
  "夜市": {
    "main": "休閒娛樂",
    "sub": "夜市",
    "id": "nightmarket"
  },
  "其他休閒": {
    "main": "休閒娛樂",
    "sub": "其他休閒",
    "id": "other_entertainment"
  },
  "住宿旅遊": {
    "main": "住宿旅遊",
    "sub": null,
    "id": "accommodation"
  },
  "商旅": {
    "main": "住宿旅遊",
    "sub": "商旅",
    "id": "hotel"
  },
  "旅館": {
    "main": "住宿旅遊",
    "sub": "商旅",
    "id": "hotel"
  },
  "飯店": {
    "main": "住宿旅遊",
    "sub": "商旅",
    "id": "hotel"
  },
  "民宿": {
    "main": "住宿旅遊",
    "sub": "民宿",
    "id": "homestay"
  },
  "其他住宿": {
    "main": "住宿旅遊",
    "sub": "其他住宿",
    "id": "other_accommodation"
  },
  "住宿": {
    "main": "住宿旅遊",
    "sub": "其他住宿",
    "id": "other_accommodation"
  },
  "其他": {
    "main": "其他",
    "sub": "其他",
    "id": "other"
  },
  "寺廟": {
    "main": "其他",
    "sub": "寺廟",
    "id": "temple"
  },
  "宮廟": {
    "main": "其他",
    "sub": "寺廟",
    "id": "temple"
  },
  "未分類": {
    "main": "其他",
    "sub": "其他",
    "id": "other"
  }
};

async function migrateCategories() {
    console.log('🔄 開始商家分類遷移...');
    
    try {
        // 1. 獲取所有商家
        const { data: merchants, error } = await supabase
            .from('stores')
            .select('id, store_name, category');
        
        if (error) {
            console.error('❌ 獲取商家資料失敗:', error.message);
            return false;
        }
        
        console.log(`✅ 找到 ${merchants.length} 家商家`);
        
        // 2. 分析分類映射
        const migrationStats = {};
        const unmappedCategories = new Set();
        
        merchants.forEach(merchant => {
            const oldCategory = merchant.category || '未分類';
            const mapping = categoryMapping[oldCategory];
            
            if (mapping) {
                const newCategory = mapping.main;
                if (!migrationStats[newCategory]) {
                    migrationStats[newCategory] = 0;
                }
                migrationStats[newCategory]++;
            } else {
                unmappedCategories.add(oldCategory);
            }
        });
        
        console.log('\n📊 分類遷移統計:');
        Object.keys(migrationStats).forEach(category => {
            console.log(`   ${category}: ${migrationStats[category]} 家`);
        });
        
        if (unmappedCategories.size > 0) {
            console.log('\n⚠️ 未映射的分類:');
            unmappedCategories.forEach(cat => {
                console.log(`   - ${cat}`);
            });
        }
        
        // 3. 執行分類更新
        console.log('\n🔧 執行分類更新...');
        let updatedCount = 0;
        
        for (const merchant of merchants) {
            const oldCategory = merchant.category || '未分類';
            const mapping = categoryMapping[oldCategory];
            
            if (mapping) {
                const newCategory = mapping.main;
                const { error: updateError } = await supabase
                    .from('stores')
                    .update({ category: newCategory })
                    .eq('id', merchant.id);
                
                if (updateError) {
                    console.error(`❌ 更新商家 ${merchant.store_name} 失敗:`, updateError.message);
                } else {
                    updatedCount++;
                }
            }
        }
        
        console.log(`✅ 成功更新 ${updatedCount} 家商家的分類`);
        
        // 4. 驗證結果
        console.log('\n🔍 驗證分類結果...');
        const { data: updatedMerchants, error: verifyError } = await supabase
            .from('stores')
            .select('category')
            .not('category', 'is', null);
        
        if (verifyError) {
            console.error('❌ 驗證失敗:', verifyError.message);
            return false;
        }
        
        const finalStats = {};
        updatedMerchants.forEach(merchant => {
            const category = merchant.category;
            finalStats[category] = (finalStats[category] || 0) + 1;
        });
        
        console.log('\n📊 最終分類統計:');
        Object.keys(finalStats).sort((a, b) => finalStats[b] - finalStats[a]).forEach(category => {
            console.log(`   ${category}: ${finalStats[category]} 家`);
        });
        
        console.log('\n🎉 分類遷移完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 遷移過程中發生錯誤:', error.message);
        return false;
    }
}

// 執行遷移
migrateCategories().then(success => {
    if (success) {
        console.log('\n✅ 遷移成功完成！');
        process.exit(0);
    } else {
        console.log('\n❌ 遷移失敗！');
        process.exit(1);
    }
});
