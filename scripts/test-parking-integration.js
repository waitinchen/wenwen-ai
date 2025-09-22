// 高文文停車場推薦功能驗收測試
import { getParkingRecommendations, generateParkingResponse } from '../src/lib/parkingRecommendation.js';
import fs from 'fs';
import path from 'path';

const parkingLots = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/data/parkingLots.json'), 'utf8'));

console.log('🧪 開始高文文停車場推薦功能驗收測試...\n');

// 測試案例
const testCases = [
  {
    name: '基本停車場查詢',
    message: '我想找停車場',
    expected: '應該返回停車場推薦'
  },
  {
    name: '24小時停車場查詢',
    message: '有沒有24小時的停車場？',
    expected: '應該返回24小時停車場推薦'
  },
  {
    name: '便宜停車場查詢',
    message: '推薦便宜的停車場',
    expected: '應該返回低費率停車場推薦'
  },
  {
    name: '公有停車場查詢',
    message: '公有停車場在哪裡？',
    expected: '應該返回公有停車場推薦'
  },
  {
    name: '非停車場相關查詢',
    message: '我想吃美食',
    expected: '應該返回空陣列'
  }
];

// 執行測試
let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
  console.log(`📋 測試 ${index + 1}: ${testCase.name}`);
  console.log(`💬 輸入: "${testCase.message}"`);
  
  try {
    // 測試推薦邏輯
    const recommendations = getParkingRecommendations(testCase.message);
    console.log(`🎯 推薦數量: ${recommendations.length}`);
    
    if (recommendations.length > 0) {
      console.log(`📍 推薦停車場: ${recommendations.map(lot => lot.name).join(', ')}`);
      
      // 測試回應生成
      const response = generateParkingResponse(recommendations, testCase.message);
      console.log(`💭 高文文回應長度: ${response.length} 字`);
      console.log(`✨ 回應預覽: ${response.substring(0, 100)}...`);
    }
    
    // 驗證結果
    const isValid = testCase.message.includes('停車') ? 
      recommendations.length > 0 : 
      recommendations.length === 0;
    
    if (isValid) {
      console.log(`✅ 通過`);
      passedTests++;
    } else {
      console.log(`❌ 失敗 - ${testCase.expected}`);
    }
    
  } catch (error) {
    console.log(`❌ 錯誤: ${error.message}`);
  }
  
  console.log('─'.repeat(50));
});

// 測試資料完整性
console.log('\n📊 資料完整性檢查:');
console.log(`📁 總停車場數量: ${parkingLots.length}`);
console.log(`🏢 公有停車場: ${parkingLots.filter(lot => lot.type === 'public').length}`);
console.log(`🏪 民營停車場: ${parkingLots.filter(lot => lot.type === 'private').length}`);
console.log(`🛣️ 路邊停車場: ${parkingLots.filter(lot => lot.type === 'roadside').length}`);
console.log(`🕒 24小時停車場: ${parkingLots.filter(lot => lot.is24Hours).length}`);

// 測試統計
const avgRate = parkingLots.reduce((sum, lot) => sum + lot.hourlyRate, 0) / parkingLots.length;
console.log(`💰 平均費率: ${avgRate.toFixed(2)} 元/小時`);

// 測試結果總結
console.log('\n🎯 測試結果總結:');
console.log(`✅ 通過: ${passedTests}/${totalTests}`);
console.log(`❌ 失敗: ${totalTests - passedTests}/${totalTests}`);
console.log(`📈 成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n🎉 所有測試通過！高文文停車場推薦功能驗收成功！');
} else {
  console.log('\n⚠️ 部分測試失敗，需要檢查功能實現。');
}

// 功能建議
console.log('\n💡 功能建議:');
console.log('1. 可以加入用戶位置定位功能');
console.log('2. 可以加入停車場即時車位查詢');
console.log('3. 可以加入停車場評價系統');
console.log('4. 可以加入停車場預約功能');
