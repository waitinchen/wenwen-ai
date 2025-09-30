/**
 * 安全 HTTP 請求工具模組
 * 負責：請求超時控制、錯誤處理、重試機制
 */

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface FetchResult<T = any> {
  data: T | null;
  error: string | null;
  status: number;
  success: boolean;
}

/**
 * 安全的 fetch 封裝，包含超時和重試機制
 */
export async function safeFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    timeout = 10000,
    retries = 3,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // 創建 AbortController 用於超時控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // 檢查回應狀態
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;

    } catch (error) {
      lastError = error as Error;
      
      // 如果不是最後一次嘗試，等待後重試
      if (attempt < retries) {
        console.warn(`請求失敗，${retryDelay}ms 後重試 (${attempt}/${retries}):`, error);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  // 所有重試都失敗
  throw new Error(`請求失敗，已重試 ${retries} 次: ${lastError?.message}`);
}

/**
 * 帶 JSON 解析的安全請求
 */
export async function safeFetchJson<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<FetchResult<T>> {
  try {
    const response = await safeFetch(url, options);
    const data = await response.json();
    
    return {
      data,
      error: null,
      status: response.status,
      success: true
    };
  } catch (error) {
    return {
      data: null,
      error: (error as Error).message,
      status: 0,
      success: false
    };
  }
}

/**
 * 帶超時控制的 Promise 包裝器
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = '操作超時'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    })
  ]);
}

/**
 * 批量請求處理
 */
export async function batchFetch<T>(
  requests: Array<() => Promise<T>>,
  concurrency: number = 3,
  options: FetchOptions = {}
): Promise<FetchResult<T[]>> {
  const results: T[] = [];
  const errors: string[] = [];

  // 分批處理請求
  for (let i = 0; i < requests.length; i += concurrency) {
    const batch = requests.slice(i, i + concurrency);
    
    try {
      const batchResults = await Promise.allSettled(
        batch.map(request => request())
      );

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          errors.push(`請求 ${i + index} 失敗: ${result.reason}`);
        }
      });

    } catch (error) {
      errors.push(`批次 ${i / concurrency + 1} 失敗: ${(error as Error).message}`);
    }
  }

  return {
    data: results,
    error: errors.length > 0 ? errors.join('; ') : null,
    status: errors.length === 0 ? 200 : 500,
    success: errors.length === 0
  };
}

/**
 * 請求統計和監控
 */
export class FetchMonitor {
  private stats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalResponseTime: 0,
    averageResponseTime: 0
  };

  /**
   * 記錄請求統計
   */
  recordRequest(success: boolean, responseTime: number): void {
    this.stats.totalRequests++;
    
    if (success) {
      this.stats.successfulRequests++;
    } else {
      this.stats.failedRequests++;
    }
    
    this.stats.totalResponseTime += responseTime;
    this.stats.averageResponseTime = this.stats.totalResponseTime / this.stats.totalRequests;
  }

  /**
   * 獲取統計資訊
   */
  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  /**
   * 重置統計
   */
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      averageResponseTime: 0
    };
  }

  /**
   * 獲取成功率
   */
  getSuccessRate(): number {
    return this.stats.totalRequests > 0 
      ? this.stats.successfulRequests / this.stats.totalRequests 
      : 0;
  }
}

// 全域監控實例
export const fetchMonitor = new FetchMonitor();

/**
 * 帶監控的安全請求
 */
export async function monitoredSafeFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const startTime = Date.now();
  
  try {
    const response = await safeFetch(url, options);
    const responseTime = Date.now() - startTime;
    
    fetchMonitor.recordRequest(true, responseTime);
    
    return response;
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    fetchMonitor.recordRequest(false, responseTime);
    
    throw error;
  }
}
