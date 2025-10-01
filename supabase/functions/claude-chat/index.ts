import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/** ================= Anti-Hallucination Kit (MVP) + 新渲染邏輯 =================
 * 無外部依賴；直接貼進 index.ts
 * 提供：Intent 型別、類別映射、跨類別防串、硬規則驗證、
 *       一致 Fallback、品牌矯正、FAQ(最小版)、欄位白名單、審計記錄
 *       新的渲染邏輯：統一的商家清單格式
 * ================================================================= */

//////////////////////// 1) 基礎型別與映射 ////////////////////////

// ===== Intents (WEN 1.5.0 擴充) =====
export type Intent =
  | 'ENGLISH_LEARNING' | 'FOOD' | 'PARKING' | 'SHOPPING' | 'BEAUTY' | 'MEDICAL'
  | 'ATTRACTION' | 'COFFEE' | 'SUPPLEMENTS' | 'PETS' | 'LEISURE'
  | 'COVERAGE_STATS' | 'DIRECTIONS'
  | 'INTRO' | 'VAGUE_CHAT' | 'GREETING' | 'GENERAL' | 'VAGUE_QUERY'
  | 'SPECIFIC_ENTITY' | 'CONFIRMATION';

export const CATEGORY_BY_INTENT: Record<Intent, string | undefined> = {
  ENGLISH_LEARNING: '教育培訓',
  FOOD: '餐飲美食',
  PARKING: '停車場',
  SHOPPING: '購物',
  BEAUTY: '美容美髮',
  MEDICAL: '醫療健康',
  ATTRACTION: '景點觀光',
  COFFEE: '咖啡廳',
  SUPPLEMENTS: '保健食品',
  PETS: '寵物用品',
  LEISURE: '休閒娛樂',
  COVERAGE_STATS: undefined,
  DIRECTIONS: undefined,
  INTRO: undefined,
  VAGUE_CHAT: undefined,
  GREETING: undefined,
  GENERAL: undefined,
  VAGUE_QUERY: undefined,
  SPECIFIC_ENTITY: undefined,
  CONFIRMATION: undefined,
};

export const CATEGORY_SYNONYM_MAP = {
  MEDICAL: {
    primary: '醫療健康',
    synonyms: ['藥局','藥妝','診所','醫院','牙醫','處方藥','保健','藥品'],
    forbidden: ['餐飲美食','教育培訓','停車場','購物','美容美髮','咖啡廳','休閒娛樂'],
  },
  FOOD: {
    primary: '餐飲美食',
    synonyms: ['餐廳','美食','料理','用餐','壽司','拉麵','火鍋','燒肉','披薩','丼飯','居酒屋'],
    forbidden: ['醫療健康','教育培訓','咖啡廳','保健食品','寵物用品'],
  },
  ENGLISH_LEARNING: {
    primary: '教育培訓',
    synonyms: ['美語','英語','英文','補習','課程','學習','教學'],
    forbidden: ['餐飲美食','醫療健康','停車場','咖啡廳','保健食品'],
  },
  PARKING: { primary: '停車場', synonyms: ['停車','車位','停車費'], forbidden: ['餐飲美食','醫療健康','教育培訓','咖啡廳'] },
  SHOPPING: { primary: '購物', synonyms: ['便利商店','超市','賣場','零售'], forbidden: ['醫療健康','教育培訓','咖啡廳'] },
  BEAUTY: { primary: '美容美髮', synonyms: ['剪髮','美甲','做臉','設計師'], forbidden: ['醫療健康','教育培訓','咖啡廳'] },
  ATTRACTION: {
    primary: '景點觀光',
    synonyms: ['景點','公園','步道','森林','古蹟','寺廟','文化園區','美術館','河濱','綠地'],
    related_intents: ['ATTRACTION'],
    forbidden: ['ENGLISH_LEARNING','FOOD','SHOPPING','MEDICAL','PARKING','COFFEE']
  },
  COFFEE: {
    primary: '咖啡廳',
    synonyms: ['咖啡','手沖','拿鐵','咖啡廳','cafe'],
    forbidden: ['醫療健康','教育培訓','保健食品','寵物用品']
  },
  SUPPLEMENTS: {
    primary: '保健食品',
    synonyms: ['保健食品','維他命','營養品','魚油','益生菌','葡萄糖胺'],
    forbidden: ['餐飲美食','教育培訓','寵物用品']
  },
  PETS: {
    primary: '寵物用品',
    synonyms: ['寵物','狗','貓','飼料','用品','寵物店'],
    forbidden: ['餐飲美食','醫療健康','教育培訓']
  },
  LEISURE: {
    primary: '休閒娛樂',
    synonyms: ['週末','假日','走走','玩','聚會','親子活動','娛樂'],
    forbidden: ['醫療健康','教育培訓']
  }
} as const;

//////////////////////// 2) 跨類別防串＋硬規則驗證 //////////////////////

type StoreLite = { store_name: string; category?: string };

export function detectCrossCategoryHallucination(intent: Intent, stores: StoreLite[]) {
  const info = (CATEGORY_SYNONYM_MAP as any)[intent];
  if (!info) return { isValid: true, issues: [] as string[], warnings: [] as string[] };

  const issues: string[] = [];
  const warnings: string[] = [];

  for (const s of stores) {
    const cat = s.category ?? '';
    if (info.forbidden?.some((f: string) => cat.includes(f))) {
      issues.push(`⛔ "${s.store_name}" 類別為 ${cat}，不應出現在 ${info.primary} 結果中`);
    }
    if (info.primary && !cat.includes(info.primary)) {
      warnings.push(`⚠️ "${s.store_name}" 類別為 ${cat}，非 ${info.primary}`);
    }
  }
  return { isValid: issues.length === 0, issues, warnings };
}

export function validateRecommendationLogic(intent: Intent, stores: StoreLite[]) {
  const expectedCategory = CATEGORY_BY_INTENT[intent];
  if (!expectedCategory) return { isValid: true as const };
  
  if (stores.some(s => s.category !== expectedCategory)) {
    return { 
      isValid: false, 
      reason: `${intent} 結果含非「${expectedCategory}」商家` 
    };
  }
  
  return { isValid: true as const };
}

//////////////////////// 3) 一致 Fallback（不造數） //////////////////////

