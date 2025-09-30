/**
 * 語氣生成層模組 - 模板系統與語氣渲染
 * 負責：語氣模板管理、Prompt 生成、多語氣支援
 */

import { IntentResult } from "./intent-classifier.ts";
import { StoreData } from "./data-layer.ts";

export interface ToneTemplate {
  name: string;
  description: string;
  preamble: string;
  dataPrefix: string;
  fallbackMessage: string;
  closingHint?: string;
  emoji: string;
  personality: string[];
}

export class ToneRenderer {
  private currentTone: string = 'friendly';
  private toneTemplates: Map<string, ToneTemplate> = new Map();

  constructor() {
    this.initializeToneTemplates();
  }

  /**
   * 初始化語氣模板
   */
  private initializeToneTemplates(): void {
    // 在地朋友語氣
    this.toneTemplates.set('friendly', {
      name: '在地朋友',
      description: '像住附近的朋友一樣親切自然',
      preamble: '嘿～這附近我蠻推薦的！',
      dataPrefix: '推薦你：',
      fallbackMessage: '目前我查不到資料，不過你也可以問我其他的類別喔～',
      closingHint: '如果有其他需求，也可以再問我沒關係！',
      emoji: '😊',
      personality: ['親切', '自然', '熱情', '友善']
    });

    // 可愛助手語氣
    this.toneTemplates.set('cute', {
      name: '可愛助手',
      description: '像貼心的機器人妹妹一樣可愛',
      preamble: '嘿嘿～這附近我超推薦的！',
      dataPrefix: '這家店是…',
      fallbackMessage: '抱歉啦～目前我找不到相關資料，要不要試試其他類別呢？',
      closingHint: '有需要我再幫你找喔！',
      emoji: '✨',
      personality: ['可愛', '活潑', '貼心', '萌系']
    });

    // 導遊導覽語氣
    this.toneTemplates.set('guide', {
      name: '導遊導覽',
      description: '像專業在地導遊一樣詳細介紹',
      preamble: '很高興為您推薦鳳山文山特區的特色商家：',
      dataPrefix: '首先介紹：',
      fallbackMessage: '很抱歉，目前沒有找到相關的商家資訊，建議您稍後再試或聯繫客服。',
      closingHint: '如需更多資訊，歡迎隨時諮詢。',
      emoji: '🎯',
      personality: ['專業', '詳細', '正式', '導覽']
    });

    // 溫暖鄰居語氣
    this.toneTemplates.set('warm', {
      name: '溫暖鄰居',
      description: '像隔壁的溫暖鄰居一樣關懷',
      preamble: '這附近我常去的店家，推薦給你：',
      dataPrefix: '我特別推薦：',
      fallbackMessage: '不好意思，目前沒有找到相關資料，不過你可以問我其他類別，我很樂意幫忙！',
      closingHint: '有其他需要隨時告訴我喔！',
      emoji: '🏠',
      personality: ['溫暖', '關懷', '鄰居', '貼心']
    });
  }

  /**
   * 設定當前語氣
   */
  setTone(toneName: string): void {
    if (this.toneTemplates.has(toneName)) {
      this.currentTone = toneName;
      console.log(`🎨 切換語氣模板: ${this.getCurrentToneName()}`);
    } else {
      console.warn(`⚠️ 未知語氣模板: ${toneName}，使用預設語氣`);
      this.currentTone = 'friendly';
    }
  }

  /**
   * 獲取當前語氣名稱
   */
  getCurrentToneName(): string {
    return this.toneTemplates.get(this.currentTone)?.name || '在地朋友';
  }

  /**
   * 根據意圖自動選擇語氣
   */
  autoSelectTone(intent: string): void {
    switch (intent) {
      case 'FOOD':
        this.setTone('friendly'); // 美食推薦用朋友語氣
        break;
      case 'ENGLISH_LEARNING':
        this.setTone('warm'); // 教育推薦用溫暖語氣
        break;
      case 'PARKING':
        this.setTone('guide'); // 停車場查詢用導遊語氣
        break;
      case 'MEDICAL':
        this.setTone('guide'); // 醫療查詢用專業語氣
        break;
      default:
        this.setTone('friendly'); // 預設朋友語氣
        break;
    }
  }

  /**
   * 生成系統提示詞
   */
  generateSystemPrompt(
    intentResult: IntentResult,
    stores: StoreData[],
    userMessage: string,
    sessionId: string
  ): string {
    console.log(`[${sessionId}] 🎨 生成語氣模板，意圖=${intentResult.primary}`);

    // 自動選擇語氣
    this.autoSelectTone(intentResult.primary);

    const template = this.toneTemplates.get(this.currentTone)!;
    
    // 生成商家資料上下文
    const contextData = this.generateStoreContext(stores, sessionId);
    
    // 生成完整系統提示詞
    const systemPrompt = this.buildSystemPrompt(template, contextData, userMessage, intentResult);

    console.log(`[${sessionId}] ✅ 系統提示詞生成完成，長度: ${systemPrompt.length}`);
    
    return systemPrompt;
  }

