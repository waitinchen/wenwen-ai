# 前端版本號顯示 SOP

## 📋 標準作業程序

### **每次更版時的前端版本號更新流程**

#### **Step 1: 更新版本配置**
1. 修改 `src/config/version.ts`
   - 更新 `CURRENT_VERSION.version`
   - 更新 `buildNumber`
   - 添加變更日誌

#### **Step 2: 前端界面修改**
1. **刪除輸入框提醒小字**
   - 修改 `src/components/MessageInput.tsx`
   - 修改 `src/components/MobileChatInterface.tsx`
   - 將 placeholder 從 "輸入您的問題... 按 Enter 發送，Shift + Enter 換行" 改為 "輸入您的問題..."

2. **添加版本號顯示**
   - 在輸入框底部正中央添加版本號
   - 使用 `CURRENT_VERSION.version` 自動獲取當前版本
   - 樣式：`text-xs text-gray-400 font-mono`

#### **Step 3: 建置與部署**
1. 執行 `npm run build`
2. 上傳 `dist` 資料夾到正式環境
3. 驗證版本號顯示正確

### **版本號顯示位置**

#### **桌面版 (MessageInput.tsx)**
```tsx
{/* 版本號顯示 */}
<div className="flex justify-center mt-2">
  <span className="text-xs text-gray-400 font-mono">
    {CURRENT_VERSION.version}
  </span>
</div>
```

#### **手機版 (MobileChatInterface.tsx)**
```tsx
{/* 版本號顯示 */}
<div className="flex justify-center mt-2">
  <span className="text-xs text-gray-400 font-mono">
    {CURRENT_VERSION.version}
  </span>
</div>
```

### **樣式規範**

#### **版本號樣式**
- **字體大小**: `text-xs` (12px)
- **顏色**: `text-gray-400` (淺灰色)
- **字體**: `font-mono` (等寬字體)
- **位置**: 正中央對齊
- **間距**: `mt-2` (上方間距 8px)

#### **輸入框樣式**
- **Placeholder**: "輸入您的問題..."
- **移除**: 所有鍵盤快捷鍵提醒文字

### **檢查清單**

#### **更版前檢查**
- [ ] 版本配置已更新
- [ ] 變更日誌已添加
- [ ] 輸入框 placeholder 已簡化
- [ ] 版本號顯示已添加

#### **更版後檢查**
- [ ] 前端建置成功
- [ ] 版本號顯示正確
- [ ] 輸入框樣式正確
- [ ] 桌面版和手機版都正常

### **歷史記錄**

#### **WEN 1.1.4 (2025-09-23)**
- ✅ 刪除輸入框提醒小字
- ✅ 添加版本號顯示
- ✅ 建立 SOP 流程

### **注意事項**

1. **版本號自動更新**: 使用 `CURRENT_VERSION.version` 確保版本號自動同步
2. **一致性**: 桌面版和手機版都要添加版本號顯示
3. **樣式統一**: 保持版本號樣式的一致性
4. **位置固定**: 版本號始終顯示在輸入框底部正中央

---

**建立日期**: 2025-09-23
**負責人**: C謀
**適用版本**: WEN 1.1.4+
**更新頻率**: 每次更版
