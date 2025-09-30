/**
 * 添加金太郎壽司到商家管理系統
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzkwNzQ4NSwiZXhwIjoyMDczNDgzNDg1fQ.qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addKintaroSushi() {
  console.log('🍣 開始添加金太郎壽司到商家管理系統...')
  
  try {
    // 金太郎壽司的詳細資料
    const kintaroSushi = {
      store_name: '金太郎壽司',
      owner: '金太郎',
      role: '店主',
      category: '餐飲美食',
      address: '高雄市鳳山區文衡路28號',
      phone: '07-224-5500',
      business_hours: '營業中, 結束營業時間: 20:30',
      services: '日式料理, 壽司, 生魚片, 丼飯',
      features: JSON.stringify({
        rating: 4.5,
        reviews: 63,
        price_level: '$200-400',
        business_status: '營業中',
        secondary_category: '日式料理',
        district_area: '鳳山文山特區',
        map_link: 'https://maps.google.com/?q=22.6156756,120.3544214',
        latitude: 22.6156756,
        longitude: 120.3544214,
        payment_methods: ['現金'],
        amenities: ['兒童高腳椅'],
        menu_url: 'facebook.com'
      }),
      is_safe_store: true,
      has_member_discount: true,
      is_partner_store: false,
      facebook_url: 'https://facebook.com/kintaro-sushi',
      website_url: '',
      approval: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('📝 準備添加的商家資料:')
    console.log(JSON.stringify(kintaroSushi, null, 2))

    // 檢查是否已存在
    const { data: existingStore } = await supabase
      .from('stores')
      .select('id, store_name')
      .eq('store_name', '金太郎壽司')
      .single()

    if (existingStore) {
      console.log('⚠️  金太郎壽司已存在，ID:', existingStore.id)
      return existingStore
    }

    // 添加新商家
    const { data, error } = await supabase
      .from('stores')
      .insert(kintaroSushi)
      .select()

    if (error) {
      console.error('❌ 添加失敗:', error)
      throw error
    }

    console.log('✅ 金太郎壽司添加成功！')
    console.log('📋 商家ID:', data[0].id)
    console.log('🏪 商家名稱:', data[0].store_name)
    console.log('📍 地址:', data[0].address)
    console.log('📞 電話:', data[0].phone)
    console.log('🏷️  分類:', data[0].category)
    console.log('🍣 子分類:', JSON.parse(data[0].features).secondary_category)

    return data[0]

  } catch (error) {
    console.error('❌ 添加金太郎壽司時發生錯誤:', error)
    throw error
  }
}

// 執行添加
addKintaroSushi()
  .then((result) => {
    console.log('\n🎉 金太郎壽司添加完成！')
    console.log('現在可以在商家管理頁面看到金太郎壽司了。')
  })
  .catch((error) => {
    console.error('💥 添加失敗:', error.message)
    process.exit(1)
  })


