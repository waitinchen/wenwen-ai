/**
 * 把關系統配置管理
 * 管理五層架構管理師的配置和規則
 */

// ===== 把關系統配置介面 =====
interface GatekeeperConfig {
  version: string;
  enabled: boolean;
  layers: {
    layer1: LayerConfig;
    layer2: LayerConfig;
    layer3: LayerConfig;
    layer4: LayerConfig;
    layer5: LayerConfig;
  };
  rules: {
    hallucinationDetection: HallucinationRules;
    contentValidation: ContentValidationRules;
    interactionRules: InteractionRules;
  };
  thresholds: {
    maxCorrections: number;
    maxResponseTime: number;
    minConfidenceScore: number;
  };
  blacklists: {
    stores: string[];
    phrases: string[];
    patterns: RegExp[];
  };
}

interface LayerConfig {
  enabled: boolean;
  priority: number;
  timeout: number;
  rules: string[];
}

interface HallucinationRules {
  enabled: boolean;
  strictMode: boolean;
  blacklistEnabled: boolean;
  patternDetection: boolean;
  confidenceThreshold: number;
}

interface ContentValidationRules {
  enabled: boolean;
  checkLogicalConsistency: boolean;
  checkIntentAlignment: boolean;
  checkDataAccuracy: boolean;
}

interface InteractionRules {
  enabled: boolean;
  checkUserIntent: boolean;
  checkResponseRelevance: boolean;
  checkSafety: boolean;
}

// ===== 預設配置 =====
const DEFAULT_CONFIG: GatekeeperConfig = {
  version: 'WEN 1.2.0-GATEKEEPER',
  enabled: true,
  layers: {
    layer1: {
      enabled: true,
      priority: 1,
      timeout: 5000,
      rules: ['data_validation', 'store_verification', 'activity_verification']
    },
    layer2: {
      enabled: true,
      priority: 2,
      timeout: 3000,
      rules: ['training_data_validation', 'faq_validation', 'knowledge_consistency']
    },
    layer3: {
      enabled: true,
      priority: 3,
      timeout: 4000,
      rules: ['hallucination_detection', 'logical_consistency', 'content_accuracy']
    },
    layer4: {
      enabled: true,
      priority: 4,
      timeout: 2000,
      rules: ['interaction_analysis', 'risk_assessment', 'correction_application']
    },
    layer5: {
      enabled: true,
      priority: 5,
      timeout: 1000,
      rules: ['final_validation', 'safety_check', 'quality_assurance']
    }
  },
  rules: {
    hallucinationDetection: {
      enabled: true,
      strictMode: true,
      blacklistEnabled: true,
      patternDetection: true,
      confidenceThreshold: 0.8
    },
    contentValidation: {
      enabled: true,
      checkLogicalConsistency: true,
      checkIntentAlignment: true,
      checkDataAccuracy: true
    },
    interactionRules: {
      enabled: true,
      checkUserIntent: true,
      checkResponseRelevance: true,
      checkSafety: true
    }
  },
  thresholds: {
    maxCorrections: 5,
    maxResponseTime: 10000,
    minConfidenceScore: 0.7
  },
  blacklists: {
    stores: [
      '鳳山牛肉麵', '山城小館', 'Coz Pizza', '好客食堂', '福源小館', '阿村魯肉飯',
      '英文達人', '環球英語', '東門市場', '文山樓', '美語街123號'
    ],
    phrases: [
      '嘿～這附近我蠻推薦的',
      '我超推薦.*的啦',
      '相信對你的學習會有幫助',
      '有空不妨去看看',
      '這幾家我都很推薦'
    ],
    patterns: [
      /嘿～這附近我蠻推薦的/,
      /我超推薦.*的啦/,
      /相信對你的學習會有幫助/,
      /有空不妨去看看/,
      /這幾家我都很推薦/
    ]
  }
};

// ===== 把關系統配置管理器 =====
class GatekeeperConfigManager {
  private config: GatekeeperConfig;
  private configVersion: string;

