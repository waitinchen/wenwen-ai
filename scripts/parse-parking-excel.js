// 解析高雄市鳳山區停車場場域資料庫 Excel 檔案
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excelFile = path.join(__dirname, '../高雄市鳳山區停車場場域資料庫.xlsx');
const outputFile = path.join(__dirname, '../src/data/parkingLots.json');

async function parseParkingExcel() {
  try {
    console.log('📊 開始解析停車場 Excel 檔案...');
    
    // 讀取 Excel 檔案
    const workbook = XLSX.readFile(excelFile);
    const sheetName = workbook.SheetNames[0]; // 取第一個工作表
    const worksheet = workbook.Sheets[sheetName];
    
    // 轉換為 JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`✅ 成功讀取 ${jsonData.length} 筆停車場資料`);
    console.log('📋 欄位結構:', Object.keys(jsonData[0] || {}));
    
    // 轉換為標準格式
    const parkingLots = jsonData.map((row, index) => ({
      id: `fs-${String(index + 1).padStart(3, '0')}`,
      name: row['停車場名稱'] || row['名稱'] || `停車場${index + 1}`,
      address: row['地址'] || row['位置'] || '',
      district: '鳳山區',
      latitude: parseFloat(row['緯度'] || row['lat'] || 0),
      longitude: parseFloat(row['經度'] || row['lng'] || 0),
      type: getParkingType(row['類型'] || row['性質'] || ''),
      totalSpaces: parseInt(row['總車位'] || row['車位數'] || 0),
      carSpaces: parseInt(row['汽車位'] || row['汽車車位'] || 0),
      motorcycleSpaces: parseInt(row['機車位'] || row['機車車位'] || 0),
      hourlyRate: parseFloat(row['時費'] || row['每小時費率'] || 0),
      dailyMax: parseFloat(row['日最高'] || row['當日最高'] || 0),
      monthlyRate: parseFloat(row['月租費'] || row['月費'] || 0) || undefined,
      operatingHours: row['營業時間'] || row['開放時間'] || '24小時',
      is24Hours: (row['營業時間'] || '').includes('24') || (row['營業時間'] || '').includes('全天'),
      features: parseFeatures(row['特色'] || row['設施'] || ''),
      contact: row['聯絡電話'] || row['電話'] || '',
      website: row['網站'] || row['官網'] || undefined,
      lastUpdated: new Date().toISOString().split('T')[0]
    }));

    // 確保輸出目錄存在
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 儲存為 JSON
    fs.writeFileSync(outputFile, JSON.stringify(parkingLots, null, 2), 'utf8');
    
    console.log(`✅ 成功轉換並儲存到: ${outputFile}`);
    console.log(`📊 共處理 ${parkingLots.length} 筆停車場資料`);
    
    // 顯示統計資訊
    const stats = {
      total: parkingLots.length,
      public: parkingLots.filter(p => p.type === 'public').length,
      private: parkingLots.filter(p => p.type === 'private').length,
      totalSpaces: parkingLots.reduce((sum, p) => sum + p.totalSpaces, 0),
      avgRate: Math.round(parkingLots.reduce((sum, p) => sum + p.hourlyRate, 0) / parkingLots.length)
    };
    
    console.log('📈 統計資訊:', stats);
    
  } catch (error) {
    console.error('❌ 解析失敗:', error.message);
    console.log('💡 請確認 Excel 檔案存在且格式正確');
  }
}

function getParkingType(typeStr) {
  if (!typeStr) return 'private';
  const str = typeStr.toLowerCase();
  if (str.includes('公有') || str.includes('公營')) return 'public';
  if (str.includes('民營') || str.includes('私營')) return 'private';
  if (str.includes('路邊')) return 'roadside';
  return 'private';
}

function parseFeatures(featuresStr) {
  if (!featuresStr) return [];
  return featuresStr.split(/[、,，]/).map(f => f.trim()).filter(f => f);
}

// 執行解析
parseParkingExcel();