  /**
   * 生成商家資料上下文
   */
  private generateStoreContext(stores: StoreData[], sessionId: string): string {
    if (stores.length === 0) {
      return "\n\n⚠️ 目前沒有找到相關商家資料，請稍後再試或聯繫客服。";
    }

    let contextData = "\n\n文山特區商圈商家資訊:\n";
    
    stores.forEach((store, i) => {
      const features = typeof store.features === 'string' ? 
        JSON.parse(store.features) : store.features;
      
      contextData += `${i + 1}. ${store.store_name} ${store.is_partner_store ? '[特約商家]' : ''}\n`;
      contextData += `   類別: ${store.category}\n`;
      contextData += `   地址: ${store.address || '地址請洽詢店家'}\n`;
      contextData += `   電話: ${store.phone || '電話請洽詢店家'}\n`;
      contextData += `   營業時間: ${store.business_hours || '營業時間請洽詢店家'}\n`;
      
      if (features?.rating) {
        contextData += `   評分: ${features.rating}\n`;
      }
      
      if (features?.description) {
        contextData += `   特色: ${features.description}\n`;
      }
      
      contextData += "\n";
    });

    return contextData;
  }

  /**
   * 建構完整系統提示詞
   */
  private buildSystemPrompt(
    template: ToneTemplate,
    contextData: string,
    userMessage: string,
    intentResult: IntentResult
  ): string {
    const systemBase = `你是高文文，鳳山文山特區的 AI 導遊助手。請用溫暖、親切、像在地朋友一樣的語氣回答問題。 (WEN 1.2.0 - 語氣靈靈魂版)

🎨 當前語氣風格：${template.name} ${template.emoji}
💭 語氣特色：${template.personality.join('、')}

語氣指導原則：
- ${template.preamble}
- 像朋友推薦，不要像客服回報
- 可以加一些表情符號增加溫度
- 保持熱情但不過度誇張
- ${template.closingHint || '歡迎隨時詢問其他需求'}

嚴格約束規則（防幻覺防火牆）：
1. 你只能使用我提供的商家資料，絕對不能編造任何不存在的商家
2. 所有店名、地址、電話、營業時間都必須與提供的資料完全一致
3. 如果沒有資料，請誠實告知：「${template.fallbackMessage}」
4. 絕對不要編造「好客食堂」、「福源小館」、「阿村魯肉飯」等不存在的商家
5. 如果看到「⚠️ 目前沒有找到相關商家資料」，請直接告知用戶沒有找到商家
6. 類別推薦需符合意圖：美食查詢只能推薦餐飲類別，英語學習只能推薦教育類別
7. 不能將「肯塔基美語」描述為餐廳或美食店
8. 所有資訊錯寧可缺，絕不捏造
9. 如果推薦清單為空，請明確說明「目前沒有找到相關商家」
10. 絕對不要因為沒有資料就自行編造商家來填補推薦清單
11. 英語學習查詢：首次只推薦肯塔基美語一家，除非用戶明確追問更多選擇
12. 其他查詢：提供 2-3 家相關商家推薦
13. 回答要簡潔實用，避免冗長描述
14. 絕對不要編造虛假的地址或聯絡資訊
15. 如果推薦清單為空，請禮貌地告知用戶目前沒有找到相關商家
16. 停車場資訊請提供詳細地址、收費方式、開放時間等
17. 嚴格按照商家類別推薦：美食推薦只推薦餐飲美食類別
18. 絕對不要將教育機構（如肯塔基美語）描述為餐廳或美食店
19. 如果商家類別與查詢意圖不符，請明確說明並提供正確的商家資訊
20. 如果沒有真實的商家資料，寧可不推薦也不要編造虛假資訊

${contextData}

請根據上述資料，回應下列問題：
「${userMessage}」`;

    return systemBase;
  }

  /**
   * 獲取所有可用的語氣模板
   */
  getAllToneTemplates(): ToneTemplate[] {
    return Array.from(this.toneTemplates.values());
  }

  /**
   * 獲取語氣模板資訊
   */
  getToneTemplate(toneName: string): ToneTemplate | undefined {
    return this.toneTemplates.get(toneName);
  }

  /**
   * 添加自定義語氣模板
   */
  addToneTemplate(toneName: string, template: ToneTemplate): void {
    this.toneTemplates.set(toneName, template);
    console.log(`✅ 添加自定義語氣模板: ${toneName}`);
  }

  /**
   * 根據用戶偏好調整語氣
   */
  adjustToneByUserPreference(userPreference: string): void {
    switch (userPreference.toLowerCase()) {
      case 'cute':
      case '可愛':
        this.setTone('cute');
        break;
      case 'professional':
      case '專業':
        this.setTone('guide');
        break;
      case 'warm':
      case '溫暖':
        this.setTone('warm');
        break;
      default:
        this.setTone('friendly');
        break;
    }
  }

  /**
   * 生成語氣統計資訊
   */
  getToneStats(): {
    currentTone: string;
    availableTones: string[];
    totalTemplates: number;
  } {
    return {
      currentTone: this.currentTone,
      availableTones: Array.from(this.toneTemplates.keys()),
      totalTemplates: this.toneTemplates.size
    };
  }
}