  constructor(initialConfig?: Partial<GatekeeperConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...initialConfig };
    this.configVersion = this.config.version;
  }

  /**
   * 獲取當前配置
   */
  getConfig(): GatekeeperConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<GatekeeperConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.configVersion = this.config.version;
    console.log(`🔧 把關系統配置已更新: ${this.configVersion}`);
  }

  /**
   * 啟用/停用把關系統
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    console.log(`🔒 把關系統${enabled ? '已啟用' : '已停用'}`);
  }

  /**
   * 啟用/停用特定層
   */
  setLayerEnabled(layer: keyof GatekeeperConfig['layers'], enabled: boolean): void {
    this.config.layers[layer].enabled = enabled;
    console.log(`🔧 Layer ${layer} ${enabled ? '已啟用' : '已停用'}`);
  }

  /**
   * 更新黑名單
   */
  updateBlacklist(type: keyof GatekeeperConfig['blacklists'], items: string[]): void {
    if (type === 'patterns') {
      // 處理正則表達式
      this.config.blacklists.patterns = items.map(item => new RegExp(item));
    } else {
      (this.config.blacklists[type] as string[]) = items;
    }
    console.log(`🚫 黑名單已更新: ${type}, 項目數: ${items.length}`);
  }

  /**
   * 添加黑名單項目
   */
  addToBlacklist(type: keyof GatekeeperConfig['blacklists'], item: string): void {
    if (type === 'patterns') {
      this.config.blacklists.patterns.push(new RegExp(item));
    } else {
      (this.config.blacklists[type] as string[]).push(item);
    }
    console.log(`➕ 已添加到黑名單: ${type} - ${item}`);
  }

  /**
   * 移除黑名單項目
   */
  removeFromBlacklist(type: keyof GatekeeperConfig['blacklists'], item: string): void {
    if (type === 'patterns') {
      this.config.blacklists.patterns = this.config.blacklists.patterns.filter(
        pattern => pattern.source !== item
      );
    } else {
      (this.config.blacklists[type] as string[]) = (this.config.blacklists[type] as string[])
        .filter(listItem => listItem !== item);
    }
    console.log(`➖ 已從黑名單移除: ${type} - ${item}`);
  }

  /**
   * 更新閾值
   */
  updateThresholds(thresholds: Partial<GatekeeperConfig['thresholds']>): void {
    this.config.thresholds = { ...this.config.thresholds, ...thresholds };
    console.log(`📊 閾值已更新:`, thresholds);
  }

  /**
   * 驗證配置
   */
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 檢查版本
    if (!this.config.version) {
      errors.push('版本號不能為空');
    }

    // 檢查層配置
    Object.entries(this.config.layers).forEach(([layerName, layerConfig]) => {
      if (layerConfig.enabled && layerConfig.timeout <= 0) {
        errors.push(`${layerName} 超時時間必須大於 0`);
      }
      if (layerConfig.priority < 1 || layerConfig.priority > 5) {
        errors.push(`${layerName} 優先級必須在 1-5 之間`);
      }
    });

    // 檢查閾值
    if (this.config.thresholds.maxCorrections < 0) {
      errors.push('最大修正數不能小於 0');
    }
    if (this.config.thresholds.maxResponseTime <= 0) {
      errors.push('最大回應時間必須大於 0');
    }
    if (this.config.thresholds.minConfidenceScore < 0 || this.config.thresholds.minConfidenceScore > 1) {
      errors.push('最小信心分數必須在 0-1 之間');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 重置為預設配置
   */
  resetToDefault(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.configVersion = this.config.version;
    console.log('🔄 配置已重置為預設值');
  }

  /**
   * 導出配置
   */
  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * 導入配置
   */
  importConfig(configJson: string): { success: boolean; error?: string } {
    try {
      const importedConfig = JSON.parse(configJson);
      const validation = this.validateConfig();
      
      if (validation.isValid) {
        this.config = { ...DEFAULT_CONFIG, ...importedConfig };
        this.configVersion = this.config.version;
        console.log('📥 配置導入成功');
        return { success: true };
      } else {
        return { success: false, error: `配置驗證失敗: ${validation.errors.join(', ')}` };
      }
    } catch (error) {
      return { success: false, error: `JSON 解析失敗: ${error.message}` };
    }
  }

  /**
   * 獲取配置摘要
   */
  getConfigSummary(): {
    version: string;
    enabled: boolean;
    enabledLayers: number;
    totalLayers: number;
    blacklistItems: number;
    thresholds: GatekeeperConfig['thresholds'];
  } {
    const enabledLayers = Object.values(this.config.layers).filter(layer => layer.enabled).length;
    const totalLayers = Object.keys(this.config.layers).length;
    const blacklistItems = this.config.blacklists.stores.length + 
                          this.config.blacklists.phrases.length + 
                          this.config.blacklists.patterns.length;

    return {
      version: this.config.version,
      enabled: this.config.enabled,
      enabledLayers,
      totalLayers,
      blacklistItems,
      thresholds: this.config.thresholds
    };
  }

  /**
   * 獲取層級狀態
   */
  getLayerStatus(): Array<{
    layer: string;
    enabled: boolean;
    priority: number;
    timeout: number;
    rules: string[];
  }> {
    return Object.entries(this.config.layers).map(([layerName, layerConfig]) => ({
      layer: layerName,
      enabled: layerConfig.enabled,
      priority: layerConfig.priority,
      timeout: layerConfig.timeout,
      rules: layerConfig.rules
    }));
  }

  /**
   * 獲取規則狀態
   */
  getRulesStatus(): {
    hallucinationDetection: HallucinationRules;
    contentValidation: ContentValidationRules;
    interactionRules: InteractionRules;
  } {
    return {
      hallucinationDetection: this.config.rules.hallucinationDetection,
      contentValidation: this.config.rules.contentValidation,
      interactionRules: this.config.rules.interactionRules
    };
  }
}

