/**
 * 版號同步服務
 * 自動從後端獲取最新版號並更新前台顯示
 */

import { createClient } from '@supabase/supabase-js'

// Supabase 配置
const supabaseUrl = 'https://vqcuwjfxoxjgsrueqodj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3V3amZ4b3hqZ3NydWVxb2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDc0ODUsImV4cCI6MjA3MzQ4MzQ4NX0.8qgpIbHaGFv7-Coy165-LrFnjwR5DexWenrNf4f0P4YE'

const supabase = createClient(supabaseUrl, supabaseKey)

export interface VersionInfo {
  version: string
  buildTime: string
  buildNumber: string
  releaseDate: string
  environment: string
  features: string[]
}

export class VersionSyncService {
  private static instance: VersionSyncService
  private currentVersion: VersionInfo | null = null
  private lastSyncTime: number = 0
  private syncInterval: number = 5 * 60 * 1000 // 5分鐘同步一次

  private constructor() {}

  static getInstance(): VersionSyncService {
    if (!VersionSyncService.instance) {
      VersionSyncService.instance = new VersionSyncService()
    }
    return VersionSyncService.instance
  }

  /**
   * 獲取最新版號資訊
   */
  async getLatestVersion(): Promise<VersionInfo> {
    try {
      const { data, error } = await supabase.functions.invoke('version-sync')
      
      if (error) {
        console.error('版號同步失敗:', error)
        throw new Error(error.message)
      }

      if (data?.success && data?.data) {
        this.currentVersion = data.data
        this.lastSyncTime = Date.now()
        return data.data
      } else {
        throw new Error('版號資料格式錯誤')
      }
    } catch (error) {
      console.error('版號同步異常:', error)
      // 返回預設版號
      return this.getDefaultVersion()
    }
  }

  /**
   * 獲取當前版號（帶快取）
   */
  async getCurrentVersion(): Promise<VersionInfo> {
    const now = Date.now()
    
    // 如果有快取且未過期，直接返回
    if (this.currentVersion && (now - this.lastSyncTime) < this.syncInterval) {
      return this.currentVersion
    }

    // 否則重新獲取
    return await this.getLatestVersion()
  }

  /**
   * 檢查是否需要更新版號
   */
  async checkForUpdates(): Promise<boolean> {
    try {
      const latestVersion = await this.getLatestVersion()
      const currentVersion = this.currentVersion

      if (!currentVersion) {
        return true
      }

      return latestVersion.version !== currentVersion.version
    } catch (error) {
      console.error('檢查版號更新失敗:', error)
      return false
    }
  }

  /**
   * 更新前台版號顯示
   */
  updateFrontendVersion(versionInfo: VersionInfo) {
    // 更新頁面中的版號顯示
    const versionElements = document.querySelectorAll('[data-version]')
    versionElements.forEach(element => {
      if (element instanceof HTMLElement) {
        element.textContent = versionInfo.version
      }
    })

    // 更新頁面標題中的版號
    const titleElement = document.querySelector('title')
    if (titleElement) {
      const currentTitle = titleElement.textContent || ''
      const newTitle = currentTitle.replace(/WEN \d+\.\d+\.\d+/, versionInfo.version)
      titleElement.textContent = newTitle
    }

    // 觸發自定義事件，通知其他組件版號已更新
    window.dispatchEvent(new CustomEvent('versionUpdated', {
      detail: versionInfo
    }))

    console.log(`✅ 前台版號已更新: ${versionInfo.version}`)
  }

  /**
   * 啟動自動同步
   */
  startAutoSync() {
    // 立即同步一次
    this.syncVersion()

    // 定期同步
    setInterval(() => {
      this.syncVersion()
    }, this.syncInterval)

    console.log('🔄 版號自動同步已啟動')
  }

  /**
   * 同步版號
   */
  private async syncVersion() {
    try {
      const versionInfo = await this.getCurrentVersion()
      this.updateFrontendVersion(versionInfo)
    } catch (error) {
      console.error('版號同步失敗:', error)
    }
  }

  /**
   * 獲取預設版號（當同步失敗時使用）
   */
  private getDefaultVersion(): VersionInfo {
    return {
      version: 'WEN 1.4.6',
      buildTime: new Date().toISOString(),
      buildNumber: `20250929-${String(Date.now()).slice(-3)}`,
      releaseDate: '2025-09-29',
      environment: 'production',
      features: []
    }
  }

  /**
   * 手動觸發版號同步
   */
  async forceSync(): Promise<VersionInfo> {
    this.lastSyncTime = 0 // 清除快取
    const versionInfo = await this.getLatestVersion()
    this.updateFrontendVersion(versionInfo)
    return versionInfo
  }
}

// 導出單例實例
export const versionSync = VersionSyncService.getInstance()
