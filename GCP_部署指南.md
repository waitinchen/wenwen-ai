# 文山特區客服機器人系統 - GCP部署指南

## 部署架構
**方案A：** 前端部署到Google Cloud Run，後端繼續使用Supabase

## 前置要求

### 1. Google Cloud 設定
- 擁有Google Cloud帳戶
- 已創建或選擇一個GCP專案
- 已啟用以下API服務：
  - Cloud Run API
  - Container Registry API
  - Cloud Build API

### 2. 工具安裝
```bash
# 安裝 Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# 驗證安裝
gcloud version
```

## 快速部署步驟

### 步驟1：初始化GCP環境
```bash
# 設定專案ID（替換成您的專案ID）
export PROJECT_ID=your-project-id
gcloud config set project $PROJECT_ID

# 啟用必要的API
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 步驟2：準備專案檔案
```bash
# 複製專案到本地
cp -r wenshan-chatbot ./wenshan-chatbot-gcp
cd wenshan-chatbot-gcp

# 確認關鍵檔案存在
ls -la Dockerfile nginx.conf cloudbuild.yaml
```

### 步驟3：環境變數配置
創建 `.env.production` 檔案（建議透過 Secret Manager 取得金鑰）：
```bash
# 從 Secret Manager 或其他安全存放服務讀取金鑰
export SUPABASE_URL=$(gcloud secrets versions access latest --secret=SUPABASE_URL)
export SUPABASE_ANON_KEY=$(gcloud secrets versions access latest --secret=SUPABASE_ANON_KEY)

cat > .env.production <<EOF
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
NODE_ENV=production
EOF
```

> ⚠️ 切勿在文件或版本控制中硬編碼實際金鑰，請改用 Secret Manager 或 CI/CD 的變數管理。

### 步驟4：使用Cloud Build自動部署
```bash
# 提交到Cloud Build進行自動化部署
gcloud builds submit --config cloudbuild.yaml

# 等待部署完成，通常需要3-5分鐘
```

### 步驟5：獲取部署URL
```bash
# 獲取Cloud Run服務URL
gcloud run services describe wenshan-chatbot --region=asia-east1 --format="get(status.url)"
```

## 手動部署（備用方案）

如果自動部署失敗，可以使用手動方式：

```bash
# 1. 構建Docker映像檔
docker build -t gcr.io/$PROJECT_ID/wenshan-chatbot .

# 2. 推送到Container Registry
docker push gcr.io/$PROJECT_ID/wenshan-chatbot

# 3. 部署到Cloud Run
gcloud run deploy wenshan-chatbot \
  --image gcr.io/$PROJECT_ID/wenshan-chatbot \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --port 8080
```

## 自訂域名設定（選用）

### 1. 映射自訂域名
```bash
# 替換成您的域名
export DOMAIN=your-domain.com

# 映射域名到Cloud Run服務
gcloud run domain-mappings create \
  --service wenshan-chatbot \
  --domain $DOMAIN \
  --region asia-east1
```

### 2. 更新DNS記錄
根據指令輸出的說明，在您的DNS供應商處添加CNAME記錄。

## 環境變數管理

如需更新環境變數：
```bash
gcloud run services update wenshan-chatbot \
  --region asia-east1 \
  --set-env-vars NODE_ENV=production,CUSTOM_VAR=value
```

## 監控與日誌

### 查看應用日誌
```bash
# 實時日誌
gcloud run services logs tail wenshan-chatbot --region=asia-east1

# 查看最近的日誌
gcloud run services logs read wenshan-chatbot --region=asia-east1 --limit=50
```

### 服務狀態檢查
```bash
# 檢查服務狀態
gcloud run services describe wenshan-chatbot --region=asia-east1

# 健康檢查
curl https://your-service-url/health
```

## 效能優化建議

### 1. 資源配置調整
```bash
# 根據流量調整資源
gcloud run services update wenshan-chatbot \
  --region asia-east1 \
  --memory 1Gi \
  --cpu 2 \
  --max-instances 20 \
  --concurrency 80
```

### 2. 啟用CDN（選用）
建議使用Google Cloud CDN來加速靜態資源載入。

## 成本估算

**基本配置每月估算成本：**
- Cloud Run：$0-5（根據使用量）
- Container Registry：$1-3
- Cloud Build：前120分鐘免費

**總計：每月約$1-8 USD**

## 疑難排解

### 1. 構建失敗
```bash
# 查看構建日誌
gcloud builds log --region=asia-east1
```

### 2. 服務無法訪問
```bash
# 檢查服務狀態
gcloud run services list --region=asia-east1

# 檢查IAM權限
gcloud projects get-iam-policy $PROJECT_ID
```

### 3. 環境變數問題
```bash
# 檢查當前環境變數
gcloud run services describe wenshan-chatbot --region=asia-east1 --format="export"
```

## 自動化CI/CD（進階）

如需設定自動化部署，可以：
1. 將代碼推送到GitHub
2. 設定Cloud Build觸發器
3. 每次推送時自動部署

```bash
# 建立觸發器
gcloud builds triggers create github \
  --repo-name=wenshan-chatbot \
  --repo-owner=your-github-username \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

## 安全性考慮

1. **API金鑰管理**：將敏感資訊存放在Google Secret Manager
2. **HTTPS強制**：Cloud Run預設啟用HTTPS
3. **CORS設定**：確保正確設定跨域訪問
4. **依賴更新**：定期更新依賴套件

## 聯絡支援

如有部署問題，請提供：
- 專案ID
- 錯誤日誌
- 使用的指令

---

**祝您部署成功！🚀**