// ===== 配置管理實例 =====
let configManager: GatekeeperConfigManager | null = null;

/**
 * 獲取配置管理器實例
 */
export function getConfigManager(): GatekeeperConfigManager {
  if (!configManager) {
    configManager = new GatekeeperConfigManager();
  }
  return configManager;
}

/**
 * 初始化配置管理器
 */
export function initializeConfigManager(initialConfig?: Partial<GatekeeperConfig>): GatekeeperConfigManager {
  configManager = new GatekeeperConfigManager(initialConfig);
  return configManager;
}

// ===== 配置工具函數 =====

/**
 * 檢查是否啟用把關系統
 */
export function isGatekeeperEnabled(): boolean {
  return getConfigManager().getConfig().enabled;
}

/**
 * 檢查特定層是否啟用
 */
export function isLayerEnabled(layer: keyof GatekeeperConfig['layers']): boolean {
  return getConfigManager().getConfig().layers[layer].enabled;
}

/**
 * 獲取黑名單
 */
export function getBlacklist(type: keyof GatekeeperConfig['blacklists']): string[] | RegExp[] {
  return getConfigManager().getConfig().blacklists[type];
}

/**
 * 檢查項目是否在黑名單中
 */
export function isInBlacklist(type: keyof GatekeeperConfig['blacklists'], item: string): boolean {
  const blacklist = getBlacklist(type);
  
  if (type === 'patterns') {
    return (blacklist as RegExp[]).some(pattern => pattern.test(item));
  } else {
    return (blacklist as string[]).includes(item);
  }
}

/**
 * 獲取閾值配置
 */
export function getThresholds(): GatekeeperConfig['thresholds'] {
  return getConfigManager().getConfig().thresholds;
}

// ===== 預設導出 =====
export default GatekeeperConfigManager;
export type { GatekeeperConfig, LayerConfig, HallucinationRules, ContentValidationRules, InteractionRules };