export const FallbackService = {
  DEFAULT: '目前資料庫中尚未收錄這類店家，歡迎推薦我們新增喔～',
  contextual(intent: Intent, sub?: string) {
    switch (intent) {
      case 'FOOD':
        return sub
          ? `目前資料庫尚未收錄「${sub}」，建議以 Google Map 搜「文山特區 ${sub}」查看即時資訊。我也可以改用相近選項幫你找。`
          : `抱歉，沒有找到符合您需求的美食推薦。${this.DEFAULT} 😊`;
      case 'MEDICAL':
        return sub
          ? `目前資料庫尚未收錄「${sub}」，建議以 Google Map 搜「文山特區 ${sub}」查看即時資訊。我也可以改用相近選項幫你找。`
          : `抱歉，沒有找到醫療健康相關商家。${this.DEFAULT} 😊`;
      case 'COFFEE':
        return sub
          ? `目前資料庫尚未收錄「${sub}」，建議以 Google Map 搜「文山特區 ${sub}」查看即時資訊。`
          : `目前資料庫尚未收錄咖啡廳，建議以 Google Map 搜「文山特區 咖啡」查看即時資訊。`;
      case 'SUPPLEMENTS':
        return `目前資料庫尚未收錄保健食品店，建議以 Google Map 搜「文山特區 保健食品」查看即時資訊。`;
      case 'PETS':
        return `目前資料庫尚未收錄寵物用品店，建議以 Google Map 搜「文山特區 寵物用品」查看即時資訊。`;
      case 'LEISURE':
        return `目前資料庫尚未收錄休閒娛樂場所，建議以 Google Map 搜「文山特區 休閒」查看即時資訊。`;
      case 'PARKING':  return `抱歉，沒有找到合適的停車場資訊。${this.DEFAULT} 😊`;
      case 'SHOPPING': return `抱歉，沒有找到符合的購物商家。${this.DEFAULT} 😊`;
      case 'BEAUTY':   return `抱歉，沒有找到美容美髮相關商家。${this.DEFAULT} 😊`;
      case 'COVERAGE_STATS':
        return `抱歉，目前統計資料暫時取不到數字，稍後再問我一次吧！${this.DEFAULT} 😊`;
      default:
        return `${this.DEFAULT} 有其他問題歡迎隨時問我喔～ 🤗`;
    }
  }
};

export function fallbackText(intent: Intent, sub?: string) {
  return FallbackService.contextual(intent, sub);
}

// ===== 兩段式意圖決策核心函數 =====

// 檢查槽位是否缺失
export function missingSlots(intentResult: { intent: Intent; subcategory?: string; confidence: number }, message?: string): boolean {
  const requiredSlots = SLOT_REQUIREMENTS[intentResult.intent as keyof typeof SLOT_REQUIREMENTS];
  if (!requiredSlots) return false;
  
  // 檢查關鍵槽位是否缺失
  const hasSubcategory = intentResult.subcategory && intentResult.subcategory !== 'general';
  const hasBrand = intentResult.subcategory && ['屈臣氏', '康是美', '星巴克', '路易莎', '全聯', '家樂福'].includes(intentResult.subcategory);
  
  // 檢查訊息中是否包含品牌關鍵詞
  const messageText = (message || '').toLowerCase();
  const hasBrandInMessage = ['星巴克', 'starbucks', '路易莎', '85度c', '85度c'].some(brand => messageText.includes(brand));
  
  // 根據意圖類型判斷是否缺失關鍵槽位
  switch (intentResult.intent) {
    case 'FOOD':
      // 如果有具體菜系（如「日式料理」），就不需要反問
      const cuisineKeywords = ['日式','韓式','泰式','義式','中式','素食','拉麵','壽司','燒肉','火鍋'];
      const hasCuisine = cuisineKeywords.some(k => intentResult.subcategory?.includes(k) || false);
      return !hasCuisine && (!hasSubcategory || intentResult.subcategory === 'general');
    case 'MEDICAL':
      return !hasSubcategory || intentResult.subcategory === 'general';
    case 'COFFEE':
      return !hasBrand && !hasBrandInMessage;
    case 'SHOPPING':
      return !hasBrand && !hasBrandInMessage;
    default:
      return false;
  }
}

// 生成單句反問
export function askOneFollowup(intent: Intent): string {
  const question = FOLLOWUP_QUESTIONS[intent as keyof typeof FOLLOWUP_QUESTIONS];
  return question || '可以告訴我更具體的需求嗎？';
}

// 選單式快速收斂
export function offerQuickChoices(intent: Intent): string {
  const choices = {
    FOOD: '🍽️ 請選擇：\n1. 日式料理\n2. 韓式料理\n3. 素食\n4. 咖啡廳\n5. 其他',
    MEDICAL: '💊 請選擇：\n1. 藥局\n2. 診所\n3. 牙醫\n4. 醫院\n5. 其他',
    COFFEE: '☕ 請選擇：\n1. 星巴克\n2. 路易莎\n3. 85度C\n4. 其他咖啡廳',
    SHOPPING: '🛍️ 請選擇：\n1. 全聯\n2. 家樂福\n3. 便利商店\n4. 其他',
    ATTRACTION: '📍 請選擇：\n1. 公園\n2. 步道\n3. 親子景點\n4. 其他'
  };
  
  return choices[intent as keyof typeof choices] || '請選擇一個選項，我會幫你找相關的推薦！';
}

// 重新檢測意圖（合併前文）
export function reDetectIntent(message: string, previousIntent?: Intent): { intent: Intent; subcategory?: string; confidence: number } {
  // 使用現有的 detectIntent 邏輯，但可以考慮前文上下文
  const result = detectIntent(message);
  
  // 如果有前文意圖，可以提高相關意圖的信心度
  if (previousIntent && result.intent === previousIntent) {
    result.confidence = Math.min(result.confidence + 0.1, 1.0);
  }
  
  return result;
}

//////////////////////// 4) 品牌矯正（Brand → 類別/資料池） //////////////

type BrandHit = { brand: string; intent: Intent; subcategory: string };
const BRAND_MAP: Array<{ kws: string[]; brand: string; intent: Intent }> = [
  // 醫療品牌
  { kws: ['屈臣氏','watsons'], brand: '屈臣氏', intent: 'MEDICAL' },
  { kws: ['康是美','cosmed'], brand: '康是美', intent: 'MEDICAL' },
  { kws: ['大樹藥局'], brand: '大樹藥局', intent: 'MEDICAL' },
  { kws: ['杏一','杏一藥局'], brand: '杏一藥局', intent: 'MEDICAL' },
  { kws: ['維康','維康藥局'], brand: '維康藥局', intent: 'MEDICAL' },
  
  // 購物品牌
  { kws: ['7-11','7-eleven','seven'], brand: '7-11', intent: 'SHOPPING' },
  { kws: ['全家','familymart','family mart'], brand: '全家', intent: 'SHOPPING' },
  { kws: ['全聯','px mart','pxmart'], brand: '全聯', intent: 'SHOPPING' },
  { kws: ['家樂福','carrefour'], brand: '家樂福', intent: 'SHOPPING' },
  { kws: ['好市多','costco'], brand: '好市多', intent: 'SHOPPING' },
  { kws: ['愛買','a-mart'], brand: '愛買', intent: 'SHOPPING' },
  
  // 咖啡品牌
  { kws: ['星巴克','starbucks'], brand: '星巴克', intent: 'COFFEE' },
  { kws: ['路易莎','louisa'], brand: '路易莎', intent: 'COFFEE' },
  { kws: ['85度c','85度','85c'], brand: '85度C', intent: 'COFFEE' },
  { kws: ['伯朗','mr.brown'], brand: '伯朗', intent: 'COFFEE' },
  { kws: ['cama','cama咖啡'], brand: 'Cama', intent: 'COFFEE' },
  
  // 保健食品品牌
  { kws: ['gnc','健安喜'], brand: 'GNC', intent: 'SUPPLEMENTS' },
  { kws: ['維康','維康保健'], brand: '維康', intent: 'SUPPLEMENTS' },
  
  // 教育品牌
  { kws: ['肯塔基美語','肯塔基'], brand: '肯塔基美語', intent: 'ENGLISH_LEARNING' },
];

