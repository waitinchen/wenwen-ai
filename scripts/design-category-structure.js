#!/usr/bin/env node

import fs from 'fs';

// 設計兩層分類架構
const categoryStructure = {
    // 第一層：大分類
    mainCategories: {
        '餐飲美食': {
            id: 'food',
            description: '餐廳、咖啡廳、小吃等餐飲相關',
            subcategories: [
                { id: 'chinese', name: '中式料理', keywords: ['中式', '中餐', '台菜', '台式'] },
                { id: 'japanese', name: '日式料理', keywords: ['日式', '日料', '壽司', '拉麵', '丼飯'] },
                { id: 'korean', name: '韓式料理', keywords: ['韓式', '韓料', '韓食', '韓燒'] },
                { id: 'western', name: '西式料理', keywords: ['西式', '西餐', '義式', '義大利', '美式'] },
                { id: 'cafe', name: '咖啡廳', keywords: ['咖啡', '咖啡廳', '咖啡店'] },
                { id: 'restaurant', name: '餐廳', keywords: ['餐廳', '親子餐廳', '茶餐廳', '餐酒館'] },
                { id: 'breakfast', name: '早餐店', keywords: ['早餐', '早午餐', 'brunch'] },
                { id: 'hotpot', name: '火鍋', keywords: ['火鍋', '涮涮鍋'] },
                { id: 'other_food', name: '其他餐飲', keywords: ['美食', '餐飲', '小吃'] }
            ]
        },
        '購物消費': {
            id: 'shopping',
            description: '商店、超市、服飾等購物相關',
            subcategories: [
                { id: 'supermarket', name: '超市', keywords: ['超市', '全聯', '家樂福'] },
                { id: 'convenience', name: '便利商店', keywords: ['便利商店', '7-11', '全家'] },
                { id: 'clothing', name: '服飾店', keywords: ['服飾', '衣服', '服裝'] },
                { id: 'electronics', name: '電器行', keywords: ['電器', '3C', '電子'] },
                { id: 'bookstore', name: '書店', keywords: ['書店', '文具', '圖書'] },
                { id: 'department', name: '百貨公司', keywords: ['百貨', '商場'] },
                { id: 'other_shopping', name: '其他購物', keywords: ['購物', '商店'] }
            ]
        },
        '生活服務': {
            id: 'services',
            description: '美容、修繕、洗衣等生活服務',
            subcategories: [
                { id: 'beauty', name: '美容美髮', keywords: ['美髮', '美容', '沙龍'] },
                { id: 'repair', name: '修繕服務', keywords: ['修車', '修繕', '保養'] },
                { id: 'fitness', name: '健身中心', keywords: ['健身', '健身房', '運動'] },
                { id: 'other_services', name: '其他服務', keywords: ['服務', '工作室'] }
            ]
        },
        '醫療保健': {
            id: 'medical',
            description: '醫院、診所、藥局等醫療相關',
            subcategories: [
                { id: 'hospital', name: '醫院', keywords: ['醫院', '綜合醫院'] },
                { id: 'clinic', name: '診所', keywords: ['診所', '牙科', '眼科', '耳鼻喉科', '婦產科', '中醫', '西醫', '泌尿科', '復健科'] },
                { id: 'pharmacy', name: '藥局', keywords: ['藥局', '藥房'] },
                { id: 'other_medical', name: '其他醫療', keywords: ['醫療', '健康'] }
            ]
        },
        '教育培訓': {
            id: 'education',
            description: '補習班、學校、圖書館等教育相關',
            subcategories: [
                { id: 'cram_school', name: '補習班', keywords: ['補習班', '美語', '英語', '教育培訓'] },
                { id: 'school', name: '學校', keywords: ['學校', '幼兒園'] },
                { id: 'library', name: '圖書館', keywords: ['圖書館', '圖書'] },
                { id: 'cultural', name: '文化中心', keywords: ['文化中心', '藝術'] },
                { id: 'other_education', name: '其他教育', keywords: ['教育', '學習'] }
            ]
        },
        '休閒娛樂': {
            id: 'entertainment',
            description: '公園、景點、休閒中心等娛樂相關',
            subcategories: [
                { id: 'park', name: '公園', keywords: ['公園', '運動園區'] },
                { id: 'attraction', name: '觀光景點', keywords: ['觀光', '景點', '歷史建築'] },
                { id: 'leisure', name: '休閒中心', keywords: ['休閒', '娛樂'] },
                { id: 'nightmarket', name: '夜市', keywords: ['夜市'] },
                { id: 'other_entertainment', name: '其他休閒', keywords: ['休閒', '娛樂'] }
            ]
        },
        '住宿旅遊': {
            id: 'accommodation',
            description: '旅館、民宿等住宿相關',
            subcategories: [
                { id: 'hotel', name: '商旅', keywords: ['商旅', '旅館', '飯店'] },
                { id: 'homestay', name: '民宿', keywords: ['民宿'] },
                { id: 'other_accommodation', name: '其他住宿', keywords: ['住宿'] }
            ]
        },
        '其他': {
            id: 'other',
            description: '其他未分類的商家',
            subcategories: [
                { id: 'temple', name: '寺廟', keywords: ['寺廟', '宮廟'] },
                { id: 'other', name: '其他', keywords: ['其他', '未分類'] }
            ]
        }
    }
};

