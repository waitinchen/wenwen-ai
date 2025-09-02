# 🤖 文山特區 WenWen AI 客服機器人系統

## 📋 項目概述

WenWen AI 是專為高雄市文山特區商圈設計的智能客服機器人系統，結合了 React、TypeScript、Vite 前端技術與 Supabase 後端服務，提供全面的商圈資訊服務和客戶互動體驗。

### 🏗️ 技術架構
- **前端**：React 18 + TypeScript + Vite + Tailwind CSS
- **後端**：Supabase (PostgreSQL + Edge Functions)
- **UI 元件**：Radix UI + Shadcn/ui
- **狀態管理**：React Hooks + Context API
- **建置工具**：Vite + pnpm
- **部署平台**：Google Cloud Run

---

## 🚀 快速開始

### 📋 前置條件

#### 必要工具
- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0（推薦）或 npm >= 9.0.0
- **Git** 版本控制
- **Google Cloud SDK**（用於 GCP 部署）

#### 必要服務帳號
- **Supabase 帳號**：後端資料庫和 API
- **Google Cloud Platform 帳號**：雲端部署
- **Claude API 帳號**：AI 對話服務
- **LINE Developers 帳號**：LINE 整合（可選）

### 💾 安裝與設置

#### 1️⃣ 克隆專案
```bash
# 解壓縮專案檔案或從 Git 克隆
unzip wenwen-ai-app.zip
cd wenwen-ai-app

# 或從 GitHub 克隆
git clone https://github.com/your-repo/wenwen-ai.git
cd wenwen-ai
```

#### 2️⃣ 安裝相依套件
```bash
# 使用 pnpm（推薦）
pnpm install

# 或使用 npm
npm install
```

#### 3️⃣ 環境變數配置
```bash
# 複製環境變數範本
cp .env.example .env.local

# 編輯環境變數檔案
vim .env.local
# 或使用其他編輯器
nano .env.local
```

#### 必要環境變數設置：
```bash
# Supabase 配置
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Claude API 金鑰
CLAUDE_API_KEY=sk-ant-api03-your-api-key-here

# 應用程式環境
NODE_ENV=development
```

#### 4️⃣ 設置 Supabase 資料庫
```bash
# 連接到您的 Supabase 專案
# 執行資料庫結構建立 SQL
# 在 Supabase Dashboard 的 SQL Editor 中執行 database-structure.sql
```

---

## 🔧 開發環境運行

### 本地開發伺服器
```bash
# 啟動開發伺服器
pnpm dev

# 伺服器將運行在 http://localhost:5173
```

### 建置專案
```bash
# 開發版本建置
pnpm build

# 生產版本建置
pnpm run build:prod
```

### 程式碼檢查
```bash
# ESLint 檢查
pnpm lint

# 型別檢查
pnpm type-check
```

---

## ☁️ GCP 部署指南

### 🔧 GCP 環境準備

#### 1️⃣ 安裝 Google Cloud SDK
```bash
# macOS
brew install google-cloud-sdk

# Ubuntu/Debian
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Windows
# 下載並安裝 Google Cloud SDK for Windows
```

#### 2️⃣ 初始化 GCP 環境
```bash
# 登入 Google 帳號
gcloud auth login

# 初始化配置
gcloud init

# 設定專案 ID（替換為您的專案 ID）
export PROJECT_ID=your-gcp-project-id
gcloud config set project $PROJECT_ID
```

#### 3️⃣ 啟用必要的 GCP API 服務
```bash
# 啟用 Cloud Run API
gcloud services enable run.googleapis.com

# 啟用 Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# 啟用 Container Registry API
gcloud services enable containerregistry.googleapis.com

# 驗證 API 啟用狀態
gcloud services list --enabled
```

### 🚀 自動化部署（推薦）

#### 使用 Cloud Build 自動部署
```bash
# 確認部署配置檔案
cat cloudbuild.yaml

# 執行自動化建置和部署
gcloud builds submit --config cloudbuild.yaml

# 監控部署進度
gcloud builds log --stream
```

#### 獲取部署結果
```bash
# 獲取 Cloud Run 服務 URL
gcloud run services describe wenshan-chatbot \
    --region=asia-east1 \
    --format="get(status.url)"
```

### 🔧 手動部署（備用方案）

#### 1️⃣ 建置 Docker 映像檔
```bash
# 建置映像檔
docker build -t gcr.io/$PROJECT_ID/wenshan-chatbot .

# 推送到 Google Container Registry
docker push gcr.io/$PROJECT_ID/wenshan-chatbot
```

#### 2️⃣ 部署到 Cloud Run
```bash
# 部署服務
gcloud run deploy wenshan-chatbot \
    --image gcr.io/$PROJECT_ID/wenshan-chatbot \
    --platform managed \
    --region asia-east1 \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --port 8080 \
    --max-instances 10 \
    --timeout 300

# 獲取服務 URL
gcloud run services describe wenshan-chatbot \
    --region=asia-east1 \
    --format="get(status.url)"
```

### 🌐 自訂網域設置

#### 映射網域到 Cloud Run
```bash
# 映射測試網域
gcloud run domain-mappings create \
    --service wenshan-chatbot \
    --domain wenwentest.dolphinlife.cc \
    --region asia-east1

# 映射正式網域
gcloud run domain-mappings create \
    --service wenshan-chatbot \
    --domain wenwen.dolphinlife.cc \
    --region asia-east1
```

#### DNS 設置
```bash
# 獲取 DNS 記錄設置資訊
gcloud run domain-mappings describe wenwentest.dolphinlife.cc \
    --region=asia-east1

# 在您的 DNS 提供商（如 GoDaddy）設置 CNAME 記錄：
# 類型: CNAME
# 主機: wenwentest (或 wenwen)
# 值: ghs.googlehosted.com
```

