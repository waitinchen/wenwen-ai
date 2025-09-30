-- 允許清單架構 - 資料庫結構升級
-- 從黑名單轉向：允許清單（Allowlist）+ 資格規則（Eligibility）+ 贊助等級（Sponsorship Tier）+ 證據優先（Evidence-required）

-- ===== 1. 創建審核狀態枚舉 =====
DO $$ BEGIN
  CREATE TYPE approval_status AS ENUM ('approved', 'pending', 'suspended', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ===== 2. 升級 stores 表結構 =====
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS approval approval_status NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS sponsorship_tier smallint NOT NULL DEFAULT 0,  -- 0:一般, 1:特約, 2:主推/贊助
  ADD COLUMN IF NOT EXISTS store_code text UNIQUE, -- 例如 'kentucky'
  ADD COLUMN IF NOT EXISTS evidence_level text DEFAULT 'verified', -- verified, unverified, pending_verification
  ADD COLUMN IF NOT EXISTS eligibility_rules jsonb DEFAULT '{}', -- 資格規則配置
  ADD COLUMN IF NOT EXISTS audit_notes text, -- 審核備註
  ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS approved_by text; -- 審核人員

-- ===== 3. 創建索引優化查詢 =====
CREATE INDEX IF NOT EXISTS idx_stores_approval ON stores (approval);
CREATE INDEX IF NOT EXISTS idx_stores_tier ON stores (sponsorship_tier DESC);
CREATE INDEX IF NOT EXISTS idx_stores_approval_tier ON stores (approval, sponsorship_tier DESC);
CREATE INDEX IF NOT EXISTS idx_stores_store_code ON stores (store_code);
CREATE INDEX IF NOT EXISTS idx_stores_evidence_level ON stores (evidence_level);

-- ===== 4. 創建審核歷史表 =====
CREATE TABLE IF NOT EXISTS store_approval_history (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  previous_status approval_status,
  new_status approval_status,
  previous_tier smallint,
  new_tier smallint,
  reason text,
  notes text,
  changed_by text NOT NULL,
  changed_at timestamp with time zone DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approval_history_store_id ON store_approval_history(store_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_changed_at ON store_approval_history(changed_at);

-- ===== 5. 創建資格規則配置表 =====
CREATE TABLE IF NOT EXISTS eligibility_rules (
  id SERIAL PRIMARY KEY,
  rule_name text NOT NULL UNIQUE,
  rule_type text NOT NULL, -- 'category', 'location', 'sponsorship', 'evidence'
  rule_config jsonb NOT NULL,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

-- ===== 6. 插入預設資格規則 =====
INSERT INTO eligibility_rules (rule_name, rule_type, rule_config, priority) VALUES
('approved_status_required', 'approval', '{"required_status": "approved"}', 100),
('evidence_verification', 'evidence', '{"min_evidence_level": "verified"}', 90),
('sponsorship_tier_priority', 'sponsorship', '{"tier_weights": [1, 2, 3]}', 80),
('kentucky_english_priority', 'special', '{"store_code": "kentucky", "auto_include": true}', 95)
ON CONFLICT (rule_name) DO NOTHING;

-- ===== 7. 更新現有資料 =====
-- 確保所有現有商家都有審核狀態
UPDATE stores SET approval = 'approved' WHERE approval IS NULL;

-- 為肯塔基美語設置特殊配置
UPDATE stores SET 
  store_code = 'kentucky',
  sponsorship_tier = 2,
  evidence_level = 'verified'
WHERE store_name LIKE '%肯塔基美語%';

-- 為特約商家設置贊助等級
UPDATE stores SET sponsorship_tier = 1 WHERE is_partner_store = true;

-- ===== 8. 創建審核工作流程表 =====
CREATE TABLE IF NOT EXISTS approval_workflows (
  id SERIAL PRIMARY KEY,
  workflow_name text NOT NULL,
  workflow_config jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT NOW()
);

-- 插入預設工作流程
INSERT INTO approval_workflows (workflow_name, workflow_config) VALUES
('standard_approval', '{
  "steps": [
    {"name": "evidence_check", "required": true, "auto_approve": false},
    {"name": "content_review", "required": true, "auto_approve": false},
    {"name": "final_approval", "required": true, "auto_approve": false}
  ],
  "timeout_hours": 72
}'),
('sponsor_approval', '{
  "steps": [
    {"name": "evidence_check", "required": true, "auto_approve": false},
    {"name": "sponsorship_verification", "required": true, "auto_approve": false},
    {"name": "executive_approval", "required": true, "auto_approve": false}
  ],
  "timeout_hours": 24
}')
ON CONFLICT (workflow_name) DO NOTHING;

-- ===== 9. 創建推薦日誌表（用於分析） =====
CREATE TABLE IF NOT EXISTS recommendation_logs (
  id SERIAL PRIMARY KEY,
  session_id text NOT NULL,
  user_intent text NOT NULL,
  recommended_stores jsonb NOT NULL,
  recommendation_logic jsonb,
  timestamp timestamp with time zone DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendation_logs_session_id ON recommendation_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_logs_timestamp ON recommendation_logs(timestamp);

-- ===== 10. 創建證據驗證表 =====
CREATE TABLE IF NOT EXISTS evidence_verification (
  id SERIAL PRIMARY KEY,
  store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  evidence_type text NOT NULL, -- 'address', 'phone', 'business_hours', 'license'
  evidence_value text NOT NULL,
  verification_status text DEFAULT 'pending', -- 'verified', 'pending', 'failed'
  verification_method text, -- 'manual', 'api', 'document'
  verified_by text,
  verified_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_verification_store_id ON evidence_verification(store_id);
CREATE INDEX IF NOT EXISTS idx_evidence_verification_status ON evidence_verification(verification_status);

-- ===== 11. 創建視圖：合格商家查詢 =====
CREATE OR REPLACE VIEW eligible_stores AS
SELECT 
  s.*,
  CASE 
    WHEN s.sponsorship_tier = 2 THEN 3
    WHEN s.sponsorship_tier = 1 THEN 2
    ELSE 1
  END as priority_score,
  CASE 
    WHEN s.store_code = 'kentucky' THEN 1
    ELSE 0
  END as is_kentucky
FROM stores s
WHERE s.approval = 'approved'
  AND s.evidence_level IN ('verified', 'pending_verification');

-- ===== 12. 創建函數：獲取推薦商家 =====
CREATE OR REPLACE FUNCTION get_recommended_stores(
  p_intent text DEFAULT 'general',
  p_limit integer DEFAULT 3
)
RETURNS TABLE (
  id INTEGER,
  store_name text,
  category text,
  address text,
  phone text,
  business_hours text,
  is_partner_store boolean,
  sponsorship_tier smallint,
  store_code text,
  priority_score integer,
  is_kentucky integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.store_name,
    s.category,
    s.address,
    s.phone,
    s.business_hours,
    s.is_partner_store,
    s.sponsorship_tier,
    s.store_code,
    es.priority_score,
    es.is_kentucky
  FROM eligible_stores es
  JOIN stores s ON es.id = s.id
  WHERE 
    CASE 
      WHEN p_intent = 'english_learning' THEN 
        s.category = '教育培訓' OR s.store_code = 'kentucky'
      WHEN p_intent = 'food' THEN 
        s.category = '餐飲美食'
      WHEN p_intent = 'parking' THEN 
        s.category = '停車場'
      ELSE true
    END
  ORDER BY 
    es.is_kentucky DESC,  -- 肯塔基優先
    es.priority_score DESC,  -- 贊助等級優先
    s.is_partner_store DESC,  -- 特約商家優先
    s.rating DESC NULLS LAST  -- 評分優先
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ===== 13. 創建觸發器：審核狀態變更記錄 =====
CREATE OR REPLACE FUNCTION log_approval_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.approval IS DISTINCT FROM NEW.approval OR OLD.sponsorship_tier IS DISTINCT FROM NEW.sponsorship_tier THEN
    INSERT INTO store_approval_history (
      store_id,
      previous_status,
      new_status,
      previous_tier,
      new_tier,
      changed_by,
      notes
    ) VALUES (
      NEW.id,
      OLD.approval,
      NEW.approval,
      OLD.sponsorship_tier,
      NEW.sponsorship_tier,
      COALESCE(NEW.approved_by, 'system'),
      COALESCE(NEW.audit_notes, 'Status updated')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_approval_changes
  AFTER UPDATE ON stores
  FOR EACH ROW
  EXECUTE FUNCTION log_approval_changes();

-- ===== 14. 插入測試資料 =====
-- 確保有測試用的合格商家
INSERT INTO stores (
  store_name, category, address, phone, business_hours, 
  approval, sponsorship_tier, store_code, evidence_level
) VALUES 
(
  '測試餐廳', '餐飲美食', '測試地址', '07-123-4567', '09:00-21:00',
  'approved', 1, 'test_restaurant', 'verified'
) ON CONFLICT (store_name) DO NOTHING;

-- ===== 15. 創建管理後台查詢視圖 =====
CREATE OR REPLACE VIEW store_management_view AS
SELECT 
  s.id,
  s.store_name,
  s.category,
  s.approval,
  s.sponsorship_tier,
  s.store_code,
  s.evidence_level,
  s.is_partner_store,
  s.rating,
  s.approved_at,
  s.approved_by,
  s.audit_notes,
  COUNT(ev.id) as evidence_count,
  COUNT(ev.id) FILTER (WHERE ev.verification_status = 'verified') as verified_evidence_count
FROM stores s
LEFT JOIN evidence_verification ev ON s.id = ev.store_id
GROUP BY s.id, s.store_name, s.category, s.approval, s.sponsorship_tier, 
         s.store_code, s.evidence_level, s.is_partner_store, s.rating,
         s.approved_at, s.approved_by, s.audit_notes;

-- ===== 完成 =====
-- 資料庫結構升級完成
-- 現在可以使用允許清單架構進行推薦和審核管理