// 生成分類映射表
function generateCategoryMapping() {
    const mapping = {};
    
    Object.keys(categoryStructure.mainCategories).forEach(mainCategory => {
        const mainCat = categoryStructure.mainCategories[mainCategory];
        
        // 主分類映射
        mapping[mainCategory] = {
            main: mainCategory,
            sub: null,
            id: mainCat.id
        };
        
        // 子分類映射
        mainCat.subcategories.forEach(subCat => {
            // 子分類名稱映射
            mapping[subCat.name] = {
                main: mainCategory,
                sub: subCat.name,
                id: subCat.id
            };
            
            // 關鍵詞映射
            subCat.keywords.forEach(keyword => {
                mapping[keyword] = {
                    main: mainCategory,
                    sub: subCat.name,
                    id: subCat.id
                };
            });
        });
    });
    
    return mapping;
}

// 生成分類整理腳本
function generateCategoryMigrationScript() {
    const mapping = generateCategoryMapping();
    
    let script = `#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

const supabase = createClient(supabaseUrl, supabaseKey);

// 分類映射表
const categoryMapping = ${JSON.stringify(mapping, null, 2)};

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
        
        console.log(\`✅ 找到 \${merchants.length} 家商家\`);
        
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
        
        console.log('\\n📊 分類遷移統計:');
        Object.keys(migrationStats).forEach(category => {
            console.log(\`   \${category}: \${migrationStats[category]} 家\`);
        });
        
        if (unmappedCategories.size > 0) {
            console.log('\\n⚠️ 未映射的分類:');
            unmappedCategories.forEach(cat => {
                console.log(\`   - \${cat}\`);
            });
        }
        
        // 3. 執行分類更新
        console.log('\\n🔧 執行分類更新...');
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
                    console.error(\`❌ 更新商家 \${merchant.store_name} 失敗:\`, updateError.message);
                } else {
                    updatedCount++;
                }
            }
        }
        
        console.log(\`✅ 成功更新 \${updatedCount} 家商家的分類\`);
        
        // 4. 驗證結果
        console.log('\\n🔍 驗證分類結果...');
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
        
        console.log('\\n📊 最終分類統計:');
        Object.keys(finalStats).sort((a, b) => finalStats[b] - finalStats[a]).forEach(category => {
            console.log(\`   \${category}: \${finalStats[category]} 家\`);
        });
        
        console.log('\\n🎉 分類遷移完成！');
        return true;
        
    } catch (error) {
        console.error('❌ 遷移過程中發生錯誤:', error.message);
        return false;
    }
}

// 執行遷移
migrateCategories().then(success => {
    if (success) {
        console.log('\\n✅ 遷移成功完成！');
        process.exit(0);
    } else {
        console.log('\\n❌ 遷移失敗！');
        process.exit(1);
    }
});
`;
    
    return script;
}

