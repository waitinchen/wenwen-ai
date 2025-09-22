// 高文文停車場推薦功能整合
import { searchParkingLots, getNearestParkingLots, ParkingLot } from './parkingData';

// 停車場推薦邏輯
export function getParkingRecommendations(userMessage: string, userLocation?: { lat: number; lng: number }): ParkingLot[] {
  const message = userMessage.toLowerCase();
  
  // 關鍵字檢測
  const parkingKeywords = [
    '停車', '停車場', '車位', '停車位', 'parking',
    '停車費', '停車費率', '停車時間', '停車資訊',
    '哪裡停車', '怎麼停車', '停車方便', '停車問題'
  ];
  
  const isParkingRelated = parkingKeywords.some(keyword => message.includes(keyword));
  
  if (!isParkingRelated) {
    return [];
  }
  
  // 根據用戶位置推薦
  if (userLocation) {
    return getNearestParkingLots(userLocation.lat, userLocation.lng, 5);
  }
  
  // 根據關鍵字推薦
  let recommendations: ParkingLot[] = [];
  
  // 24小時停車場
  if (message.includes('24小時') || message.includes('全天') || message.includes('晚上')) {
    recommendations = searchParkingLots({ is24Hours: true });
  }
  // 便宜停車場
  else if (message.includes('便宜') || message.includes('省錢') || message.includes('經濟')) {
    recommendations = searchParkingLots({ maxRate: 30 });
  }
  // 公有停車場
  else if (message.includes('公有') || message.includes('公營') || message.includes('政府')) {
    recommendations = searchParkingLots({ type: 'public' });
  }
  // 一般推薦
  else {
    recommendations = searchParkingLots({});
  }
  
  return recommendations.slice(0, 5);
}

// 生成高文文風格的停車場推薦回應
export function generateParkingResponse(recommendations: ParkingLot[], userMessage: string): string {
  if (recommendations.length === 0) {
    return `哎呀！我沒有找到相關的停車場資訊呢～😅 要不要試試看其他關鍵字，或者告訴我你在哪個區域，我幫你找找看！`;
  }
  
  const message = userMessage.toLowerCase();
  
  // 根據不同情況生成回應
  let response = '';
  
  if (message.includes('24小時') || message.includes('全天')) {
    response = `我來幫你找24小時的停車場！✨ 鳳山區有這些全天開放的停車場：\n\n`;
  } else if (message.includes('便宜') || message.includes('省錢')) {
    response = `我超推薦這些經濟實惠的停車場！💰 都是鳳山區CP值很高的選擇：\n\n`;
  } else if (message.includes('公有') || message.includes('公營')) {
    response = `我來介紹鳳山區的公有停車場！🏛️ 這些都是政府管理的，品質有保證：\n\n`;
  } else {
    response = `我來推薦鳳山區的優質停車場！🚗 這些都是我精挑細選的：\n\n`;
  }
  
  // 添加停車場資訊
  recommendations.forEach((lot, index) => {
    const rateText = lot.hourlyRate > 0 ? `每小時 ${lot.hourlyRate} 元` : '免費';
    const dailyText = lot.dailyMax > 0 ? `，當日最高 ${lot.dailyMax} 元` : '';
    const spacesText = lot.totalSpaces > 0 ? `（${lot.totalSpaces} 個車位）` : '';
    const hoursText = lot.is24Hours ? '24小時營業' : lot.operatingHours;
    
    response += `**${index + 1}. ${lot.name}** 🅿️\n`;
    response += `📍 ${lot.address}\n`;
    response += `💰 ${rateText}${dailyText}\n`;
    response += `🕒 ${hoursText}\n`;
    response += `🚗 ${spacesText}\n`;
    
    if (lot.features && lot.features.length > 0) {
      response += `✨ 特色：${lot.features.join('、')}\n`;
    }
    
    if (lot.contact) {
      response += `📞 ${lot.contact}\n`;
    }
    
    response += `\n`;
  });
  
  // 添加額外建議
  response += `💡 **小提醒：**\n`;
  response += `- 建議先打電話確認車位狀況\n`;
  response += `- 記得記下停車位置，避免找不到車\n`;
  response += `- 鳳山火車站附近停車比較方便\n\n`;
  
  response += `有什麼其他停車問題都可以問我喔！我對鳳山區超熟的～😊`;
  
  return response;
}

// 停車場查詢輔助函數
export function getParkingQueryHints(userMessage: string): string[] {
  const message = userMessage.toLowerCase();
  const hints: string[] = [];
  
  if (message.includes('停車') && !message.includes('24小時')) {
    hints.push('可以問「24小時停車場」');
  }
  
  if (message.includes('停車') && !message.includes('便宜')) {
    hints.push('可以問「便宜的停車場」');
  }
  
  if (message.includes('停車') && !message.includes('公有')) {
    hints.push('可以問「公有停車場」');
  }
  
  if (!message.includes('位置') && !message.includes('地址')) {
    hints.push('可以告訴我你的位置，我推薦最近的停車場');
  }
  
  return hints;
}
