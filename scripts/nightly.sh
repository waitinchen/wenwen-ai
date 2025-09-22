#!/bin/bash
# 夜間回歸總控腳本
# 執行時間: 每日 02:00 (Asia/Taipei)

echo "🌙 開始夜間回歸測試 - $(date)"
echo "================================================"

# 設定環境變數
export NODE_ENV=production
export TZ=Asia/Taipei

# 建立報告目錄
mkdir -p data/eval/report

# 1. 重新 seed 資料（商家/停車）
echo "📊 步驟 1: 重新 seed 資料..."
node scripts/seed-merchants.js
node scripts/seed-parking.js

# 2. 執行資料驗證
echo "🔍 步驟 2: 執行資料驗證..."
node scripts/data-validate.js
if [ $? -ne 0 ]; then
    echo "❌ 資料驗證失敗，停止夜間回歸"
    exit 1
fi

# 3. 執行 API 煙霧測試
echo "🔥 步驟 3: 執行 API 煙霧測試..."
node scripts/test-api-smoke.js
if [ $? -ne 0 ]; then
    echo "❌ API 煙霧測試失敗，停止夜間回歸"
    exit 1
fi

# 4. 執行完整對話驗收
echo "🧪 步驟 4: 執行完整對話驗收..."
node scripts/eval-runner.js --suite full --threshold 0.95
if [ $? -ne 0 ]; then
    echo "❌ 對話驗收失敗，停止夜間回歸"
    exit 1
fi

# 5. 產出夜間回歸報告
echo "📄 步驟 5: 產出夜間回歸報告..."
DATE=$(date +%Y-%m-%d)
REPORT_FILE="data/eval/report/nightly-${DATE}.json"

# 合併所有測試結果
cat > "$REPORT_FILE" << EOF
{
  "date": "${DATE}",
  "timestamp": "$(date -Iseconds)",
  "suite": "nightly",
  "environment": "production",
  "status": "PASS",
  "summary": {
    "data_validation": "PASS",
    "api_smoke_test": "PASS",
    "conversation_eval": "PASS"
  },
  "details": {
    "data_validation_report": "data/eval/report/data-validation.json",
    "api_smoke_report": "data/eval/report/api-smoke-test.json",
    "conversation_eval_report": "data/eval/report/test-report.json"
  }
}
EOF

echo "✅ 夜間回歸測試完成！"
echo "📄 報告已儲存至: $REPORT_FILE"

# 6. 檢查通過率並發送警報（如果失敗）
PASS_RATE=$(node -e "
const fs = require('fs');
try {
  const report = JSON.parse(fs.readFileSync('data/eval/report/test-report.json', 'utf8'));
  console.log(report.pass_rate);
} catch (e) {
  console.log('0');
}
")

if (( $(echo "$PASS_RATE < 95" | bc -l) )); then
    echo "🚨 警報: 通過率低於 95% ($PASS_RATE%)"
    echo "📧 發送警報通知..."
    # 這裡可以加入實際的警報發送邏輯
    # 例如: curl -X POST "https://hooks.slack.com/..." -d "{\"text\":\"高文文夜間回歸失敗: 通過率 $PASS_RATE%\"}"
else
    echo "🎉 夜間回歸測試全部通過！通過率: $PASS_RATE%"
fi

echo "🌙 夜間回歸測試結束 - $(date)"