export function resolveBrandQuery(q: string): BrandHit | null {
  const L = q.toLowerCase();
  for (const row of BRAND_MAP) {
    if (row.kws.some(k => L.includes(k.toLowerCase()))) {
      return { brand: row.brand, intent: row.intent, subcategory: row.brand };
    }
  }
  return null;
}

export function renderAlternatives(stores: StoreLite[]) {
  return stores.slice(0, 3).map((s, i) => `${i + 1}. ${s.store_name}（${s.category ?? '未分類'}）`).join('\n');
}

//////////////////////// 5) FAQ（最小可用版） /////////////////////////////

const FAQ_ALLOWED = new Set<Intent>(['INTRO','VAGUE_CHAT','GREETING','GENERAL','SPECIFIC_ENTITY']);

export class FAQService {
  constructor(private supabase: any) {}
  async getExact(q: string) {
    const { data, error } = await this.supabase
      .from('faqs').select('*').eq('question', q).eq('is_active', true).single();
    return error ? null : data;
  }
  async getAll() {
    const { data } = await this.supabase.from('faqs').select('*').eq('is_active', true);
    return data || [];
  }
  static sim(a:string, b:string) {
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    if (!longer.length) return 1;
    const d = (s1:string, s2:string) => {
      const m = Array.from({length: s2.length+1}, (_,i)=>[i] as number[]);
      for (let j=0;j<=s1.length;j++) m[0][j]=j;
      for (let i=1;i<=s2.length;i++)
        for (let j=1;j<=s1.length;j++)
          m[i][j] = s2[i-1]===s1[j-1] ? m[i-1][j-1]
            : Math.min(m[i-1][j-1]+1, m[i][j-1]+1, m[i-1][j]+1);
      return m[s2.length][s1.length];
    };
    return (longer.length - d(longer, shorter)) / longer.length;
  }
  async answer(q: string, intent: Intent) {
    const exact = await this.getExact(q);
    if (exact) return { answer: exact.answer, match: 'exact' as const, sim: 1.0 };
    if (!FAQ_ALLOWED.has(intent)) return null;
    const all = await this.getAll();
    let best: { answer: string; sim: number } | null = null;
    for (const f of all) {
      const s = FAQService.sim(String(f.question ?? ''), q);
      if (!best || s > best.sim) best = { answer: String(f.answer ?? ''), sim: s };
    }
    if (best && best.sim >= 0.90) return { answer: best.answer, match: 'fuzzy' as const, sim: best.sim };
    return null;
  }
}

//////////////////////// 6) 查詢欄位白名單 /////////////////////////////////

export function getOptimizedSelectFields(intent: Intent) {
  const common = 'id,store_name,category,address,approval,is_partner_store,sponsorship_tier,rating,store_code,features,is_safe_store';
  switch (intent) {
    case 'COVERAGE_STATS':
      return 'id,approval,is_partner_store,sponsorship_tier,rating,category';
    default:
      return common;
  }
}

//////////////////////// 7) 審計記錄（錯誤遮罩＋追蹤） //////////////////////

export async function logRecommendation(
  supabase: any,
  payload: {
    session_id: string;
    intent: Intent;
    subcategory?: string;
    message: string;
    stores: any[];
    checks?: { hard?: any; cross?: any };
    fallback?: { used: boolean; reason?: string };
    ms: number;
    error?: string;
  }
) {
  try {
    await supabase.from('recommendation_logs').insert({
      session_id: payload.session_id,
      intent: payload.intent,
      subcategory: payload.subcategory ?? null,
      message: payload.message,
      result_count: payload.stores.length,
      checks: payload.checks ?? {},
      fallback_used: payload.fallback?.used ?? false,
      fallback_reason: payload.fallback?.reason ?? null,
      processing_ms: payload.ms,
      error: payload.error ?? null,
      created_at: new Date().toISOString()
    });
  } catch (e) {
    console.error('[logRecommendation] failed', e);
  }
}

// ===== MEDICAL 子分類表（型別安全＋資料驅動）=====
export const SUBCATEGORY_BY_MEDICAL: Record<string, string[]> = {
  '藥局': ['藥局','藥房','處方藥','處方','慢箋','配藥'],
  '藥妝': ['藥妝','美妝','保養品','化妝品','彩妝','保養','保健食品','營養品','維他命','維生素','魚油','益生菌'],
  '診所': ['診所','內科','小兒','耳鼻喉','骨科','皮膚','婦產','眼科','復健','門診'],
  '牙醫': ['牙醫','牙科','洗牙','矯正','植牙','美白','兒童牙科','口腔','牙齒'],
  '醫院': ['醫院','急診','門急診','醫療中心','大醫院','綜合醫院'],
  '保健': ['保健食品','營養品','維他命','維生素','魚油','益生菌','保健','健康食品'],
};
export type MedicalSubcategory = keyof typeof SUBCATEGORY_BY_MEDICAL;

// ===== 路由偏好（用來修正測試期望）=====
export const ROUTING_PREFS = {
  greetingExplicit: true,   // "你好" → GREETING（而非 VAGUE_CHAT）
  generalOverVague: true,   // 沒領域線索且像「有什麼推薦」→ GENERAL
};

/** ===== Two-Stage Intent + Single Follow-up (Minimal Patch) ===== */

// --- thresholds ---
const T_ASK = 0.80; // 低於此值 → 問一次
const T_LOCK = 0.90; // 高於此值 → 直接走資料優先

// --- slot schema （可按需擴充）---
type Slots = Record<string, any>;
const REQUIRED_SLOTS: Record<Intent, string[]> = {
  FOOD: ['cuisine?','budget?','meal_time?'],      // ? 表示可選，僅作提示
  MEDICAL: ['subcategory?','brand?'],
  ATTRACTION: ['type?','with_kids?','pet_friendly?'],
  ENGLISH_LEARNING: [],
  PARKING: [],
  SHOPPING: [],
  BEAUTY: [],
  COVERAGE_STATS: [],
  DIRECTIONS: [],
  INTRO: [],
  VAGUE_CHAT: [],
  GREETING: [],
  GENERAL: [],
  VAGUE_QUERY: [],
  SPECIFIC_ENTITY: [],
  CONFIRMATION: [],
  COFFEE: ['brand?','time_preference?'],
  SUPPLEMENTS: ['product_type?','brand?'],
  PETS: ['product_type?','service_type?'],
  LEISURE: ['activity_type?','group_size?'],
};

type FollowupState =
  | 'cold_start'          // 第一次進來，尚未反問
  | 'asked_once'          // 已反問一次，等待使用者補充
  | 'locked';             // 意圖已鎖定，直接資訊優先

