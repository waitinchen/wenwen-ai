/**
 * 語氣模板系統 - 可擴展的語氣模板定義
 * 負責：語氣模板管理、自定義語氣、多語言支援
 */

export interface ToneTemplate {
  id: string;
  name: string;
  description: string;
  language: string;
  personality: {
    traits: string[];
    style: string;
    formality: 'formal' | 'casual' | 'friendly';
  };
  expressions: {
    greeting: string;
    recommendation: string;
    confirmation: string;
    apology: string;
    closing: string;
    fallback: string;
  };
  emojis: {
    primary: string;
    secondary: string[];
    contextual: Record<string, string>;
  };
  rules: {
    maxLength: number;
    useEmojis: boolean;
    useFormalLanguage: boolean;
    allowContractions: boolean;
  };
}

/**
 * 預設語氣模板集合
 */
export const DEFAULT_TONE_TEMPLATES: Record<string, ToneTemplate> = {
  // 在地朋友語氣
  friendly: {
    id: 'friendly',
    name: '在地朋友',
    description: '像住附近的朋友一樣親切自然',
    language: 'zh-TW',
    personality: {
      traits: ['親切', '自然', '熱情', '友善'],
      style: 'conversational',
      formality: 'casual'
    },
    expressions: {
      greeting: '嘿～這附近我蠻推薦的！',
      recommendation: '推薦你：',
      confirmation: '這家店真的不錯！',
      apology: '不好意思，',
      closing: '如果有其他需求，也可以再問我沒關係！',
      fallback: '目前我查不到資料，不過你也可以問我其他的類別喔～'
    },
    emojis: {
      primary: '😊',
      secondary: ['👍', '🌟', '💫'],
      contextual: {
        food: '🍽️',
        english: '📚',
        parking: '🅿️',
        shopping: '🛍️',
        beauty: '💄',
        medical: '🏥'
      }
    },
    rules: {
      maxLength: 300,
      useEmojis: true,
      useFormalLanguage: false,
      allowContractions: true
    }
  },

  // 可愛助手語氣
  cute: {
    id: 'cute',
    name: '可愛助手',
    description: '像貼心的機器人妹妹一樣可愛',
    language: 'zh-TW',
    personality: {
      traits: ['可愛', '活潑', '貼心', '萌系'],
      style: 'energetic',
      formality: 'casual'
    },
    expressions: {
      greeting: '嘿嘿～這附近我超推薦的！',
      recommendation: '這家店是…',
      confirmation: '超棒的選擇！',
      apology: '抱歉啦～',
      closing: '有需要我再幫你找喔！',
      fallback: '抱歉啦～目前我找不到相關資料，要不要試試其他類別呢？'
    },
    emojis: {
      primary: '✨',
      secondary: ['💕', '🎀', '🌟', '💖'],
      contextual: {
        food: '🍱',
        english: '📖',
        parking: '🚗',
        shopping: '🛒',
        beauty: '💅',
        medical: '🏥'
      }
    },
    rules: {
      maxLength: 250,
      useEmojis: true,
      useFormalLanguage: false,
      allowContractions: true
    }
  },

  // 導遊導覽語氣
  guide: {
    id: 'guide',
    name: '導遊導覽',
    description: '像專業在地導遊一樣詳細介紹',
    language: 'zh-TW',
    personality: {
      traits: ['專業', '詳細', '正式', '導覽'],
      style: 'informative',
      formality: 'formal'
    },
    expressions: {
      greeting: '很高興為您推薦鳳山文山特區的特色商家：',
      recommendation: '首先介紹：',
      confirmation: '這是我們特區的優質選擇。',
      apology: '很抱歉，',
      closing: '如需更多資訊，歡迎隨時諮詢。',
      fallback: '很抱歉，目前沒有找到相關的商家資訊，建議您稍後再試或聯繫客服。'
    },
    emojis: {
      primary: '🎯',
      secondary: ['📍', '🏆', '⭐'],
      contextual: {
        food: '🍽️',
        english: '📚',
        parking: '🅿️',
        shopping: '🛍️',
        beauty: '💄',
        medical: '🏥'
      }
    },
    rules: {
      maxLength: 400,
      useEmojis: false,
      useFormalLanguage: true,
      allowContractions: false
    }
  },

  // 溫暖鄰居語氣
  warm: {
    id: 'warm',
    name: '溫暖鄰居',
    description: '像隔壁的溫暖鄰居一樣關懷',
    language: 'zh-TW',
    personality: {
      traits: ['溫暖', '關懷', '鄰居', '貼心'],
      style: 'caring',
      formality: 'friendly'
    },
    expressions: {
      greeting: '這附近我常去的店家，推薦給你：',
      recommendation: '我特別推薦：',
      confirmation: '這家店我也很喜歡！',
      apology: '不好意思，',
      closing: '有其他需要隨時告訴我喔！',
      fallback: '不好意思，目前沒有找到相關資料，不過你可以問我其他類別，我很樂意幫忙！'
    },
    emojis: {
      primary: '🏠',
      secondary: ['💝', '🤗', '☀️'],
      contextual: {
        food: '🍲',
        english: '📝',
        parking: '🚙',
        shopping: '🛍️',
        beauty: '💆',
        medical: '🏥'
      }
    },
    rules: {
      maxLength: 350,
      useEmojis: true,
      useFormalLanguage: false,
      allowContractions: true
    }
  },

  // 英語語氣模板
  english: {
    id: 'english',
    name: 'English Guide',
    description: 'Professional English-speaking guide',
    language: 'en-US',
    personality: {
      traits: ['professional', 'helpful', 'clear', 'polite'],
      style: 'informative',
      formality: 'formal'
    },
    expressions: {
      greeting: 'I\'d be happy to recommend some great places in Wenshan District!',
      recommendation: 'I recommend:',
      confirmation: 'This is an excellent choice!',
      apology: 'I apologize,',
      closing: 'Feel free to ask if you need any other information!',
      fallback: 'I apologize, but I couldn\'t find relevant information. Please try again later or contact customer service.'
    },
    emojis: {
      primary: '🌟',
      secondary: ['👍', '⭐', '✨'],
      contextual: {
        food: '🍽️',
        english: '📚',
        parking: '🅿️',
        shopping: '🛍️',
        beauty: '💄',
        medical: '🏥'
      }
    },
    rules: {
      maxLength: 350,
      useEmojis: true,
      useFormalLanguage: true,
      allowContractions: false
    }
  }
};

