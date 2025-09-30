-- 創建 recommendation_logs 表
-- 用於記錄推薦系統的詳細日誌

CREATE TABLE IF NOT EXISTS recommendation_logs (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  intent TEXT NOT NULL,
  recommended_stores JSONB,
  recommendation_logic JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引以提升查詢性能
CREATE INDEX IF NOT EXISTS idx_recommendation_logs_session_id ON recommendation_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_logs_intent ON recommendation_logs(intent);
CREATE INDEX IF NOT EXISTS idx_recommendation_logs_created_at ON recommendation_logs(created_at);

-- 添加註釋
COMMENT ON TABLE recommendation_logs IS '推薦系統詳細日誌記錄表';
COMMENT ON COLUMN recommendation_logs.session_id IS '會話ID';
COMMENT ON COLUMN recommendation_logs.intent IS '用戶意圖';
COMMENT ON COLUMN recommendation_logs.recommended_stores IS '推薦的商家清單(JSON格式)';
COMMENT ON COLUMN recommendation_logs.recommendation_logic IS '推薦邏輯和處理過程(JSON格式)';
COMMENT ON COLUMN recommendation_logs.created_at IS '記錄創建時間';