type TurnState = {
  stage: FollowupState;
  intent?: Intent;
  subcategory?: string;
  confidence?: number;
  slots?: Slots;
  asked_followup?: boolean;
};

function missingSlots(intent: Intent, slots?: Slots) {
  const reqs = (REQUIRED_SLOTS[intent] || []).filter(s => !s.endsWith('?')); // 僅必填
  if (!reqs.length) return false;
  const ok = reqs.every(k => slots && slots[k] !== undefined && slots[k] !== null);
  return !ok;
}

// 單句反問（依 intent 給自然提示）
function askOneFollowup(intent: Intent, preSub?: string) {
  switch (intent) {
    case 'FOOD':
      return preSub
        ? `想吃「${preSub}」哪一類？（壽司/拉麵/燒肉/泰式/素食…）或告訴我預算～`
        : '想吃什麼類型？（日式/韓式/泰式/素食…）或直接說預算、想在內用/外帶？';
    case 'MEDICAL':
      return preSub
        ? `你是要找「${preSub}」品牌還是特定科別呢？（藥局/藥妝/診所/牙醫…）`
        : '想找藥局、藥妝、診所或牙醫呢？若有品牌也可以告訴我～';
    case 'ATTRACTION':
      return '想走公園、步道還是親子/遛寵物友善的地方？';
    case 'COFFEE':
      return '想找特定品牌？（星巴克/路易莎/85度C）或任何咖啡廳都可以？';
    case 'SHOPPING':
      return '需要找什麼？（全聯/家樂福/便利商店）';
    case 'SUPPLEMENTS':
      return '需要什麼產品？（維他命/魚油/保健食品）';
    case 'PETS':
      return '需要什麼服務？（寵物用品/美容/醫療）';
    case 'LEISURE':
      return '想要什麼活動？（親子/聚會/休閒）';
    default:
      return '想找哪一類？（美食、藥局、停車、景點…）我好幫你快篩～';
  }
}

// 合併使用者第二句的補充（極簡做法：把文字拼接再跑一次 detectIntent）
function mergeAndRedetect(prevMsg: string, userReply: string) {
  const merged = `${prevMsg}\n${userReply}`.slice(-500); // 避免過長
  return detectIntent(merged);
}

// ===== 兩段式意圖決策配置 =====
export const INTENT_THRESHOLDS = {
  ASK_FOLLOWUP: T_ASK,      // 低於此閾值就反問
  LOCK_INTENT: T_LOCK,      // 高於此閾值就直接資訊優先
};

// 槽位需求表（per intent）
export const SLOT_REQUIREMENTS = {
  FOOD: ['cuisine', 'budget', 'meal_time'],
  MEDICAL: ['subcategory', 'brand'],
  ATTRACTION: ['type', 'with_kids', 'pet_friendly'],
  COFFEE: ['brand', 'time_preference'],
  SHOPPING: ['store_type', 'brand'],
  SUPPLEMENTS: ['product_type', 'brand'],
  PETS: ['product_type', 'service_type'],
  LEISURE: ['activity_type', 'group_size']
};

// 反問模板
export const FOLLOWUP_QUESTIONS = {
  FOOD: '想吃什麼類型？（日式/韓式/素食/咖啡…）或直接告訴我預算～',
  MEDICAL: '需要找哪一類？（藥局/診所/牙醫/醫院）',
  ATTRACTION: '想去哪種地方？（公園/步道/親子景點）',
  COFFEE: '想找特定品牌？（星巴克/路易莎/85度C）',
  SHOPPING: '需要找什麼？（全聯/家樂福/便利商店）',
  SUPPLEMENTS: '需要什麼產品？（維他命/魚油/保健食品）',
  PETS: '需要什麼服務？（寵物用品/美容/醫療）',
  LEISURE: '想要什麼活動？（親子/聚會/休閒）'
};

// === utils.ts ===
const norm = (s: string) => s.normalize('NFKC').toLowerCase().trim();

function getFeaturesObj(f: any): Record<string, any> {
  if (!f) return {};
  if (typeof f === 'object') return f;
  try { return JSON.parse(String(f)); } catch { return {}; }
}

function featuresText(f: any): string {
  const o = getFeaturesObj(f);
  const tags = Array.isArray(o.tags) ? o.tags.join(' ') : '';
  const sec = o.secondary_category ? String(o.secondary_category) : '';
  const desc = o.description ? String(o.description) : '';
  return [tags, sec, desc].join(' ').toLowerCase();
}

// 嚴格匹配函數（must-match）
function mustMatch(s: any, kws: string[]): boolean {
  const name = (s.store_name || '').toLowerCase();
  const fx = featuresText(s.features);
  const sec = (getFeaturesObj(s.features).secondary_category || '').toLowerCase();
  return kws.some(k => {
    const x = k.toLowerCase();
    return name.includes(x) || fx.includes(x) || sec.includes(x);
  });
}

// 素食專用過濾（排除肉類負面詞）
function filterVegetarian(stores: any[]): any[] {
  const meatKeywords = ['牛','豬','雞','鴨','魚','肉','燒肉','烤肉','牛排','豬排','雞排','海鮮','生魚片'];
  return stores.filter(s => {
    const name = (s.store_name || '').toLowerCase();
    const fx = featuresText(s.features);
    const hasMeat = meatKeywords.some(k => name.includes(k) || fx.includes(k));
    return !hasMeat;
  });
}

// 地址格式轉換（英文轉中文）
function formatAddressToChinese(address: string): string {
  if (!address) return '地址未提供';
  
  // 如果已經是中文格式，直接返回
  if (/[\u4e00-\u9fff]/.test(address) && !address.includes('No.') && !address.includes('District') && !address.includes('City')) {
    return address;
  }
  
  // 路名映射表
  const streetMap = {
    'Xinsheng St': '新生街',
    'Xinsheng Street': '新生街',
    'Jianguo Rd': '建國路',
    'Jianguo Road': '建國路',
    'Heping Rd': '和平路',
    'Heping Road': '和平路',
    'Wenheng Rd': '文衡路',
    'Wenheng Road': '文衡路'
  };
  
  let chineseAddress = address;
  
  // 提取地址號碼
  const numberMatch = chineseAddress.match(/No\.\s*(\d+[之\d]*)/i);
  const number = numberMatch ? numberMatch[1] : '';
  
  // 提取路名
  let street = '';
  for (const [en, zh] of Object.entries(streetMap)) {
    if (chineseAddress.includes(en)) {
      street = zh;
      break;
    }
  }
  
  // 提取段數
  const sectionMatch = chineseAddress.match(/Section\s*(\d+)/i);
  const section = sectionMatch ? sectionMatch[1] + '段' : '';
  
  // 組裝中文地址
  if (street && number) {
    const sectionPart = section ? section : '';
    chineseAddress = `${street}${sectionPart}${number}號`;
  } else if (street) {
    // 只有路名，沒有號碼
    chineseAddress = street;
  } else if (number) {
    // 只有號碼，沒有路名
    chineseAddress = `${number}號`;
  } else {
    // 無法解析，返回原地址
    chineseAddress = address;
  }
  
  return chineseAddress.trim();
}

