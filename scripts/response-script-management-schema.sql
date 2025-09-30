-- ====================================
-- 高文文回應腳本審核管理系統數據庫結構
-- ====================================

-- 1. 未知用戶提問記錄表
CREATE TABLE unknown_user_queries (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    original_question TEXT NOT NULL,
    detected_intent VARCHAR(50),
    confidence_score DECIMAL(3,2),
    user_meta JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 分析結果
    analysis_result JSONB, -- {keywords, sentiment, complexity, category_suggestion}
    is_reasonable_intent BOOLEAN DEFAULT NULL, -- 是否為合理意圖

    -- 處理狀態
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'script_generated', 'approved', 'rejected', 'ignored')),

    -- 索引優化
    CONSTRAINT uk_unknown_queries_session_question UNIQUE (session_id, original_question, created_at)
);

-- 2. AI生成回應腳本表
CREATE TABLE generated_response_scripts (
    id SERIAL PRIMARY KEY,
    query_id INTEGER REFERENCES unknown_user_queries(id) ON DELETE CASCADE,

    -- 腳本內容
    intent_type VARCHAR(50) NOT NULL,
    intent_category VARCHAR(50),
    response_template TEXT NOT NULL,
    response_variables JSONB, -- 模板變數 {store_name, address, phone, etc.}

    -- 生成資訊
    generated_by VARCHAR(20) DEFAULT 'AI' CHECK (generated_by IN ('AI', 'human', 'hybrid')),
    generation_model VARCHAR(50) DEFAULT 'claude-3-sonnet',
    generation_prompt TEXT,
    generation_confidence DECIMAL(3,2),

    -- 腳本元數據
    script_metadata JSONB, -- {tone, style, target_audience, use_cases}
    related_intents TEXT[], -- 相關意圖標籤

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 人工審核記錄表
CREATE TABLE script_review_records (
    id SERIAL PRIMARY KEY,
    script_id INTEGER REFERENCES generated_response_scripts(id) ON DELETE CASCADE,

    -- 審核人員
    reviewer_id VARCHAR(50) NOT NULL, -- 審核員ID
    reviewer_name VARCHAR(100),
    reviewer_role VARCHAR(20) DEFAULT 'admin' CHECK (reviewer_role IN ('admin', 'moderator', 'expert')),

    -- 審核結果
    review_status VARCHAR(20) NOT NULL CHECK (review_status IN ('approved', 'rejected', 'needs_revision')),
    review_score INTEGER CHECK (review_score BETWEEN 1 AND 100),

    -- 審核意見
    review_comments TEXT,
    improvement_suggestions TEXT,

    -- 審核細項評分 (JSON格式)
    detailed_scores JSONB, -- {accuracy: 90, tone: 85, usefulness: 88, safety: 95}

    -- 修改記錄
    original_template TEXT, -- 原始模板
    revised_template TEXT, -- 修改後模板
    revision_notes TEXT,

    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 確保同一腳本的最新審核記錄
    CONSTRAINT uk_latest_review UNIQUE (script_id, reviewed_at)
);

-- 4. 知識庫訓練資料表
CREATE TABLE training_knowledge_base (
    id SERIAL PRIMARY KEY,

    -- 來源追蹤
    source_type VARCHAR(20) DEFAULT 'reviewed_script' CHECK (source_type IN ('reviewed_script', 'manual_entry', 'imported', 'system_default')),
    source_script_id INTEGER REFERENCES generated_response_scripts(id),
    source_review_id INTEGER REFERENCES script_review_records(id),

    -- 知識內容
    intent_pattern VARCHAR(100) NOT NULL, -- 意圖識別模式
    intent_keywords TEXT[], -- 關鍵字陣列
    intent_category VARCHAR(50),
    intent_subcategory VARCHAR(50),

    -- 回應模板
    response_template TEXT NOT NULL,
    response_examples JSONB, -- 多個回應範例
    template_variables JSONB, -- 模板中的變數定義

    -- 使用條件
    usage_conditions JSONB, -- {time_of_day, user_type, context, etc.}
    priority_score INTEGER DEFAULT 50 CHECK (priority_score BETWEEN 1 AND 100),

    -- 品質控制
    quality_score DECIMAL(4,2) DEFAULT 0.00,
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(4,2) DEFAULT 0.00,
    last_used_at TIMESTAMP WITH TIME ZONE,

    -- 狀態管理
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated', 'testing')),
    version VARCHAR(10) DEFAULT '1.0',

    -- 時間戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by VARCHAR(50),

    -- 索引
    CONSTRAINT uk_knowledge_intent_pattern UNIQUE (intent_pattern, version)
);

-- 5. 腳本使用統計表
CREATE TABLE script_usage_analytics (
    id SERIAL PRIMARY KEY,
    knowledge_id INTEGER REFERENCES training_knowledge_base(id) ON DELETE CASCADE,

    -- 使用情境
    session_id VARCHAR(100),
    user_question TEXT,
    matched_intent VARCHAR(50),
    confidence_score DECIMAL(3,2),

    -- 回應資訊
    generated_response TEXT,
    response_time_ms INTEGER,

    -- 用戶反饋
    user_feedback VARCHAR(20) CHECK (user_feedback IN ('positive', 'negative', 'neutral')),
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    feedback_comment TEXT,

    -- 系統評估
    system_confidence DECIMAL(3,2),
    context_relevance DECIMAL(3,2),

    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- 分析用索引
    INDEX idx_usage_knowledge_date (knowledge_id, used_at),
    INDEX idx_usage_feedback (user_feedback, user_rating)
);

-- 6. 審核工作流程表
CREATE TABLE review_workflow (
    id SERIAL PRIMARY KEY,

    -- 工作流基本資訊
    workflow_name VARCHAR(100) NOT NULL,
    workflow_type VARCHAR(20) DEFAULT 'script_review' CHECK (workflow_type IN ('script_review', 'knowledge_update', 'quality_check')),

    -- 當前處理項目
    current_script_id INTEGER REFERENCES generated_response_scripts(id),
    current_query_id INTEGER REFERENCES unknown_user_queries(id),

    -- 流程狀態
    workflow_status VARCHAR(20) DEFAULT 'pending' CHECK (workflow_status IN ('pending', 'in_review', 'completed', 'cancelled')),
    priority_level VARCHAR(10) DEFAULT 'normal' CHECK (priority_level IN ('low', 'normal', 'high', 'urgent')),

    -- 分配資訊
    assigned_to VARCHAR(50),
    assigned_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,

    -- 進度追蹤
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    workflow_notes JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,

    INDEX idx_workflow_status_priority (workflow_status, priority_level),
    INDEX idx_workflow_assigned (assigned_to, workflow_status)
);

-- 7. 系統配置表
CREATE TABLE system_configurations (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    config_description TEXT,
    config_category VARCHAR(50) DEFAULT 'general',

    -- 版本控制
    version VARCHAR(10) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by VARCHAR(50)
);

-- ====================================
-- 創建索引以優化查詢性能
-- ====================================

-- 未知查詢索引
CREATE INDEX idx_unknown_queries_status ON unknown_user_queries(status);
CREATE INDEX idx_unknown_queries_intent ON unknown_user_queries(detected_intent);
CREATE INDEX idx_unknown_queries_created ON unknown_user_queries(created_at DESC);

-- 生成腳本索引
CREATE INDEX idx_scripts_intent ON generated_response_scripts(intent_type);
CREATE INDEX idx_scripts_confidence ON generated_response_scripts(generation_confidence DESC);
CREATE INDEX idx_scripts_created ON generated_response_scripts(created_at DESC);

-- 審核記錄索引
CREATE INDEX idx_reviews_status ON script_review_records(review_status);
CREATE INDEX idx_reviews_reviewer ON script_review_records(reviewer_id);
CREATE INDEX idx_reviews_score ON script_review_records(review_score DESC);

-- 知識庫索引
CREATE INDEX idx_knowledge_intent ON training_knowledge_base(intent_category, intent_subcategory);
CREATE INDEX idx_knowledge_status ON training_knowledge_base(status);
CREATE INDEX idx_knowledge_quality ON training_knowledge_base(quality_score DESC);
CREATE INDEX idx_knowledge_usage ON training_knowledge_base(usage_count DESC);

-- 全文搜索索引
CREATE INDEX idx_knowledge_keywords_gin ON training_knowledge_base USING GIN (intent_keywords);
CREATE INDEX idx_scripts_template_gin ON generated_response_scripts USING GIN (to_tsvector('chinese', response_template));

-- ====================================
-- 創建觸發器函數
-- ====================================

-- 更新時間觸發器函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 應用觸發器到相關表
CREATE TRIGGER update_scripts_updated_at BEFORE UPDATE ON generated_response_scripts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_updated_at BEFORE UPDATE ON training_knowledge_base FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_config_updated_at BEFORE UPDATE ON system_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 知識庫統計更新函數
CREATE OR REPLACE FUNCTION update_knowledge_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- 更新使用統計
    UPDATE training_knowledge_base
    SET
        usage_count = usage_count + 1,
        last_used_at = NOW()
    WHERE id = NEW.knowledge_id;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- 使用統計觸發器
CREATE TRIGGER update_knowledge_usage_stats
    AFTER INSERT ON script_usage_analytics
    FOR EACH ROW EXECUTE FUNCTION update_knowledge_stats();

-- ====================================
-- 插入初始配置資料
-- ====================================

INSERT INTO system_configurations (config_key, config_value, config_description, config_category) VALUES
('review_thresholds', '{"min_confidence": 0.7, "auto_approve_score": 90, "manual_review_score": 70}', '審核閾值設定', 'review'),
('generation_settings', '{"max_response_length": 500, "tone": "friendly", "language": "zh-TW"}', 'AI生成設定', 'generation'),
('workflow_rules', '{"auto_assign": true, "review_timeout_days": 7, "priority_keywords": ["urgent", "error", "complaint"]}', '工作流程規則', 'workflow'),
('knowledge_quality', '{"min_usage_for_promotion": 10, "success_rate_threshold": 0.8, "deprecate_after_days": 90}', '知識庫品質控制', 'knowledge');

-- ====================================
-- 創建視圖以簡化常用查詢
-- ====================================

-- 待審核腳本視圖
CREATE VIEW pending_scripts_review AS
SELECT
    grs.id as script_id,
    uq.original_question,
    uq.detected_intent,
    grs.intent_type,
    grs.response_template,
    grs.generation_confidence,
    grs.created_at,
    CASE
        WHEN srr.review_status IS NULL THEN 'pending'
        ELSE srr.review_status
    END as review_status
FROM generated_response_scripts grs
JOIN unknown_user_queries uq ON grs.query_id = uq.id
LEFT JOIN script_review_records srr ON grs.id = srr.script_id
WHERE uq.status IN ('script_generated', 'pending')
ORDER BY grs.created_at DESC;

-- 知識庫統計視圖
CREATE VIEW knowledge_base_stats AS
SELECT
    tkb.intent_category,
    COUNT(*) as total_entries,
    AVG(tkb.quality_score) as avg_quality,
    SUM(tkb.usage_count) as total_usage,
    AVG(tkb.success_rate) as avg_success_rate,
    COUNT(CASE WHEN tkb.status = 'active' THEN 1 END) as active_entries
FROM training_knowledge_base tkb
GROUP BY tkb.intent_category
ORDER BY total_usage DESC;

-- 審核員績效視圖
CREATE VIEW reviewer_performance AS
SELECT
    srr.reviewer_id,
    srr.reviewer_name,
    COUNT(*) as total_reviews,
    AVG(srr.review_score) as avg_score_given,
    COUNT(CASE WHEN srr.review_status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN srr.review_status = 'rejected' THEN 1 END) as rejected_count,
    EXTRACT(EPOCH FROM (NOW() - MAX(srr.reviewed_at))) / 86400 as days_since_last_review
FROM script_review_records srr
GROUP BY srr.reviewer_id, srr.reviewer_name
ORDER BY total_reviews DESC;

-- ====================================
-- 權限設定 (根據需要調整)
-- ====================================

-- 創建角色
-- CREATE ROLE wenwen_admin;
-- CREATE ROLE wenwen_reviewer;
-- CREATE ROLE wenwen_readonly;

-- 授權範例
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO wenwen_admin;
-- GRANT SELECT, INSERT, UPDATE ON script_review_records TO wenwen_reviewer;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO wenwen_readonly;