# 🎯 高文文調試衝刺交付標準檢查清單

## 📋 交付標準

### ✅ 後台會話列表與詳情
- [ ] 顯示暱稱/頭像
- [ ] 連續兩句同一 session
- [ ] 用戶元資料正確解析

### ✅ 特約商家功能
- [ ] 後台打勾「特約商家」能保存
- [ ] API GET /merchants/:id 回 true
- [ ] 前台推薦優先但非唯一

### ✅ 對話優化
- [ ] 移除硬推語句
- [ ] 自介只在新會話
- [ ] 一般「美食推薦」回覆列出最多 3 家
- [ ] 包含「特約」標籤

### ✅ 三個驗收腳本
- [ ] `npm run eval:quick` - Greeting 不重覆、Intent 正確
- [ ] `npm run eval:partner` - 特約生效且列出多家
- [ ] `npm run eval:parking` - 停車查詢 OK

## 🚀 執行步驟

### 1. 資料庫修復
```sql
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS is_partner_store BOOLEAN NOT NULL DEFAULT false;
```

### 2. 部署 Edge Function
- 複製 `scripts/complete-edge-function-code.ts` 內容
- 貼到 Supabase Dashboard
- 點擊「部署更新」

### 3. 執行驗收測試
```bash
npm run eval:quick
npm run eval:partner
npm run eval:parking
```

### 4. 檢查後台功能
- 登入後台管理系統
- 測試商家管理（特約商家勾選保存）
- 檢查對話歷史（顯示暱稱頭像）

## 📊 驗收結果格式

### 測試輸出範例
```
🚀 快速驗收測試：Greeting 不重覆、Intent 正確
✅ 測試 1: 初次問候測試
✅ 回應: 哈囉～我是高文文，在鳳山陪你！今天要查美食、交通還是停車呢？
✅ 正確沒有重複自介
✅ Intent 識別正確
📊 快速驗收結果: 通過: 4/4
🎉 快速驗收 PASS！Greeting 不重覆、Intent 正確
```

### 後台截圖要求
1. **商家管理頁面**：顯示特約商家勾選框，能正確保存
2. **對話歷史列表**：顯示用戶暱稱和頭像
3. **對話詳情頁面**：顯示完整對話記錄，同一 session 連續對話

## 🎯 完成標準

### 必須全部通過
- ✅ 三個驗收腳本全部 PASS
- ✅ 後台功能正常運作
- ✅ 特約商家功能完整
- ✅ 對話體驗優化

### 交付文件
1. 測試輸出截圖
2. 後台功能截圖
3. 修復說明文件
4. 部署確認記錄

---

**高文文調試衝刺 v1.0** - 專注聊天與商家推薦功能 🚀
