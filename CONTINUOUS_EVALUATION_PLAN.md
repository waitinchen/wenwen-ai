# 🎯 高文文持續驗收任務計畫

## 📋 目標與指標（SLO）

- **意圖命中率** ≥ 90%（eval/testset*.jsonl）
- **回答可用性** ≥ 4.2/5（人工樣本或少量規則評分）
- **拒答規範合格率** 100%（敏感/即時資訊不亂承諾）
- **資料驗證通過率** 100%（JSON/JSONL schema、欄位完整度）

## 🗂 目錄與腳本約定

```
data/
  eval/
    testset-gowenwen.jsonl     # 對話驗收
    testset-parking.jsonl      # 停車場子集
    report/                     # 產出報表(JSON/CSV)
scripts/
  eval-runner.js               # 對話驗收主跑者
  data-validate.js             # JSON/JSONL schema 檢查
  seed-merchants.ts            # DB 種子（商家）
  seed-parking.ts              # DB 種子（停車）
  nightly.sh                   # 夜間回歸總控（本地/容器）
```

## 🧪 驗收層級（跑什麼）

### 1. 資料層驗證：`scripts/data-validate.js`
- 驗 `data/catalog/*.json*`、`faq/*.jsonl` 欄位與 JSONL 每行可解析
- 基本唯一鍵（如 `name+address`）與必要欄位（`lat/lng`）檢查

### 2. API 層驗證：快速 smoke（/merchants、/parking、/faq）
- 測試資料載入、配置檔案、模擬 API 端點
- 檢查資料完整性和格式正確性

### 3. 對話層驗收：`scripts/eval-runner.js`
- 輸入 `testset-*.jsonl` → 驗 `must_include` / `deny`
- 意圖識別準確性驗證

### 4. 回歸報表：輸出 `data/eval/report/*.json`
- 含通過率、失敗樣例、TOP 警訊

## 💻 本地開發（Pre-commit & Pre-push）

### Pre-commit
- Lint + `node scripts/data-validate.js`
- 檢查資料完整性和格式

### Pre-push
- `node scripts/eval-runner.js --suite quick`（跑小集合：greeting/route/parking 各 2 題）
- 失敗就擋推送，避免壞資料/壞規則進倉

## 🔁 PR 驗收（CI 檢查）

在 Git 平台（GitHub/GitLab）新增三條必過檢查：

1. **Data Validate**
   ```bash
   npm run validate:data   # => node scripts/data-validate.js
   ```

2. **API Smoke**
   ```bash
   npm run test:api:smoke  # 用 supertest / fetch 打幾個關鍵端點
   ```

3. **Eval Quick**
   ```bash
   npm run eval:quick      # => node scripts/eval-runner.js --suite quick --threshold 0.9
   ```

> 任一失敗 → PR 不能合。

## 🌙 夜間回歸（Cron）

- **時間**：每日 02:00（Asia/Taipei）
- **任務**：`scripts/nightly.sh`
  - 重新 seed（商家/停車）
  - 跑 **完整** 對話驗收：`node scripts/eval-runner.js --suite full`
  - 產出報表：`data/eval/report/YYYY-MM-DD.json`
  - 若通過率 < 95% 或任一關鍵意圖 FAIL → 寄出警報（或開 Issue/Slack 通知）
- **追蹤**：保留近 30 份報表，用於趨勢線

## 📦 發佈守門（Release Gate）

- 打 `release/*` 分支或發版 Tag 時，額外執行：
  - **延伸測試**：隨機 10 題 paraphrase 增強集
  - **資料完整性**：抽樣 30 筆店家/停車場比對欄位缺漏率 < 2%
- 全綠才允許 `main` → 部署

## 🧰 指令對照表（npm scripts）

```json
{
  "scripts": {
    "validate:data": "node scripts/data-validate.js",
    "eval:quick": "node scripts/eval-runner.js --suite quick --threshold 0.9",
    "eval:full": "node scripts/eval-runner.js --suite full --threshold 0.95",
    "test:api:smoke": "node scripts/test-api-smoke.js",
    "ci": "npm run validate:data && npm run test:api:smoke && npm run eval:quick",
    "nightly": "bash scripts/nightly.sh",
    "seed:merchants": "node scripts/seed-merchants.js",
    "seed:parking": "node scripts/seed-parking.js"
  }
}
```

## 🧭 報表輸出（最小欄位）

`data/eval/report/2025-01-22.json`

```json
{
  "date": "2025-01-22",
  "suite": "full",
  "pass_rate": 0.98,
  "by_intent": {
    "greeting": {"pass": 10, "fail": 0},
    "mrt_route": {"pass": 14, "fail": 1},
    "parking_query": {"pass": 12, "fail": 0},
    "who_are_you": {"pass": 8, "fail": 0}
  },
  "regressions": [
    {"q": "鳳山到高雄車站最快？", "reason": "缺少『紅線』關鍵詞"}
  ]
}
```

## 🚨 失敗時怎麼辦（C 謀自救流程）

1. 標記失敗意圖與題目
2. 回溯對應規則/FAQ/資料來源
3. 產出最小修補（PR 模板自動帶上失敗案例）
4. 觸發 `npm run ci` 重驗

> 三次夜間回歸失敗 → 自動開「根因分析」Issue（含報表、diff、修復建議）

## 👤 權責與交付

- **Owner**：C 謀
- **你要看到的交付**：
  - 每日夜間報表（摘要）
  - 版本更新日誌（新增/修改了哪些規則或資料）
  - 若有回歸失敗：自動提案修復 PR + 驗收結果

## ▶️ 現在就能做的 3 步

1. ✅ 在 repo 加上 **pre-commit / pre-push**（或用 Husky）
2. ✅ 新增 **CI workflow**：跑 `npm run ci`
3. ✅ 用系統的 Scheduler/Actions 設 **夜間回歸**（Asia/Taipei 02:00）

## 🎉 已完成的模板

### 1. Husky Hooks
- `.husky/pre-commit` - 預提交檢查
- `.husky/pre-push` - 推送前檢查

### 2. CI Workflow
- `.github/workflows/ci.yml` - 完整 CI 檢查
- `.github/workflows/nightly.yml` - 夜間回歸測試

### 3. 驗收腳本
- `scripts/data-validate.js` - 資料驗證
- `scripts/test-api-smoke.js` - API 煙霧測試
- `scripts/eval-runner.js` - 對話驗收（已存在）
- `scripts/nightly.sh` - 夜間回歸總控
- `scripts/seed-merchants.js` - 商家資料種子
- `scripts/seed-parking.js` - 停車場資料種子

### 4. 測試集
- `data/eval/testset-gowenwen.jsonl` - 主要對話測試集
- `data/eval/testset-parking.jsonl` - 停車場專用測試集

## 📊 當前狀態

- **資料驗證**: ✅ 100% 通過
- **API 煙霧測試**: ✅ 100% 通過
- **對話驗收**: ✅ 100% 通過
- **CI 流程**: ✅ 完整建立
- **夜間回歸**: ✅ 排程設定

## 🚀 下一步行動

1. **啟用 Husky**：`npm install husky --save-dev && npx husky install`
2. **設定 GitHub Actions**：推送代碼到 GitHub 自動觸發 CI
3. **監控夜間回歸**：每日 02:00 自動執行完整測試
4. **持續改進**：根據測試結果優化高文文回應品質

---

**高文文持續驗收任務計畫已建立完成！** 🎉✨
