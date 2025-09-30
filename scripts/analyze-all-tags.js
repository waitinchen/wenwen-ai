/**
 * 分析所有母標籤及子標籤
 * 展開完整的標籤體系
 */

async function analyzeAllTags() {
  console.log('🏷️ 展開所有母標籤及子標籤');
  console.log('==========================================');

  const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.PR5LV3ENSwpxYgml6L7PpyerZHAbfQzdC0ny0JVhcBo';

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 獲取所有已審核的商家
    console.log('\n📊 獲取所有商家資料...');
    const { data: allStores, error } = await supabase
      .from('stores')
      .select('*')
      .eq('approval', 'approved');
    
    if (error) {
      console.log('❌ 查詢失敗:', error.message);
      return;
    }
    
    console.log(`✅ 找到 ${allStores.length} 個已審核商家`);
    
    // 分析母標籤（主要類別）
    console.log('\n🏷️ 母標籤分析（主要類別）');
    console.log('==========================================');
    
    const categoryMap = new Map();
    allStores.forEach(store => {
      const category = store.category || '未分類';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category).push(store);
    });
    
    // 按商家數量排序
    const sortedCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1].length - a[1].length);
    
    sortedCategories.forEach(([category, stores]) => {
      console.log(`\n📂 ${category} (${stores.length} 個商家)`);
      stores.forEach(store => {
        console.log(`   🏪 ${store.store_name}`);
      });
    });
    
    // 分析子標籤（secondary_category）
    console.log('\n🏷️ 子標籤分析（次要類別）');
    console.log('==========================================');
    
    const subcategoryMap = new Map();
    allStores.forEach(store => {
      let subcategory = '未分類';
      try {
        if (store.features) {
          const featuresObj = JSON.parse(store.features);
          subcategory = featuresObj.secondary_category || '未分類';
        }
      } catch (e) {
        // 忽略 JSON 解析錯誤
      }
      
      if (!subcategoryMap.has(subcategory)) {
        subcategoryMap.set(subcategory, []);
      }
      subcategoryMap.get(subcategory).push(store);
    });
    
    // 按商家數量排序
    const sortedSubcategories = Array.from(subcategoryMap.entries())
      .sort((a, b) => b[1].length - a[1].length);
    
    sortedSubcategories.forEach(([subcategory, stores]) => {
      console.log(`\n📂 ${subcategory} (${stores.length} 個商家)`);
      stores.forEach(store => {
        console.log(`   🏪 ${store.store_name}`);
      });
    });
    
    // 分析料理類型標籤
    console.log('\n🍽️ 料理類型標籤分析');
    console.log('==========================================');
    
    const cuisineTypes = {
      '日式料理': [],
      '韓式料理': [],
      '中式料理': [],
      '義式料理': [],
      '美式料理': [],
      '泰式料理': [],
      '港式料理': [],
      '其他料理': []
    };
    
    allStores.forEach(store => {
      const storeName = (store.store_name || '').toLowerCase();
      const category = (store.category || '').toLowerCase();
      const features = (store.features || '').toLowerCase();
      
      // 解析 secondary_category
      let secondaryCategory = '';
      try {
        if (store.features) {
          const featuresObj = JSON.parse(store.features);
          secondaryCategory = (featuresObj.secondary_category || '').toLowerCase();
        }
      } catch (e) {
        // 忽略 JSON 解析錯誤
      }
      
      // 日式料理
      if (storeName.includes('日') || 
          category.includes('日') || 
          features.includes('日') ||
          storeName.includes('壽司') ||
          storeName.includes('拉麵') ||
          storeName.includes('和食') ||
          storeName.includes('天婦羅') ||
          storeName.includes('居酒屋') ||
          storeName.includes('燒肉') ||
          storeName.includes('丼飯') ||
          storeName.includes('壽司郎') ||
          features.includes('壽司') ||
          features.includes('拉麵') ||
          features.includes('和食') ||
          secondaryCategory.includes('壽司') ||
          secondaryCategory.includes('日式') ||
          secondaryCategory.includes('居酒屋') ||
          secondaryCategory.includes('丼飯')) {
        cuisineTypes['日式料理'].push(store);
      }
      // 韓式料理
      else if (storeName.includes('韓') || 
               category.includes('韓') || 
               features.includes('韓') ||
               storeName.includes('烤肉') ||
               storeName.includes('泡菜') ||
               storeName.includes('石鍋') ||
               storeName.includes('韓國') ||
               storeName.includes('玉豆腐') ||
               features.includes('烤肉') ||
               features.includes('泡菜') ||
               features.includes('石鍋') ||
               secondaryCategory.includes('韓式') ||
               secondaryCategory.includes('烤肉') ||
               secondaryCategory.includes('韓國')) {
        cuisineTypes['韓式料理'].push(store);
      }
      // 中式料理
      else if (storeName.includes('中') || 
               category.includes('中') || 
               features.includes('中') ||
               storeName.includes('牛肉麵') ||
               storeName.includes('家常菜') ||
               storeName.includes('合菜') ||
               storeName.includes('港式') ||
               features.includes('牛肉麵') ||
               features.includes('家常菜') ||
               features.includes('合菜') ||
               secondaryCategory.includes('中式') ||
               secondaryCategory.includes('牛肉麵') ||
               secondaryCategory.includes('家常菜') ||
               secondaryCategory.includes('合菜') ||
               secondaryCategory.includes('港式')) {
        cuisineTypes['中式料理'].push(store);
      }
      // 義式料理
      else if (storeName.includes('義') || 
               category.includes('義') || 
               features.includes('義') ||
               storeName.includes('義大利') ||
               storeName.includes('pasta') ||
               features.includes('義大利') ||
               features.includes('pasta') ||
               secondaryCategory.includes('義大利') ||
               secondaryCategory.includes('義式')) {
        cuisineTypes['義式料理'].push(store);
      }
      // 美式料理
      else if (storeName.includes('美') || 
               category.includes('美') || 
               features.includes('美') ||
               storeName.includes('漢堡') ||
               storeName.includes('牛排') ||
               features.includes('漢堡') ||
               features.includes('牛排') ||
               secondaryCategory.includes('美式') ||
               secondaryCategory.includes('漢堡') ||
               secondaryCategory.includes('牛排')) {
        cuisineTypes['美式料理'].push(store);
      }
      // 泰式料理
      else if (storeName.includes('泰') || 
               category.includes('泰') || 
               features.includes('泰') ||
               storeName.includes('泰式') ||
               features.includes('泰式') ||
               secondaryCategory.includes('泰式')) {
        cuisineTypes['泰式料理'].push(store);
      }
      // 港式料理
      else if (storeName.includes('港') || 
               category.includes('港') || 
               features.includes('港') ||
               storeName.includes('港式') ||
               features.includes('港式') ||
               secondaryCategory.includes('港式')) {
        cuisineTypes['港式料理'].push(store);
      }
      // 其他料理
      else {
        cuisineTypes['其他料理'].push(store);
      }
    });
    
    // 顯示料理類型分析
    Object.entries(cuisineTypes).forEach(([cuisineType, stores]) => {
      if (stores.length > 0) {
        console.log(`\n🍽️ ${cuisineType} (${stores.length} 個商家)`);
        stores.forEach(store => {
          console.log(`   🏪 ${store.store_name}`);
        });
      }
    });
    
    // 分析特殊標籤
    console.log('\n🏷️ 特殊標籤分析');
    console.log('==========================================');
    
    const specialTags = {
      '特約商家': [],
      '高評分商家': [],
      '新商家': [],
      '連鎖品牌': []
    };
    
    allStores.forEach(store => {
      // 特約商家
      if (store.is_partner_store) {
        specialTags['特約商家'].push(store);
      }
      
      // 高評分商家 (4.5分以上)
      try {
        if (store.features) {
          const featuresObj = JSON.parse(store.features);
          const rating = parseFloat(featuresObj.rating);
          if (rating >= 4.5) {
            specialTags['高評分商家'].push(store);
          }
        }
      } catch (e) {
        // 忽略 JSON 解析錯誤
      }
      
      // 連鎖品牌 (名稱包含特定關鍵字)
      const storeName = (store.store_name || '').toLowerCase();
      if (storeName.includes('店') || 
          storeName.includes('分店') || 
          storeName.includes('連鎖') ||
          storeName.includes('品牌')) {
        specialTags['連鎖品牌'].push(store);
      }
    });
    
    // 顯示特殊標籤分析
    Object.entries(specialTags).forEach(([tagType, stores]) => {
      if (stores.length > 0) {
        console.log(`\n🏷️ ${tagType} (${stores.length} 個商家)`);
        stores.forEach(store => {
          console.log(`   🏪 ${store.store_name}`);
        });
      }
    });
    
    // 總結
    console.log('\n📊 標籤體系總結');
    console.log('==========================================');
    console.log(`📂 母標籤（主要類別）: ${categoryMap.size} 個`);
    console.log(`📂 子標籤（次要類別）: ${subcategoryMap.size} 個`);
    console.log(`🍽️ 料理類型: ${Object.values(cuisineTypes).filter(stores => stores.length > 0).length} 個`);
    console.log(`🏷️ 特殊標籤: ${Object.values(specialTags).filter(stores => stores.length > 0).length} 個`);
    console.log(`📊 總商家數: ${allStores.length} 個`);
    
  } catch (error) {
    console.log('❌ 分析過程異常:', error.message);
  }
}

// 執行分析
analyzeAllTags()
  .then(() => {
    console.log('\n✅ 標籤分析完成');
  })
  .catch(error => {
    console.error('分析執行失敗:', error);
  });





