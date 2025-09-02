# 📦 WenWen AI 匯出包內容清單

## 📅 匯出資訊
- **匯出日期**：2025-09-02
- **版本**：v1.0.0
- **匯出者**：MiniMax Agent
- **目標部署**：Google Cloud Platform

## 📁 檔案結構

```
wenwen-ai-export/
├── 📄 README.md                    # 完整部署指南
├── 📄 .env.example                 # 環境變數配置範本
├── 📄 database-structure.sql       # 完整資料庫結構與初始資料
├── 📄 package.json                 # Node.js 相依套件清單
├── 📄 pnpm-lock.yaml              # 套件鎖定版本
├── 📄 vite.config.ts              # Vite 建置配置
├── 📄 tailwind.config.js          # Tailwind CSS 配置
├── 📄 tsconfig.json               # TypeScript 配置
├── 📄 Dockerfile                  # Docker 容器配置
├── 📄 nginx.conf                  # Nginx 伺服器配置
├── 📄 cloudbuild.yaml             # Google Cloud Build 配置
├── 📄 GCP_部署指南.md              # GCP 部署詳細說明
├── 📄 index.html                  # 應用程式入口頁面
├── 📄 PROJECT_MANIFEST.md          # 本檔案（項目清單）
│
├── 📁 src/                        # 前端原始碼
│   ├── 📄 main.tsx                # React 應用程式進入點
│   ├── 📄 App.tsx                 # 主要應用程式元件
│   ├── 📄 index.css               # 全域樣式
│   ├── 📁 components/             # React 元件庫
│   ├── 📁 contexts/               # React Context 狀態管理
│   ├── 📁 hooks/                  # 自定義 React Hooks
│   └── 📁 lib/                    # 工具函式庫
│       ├── 📄 supabase.ts         # Supabase 客戶端配置
│       ├── 📄 api.ts              # API 呼叫函式
│       └── 📄 utils.ts            # 通用工具函式
│
├── 📁 supabase/                   # Supabase 後端函式
│   └── 📁 functions/              # Edge Functions
│       ├── 📁 claude-chat/        # Claude AI 對話服務
│       ├── 📁 admin-auth/         # 管理員認證服務
│       ├── 📁 analytics-service/  # 分析統計服務
│       ├── 📁 content-validation/ # 內容驗證服務
│       └── 📁 daily-conversation-reset/ # 每日對話重置
│
└── 📁 public/                     # 靜態資源檔案
    └── 📁 data/                   # 靜態資料檔案
```

## 🔧 技術規格

### 前端技術棧
| 技術 | 版本 | 用途 |
|------|------|------|
| React | 18.3.1 | 前端框架 |
| TypeScript | 5.6.2 | 型別系統 |
| Vite | 6.0.1 | 建置工具 |
| Tailwind CSS | 3.4.16 | CSS 框架 |
| Radix UI | 最新 | UI 元件庫 |

### 後端技術棧
| 服務 | 版本 | 用途 |
|------|------|------|
| Supabase | 最新 | 後端即服務 |
| PostgreSQL | 15+ | 資料庫 |
| Edge Functions | 最新 | 無伺服器函式 |

### 部署技術
| 工具 | 版本 | 用途 |
|------|------|------|
| Docker | 最新 | 容器化 |
| Google Cloud Run | 最新 | 容器託管 |
| Cloud Build | 最新 | CI/CD |
| Nginx | Alpine | 網頁伺服器 |

## 📊 資料庫結構摘要

### 核心資料表
- `line_users` - LINE 用戶管理
- `chat_sessions` - 聊天會話紀錄
- `conversations` - 對話歷史
- `admins` - 管理員帳戶
- `stores` - 商家資料
- `faqs` - 常見問題

### 功能擴充表
- `quick_questions` - 快速問題
- `activities` - 活動管理
- `personality_configs` - AI 人格配置
- `api_keys` - API 金鑰管理
- `content_warnings` - 內容過濾

## 🚀 部署步驟摘要

### 1. 環境準備
```bash
# 安裝 Node.js 18+
# 安裝 pnpm
# 安裝 Google Cloud SDK
```

### 2. 專案設置
```bash
pnpm install
cp .env.example .env.local
# 編輯環境變數
```

### 3. 資料庫初始化
```sql
-- 在 Supabase 執行 database-structure.sql
```

### 4. 部署到 GCP
```bash
gcloud builds submit --config cloudbuild.yaml
```

## 🔐 安全注意事項

### 必要配置
- ✅ 設置強密碼的管理員帳戶
- ✅ 配置 Supabase RLS 政策
- ✅ 啟用 HTTPS 和安全標頭
- ✅ 使用 GCP Secret Manager 管理敏感資訊

### API 金鑰管理
- `CLAUDE_API_KEY` - Claude AI 服務金鑰
- `SUPABASE_ANON_KEY` - Supabase 匿名金鑰
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase 服務金鑰

## 📞 支援資訊

### 測試環境
- **URL**: https://wenwentest.dolphinlife.cc
- **用途**: 功能測試與驗證

### 正式環境
- **URL**: https://wenwen.dolphinlife.cc
- **用途**: 生產環境服務

### 聯絡資訊
- **部署負責人**: 芭樂
- **技術支援**: MiniMax Agent
- **緊急聯絡**: 系統管理員

## ✅ 部署檢查清單

### 部署前檢查
- [ ] 環境變數配置完成
- [ ] Supabase 專案建立完成
- [ ] GCP 專案和 API 啟用
- [ ] 網域 DNS 設定準備

### 部署後驗證
- [ ] 網站可正常訪問
- [ ] 聊天機器人功能正常
- [ ] 管理後台可登入
- [ ] 資料庫連接正常
- [ ] SSL 憑證有效

## 📝 版本紀錄

| 版本 | 日期 | 變更內容 |
|------|------|----------|
| v1.0.0 | 2025-09-02 | 初始匯出版本，包含完整功能 |

---

**⚠️ 重要提醒：請妥善保管所有 API 金鑰和敏感資訊，切勿公開或提交到版本控制系統。**

**🎯 部署完成後，建議進行完整的功能測試以確保系統正常運作。**
