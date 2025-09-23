# 🧠 高文文長記憶系統

## 📋 系統概述

高文文長記憶系統為 AI 助理提供持續的對話記憶能力，讓高文文能夠記住用戶的偏好、歷史對話和重要資訊，提供更個性化和一致的服務體驗。

## 🏗️ 系統架構

### 核心組件

1. **MemoryItem 資料模型** - 存儲記憶資料的 SQLite 資料庫結構
2. **MemoryService** - 核心記憶處理服務（CRUD、加密、檢索）
3. **MemoryProcessor** - 記憶處理器（摘要抽取、去重、存儲）
4. **ChatInterface 整合** - 聊天介面中的記憶檢索與注入
5. **管理後台** - 記憶管理、統計、匯出功能

### 資料流程

```
用戶訊息 → 記憶檢索 → 上下文注入 → AI 回應 → 記憶處理 → 存儲
```

## 🗄️ 資料庫結構

### MemoryItem 模型

```typescript
model MemoryItem {
  id          String   @id @default(cuid())
  userId      String   @map("user_id")           // 用戶ID
  sessionId   String?  @map("session_id")        // 會話ID
  content     String                              // 記憶內容（已加密）
  summary     String?                             // 摘要（已加密）
  intent      String?                             // 意圖分類
  keywords    String?                             // 關鍵字（JSON）
  meta        String?                             // 元資料（JSON）
  encrypted   Boolean  @default(true)            // 是否加密
  expiresAt   DateTime? @map("expires_at")       // 到期時間
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  @@map("memory_items")
  @@index([userId])
  @@index([sessionId])
  @@index([expiresAt])
}
```

## 🔧 安裝與設定

### 1. 安裝依賴

```bash
npm install prisma @prisma/client sqlite3 crypto-js @types/crypto-js
```

### 2. 初始化資料庫

```bash
npx prisma db push
```

### 3. 生成 Prisma Client

```bash
npx prisma generate
```

### 4. 設定環境變數

```env
MEMORY_ENCRYPTION_KEY=your-secure-encryption-key
```

## 📁 檔案結構

```
src/
├── lib/
│   ├── memoryService.ts      # 核心記憶服務
│   ├── memoryProcessor.ts    # 記憶處理器
│   └── memoryApi.ts          # 記憶管理 API
├── components/
│   ├── ChatInterface.tsx     # 聊天介面（已整合記憶功能）
│   └── admin/
│       └── MemoryManagement.tsx  # 記憶管理後台
prisma/
├── schema.prisma             # Prisma 資料庫結構
data/
└── memory/
    └── wenwen-memory.db      # SQLite 資料庫檔案
scripts/
├── init-memory-db.js         # 資料庫初始化腳本
└── test-memory-system.js     # 系統測試腳本
```

## 🚀 使用方式

### 在聊天中自動使用

記憶系統已整合到 `ChatInterface` 中，會自動：

1. **檢索相關記憶** - 根據用戶訊息檢索相關歷史記憶
2. **注入上下文** - 將記憶注入到 AI 提示中
3. **存儲新記憶** - 處理對話並存儲重要資訊

### 程式化使用

```typescript
import { createMemoryProcessor } from '@/lib/memoryProcessor';

// 創建記憶處理器
const processor = createMemoryProcessor('user-123', 'session-456');

// 處理並存儲記憶
await processor.processAndStore(
  '用戶訊息',
  'AI 回應'
);

// 檢索相關記憶
const context = await processor.retrieveRelevantMemories('當前訊息');

// 獲取統計資訊
const stats = await processor.getMemoryStats();
```

## 🛡️ 安全功能

### 資料加密

- 使用 AES 加密存儲敏感記憶內容
- 支援自定義加密金鑰
- 摘要和內容分別加密

### 到期清理

- 根據意圖設定不同的到期時間
- 自動清理過期記憶
- 支援永不過期記憶（如感謝訊息）

### 意圖分類

- `recommendation` - 推薦類（7天過期）
- `question` - 問題類（30天過期）
- `gratitude` - 感謝類（永不過期）
- `booking` - 預約類（14天過期）
- `general` - 一般類（14天過期）

## 📊 管理後台功能

### 記憶管理

- 查看所有記憶列表
- 搜尋和過濾記憶
- 批量刪除記憶
- 匯出記憶資料

### 統計分析

- 記憶總數統計
- 意圖分布分析
- 用戶活躍度分析
- 時間分布統計

### 系統維護

- 清理過期記憶
- 資料庫備份
- 效能監控

## 🔍 監控與除錯

### 日誌記錄

系統會在控制台輸出詳細的記憶處理日誌：

```
記憶處理完成: {
  userId: "user-123",
  sessionId: "session-456", 
  intent: "recommendation",
  summary: "詢問餐廳推薦..."
}
```

### 測試腳本

```bash
node scripts/test-memory-system.js
```

## 🚨 注意事項

### 資料存儲

- 資料存儲在 `data/memory/` 目錄
- 不進入版本控制
- 定期備份資料庫檔案

### 效能考量

- 記憶檢索限制為最近 10 筆
- 自動去重避免重複存儲
- 異步處理不阻擋對話流程

### 隱私保護

- 支援用戶記憶匯出
- 提供記憶刪除功能
- 加密存儲敏感資訊

## 🔮 未來擴展

### 計劃功能

1. **智能摘要** - 使用 AI 生成更精確的摘要
2. **情感分析** - 分析用戶情感狀態
3. **個性化推薦** - 基於記憶的個性化推薦
4. **跨平台同步** - 支援多平台記憶同步
5. **記憶分享** - 安全的記憶分享功能

### 技術改進

1. **向量檢索** - 使用向量資料庫提升檢索精度
2. **機器學習** - 智能記憶重要性評分
3. **分散式存儲** - 支援大規模記憶存儲
4. **實時同步** - 多實例間記憶同步

## 📞 技術支援

如有問題或建議，請聯繫開發團隊或提交 Issue。

---

**高文文長記憶系統 v1.0** - 讓 AI 助理記住每一次對話 💝