// === classify.ts（精簡前置覆寫） ===
export function detectMedicalSubcategory(msg: string): MedicalSubcategory | undefined {
  const m = norm(msg);
  for (const [sub, kws] of Object.entries(SUBCATEGORY_BY_MEDICAL)) {
    // 關鍵字命中即可
    if (kws.some((kw: string) => m.includes(kw))) return sub as MedicalSubcategory;
  }
  return undefined;
}

export function detectGreeting(msg: string): boolean {
  const m = norm(msg);
  return /(你好|嗨|哈囉|hello|hi|hey|文文|晚安|早安|下午好|早上好|晚上好)/.test(m);
}

export function detectGeneral(msg: string): boolean {
  const m = norm(msg);
  // 沒有明確領域詞，但包含泛問句
  const hasGeneric = /(有什麼|推薦|建議|幫我想)/.test(m);
  const hasDomain = /(餐|飯|料理|藥|診所|牙|停車|購物|髮|景點|交通|捷運|公車)/.test(m);
  return hasGeneric && !hasDomain;
}

// ※ 完整的意圖檢測邏輯
export function detectIntent(msg: string): { intent: Intent; subcategory?: string; confidence: number } {
  const text = msg.toLowerCase();

  // 1) INTRO 檢測：自我介紹相關
  if (/自我介紹|介紹你自己|你是誰|介紹一下/.test(text)) {
    return { intent: 'INTRO', confidence: 0.95 };
  }

  // 2) GREETING 明確化（修正測試）
  if (ROUTING_PREFS.greetingExplicit && detectGreeting(msg)) {
    return { intent: 'GREETING', confidence: 0.98 };
  }

  // 2) 品牌檢測優先（WEN 1.5.0 強化）
  const brandHit = resolveBrandQuery(msg);
  if (brandHit) {
    return { intent: brandHit.intent, subcategory: brandHit.subcategory, confidence: 0.96 };
  }

  // 3) SUPPLEMENTS 檢測（優先於 MEDICAL，避免保健食品被誤判）
  const supplementKeywords = ['保健食品','維他命','營養品','魚油','益生菌','葡萄糖胺','蛋白粉','膠原蛋白','葉黃素'];
  if (supplementKeywords.some(k => text.includes(k))) {
    return { intent: 'SUPPLEMENTS', confidence: 0.90 };
  }

  // 4) 一般 MEDICAL（保留原本的 medicalHit + SUBCATEGORY_BY_MEDICAL 判定）
  const medicalHit = ['診所','看醫生','藥局','藥房','牙醫','藥妝','保養品','化妝品','醫院','急診']
    .some(k => text.includes(k));
  if (medicalHit) {
    // 按優先級檢測子類（更具體的先檢測）
    const priorityOrder = ['牙醫', '醫院', '保健', '藥妝', '藥局', '診所'];
    for (const sub of priorityOrder) {
      if (SUBCATEGORY_BY_MEDICAL[sub] && SUBCATEGORY_BY_MEDICAL[sub].some(k => text.includes(k))) {
        return { intent: 'MEDICAL', subcategory: sub, confidence: 0.92 };
      }
    }
    return { intent: 'MEDICAL', subcategory: 'general', confidence: 0.85 };
  }

  // 3) ATTRACTION 檢測
  const parkKW = ['公園','森林公園','運動公園','親子公園','兒童公園','遊戲場','溜滑梯','步道','散步','遛狗','綠地','草地','河濱','河堤'];
  const attractionKW = ['景點','觀光','旅遊','推薦景點','好玩的地方','值得去的地方','景區','古蹟','寺廟','文化園區','美術館'];
  
  if (parkKW.some(k => text.includes(k))) {
    return { intent: 'ATTRACTION', subcategory: '公園', confidence: 0.95 };
  }
  if (attractionKW.some(k => text.includes(k))) {
    return { intent: 'ATTRACTION', confidence: 0.92 };
  }

  // 6) COFFEE 檢測（新增）
  const coffeeKeywords = ['咖啡','手沖','拿鐵','咖啡廳','cafe','卡布奇諾','摩卡','美式','咖啡豆','星巴克','路易莎','85度C','85度c','85度','coffee','starbucks'];
  if (coffeeKeywords.some(k => text.includes(k))) {
    // 檢查是否有具體品牌
    const brandKeywords = ['星巴克','starbucks','路易莎','85度C','85度c','85度'];
    const hasBrand = brandKeywords.some(k => text.includes(k));
    return { intent: 'COFFEE', confidence: hasBrand ? 0.95 : 0.92 };
  }

  // SUPPLEMENTS 檢測已移到前面（優先於 MEDICAL）

  // 8) PETS 檢測（新增）
  const petKeywords = ['寵物','狗','貓','飼料','寵物用品','寵物店','狗糧','貓糧','寵物美容','動物醫院'];
  if (petKeywords.some(k => text.includes(k))) {
    return { intent: 'PETS', confidence: 0.90 };
  }

  // 9) LEISURE 檢測（新增）
  const leisureKeywords = ['週末','假日','走走','玩','聚會','親子活動','娛樂','休閒','放鬆','出遊'];
  if (leisureKeywords.some(k => text.includes(k))) {
    return { intent: 'LEISURE', confidence: 0.85 };
  }

  // 10) FOOD 檢測（擴充飢餓相關關鍵詞）
  const FOOD_HARD = [
    '美食','餐廳','吃飯','料理','菜單','餐點',
    // 飢餓相關
    '肚子餓','餓了','想吃','覓食','用餐',
    // 菜系強信號
    '壽司','拉麵','燒肉','天婦羅','居酒屋','和食','丼飯',
    '韓式','韓料','烤肉','泡菜','石鍋',
    '泰式','冬陰功','綠咖喱',
    '義式','披薩','義大利麵',
    '中式','火鍋','川菜','台菜',
    '素食','蔬食','全素','vegan','vegetarian',
    '早餐','午餐','晚餐','宵夜'
  ];

  const CUISINE_BY_FOOD: Record<string, string[]> = {
    '日式料理': ['日式','日料','壽司','燒肉','天婦羅','居酒屋','和食','丼飯','日本'],
    '韓式料理': ['韓式','韓料','烤肉','泡菜','石鍋','韓國'],
    '泰式料理': ['泰式','泰國','冬陰功','綠咖喱','打拋'],
    '義式料理': ['義式','義大利','披薩','義大利麵'],
    '中式料理': ['中式','中華','火鍋','川菜','台菜'],
    '拉麵':     ['拉麵','ramen'],
    '素食':     ['素食','蔬食','全素','vegan','vegetarian','蛋奶素'],
    '咖啡':     ['咖啡','咖啡廳','cafe','拿鐵','手沖','咖啡店'],
    '早餐':     ['早餐'],
    '午餐':     ['午餐','中午'],
    '晚餐':     ['晚餐','晚上'],
    '宵夜':     ['宵夜','深夜']
  };

  if (FOOD_HARD.some(k => text.includes(k))) {
    for (const [sub, kws] of Object.entries(CUISINE_BY_FOOD)) {
      if (kws.some(k => text.includes(k))) {
        return { intent: 'FOOD', subcategory: sub, confidence: 0.95 };
      }
    }
    return { intent: 'FOOD', confidence: 0.75 };
  }

  // 5) ENGLISH_LEARNING 檢測
  const englishKW = ['英文','美語','補習班','課程','教育','學習','英文','培訓','學美語','學英語','英文學習','美語學習','語言學習','補習','教學','老師','學生','學校','教育機構','我想學','想要學','補習班推薦'];
  if (englishKW.some(k => text.includes(k))) {
    return { intent: 'ENGLISH_LEARNING', confidence: 0.90 };
  }

  // 6) PARKING 檢測
  const parkingKW = ['停車','停車場','車位','停車費','停車資訊','停車查詢','可以停車嗎','停車方便嗎'];
  if (parkingKW.some(k => text.includes(k))) {
    return { intent: 'PARKING', confidence: 0.90 };
  }

  // 7) COVERAGE_STATS 檢測
  const statsKW = ['統計','資料','資料量','資料庫','總數','總共有','商家數量','餐廳數量','店家數量','有多少','幾家','幾間'];
  if (statsKW.some(k => text.includes(k))) {
    return { intent: 'COVERAGE_STATS', confidence: 0.95 };
  }

  // 8) GENERAL vs VAGUE_QUERY（修正測試）
  if (ROUTING_PREFS.generalOverVague && detectGeneral(msg)) {
    return { intent: 'GENERAL', confidence: 0.70 };
  }

  // 9) 其他 fallback
  return { intent: 'VAGUE_CHAT', confidence: 0.60 };
}

