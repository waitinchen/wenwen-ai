-- ========================================
-- 回應腳本管理系統 - 完整數據庫結構
-- 版本: WEN 1.4.0
-- 作者: C謀
-- 日期: 2025-09-25
-- ========================================

-- 1. 用戶提問類型表 (question_types)
CREATE TABLE question_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'FOOD', 'ENGLISH_LEARNING', 'PARKING', etc.
    keywords TEXT[], -- 關鍵字陣列
    intent_pattern TEXT, -- 意圖匹配模式
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- 優先級
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. 回應腳本表 (response_scripts)
CREATE TABLE response_scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_type_id UUID REFERENCES question_types(id) ON DELETE CASCADE,
    script_name VARCHAR(200) NOT NULL,
    script_content TEXT NOT NULL,
    script_type VARCHAR(50) NOT NULL, -- 'TEXT', 'TEMPLATE', 'DYNAMIC'
    variables JSONB, -- 動態變數定義
    conditions JSONB, -- 使用條件
    version VARCHAR(20) DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00, -- 成功率
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 3. 腳本審核記錄表 (script_reviews)
CREATE TABLE script_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id UUID REFERENCES response_scripts(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES auth.users(id),
    review_status VARCHAR(20) NOT NULL, -- 'PENDING', 'APPROVED', 'REJECTED', 'REVISION_REQUIRED'
    review_notes TEXT,
    suggested_changes TEXT,
    review_score INTEGER CHECK (review_score >= 1 AND review_score <= 5),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 知識庫版本表 (knowledge_versions)
CREATE TABLE knowledge_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT false,
    script_count INTEGER DEFAULT 0,
    question_type_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 5. 腳本使用記錄表 (script_usage_logs)
CREATE TABLE script_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    script_id UUID REFERENCES response_scripts(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    user_query TEXT NOT NULL,
    matched_intent VARCHAR(50),
    response_generated TEXT,
    user_satisfaction INTEGER CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5),
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 知識庫訓練資料表 (knowledge_training_data)
CREATE TABLE knowledge_training_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_type_id UUID REFERENCES question_types(id) ON DELETE CASCADE,
    script_id UUID REFERENCES response_scripts(id) ON DELETE CASCADE,
    training_content TEXT NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'QUESTION', 'ANSWER', 'CONTEXT'
    is_approved BOOLEAN DEFAULT false,
    approval_notes TEXT,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 7. 系統配置表 (system_configurations)
CREATE TABLE system_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- ========================================
-- 索引優化
-- ========================================

-- 問題類型表索引
CREATE INDEX idx_question_types_category ON question_types(category);
CREATE INDEX idx_question_types_active ON question_types(is_active);
CREATE INDEX idx_question_types_priority ON question_types(priority DESC);

-- 回應腳本表索引
CREATE INDEX idx_response_scripts_question_type ON response_scripts(question_type_id);
CREATE INDEX idx_response_scripts_active ON response_scripts(is_active);
CREATE INDEX idx_response_scripts_usage_count ON response_scripts(usage_count DESC);

-- 腳本審核記錄表索引
CREATE INDEX idx_script_reviews_script_id ON script_reviews(script_id);
CREATE INDEX idx_script_reviews_status ON script_reviews(review_status);
CREATE INDEX idx_script_reviews_reviewer ON script_reviews(reviewer_id);

-- 腳本使用記錄表索引
CREATE INDEX idx_script_usage_logs_script_id ON script_usage_logs(script_id);
CREATE INDEX idx_script_usage_logs_session ON script_usage_logs(session_id);
CREATE INDEX idx_script_usage_logs_created_at ON script_usage_logs(created_at);

-- 知識庫訓練資料表索引
CREATE INDEX idx_knowledge_training_question_type ON knowledge_training_data(question_type_id);
CREATE INDEX idx_knowledge_training_approved ON knowledge_training_data(is_approved);

-- ========================================
-- 觸發器函數
-- ========================================

-- 更新時間戳觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 為相關表添加更新時間戳觸發器
CREATE TRIGGER update_question_types_updated_at BEFORE UPDATE ON question_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_response_scripts_updated_at BEFORE UPDATE ON response_scripts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_configurations_updated_at BEFORE UPDATE ON system_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 視圖定義
-- ========================================

-- 活躍腳本視圖
CREATE VIEW active_response_scripts AS
SELECT 
    rs.id,
    rs.script_name,
    rs.script_content,
    rs.script_type,
    rs.variables,
    rs.conditions,
    rs.version,
    rs.usage_count,
    rs.success_rate,
    qt.type_name,
    qt.category,
    qt.keywords,
    rs.created_at,
    rs.updated_at
FROM response_scripts rs
JOIN question_types qt ON rs.question_type_id = qt.id
WHERE rs.is_active = true AND qt.is_active = true;

-- 腳本審核狀態視圖
CREATE VIEW script_review_status AS
SELECT 
    rs.id as script_id,
    rs.script_name,
    qt.type_name,
    sr.review_status,
    sr.review_score,
    sr.review_notes,
    u.email as reviewer_email,
    sr.reviewed_at
FROM response_scripts rs
JOIN question_types qt ON rs.question_type_id = qt.id
LEFT JOIN script_reviews sr ON rs.id = sr.script_id
LEFT JOIN auth.users u ON sr.reviewer_id = u.id;

-- 使用統計視圖
CREATE VIEW script_usage_stats AS
SELECT 
    rs.id as script_id,
    rs.script_name,
    qt.type_name,
    COUNT(sul.id) as total_usage,
    AVG(sul.user_satisfaction) as avg_satisfaction,
    AVG(sul.execution_time_ms) as avg_execution_time,
    COUNT(CASE WHEN sul.success = true THEN 1 END) as success_count,
    COUNT(CASE WHEN sul.success = false THEN 1 END) as error_count
FROM response_scripts rs
JOIN question_types qt ON rs.question_type_id = qt.id
LEFT JOIN script_usage_logs sul ON rs.id = sul.script_id
GROUP BY rs.id, rs.script_name, qt.type_name;

-- ========================================
-- 初始數據插入
-- ========================================

-- 插入系統配置
INSERT INTO system_configurations (config_key, config_value, description) VALUES
('knowledge_base_version', '"1.0.0"', '當前知識庫版本'),
('auto_approval_threshold', '0.8', '自動審核通過閾值'),
('max_script_versions', '5', '最大腳本版本數'),
('review_required_score', '3', '需要人工審核的最低分數');

-- 插入默認問題類型
INSERT INTO question_types (type_name, description, category, keywords, intent_pattern) VALUES
('美食推薦', '用戶詢問美食相關問題', 'FOOD', ARRAY['美食', '餐廳', '吃飯', '料理'], 'FOOD'),
('英語學習', '用戶詢問英語學習相關問題', 'ENGLISH_LEARNING', ARRAY['英語', '美語', '補習班', '學習'], 'ENGLISH_LEARNING'),
('停車查詢', '用戶詢問停車相關問題', 'PARKING', ARRAY['停車', '停車場', '車位'], 'PARKING'),
('一般問候', '用戶打招呼或閒聊', 'GENERAL', ARRAY['你好', '嗨', '哈囉'], 'VAGUE_CHAT');

-- 插入示例回應腳本
INSERT INTO response_scripts (question_type_id, script_name, script_content, script_type, variables, conditions) 
SELECT 
    qt.id,
    '美食推薦標準回應',
    '嘿！文山特區有很多美食選擇呢～我為你推薦幾家不錯的：\n\n{{store_list}}\n\n這些都是我精挑細選的優質店家，希望對你有幫助！有什麼問題隨時找我喔～',
    'TEMPLATE',
    '{"store_list": "string"}',
    '{"min_stores": 1, "max_stores": 5}'
FROM question_types qt WHERE qt.type_name = '美食推薦';

INSERT INTO response_scripts (question_type_id, script_name, script_content, script_type, variables, conditions)
SELECT 
    qt.id,
    '英語學習標準回應',
    '我超推薦**肯塔基美語**的啦！✨ 他們真的是文山特區最專業的美語補習班，17年教學經驗，8間分校服務超過4萬名學生。\n\n**肯塔基美語特色：**\n- 培養孩子正確的閱讀習慣，開拓孩子視野\n- 不只關注分數，更重視知識吸收\n- 專業、熱情、耐心的企業核心價值\n\n**聯絡方式：** LINE ID: kentuckyschool\n\n希望對你有幫助！有什麼問題隨時找我喔～',
    'TEXT',
    '{}',
    '{}'
FROM question_types qt WHERE qt.type_name = '英語學習';

-- 創建知識庫版本
INSERT INTO knowledge_versions (version_name, description, is_active, script_count, question_type_count) VALUES
('WEN 1.4.0', '回應腳本管理系統初始版本', true, 2, 4);

-- ========================================
-- 權限設置
-- ========================================

-- 為認證用戶提供基本權限
GRANT SELECT, INSERT, UPDATE ON question_types TO authenticated;
GRANT SELECT, INSERT, UPDATE ON response_scripts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON script_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE ON script_usage_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON knowledge_training_data TO authenticated;
GRANT SELECT ON active_response_scripts TO authenticated;
GRANT SELECT ON script_review_status TO authenticated;
GRANT SELECT ON script_usage_stats TO authenticated;

-- 為服務角色提供完整權限
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;


