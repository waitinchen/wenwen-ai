// 高雄市鳳山區停車場場域資料庫整合
export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  district: string; // 鳳山區
  latitude: number;
  longitude: number;
  type: 'public' | 'private' | 'roadside';
  totalSpaces: number;
  carSpaces: number;
  motorcycleSpaces: number;
  hourlyRate: number;
  dailyMax: number;
  monthlyRate?: number;
  operatingHours: string;
  is24Hours: boolean;
  features: string[];
  contact: string;
  website?: string;
  lastUpdated: string;
}

// 鳳山區停車場資料
export const fengshanParkingLots: ParkingLot[] = [
  {
    id: 'fs-001',
    name: '鳳山甲一站停車場',
    address: '高雄市鳳山區五甲一路261號',
    district: '鳳山區',
    latitude: 22.6245,
    longitude: 120.3521,
    type: 'private',
    totalSpaces: 200,
    carSpaces: 200,
    motorcycleSpaces: 0,
    hourlyRate: 40,
    dailyMax: 200,
    monthlyRate: 2000,
    operatingHours: '24小時',
    is24Hours: true,
    features: ['月租', '日租', '臨停'],
    contact: '07-1234-5678',
    website: 'https://cityparking888.com',
    lastUpdated: '2025-01-22'
  },
  {
    id: 'fs-002',
    name: '光復路停車場',
    address: '高雄市鳳山區光復路二段132號',
    district: '鳳山區',
    latitude: 22.6189,
    longitude: 120.3487,
    type: 'private',
    totalSpaces: 414,
    carSpaces: 310,
    motorcycleSpaces: 104,
    hourlyRate: 30, // 每半小時15元
    dailyMax: 200,
    operatingHours: '24小時',
    is24Hours: true,
    features: ['汽車', '機車', '臨停'],
    contact: '07-2345-6789',
    website: 'https://youparking.com.tw',
    lastUpdated: '2025-01-22'
  },
  {
    id: 'fs-003',
    name: '鳳山火車站停車場',
    address: '高雄市鳳山區曹公路25號',
    district: '鳳山區',
    latitude: 22.6256,
    longitude: 120.3512,
    type: 'public',
    totalSpaces: 150,
    carSpaces: 120,
    motorcycleSpaces: 30,
    hourlyRate: 20,
    dailyMax: 150,
    operatingHours: '06:00-22:00',
    is24Hours: false,
    features: ['火車站', '轉乘', '臨停'],
    contact: '07-3456-7890',
    lastUpdated: '2025-01-22'
  }
];

// 停車場查詢函數
export function searchParkingLots(query: {
  district?: string;
  type?: 'public' | 'private' | 'roadside';
  is24Hours?: boolean;
  maxRate?: number;
  nearLat?: number;
  nearLng?: number;
  radius?: number; // 公里
}): ParkingLot[] {
  let results = fengshanParkingLots;

  // 區域篩選
  if (query.district) {
    results = results.filter(lot => lot.district === query.district);
  }

  // 類型篩選
  if (query.type) {
    results = results.filter(lot => lot.type === query.type);
  }

  // 24小時篩選
  if (query.is24Hours !== undefined) {
    results = results.filter(lot => lot.is24Hours === query.is24Hours);
  }

  // 價格篩選
  if (query.maxRate) {
    results = results.filter(lot => lot.hourlyRate <= query.maxRate);
  }

  // 距離篩選
  if (query.nearLat && query.nearLng && query.radius) {
    results = results.filter(lot => {
      const distance = calculateDistance(
        query.nearLat!,
        query.nearLng!,
        lot.latitude,
        lot.longitude
      );
      return distance <= query.radius!;
    });
  }

  return results;
}

// 計算兩點間距離（公里）
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // 地球半徑（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// 取得最近的停車場
export function getNearestParkingLots(latitude: number, longitude: number, limit: number = 5): ParkingLot[] {
  const lotsWithDistance = fengshanParkingLots.map(lot => ({
    ...lot,
    distance: calculateDistance(latitude, longitude, lot.latitude, lot.longitude)
  }));

  return lotsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

// 停車場統計
export function getParkingStats() {
  const total = fengshanParkingLots.length;
  const publicLots = fengshanParkingLots.filter(lot => lot.type === 'public').length;
  const privateLots = fengshanParkingLots.filter(lot => lot.type === 'private').length;
  const totalSpaces = fengshanParkingLots.reduce((sum, lot) => sum + lot.totalSpaces, 0);
  const avgRate = fengshanParkingLots.reduce((sum, lot) => sum + lot.hourlyRate, 0) / total;

  return {
    total,
    publicLots,
    privateLots,
    totalSpaces,
    avgRate: Math.round(avgRate)
  };
}
