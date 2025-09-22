// 停車場資料種子腳本
import fs from 'fs';
import path from 'path';

console.log('🅿️ 開始重新 seed 停車場資料...\n');

// 檢查現有停車場資料
const parkingFile = path.join(process.cwd(), 'src/data/parkingLots.json');
let parkingLots = [];

if (fs.existsSync(parkingFile)) {
  try {
    const content = fs.readFileSync(parkingFile, 'utf8');
    parkingLots = JSON.parse(content);
    console.log(`📁 載入現有停車場資料: ${parkingLots.length} 筆`);
  } catch (error) {
    console.log(`⚠️ 載入現有資料失敗: ${error.message}`);
  }
}

// 如果沒有現有資料，建立模擬資料
if (parkingLots.length === 0) {
  console.log('📝 建立模擬停車場資料...');
  
  parkingLots = [
    {
      id: 'fs-001',
      name: '鳳山火車站停車場',
      address: '高雄市鳳山區曹公路6號',
      district: '鳳山區',
      latitude: 22.6275,
      longitude: 120.3591,
      type: 'public',
      totalSpaces: 200,
      carSpaces: 180,
      motorcycleSpaces: 20,
      hourlyRate: 20,
      dailyMax: 200,
      operatingHours: '24小時',
      is24Hours: true,
      features: ['24小時', '電子支付', '監控'],
      contact: '07-1234567',
      lastUpdated: new Date().toISOString().split('T')[0]
    },
    {
      id: 'fs-002',
      name: '文山特區停車場',
      address: '高雄市鳳山區文衡路100號',
      district: '鳳山區',
      latitude: 22.6250,
      longitude: 120.3600,
      type: 'private',
      totalSpaces: 150,
      carSpaces: 120,
      motorcycleSpaces: 30,
      hourlyRate: 30,
      dailyMax: 300,
      operatingHours: '06:00-22:00',
      is24Hours: false,
      features: ['電子支付', '監控', '代客泊車'],
      contact: '07-7654321',
      lastUpdated: new Date().toISOString().split('T')[0]
    },
    {
      id: 'fs-003',
      name: '鳳山區公所停車場',
      address: '高雄市鳳山區光復路132號',
      district: '鳳山區',
      latitude: 22.6300,
      longitude: 120.3550,
      type: 'public',
      totalSpaces: 80,
      carSpaces: 70,
      motorcycleSpaces: 10,
      hourlyRate: 15,
      dailyMax: 150,
      operatingHours: '08:00-18:00',
      is24Hours: false,
      features: ['公有', '便宜', '監控'],
      contact: '07-9876543',
      lastUpdated: new Date().toISOString().split('T')[0]
    }
  ];
}

// 更新資料時間戳
parkingLots.forEach(lot => {
  lot.lastUpdated = new Date().toISOString().split('T')[0];
});

// 儲存停車場資料
fs.mkdirSync(path.dirname(parkingFile), { recursive: true });
fs.writeFileSync(parkingFile, JSON.stringify(parkingLots, null, 2), 'utf8');

console.log(`✅ 停車場資料已重新 seed: ${parkingLots.length} 筆資料`);
console.log(`📄 儲存位置: ${parkingFile}`);

// 統計資訊
const publicLots = parkingLots.filter(lot => lot.type === 'public').length;
const privateLots = parkingLots.filter(lot => lot.type === 'private').length;
const roadsideLots = parkingLots.filter(lot => lot.type === 'roadside').length;
const twentyFourHourLots = parkingLots.filter(lot => lot.is24Hours).length;
const totalSpaces = parkingLots.reduce((sum, lot) => sum + lot.totalSpaces, 0);
const avgRate = parkingLots.reduce((sum, lot) => sum + lot.hourlyRate, 0) / parkingLots.length;

console.log(`\n📊 停車場資料統計:`);
console.log(`- 總停車場數: ${parkingLots.length}`);
console.log(`- 公有停車場: ${publicLots}`);
console.log(`- 民營停車場: ${privateLots}`);
console.log(`- 路邊停車場: ${roadsideLots}`);
console.log(`- 24小時停車場: ${twentyFourHourLots}`);
console.log(`- 總車位數: ${totalSpaces}`);
console.log(`- 平均費率: ${avgRate.toFixed(2)} 元/小時`);

console.log('\n🎉 停車場資料 seed 完成！');
