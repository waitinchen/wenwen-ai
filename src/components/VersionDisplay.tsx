/**
 * 版號顯示組件
 * 自動同步並顯示最新版號
 */

import React, { useState, useEffect } from 'react'
import { versionSync, VersionInfo } from '../lib/versionSync'

interface VersionDisplayProps {
  showDetails?: boolean
  autoSync?: boolean
  className?: string
}

export const VersionDisplay: React.FC<VersionDisplayProps> = ({
  showDetails = false,
  autoSync = true,
  className = ''
}) => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    const loadVersion = async () => {
      try {
        setIsLoading(true)
        const version = await versionSync.getCurrentVersion()
        setVersionInfo(version)
        setLastSync(new Date())
      } catch (error) {
        console.error('載入版號失敗:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // 初始載入
    loadVersion()

    // 監聽版號更新事件
    const handleVersionUpdate = (event: CustomEvent) => {
      setVersionInfo(event.detail)
      setLastSync(new Date())
    }

    window.addEventListener('versionUpdated', handleVersionUpdate as EventListener)

    // 啟動自動同步
    if (autoSync) {
      versionSync.startAutoSync()
    }

    return () => {
      window.removeEventListener('versionUpdated', handleVersionUpdate as EventListener)
    }
  }, [autoSync])

  const handleManualSync = async () => {
    try {
      setIsLoading(true)
      const version = await versionSync.forceSync()
      setVersionInfo(version)
      setLastSync(new Date())
    } catch (error) {
      console.error('手動同步失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !versionInfo) {
    return (
      <div className={`version-display loading ${className}`}>
        <span className="version-text">載入中...</span>
      </div>
    )
  }

  if (!versionInfo) {
    return (
      <div className={`version-display error ${className}`}>
        <span className="version-text">版號載入失敗</span>
      </div>
    )
  }

  return (
    <div className={`version-display ${className}`}>
      <div className="version-main">
        <span className="version-text" data-version>
          {versionInfo.version}
        </span>
        {showDetails && (
          <div className="version-details">
            <div className="version-item">
              <strong>發布日期:</strong> {versionInfo.releaseDate}
            </div>
            <div className="version-item">
              <strong>構建號:</strong> {versionInfo.buildNumber}
            </div>
            <div className="version-item">
              <strong>環境:</strong> {versionInfo.environment}
            </div>
            {lastSync && (
              <div className="version-item">
                <strong>最後同步:</strong> {lastSync.toLocaleTimeString('zh-TW')}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="version-actions">
        <button 
          onClick={handleManualSync}
          disabled={isLoading}
          className="sync-button"
          title="手動同步版號"
        >
          {isLoading ? '🔄' : '🔄'}
        </button>
      </div>

      <style>{`
        .version-display {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .version-display.loading {
          opacity: 0.7;
        }

        .version-display.error {
          color: #dc2626;
        }

        .version-main {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .version-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
        }

        .version-details {
          font-size: 0.75rem;
          color: #9ca3af;
          line-height: 1.4;
        }

        .version-item {
          display: flex;
          gap: 0.25rem;
        }

        .version-item strong {
          font-weight: 600;
          color: #4b5563;
        }

        .version-actions {
          display: flex;
          align-items: center;
        }

        .sync-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: background-color 0.2s;
          font-size: 0.875rem;
        }

        .sync-button:hover:not(:disabled) {
          background-color: #f3f4f6;
        }

        .sync-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .version-display.error .version-text {
          color: #dc2626;
        }
      `}</style>
    </div>
  )
}

export default VersionDisplay
