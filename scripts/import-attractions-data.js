/**
 * 導入景點資料到資料庫
 * 將鳳山區的歷史古蹟和景點資料加入 stores 表
 */

const SUPABASE_URL = 'https://vqcuwjfxoxjgsrueqodj.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE';

// 景點資料
const attractionsData = [
  {
    store_name: '鳳儀書院',
    address: '高雄市鳳山區鳳明街62號',
    category: '景點觀光',
    features: JSON.stringify({
      secondary_category: '歷史古蹟',
      district: '鳳山古城區',
      nearby_landmarks: '鳳明街',
      services: '歷史建築參觀、文化導覽',
      original_category: '景點',
      original_subcategory: '歷史古蹟',
      tags: ['歷史', '古蹟', '書院', '文化', '教育']
    }),
    phone: '',
    business_hours: '週二至週日 09:00-17:00',
    services: '歷史建築參觀',
    approval: 'approved',
    is_trusted: true,
    is_partner_store: false,
    sponsorship_tier: 0,
    rating: 4.5,
    is_safe_store: true,
    has_member_discount: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    store_name: '鳳山龍山寺',
    address: '高雄市鳳山區中山路7號',
    category: '景點觀光',
    features: JSON.stringify({
      secondary_category: '國定古蹟',
      district: '鳳山古城區',
      nearby_landmarks: '中山路',
      services: '宗教參拜、歷史建築參觀',
      original_category: '景點',
      original_subcategory: '國定古蹟',
      tags: ['寺廟', '古蹟', '宗教', '文化', '歷史']
    }),
    phone: '',
    business_hours: '每日 06:00-21:00',
    services: '宗教參拜、歷史建築參觀',
    approval: 'approved',
    is_trusted: true,
    is_partner_store: false,
    sponsorship_tier: 0,
    rating: 4.7,
    is_safe_store: true,
    has_member_discount: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    store_name: '曹公圳',
    address: '流經鳳山等多個區域，鳳山車站附近',
    category: '景點觀光',
    features: JSON.stringify({
      secondary_category: '水利設施',
      district: '鳳山車站周邊',
      nearby_landmarks: '鳳山車站',
      services: '河岸步道、休閒散步',
      original_category: '景點',
      original_subcategory: '水利設施',
      tags: ['水圳', '步道', '休閒', '歷史', '水利']
    }),
    phone: '',
    business_hours: '24小時開放',
    services: '河岸步道、休閒散步',
    approval: 'approved',
    is_trusted: true,
    is_partner_store: false,
    sponsorship_tier: 0,
    rating: 4.2,
    is_safe_store: true,
    has_member_discount: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    store_name: '平成砲台',
    address: '高雄市鳳山區曹公路25-3號',
    category: '景點觀光',
    features: JSON.stringify({
      secondary_category: '歷史古蹟',
      district: '鳳山古城區',
      nearby_landmarks: '曹公路',
      services: '歷史建築參觀、文化導覽',
      original_category: '景點',
      original_subcategory: '歷史古蹟',
      tags: ['砲台', '古蹟', '歷史', '軍事', '文化']
    }),
    phone: '',
    business_hours: '每日 09:00-17:00',
    services: '歷史建築參觀',
    approval: 'approved',
    is_trusted: true,
    is_partner_store: false,
    sponsorship_tier: 0,
    rating: 4.3,
    is_safe_store: true,
    has_member_discount: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    store_name: '東便門',
    address: '高雄市鳳山區三民路44巷28號',
    category: '景點觀光',
    features: JSON.stringify({
      secondary_category: '歷史古蹟',
      district: '鳳山古城區',
      nearby_landmarks: '三民路',
      services: '歷史建築參觀、文化導覽',
      original_category: '景點',
      original_subcategory: '歷史古蹟',
      tags: ['城門', '古蹟', '歷史', '文化', '建築']
    }),
    phone: '',
    business_hours: '每日 09:00-17:00',
    services: '歷史建築參觀',
    approval: 'approved',
    is_trusted: true,
    is_partner_store: false,
    sponsorship_tier: 0,
    rating: 4.1,
    is_safe_store: true,
    has_member_discount: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    store_name: '訓風砲台',
    address: '高雄市鳳山區勝利路',
    category: '景點觀光',
    features: JSON.stringify({
      secondary_category: '歷史古蹟',
      district: '鳳山古城區',
      nearby_landmarks: '勝利路',
      services: '歷史建築參觀、文化導覽',
      original_category: '景點',
      original_subcategory: '歷史古蹟',
      tags: ['砲台', '古蹟', '歷史', '軍事', '文化']
    }),
    phone: '',
    business_hours: '每日 09:00-17:00',
    services: '歷史建築參觀',
    approval: 'approved',
    is_trusted: true,
    is_partner_store: false,
    sponsorship_tier: 0,
    rating: 4.2,
    is_safe_store: true,
    has_member_discount: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    store_name: '鳳山縣舊城',
    address: '高雄市左營區勝利路117號（遺址分散）',
    category: '景點觀光',
    features: JSON.stringify({
      secondary_category: '國定古蹟',
      district: '左營區',
      nearby_landmarks: '勝利路',
      services: '歷史建築參觀、文化導覽',
      original_category: '景點',
      original_subcategory: '國定古蹟',
      tags: ['古城', '古蹟', '歷史', '文化', '遺址']
    }),
    phone: '',
    business_hours: '每日 09:00-17:00',
    services: '歷史建築參觀',
    approval: 'approved',
    is_trusted: true,
    is_partner_store: false,
    sponsorship_tier: 0,
    rating: 4.6,
    is_safe_store: true,
    has_member_discount: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

async function importAttractionsData() {
  console.log('🎯 開始導入景點資料...\n');
  
  try {
    // 檢查是否已存在這些景點
    console.log('🔍 檢查現有景點資料...');
    const existingResponse = await fetch(`${SUPABASE_URL}/rest/v1/stores?category=eq.景點觀光&select=store_name`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const existingAttractions = await existingResponse.json();
    console.log(`📊 現有景點數量: ${existingAttractions.length}`);
    
    if (existingAttractions.length > 0) {
      console.log('現有景點:');
      existingAttractions.forEach(attraction => {
        console.log(`  - ${attraction.store_name}`);
      });
    }
    
    // 導入新景點資料
    console.log('\n📝 導入景點資料...');
    const importResponse = await fetch(`${SUPABASE_URL}/rest/v1/stores`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(attractionsData)
    });
    
    if (importResponse.ok) {
      console.log('✅ 景點資料導入成功！');
      console.log(`📊 共導入 ${attractionsData.length} 個景點`);
      
      // 顯示導入的景點
      console.log('\n🎯 導入的景點:');
      attractionsData.forEach((attraction, index) => {
        console.log(`${index + 1}. ${attraction.store_name} (${attraction.features.secondary_category})`);
        console.log(`   📍 ${attraction.address}`);
        console.log(`   ⭐ 評分: ${attraction.rating}/5`);
        console.log('');
      });
      
    } else {
      const errorText = await importResponse.text();
      console.log(`❌ 導入失敗: ${importResponse.status}`);
      console.log(`錯誤詳情: ${errorText}`);
    }
    
  } catch (error) {
    console.log(`❌ 導入過程發生錯誤: ${error.message}`);
  }
}

// 執行導入
importAttractionsData().catch(console.error);
