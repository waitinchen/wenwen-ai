// 商家資料種子腳本
import fs from 'fs';
import path from 'path';

console.log('🌱 開始重新 seed 商家資料...\n');

// 模擬商家資料
const mockMerchants = [
  {
    id: 1,
    name: '肯塔基美語',
    category: '教育培訓',
    address: '高雄市鳳山區文化路131號',
    phone: '07-7777789',
    isPartnerStore: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: '文山特區咖啡廳',
    category: '餐飲',
    address: '高雄市鳳山區文衡路123號',
    phone: '07-1234567',
    isPartnerStore: false,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: '鳳山書局',
    category: '零售',
    address: '高雄市鳳山區中正路456號',
    phone: '07-7654321',
    isPartnerStore: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 儲存商家資料
const merchantsFile = path.join(process.cwd(), 'data/catalog/merchants.json');
fs.mkdirSync(path.dirname(merchantsFile), { recursive: true });
fs.writeFileSync(merchantsFile, JSON.stringify(mockMerchants, null, 2), 'utf8');

console.log(`✅ 商家資料已重新 seed: ${mockMerchants.length} 筆資料`);
console.log(`📄 儲存位置: ${merchantsFile}`);

// 統計資訊
const partnerStores = mockMerchants.filter(m => m.isPartnerStore).length;
const activeStores = mockMerchants.filter(m => m.status === 'active').length;

console.log(`\n📊 商家資料統計:`);
console.log(`- 總商家數: ${mockMerchants.length}`);
console.log(`- 特約商家: ${partnerStores}`);
console.log(`- 活躍商家: ${activeStores}`);
console.log(`- 類別分布: ${[...new Set(mockMerchants.map(m => m.category))].join(', ')}`);

console.log('\n🎉 商家資料 seed 完成！');