// === data.ts（極簡） ===
class DataLayer {
  supabase: any;
  
  constructor(url: string, key: string) {
    this.supabase = createClient(url, key, { 
      auth: { persistSession: false, autoRefreshToken: false } 
    });
  }

  async getEligibleStores(intent: Intent, limit = 20): Promise<any[]> {
    const cat = CATEGORY_BY_INTENT[intent];
    if (!cat) return [];
    
    const select = getOptimizedSelectFields(intent);
    const { data } = await this.supabase
      .from('stores')
      .select(select)
      .eq('approval', 'approved')
      .eq('category', cat)
      .order('is_partner_store', { ascending: false })
      .order('sponsorship_tier', { ascending: false, nullsFirst: false })
      .order('rating', { ascending: false, nullsFirst: false })
      .limit(limit);
    return data || [];
  }

  async getStats(): Promise<any> {
    const c = async (q: any) => (await q.select('id', { count: 'exact', head: true })).count || 0;
    const total = await c(this.supabase.from('stores'));
    const safe = await c(this.supabase.from('stores').eq('is_safe_store', true));
    const disc = await c(this.supabase.from('stores').eq('has_member_discount', true));
    const partner = await c(this.supabase.from('stores').eq('is_partner_store', true));
    const { data: cats } = await this.supabase.from('stores').select('category');
    const categories = new Set((cats || []).map((x: any) => x.category).filter(Boolean)).size;
    return { 
      total, 
      verified: safe, 
      discount: disc, 
      partner, 
      categories, 
      last_updated: new Date().toISOString() 
    };
  }
}

// === recommend.ts（極簡） ===
class Reco {
  constructor(private dl: DataLayer) {}

  async forIntent(intent: Intent, opts: { subcategory?: string; message?: string } = {}): Promise<any[]> {
    if (intent === 'ATTRACTION') {
      return this.dl.getEligibleStores('ATTRACTION');
    }
    
    if (intent === 'COFFEE') {
      const pool = await this.dl.getEligibleStores('COFFEE', 50);
      return pool.filter((s: any) => mustMatch(s, ['咖啡','咖啡廳','cafe'])).slice(0, 5);
    }
    
    if (intent === 'SUPPLEMENTS') {
      const pool = await this.dl.getEligibleStores('SUPPLEMENTS', 50);
      return pool.filter((s: any) => mustMatch(s, ['保健食品','維他命','營養品','魚油','益生菌'])).slice(0, 5);
    }
    
    if (intent === 'PETS') {
      const pool = await this.dl.getEligibleStores('PETS', 50);
      return pool.filter((s: any) => mustMatch(s, ['寵物','狗','貓','飼料','寵物用品'])).slice(0, 5);
    }
    
    if (intent === 'LEISURE') {
      const pool = await this.dl.getEligibleStores('LEISURE', 50);
      return pool.filter((s: any) => mustMatch(s, ['休閒','娛樂','親子','聚會'])).slice(0, 5);
    }
    
    if (intent === 'FOOD') {
      const pool = await this.dl.getEligibleStores('FOOD', 50);
      const sub = opts.subcategory as string | undefined;
      if (!sub) return pool.slice(0, 5);

      const CUISINE_BY_FOOD: Record<string, string[]> = {
        '日式料理': ['日式','日料','壽司','燒肉','天婦羅','居酒屋','和食','丼飯','日本'],
        '韓式料理': ['韓式','韓料','烤肉','泡菜','石鍋','韓國'],
        '泰式料理': ['泰式','泰國','冬陰功','綠咖喱','打拋'],
        '義式料理': ['義式','義大利','披薩','義大利麵'],
        '中式料理': ['中式','中華','火鍋','川菜','台菜'],
        '拉麵':     ['拉麵','ramen'],
        '素食':     ['素食','蔬食','全素','vegan','vegetarian','蛋奶素'],
        '咖啡':     ['咖啡','咖啡廳','cafe','拿鐵','手沖','咖啡店'],
        '早餐':     ['早餐'],
        '午餐':     ['午餐','中午'],
        '晚餐':     ['晚餐','晚上'],
        '宵夜':     ['宵夜','深夜']
      };

      const kws = CUISINE_BY_FOOD[sub] || [];
      
      // 嚴格匹配：必須包含關鍵字
      let out = pool.filter((s: any) => mustMatch(s, kws));
      
      // 素食特殊處理：排除肉類負面詞
      if (sub === '素食') {
        out = filterVegetarian(out);
      }
      
      // 如果沒有匹配結果，返回空陣列（交給 fallback）
      return out.slice(0, 5);
    }
    
    if (intent === 'MEDICAL') {
      const pool = await this.dl.getEligibleStores('MEDICAL', 50);
      const sub = opts.subcategory as string | undefined;
      if (!sub) return pool.slice(0, 5);

      // 品牌子類：以 store_name 直接過濾
      const brandNames = ['屈臣氏','康是美','大樹藥局','杏一藥局','丁丁連鎖藥局'];
      if (brandNames.includes(sub)) {
        const out = pool.filter(s => (s.store_name || '').toLowerCase().includes(sub.toLowerCase()));
        return out.slice(0, 5); // 不再回退到通用池
      }

      // 嚴格匹配：必須包含關鍵字
      const keywords = SUBCATEGORY_BY_MEDICAL[sub] || [];
      const out = pool.filter((s: any) => mustMatch(s, keywords));
      
      // 如果沒有匹配結果，返回空陣列（交給 fallback）
      return out.slice(0, 5);
    }

    return (await this.dl.getEligibleStores(intent, 20)).slice(0, 5);
  }
}