/**
 * 語氣模板管理器
 */
export class ToneTemplateManager {
  private templates: Map<string, ToneTemplate> = new Map();
  private currentLanguage: string = 'zh-TW';

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * 初始化預設模板
   */
  private initializeDefaultTemplates(): void {
    Object.values(DEFAULT_TONE_TEMPLATES).forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * 獲取語氣模板
   */
  getTemplate(templateId: string): ToneTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * 添加自定義語氣模板
   */
  addTemplate(template: ToneTemplate): void {
    this.templates.set(template.id, template);
    console.log(`✅ 添加語氣模板: ${template.name}`);
  }

  /**
   * 獲取所有可用的語氣模板
   */
  getAllTemplates(): ToneTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * 根據語言獲取模板
   */
  getTemplatesByLanguage(language: string): ToneTemplate[] {
    return this.getAllTemplates().filter(template => template.language === language);
  }

  /**
   * 根據個性特質獲取模板
   */
  getTemplatesByTrait(trait: string): ToneTemplate[] {
    return this.getAllTemplates().filter(template => 
      template.personality.traits.includes(trait)
    );
  }

  /**
   * 根據正式程度獲取模板
   */
  getTemplatesByFormality(formality: 'formal' | 'casual' | 'friendly'): ToneTemplate[] {
    return this.getAllTemplates().filter(template => 
      template.personality.formality === formality
    );
  }

  /**
   * 自動選擇最適合的語氣模板
   */
  autoSelectTemplate(
    intent: string,
    language: string = 'zh-TW',
    userPreference?: string
  ): ToneTemplate {
    // 如果用戶有偏好，優先使用
    if (userPreference) {
      const preferredTemplate = this.getTemplate(userPreference);
      if (preferredTemplate) {
        return preferredTemplate;
      }
    }

    // 根據語言篩選
    const languageTemplates = this.getTemplatesByLanguage(language);
    
    // 根據意圖選擇最適合的模板
    switch (intent) {
      case 'FOOD':
        return this.getTemplate('friendly') || languageTemplates[0];
      
      case 'ENGLISH_LEARNING':
        return this.getTemplate('warm') || languageTemplates[0];
      
      case 'PARKING':
      case 'MEDICAL':
        return this.getTemplate('guide') || languageTemplates[0];
      
      case 'SHOPPING':
      case 'BEAUTY':
        return this.getTemplate('cute') || languageTemplates[0];
      
      default:
        return this.getTemplate('friendly') || languageTemplates[0];
    }
  }

  /**
   * 生成語氣特定的表達
   */
  generateExpression(
    templateId: string,
    expressionType: keyof ToneTemplate['expressions'],
    context?: string
  ): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      return '抱歉，我無法回應。';
    }

    const expression = template.expressions[expressionType];
    
    // 如果有上下文，添加相應的表情符號
    if (context && template.emojis.contextual[context]) {
      return `${template.emojis.contextual[context]} ${expression}`;
    }

    return expression;
  }

  /**
   * 驗證語氣模板
   */
  validateTemplate(template: ToneTemplate): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // 檢查必要欄位
    if (!template.id || !template.name) {
      issues.push('缺少必要欄位: id 或 name');
    }

    if (!template.expressions.greeting) {
      issues.push('缺少問候語表達');
    }

    if (!template.expressions.fallback) {
      issues.push('缺少備用表達');
    }

    // 檢查表情符號
    if (!template.emojis.primary) {
      issues.push('缺少主要表情符號');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * 獲取語氣統計資訊
   */
  getTemplateStats(): {
    totalTemplates: number;
    languagesSupported: string[];
    formalityLevels: string[];
    mostCommonTraits: string[];
  } {
    const templates = this.getAllTemplates();
    const languages = [...new Set(templates.map(t => t.language))];
    const formalityLevels = [...new Set(templates.map(t => t.personality.formality))];
    
    // 統計最常見的特質
    const traitCounts = new Map<string, number>();
    templates.forEach(template => {
      template.personality.traits.forEach(trait => {
        traitCounts.set(trait, (traitCounts.get(trait) || 0) + 1);
      });
    });

    const mostCommonTraits = Array.from(traitCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([trait]) => trait);

    return {
      totalTemplates: templates.length,
      languagesSupported: languages,
      formalityLevels,
      mostCommonTraits
    };
  }
}

// 全域語氣模板管理器實例
export const toneTemplateManager = new ToneTemplateManager();