---

## 🗄️ 資料庫設置

### Supabase 資料庫初始化

#### 1️⃣ 創建 Supabase 專案
1. 訪問 [Supabase Dashboard](https://supabase.com/dashboard)
2. 創建新專案
3. 等待資料庫初始化完成
4. 獲取專案 URL 和 API 金鑰

#### 2️⃣ 執行資料庫結構 SQL
```sql
-- 在 Supabase SQL Editor 中執行
-- 檔案: database-structure.sql
-- 此檔案包含所有必要的表結構、索引和基礎資料
```

#### 3️⃣ 設置 Row Level Security (RLS)
```sql
-- 啟用必要表的 RLS 政策
-- 詳細政策設定請參考 database-structure.sql
```

#### 4️⃣ 創建測試帳號
```sql
-- 管理員測試帳號（密碼：admin123）
INSERT INTO admins (username, email, password_hash, role) VALUES 
('admin', 'admin@wenshan.ai', '$2a$10$...', 'super_admin');

-- LINE 測試用戶
INSERT INTO line_users (line_uid, line_display_name) VALUES 
('test_user_001', '測試用戶');
```

---

## 🔐 安全性配置

### 環境變數安全管理

#### 使用 GCP Secret Manager（推薦）
```bash
# 創建 secret
gcloud secrets create claude-api-key --data-file=-
echo "sk-ant-api03-your-key" | gcloud secrets create claude-api-key --data-file=-

# 授權 Cloud Run 訪問 secret
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

#### 更新 Cloud Run 環境變數
```bash
gcloud run services update wenshan-chatbot \
    --update-env-vars="CLAUDE_API_KEY=sk-ant-api03-your-key" \
    --region=asia-east1
```

### HTTPS 和 CORS 設置
```nginx
# nginx.conf 已包含安全標頭設置
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000";
```

---

## 📊 監控與維護

### Cloud Run 監控
```bash
# 查看服務狀態
gcloud run services describe wenshan-chatbot --region=asia-east1

# 查看日誌
gcloud logging read "resource.type=cloud_run_revision" --limit=50

# 監控指標
gcloud monitoring metrics list --filter="metric.type:run.googleapis.com"
```

### 效能優化建議

#### 1️⃣ 設置 CDN
```bash
# 使用 Cloud CDN 加速靜態資源
gcloud compute backend-services create wenshan-backend \
    --global \
    --protocol=HTTP
```

#### 2️⃣ 資料庫優化
- 定期檢查 Supabase 資料庫效能
- 監控 API 請求量和回應時間
- 設置適當的快取策略

#### 3️⃣ 成本控制
```bash
# 設置預算警報
gcloud billing budgets create \
    --billing-account=BILLING_ACCOUNT_ID \
    --display-name="WenWen AI Budget" \
    --budget-amount=100USD
```

---

## 🛠️ 故障排除

### 常見問題與解決方案

#### 1️⃣ 部署失敗
```bash
# 檢查建置日誌
gcloud builds log --stream

# 檢查 Docker 建置
docker build -t test-image .
```

#### 2️⃣ 環境變數問題
```bash
# 驗證環境變數
gcloud run services describe wenshan-chatbot \
    --region=asia-east1 \
    --format="get(spec.template.spec.template.spec.containers[0].env[].name)"
```

#### 3️⃣ 資料庫連接問題
- 檢查 Supabase URL 和 API 金鑰
- 確認 RLS 政策設置正確
- 驗證網路連接

#### 4️⃣ SSL/TLS 憑證問題
```bash
# 檢查憑證狀態
gcloud run domain-mappings describe wenwen.dolphinlife.cc \
    --region=asia-east1
```

---

## 📈 效能指標

### 建議的監控指標

#### 應用程式指標
- **回應時間**：< 2 秒
- **可用性**：> 99.9%
- **錯誤率**：< 0.1%
- **並發用戶**：支援 1000+ 同時連線

#### 資料庫指標
- **查詢效能**：平均 < 100ms
- **連線數**：< 資料庫限制的 80%
- **儲存空間**：定期監控增長趨勢

---

## 🤝 支援與維護

### 聯絡資訊
- **技術支援**：tech-support@wenshan.ai
- **專案維護**：MiniMax Agent
- **緊急聯絡**：emergency@wenshan.ai

### 版本更新
```bash
# 檢查版本
git describe --tags

# 更新到最新版本
git pull origin main
pnpm install
pnpm build
```

### 備份策略
- **資料庫**：Supabase 自動備份 + 手動匯出
- **程式碼**：Git 版本控制 + GitHub 備份
- **配置檔案**：加密儲存於 Secret Manager

---

## 📚 相關資源

### 文檔連結
- [Supabase 官方文檔](https://supabase.com/docs)
- [Google Cloud Run 文檔](https://cloud.google.com/run/docs)
- [React 18 官方文檔](https://reactjs.org/docs)
- [Vite 構建工具文檔](https://vitejs.dev/guide/)

### 開發工具
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Google Cloud Console](https://console.cloud.google.com)
- [GitHub Repository](https://github.com/your-repo/wenwen-ai)

---

## 📄 授權條款

本專案採用 MIT 授權條款。詳細資訊請參閱 LICENSE 檔案。

---

## 🙏 致謝

感謝所有為文山特區 WenWen AI 客服機器人系統開發做出貢獻的開發者和測試人員。

---

**🎯 部署完成後，請訪問以下網址進行測試：**
- **測試環境**：https://wenwentest.dolphinlife.cc
- **正式環境**：https://wenwen.dolphinlife.cc

祝您部署順利！ 🚀✨