async function main() {
    console.log('🎨 設計兩層分類架構...');
    
    // 1. 生成分類結構文檔
    const structureDoc = `# 商家分類架構設計

## 第一層：大分類

### 1. 餐飲美食 (33家)
- 中式料理 (4家)
- 日式料理 (6家) 
- 韓式料理 (3家)
- 西式料理 (4家)
- 咖啡廳 (6家)
- 餐廳 (1家)
- 早餐店 (1家)
- 火鍋 (2家)
- 其他餐飲 (6家)

### 2. 購物消費 (14家)
- 超市 (9家)
- 便利商店 (6家)
- 服飾店 (8家)
- 電器行 (6家)
- 書店 (5家)
- 百貨公司 (5家)
- 其他購物 (1家)

### 3. 生活服務 (8家)
- 美容美髮 (8家)
- 修繕服務 (4家)
- 健身中心 (4家)
- 其他服務 (1家)

### 4. 醫療保健 (41家)
- 醫院 (1家)
- 診所 (40家)
- 藥局 (7家)
- 其他醫療 (1家)

### 5. 教育培訓 (15家)
- 補習班 (7家)
- 學校 (1家)
- 圖書館 (2家)
- 文化中心 (2家)
- 其他教育 (3家)

### 6. 休閒娛樂 (12家)
- 公園 (2家)
- 觀光景點 (1家)
- 休閒中心 (2家)
- 夜市 (2家)
- 其他休閒 (5家)

### 7. 住宿旅遊 (4家)
- 商旅 (3家)
- 民宿 (1家)

### 8. 其他 (13家)
- 寺廟 (5家)
- 其他 (8家)

## 分類映射規則

### 餐飲美食
- 美食餐飲 → 餐飲美食
- 西式料理 → 餐飲美食
- 日式料理 → 餐飲美食
- 中式料理 → 餐飲美食
- 韓式料理 → 餐飲美食
- 義式料理 → 餐飲美食
- 台式料理 → 餐飲美食
- 咖啡廳 → 餐飲美食
- 親子餐廳 → 餐飲美食
- 餐廳 → 餐飲美食
- 茶餐廳 → 餐飲美食
- 餐酒館 → 餐飲美食
- 早午餐 → 餐飲美食
- 火鍋 → 餐飲美食

### 購物消費
- 超市 → 購物消費
- 便利商店 → 購物消費
- 服飾店 → 購物消費
- 電器行 → 購物消費
- 書店 → 購物消費
- 百貨公司 → 購物消費
- 文具店 → 購物消費

### 生活服務
- 美髮店 → 生活服務
- 修車廠 → 生活服務
- 健身房 → 生活服務

### 醫療保健
- 牙科 → 醫療保健
- 中醫 → 醫療保健
- 藥局 → 醫療保健
- 耳鼻喉科 → 醫療保健
- 眼科 → 醫療保健
- 婦產科 → 醫療保健
- 綜合醫院 → 醫療保健
- 西醫 → 醫療保健
- 泌尿科 → 醫療保健
- 復健科 → 醫療保健

### 教育培訓
- 補習班 → 教育培訓
- 教育培訓 → 教育培訓
- 圖書館 → 教育培訓
- 文化中心 → 教育培訓
- 幼兒園 → 教育培訓

### 休閒娛樂
- 公園 → 休閒娛樂
- 觀光景點 → 休閒娛樂
- 休閒中心 → 休閒娛樂
- 夜市 → 休閒娛樂
- 運動園區 → 休閒娛樂
- 歷史建築 → 休閒娛樂

### 住宿旅遊
- 商旅 → 住宿旅遊
- 民宿 → 住宿旅遊

### 其他
- 寺廟 → 其他
- 其他 → 其他
- 居家生活 → 其他
`;
    
    fs.writeFileSync('scripts/category-structure-design.md', structureDoc);
    console.log('✅ 分類架構設計文檔已生成: scripts/category-structure-design.md');
    
    // 2. 生成分類映射表
    const mapping = generateCategoryMapping();
    fs.writeFileSync('scripts/category-mapping.json', JSON.stringify(mapping, null, 2));
    console.log('✅ 分類映射表已生成: scripts/category-mapping.json');
    
    // 3. 生成遷移腳本
    const migrationScript = generateCategoryMigrationScript();
    fs.writeFileSync('scripts/migrate-categories.js', migrationScript);
    console.log('✅ 分類遷移腳本已生成: scripts/migrate-categories.js');
    
    // 4. 生成分類結構 JSON
    fs.writeFileSync('scripts/category-structure.json', JSON.stringify(categoryStructure, null, 2));
    console.log('✅ 分類結構 JSON 已生成: scripts/category-structure.json');
    
    console.log('\n🎉 分類架構設計完成！');
    console.log('\n📋 下一步:');
    console.log('1. 檢查分類架構設計: scripts/category-structure-design.md');
    console.log('2. 執行分類遷移: node scripts/migrate-categories.js');
    console.log('3. 驗證分類統計: 檢查管理後台的分類統計');
}

main();