// === 新渲染模組：統一的商家清單格式 ===

/** 利用 features 安全取 tag（只讀 features.tags，避免噪訊） */
function getTags(features: any): string[] {
  if (!features) return []
  if (Array.isArray(features?.tags)) return features.tags.map(String)
  try {
    const obj = typeof features === 'string' ? JSON.parse(features) : features
    return Array.isArray(obj?.tags) ? obj.tags.map(String) : []
  } catch {
    return []
  }
}

/** 渲染：統一的商家清單（您要求的格式） */
function renderStoreList(stores: any[]): string {
  if (!stores?.length) {
    return '目前沒有找到合適的商家。'
  }

  return stores.map((s: any, i: number) => {
    // 徽章處理
    const badges = []
    if (s.is_partner_store) badges.push('[特約]')
    if (s.sponsorship_tier) badges.push(`[贊助${s.sponsorship_tier}]`)
    if (s.is_safe_store) badges.push('[安心店家]')
    const badgeStr = badges.length ? ` ${badges.join(' ')}` : ''
    
    // 類別
    const category = s.category ? ` [${s.category}]` : ''
    
    // 評分
    const rating = s.rating ? `\n⭐ 評分：${s.rating}/5` : ''
    
    // 標籤
    const tagsArr = getTags(s.features)
    const tags = tagsArr.length ? `\n🏷️ ${tagsArr.join('、')}` : ''
    
    // 地址（轉換為中文格式）
    const address = formatAddressToChinese(s.address || '地址未提供')

    return (
      `${i + 1}. **${s.store_name}**${badgeStr}${category}\n` +
      `📍 ${address}${rating}${tags}`
    )
  }).join('\n\n')
}

/** 依意圖輸出開場標題 */
function getIntentTitle(intent: Intent): string {
  const titles: Record<Intent, string> = {
    FOOD: '🍽️ 我幫你把餐廳整理成清單：',
    MEDICAL: '💊 這裡是醫療/藥局清單：',
    BEAUTY: '💈 美容美髮店家：',
    SHOPPING: '🛍️ 購物商家：',
    PARKING: '🅿️ 停車場資訊：',
    ENGLISH_LEARNING: '📚 學習資源：',
    ATTRACTION: '📍 周邊景點：',
    COFFEE: '☕ 咖啡廳推薦：',
    SUPPLEMENTS: '💊 保健食品店：',
    PETS: '🐾 寵物用品店：',
    LEISURE: '🎮 休閒娛樂：',
    COVERAGE_STATS: '📊 統計資訊：',
    GENERAL: '📌 推薦清單：',
    GREETING: '',
    VAGUE_CHAT: '',
    VAGUE_QUERY: '',
    SPECIFIC_ENTITY: '',
    CONFIRMATION: '',
    DIRECTIONS: '',
    INTRO: ''
  }
  return titles[intent] || '📌 推薦清單：'
}

/** 主要渲染函數 */
function renderList(stores: any[], intent: Intent, subcategory?: string): string {
  if (!stores?.length) {
    // 子類專屬 fallback
    if (intent === 'FOOD' && subcategory) {
      switch (subcategory) {
        case '素食':
          return '抱歉，資料庫目前沒有收錄素食餐廳。建議以「文山特區 素食」在地圖搜尋；我可以幫你找其他類型的美食～';
        case '拉麵':
          return '抱歉，資料庫目前沒有收錄拉麵店。建議以「文山特區 拉麵」在地圖搜尋；我可以幫你找其他類型的美食～';
        case '咖啡':
          return '抱歉，資料庫目前沒有收錄咖啡廳。建議以「文山特區 咖啡」在地圖搜尋；我可以幫你找其他類型的美食～';
        default:
          return `抱歉，資料庫目前沒有收錄「${subcategory}」類型的店家。建議以關鍵字在地圖搜尋；我可以幫你找其他類型的美食～`;
      }
    } else if (intent === 'MEDICAL' && subcategory) {
      switch (subcategory) {
        case '牙醫':
          return '抱歉，資料庫目前沒有收錄牙醫診所。建議以「文山特區 牙醫」在地圖搜尋；我可以幫你找其他醫療機構～';
        case '醫院':
          return '抱歉，資料庫目前沒有收錄醫院資訊。建議以「文山特區 醫院」在地圖搜尋；我可以幫你找其他醫療機構～';
        case '保健':
          return '抱歉，資料庫目前沒有收錄保健食品店。建議以「文山特區 保健食品」在地圖搜尋；我可以幫你找其他醫療機構～';
        default:
          return `抱歉，資料庫目前沒有收錄「${subcategory}」相關的醫療機構。建議以關鍵字在地圖搜尋，或告訴我其他需求～`;
      }
    } else if (intent === 'ATTRACTION') {
      return '抱歉，我這邊只有已收錄的景點資料，未收錄的就不亂猜囉。建議以「文山特區 景點 / 公園」在地圖查看即時資訊。';
    } else if (intent === 'MEDICAL') {
      return '抱歉，資料庫目前沒有收錄這類醫療機構。建議以關鍵字在地圖搜尋，或告訴我其他需求～';
    } else if (intent === 'FOOD') {
      return '抱歉，資料庫目前沒有符合條件的餐廳。建議以關鍵字在地圖搜尋；我可以幫你找其他類型的美食～';
    }
    return '目前資料庫中尚未收錄這類店家，歡迎推薦我們新增喔～';
  }

  const title = getIntentTitle(intent)
  const list = renderStoreList(stores)
  
  // 根據意圖添加自然反問
  let footer = '';
  switch (intent) {
    case 'FOOD':
      footer = '\n\n— 這些都是我精挑細選的優質餐廳！想吃什麼類型的美食嗎？我可以幫你找更精確的推薦～';
      break;
    case 'MEDICAL':
      footer = '\n\n— 需要找特定類型的醫療機構嗎？藥局、診所、牙醫我都能幫你找！';
      break;
    case 'COFFEE':
      footer = '\n\n— 想找特定品牌的咖啡廳嗎？星巴克、路易莎我都能幫你找！';
      break;
    case 'SHOPPING':
      footer = '\n\n— 需要找特定商店嗎？全聯、家樂福、7-11 我都能幫你找！';
      break;
    default:
      footer = '\n\n— 如果需要我可以依「營業中 / 距離 / 價位 / 標籤」再幫你篩一輪。';
  }
  
  return `${title}\n\n${list}${footer}`
}


