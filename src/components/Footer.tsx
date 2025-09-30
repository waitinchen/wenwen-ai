/**
 * 頁腳組件
 * 包含自動同步的版號顯示
 */

import React from 'react'
import VersionDisplay from './VersionDisplay'

interface FooterProps {
  className?: string
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`footer ${className}`}>
      <div className="footer-content">
        <div className="footer-info">
          <p>&copy; 2025 文山特區智能助手. All rights reserved.</p>
        </div>
        
        <div className="footer-version">
          <VersionDisplay 
            showDetails={false}
            autoSync={true}
            className="footer-version-display"
          />
        </div>
      </div>

      <style>{`
        .footer {
          background-color: #f9fafb;
          border-top: 1px solid #e5e7eb;
          padding: 1rem 0;
          margin-top: auto;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-info {
          flex: 1;
        }

        .footer-info p {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .footer-version {
          flex-shrink: 0;
        }

        .footer-version-display {
          font-size: 0.875rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .footer-content {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  )
}

export default Footer