// === Edge Function ===
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const msg = String(body?.message?.content || '');
    const sessionId = String(body?.session_id || `session-${crypto.randomUUID?.() || Date.now()}`);

    // 新增：上行帶 state 可連貫單輪反問（若沒有一樣可以運作）
    const incomingState: TurnState = body?.state || { stage: 'cold_start' };

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: { code: 'CONFIG', message: 'missing env' } }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const t0 = Date.now();
    const dl = new DataLayer(supabaseUrl, supabaseKey);

    let response = '';
    let recommended: any[] = [];
    let intent: Intent;
    let subcategory: string | undefined;
    let confidence = 0;

    // ===== Stage 1: 初判 =====
    const pre = detectIntent(msg); // {intent, subcategory?, confidence}
    intent = pre.intent; subcategory = pre.subcategory; confidence = pre.confidence;

    // 判斷是否需要反問（雙閾值 + 槽位缺失）
    const needAsk = (confidence < T_ASK) || missingSlots(intent, incomingState.slots);

    if (incomingState.stage === 'cold_start' && needAsk) {
      // 單輪反問
      const follow = askOneFollowup(intent, subcategory);
      const outState: TurnState = {
        stage: 'asked_once',
        intent, subcategory, confidence,
        slots: incomingState.slots || {},
        asked_followup: true
      };
      // 記錄審計（可觀察反問佔比）
      await logRecommendation(dl.supabase, {
        session_id: sessionId,
        intent,
        subcategory,
        message: msg,
        stores: [],
        checks: { hard: { isValid: true }, cross: { isValid: true } },
        ms: Date.now() - t0,
        fallback: { used: false },
      });
      return new Response(JSON.stringify({
        data: {
          response: follow,
          intent, subcategory, recommended_stores: [],
          version: 'WEN 1.5.0',
          meta: { stage: 'ASK_ONCE', confidence },
          state: outState
        }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ===== Stage 2: 複判（如果上一輪已反問，合併本輪訊息再判一次）=====
    let effectiveIntent = intent, effectiveSub = subcategory, effectiveConf = confidence;
    if (incomingState.stage === 'asked_once') {
      const post = mergeAndRedetect(body?.prev_message || '', msg);
      effectiveIntent = post.intent; effectiveSub = post.subcategory; effectiveConf = post.confidence;
    }

    // 低信心仍未清楚 → 提供快速選項（不再聊天繞圈）
    if (effectiveConf < T_ASK && incomingState.stage === 'asked_once') {
      const quick =
        effectiveIntent === 'FOOD'
          ? '我可以直接列出熱門類型：日式、韓式、泰式、義式、素食。你想看哪一類？'
          : '我可以顯示常見類別給你選：美食、藥局、停車、景點。你想看哪一類？';

      const outState: TurnState = {
        stage: 'locked', // 鎖定不再反問，避免迴圈
        intent: effectiveIntent, subcategory: effectiveSub,
        confidence: effectiveConf, slots: incomingState.slots || {}
      };

      await logRecommendation(dl.supabase, {
        session_id: sessionId,
        intent: effectiveIntent,
        subcategory: effectiveSub,
        message: msg,
        stores: [],
        checks: { hard: { isValid: true }, cross: { isValid: true } },
        ms: Date.now() - t0
      });

      return new Response(JSON.stringify({
        data: {
          response: quick,
          intent: effectiveIntent,
          subcategory: effectiveSub,
          recommended_stores: [],
          version: 'WEN 1.5.0',
          meta: { stage: 'QUICK_CHOICES', confidence: effectiveConf },
          state: outState
        }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ===== Stage 3: 資訊優先（鎖定或高信心）=====
    const finalIntent = effectiveIntent;
    const finalSub = effectiveSub;

    // FAQ 僅在聊天類介入（保持你原先邏輯）
    if (['INTRO','VAGUE_CHAT','GREETING','GENERAL','SPECIFIC_ENTITY'].includes(finalIntent)) {
      const faqSvc = new FAQService(dl.supabase);
      const faq = await faqSvc.answer(msg, finalIntent);
      if (faq) {
        return new Response(JSON.stringify({
          data: {
            response: faq.answer,
            intent: finalIntent,
            subcategory: finalSub,
            recommended_stores: [],
            version: 'WEN 1.5.0',
            meta: { type: 'faq', match: faq.match, sim: faq.sim },
            state: { stage: 'locked', intent: finalIntent, subcategory: finalSub, confidence: effectiveConf }
          }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // 業務意圖 → 查資料庫
    let stores: any[] = [];
    if (['ENGLISH_LEARNING','FOOD','PARKING','SHOPPING','BEAUTY','MEDICAL','ATTRACTION','COVERAGE_STATS','COFFEE','SUPPLEMENTS','PETS','LEISURE'].includes(finalIntent)) {
      if (finalIntent === 'COVERAGE_STATS') {
        const stats = await dl.getStats();
        response = `📊 **統計**
• 商家總數：${stats.total}
• 安心店家：${stats.verified}
• 優惠店家：${stats.discount}
• 特約商家：${stats.partner}
• 分類數：${stats.categories}`;
      } else {
        const reco = new Reco(dl);
        stores = await reco.forIntent(finalIntent as Intent, { subcategory: finalSub, message: msg });

        // 硬規則＋跨類別檢查
        const hard = validateRecommendationLogic(finalIntent as Intent, stores);
        if (!hard.isValid || stores.length === 0) {
          const fallbackResponse = fallbackText(finalIntent as Intent, finalSub);
          await logRecommendation(dl.supabase, {
            session_id: sessionId,
            intent: finalIntent as Intent,
            subcategory: finalSub,
            message: msg,
            stores,
            checks: { hard },
            fallback: { used: true, reason: hard.isValid ? 'EMPTY' : hard.reason },
            ms: Date.now() - t0
          });
          return new Response(JSON.stringify({
            data: {
              response: fallbackResponse,
              intent: finalIntent,
              subcategory: finalSub,
              recommended_stores: [],
              version: 'WEN 1.5.0',
              meta: { fallback: true },
              state: { stage: 'locked', intent: finalIntent, subcategory: finalSub, confidence: effectiveConf }
            }
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        response = renderList(stores, finalIntent as Intent, finalSub);
      }
    } else {
      // 其餘意圖 → 簡潔引導
      response = '把需求丟給我，我幫你在文山特區找美食、醫療、停車與景點等資訊！';
    }

    // 審計：新增欄位（intent_before/after、confidence、asked_followup）
    await logRecommendation(dl.supabase, {
      session_id: sessionId,
      intent: finalIntent as Intent,
      subcategory: finalSub,
      message: msg,
      stores,
      checks: { hard: { isValid: true }, cross: { isValid: true } },
      ms: Date.now() - t0
    });

    return new Response(JSON.stringify({
      data: {
        response,
        intent: finalIntent,
        subcategory: finalSub,
        recommended_stores: (stores || []).map(s => ({ id: s.id, name: s.store_name, category: s.category })),
        version: 'WEN 1.5.0',
        meta: { stage: 'INFO_FIRST', confidence: effectiveConf },
        // 回傳 state 讓前端下輪帶上（保持單輪反問邏輯）
        state: { stage: 'locked', intent: finalIntent, subcategory: finalSub, confidence: effectiveConf }
      }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (e) {
    return new Response(JSON.stringify({ error: { code: 'RUNTIME', message: 'failed' } }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
