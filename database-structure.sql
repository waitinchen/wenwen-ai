-- =================================================
-- 文山特區 WenWen AI 客服機器人系統 - 完整數據庫結構
-- 匯出日期: 2025-09-02
-- 描述: 包含所有表結構、索引、約束和基礎數據
-- =================================================

-- 啟用必要擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================
-- 1. 核心用戶管理表
-- =================================================

-- 用戶資料表 (支援前台匿名用戶)
CREATE TABLE user_profiles (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    external_id VARCHAR(255) UNIQUE, -- 前台 cookie / deviceId / OAuth sub
    display_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- LINE 用戶表 (保留原有結構)
CREATE TABLE line_users (
    id SERIAL PRIMARY KEY,
    line_uid VARCHAR(255) UNIQUE NOT NULL,
    line_display_name VARCHAR(255) NOT NULL,
    line_avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    first_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_conversations INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 聊天會話表 (更新結構)
CREATE TABLE chat_sessions (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(255) REFERENCES user_profiles(id),
    line_user_id INTEGER REFERENCES line_users(id),
    client_ip VARCHAR(45),
    user_agent TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message_count INTEGER DEFAULT 0,
    last_message_preview TEXT -- 最後一句話預覽 (前80字)
);

-- 聊天消息表 (更新結構)
CREATE TABLE chat_messages (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    session_id VARCHAR(255) REFERENCES chat_sessions(id),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    response_time INTEGER,
    user_feedback INTEGER CHECK (user_feedback IN (1, -1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- 對話歷史表
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_ip VARCHAR(45),
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    user_feedback INTEGER CHECK (user_feedback IN (1, -1)),
    response_time INTEGER, -- 響應時間（毫秒）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================
-- 2. 管理員系統表
-- =================================================

-- 管理員表
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 管理員會話表
CREATE TABLE admin_sessions (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 審計日誌表
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================
-- 3. 商家管理表
-- =================================================

-- 商家資料表
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    store_name VARCHAR(255) NOT NULL,
    owner VARCHAR(255),
    role VARCHAR(255),
    category VARCHAR(255),
    address TEXT,
    phone VARCHAR(100),
    business_hours TEXT,
    services TEXT,
    features TEXT,
    is_safe_store BOOLEAN DEFAULT false,
    has_member_discount BOOLEAN DEFAULT false,
    is_partner_store BOOLEAN DEFAULT false,
    facebook_url TEXT,
    website_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 商業資訊表
CREATE TABLE business_info (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id),
    business_type VARCHAR(100),
    description TEXT,
    specialties TEXT[],
    price_range VARCHAR(50),
    payment_methods TEXT[],
    wifi_available BOOLEAN DEFAULT FALSE,
    parking_available BOOLEAN DEFAULT FALSE,
    barrier_free BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================
-- 4. AI 配置與訓練表
-- =================================================

-- AI 配置表
CREATE TABLE ai_configs (
    id SERIAL PRIMARY KEY,
    config_name VARCHAR(100) UNIQUE NOT NULL,
    model_name VARCHAR(100),
    temperature DECIMAL(3,2) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 2000,
    system_prompt TEXT,
    personality_traits JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 訓練數據表
CREATE TABLE training_data (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    keywords TEXT[],
    confidence_score DECIMAL(3,2),
    is_verified BOOLEAN DEFAULT FALSE,
    created_by INTEGER REFERENCES admins(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ 表
CREATE TABLE faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    keywords TEXT[],
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================
-- 5. 增強功能表
-- =================================================

-- 常用問題啟動詞管理表
CREATE TABLE quick_questions (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 活動管理系統表
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    applicable_stores TEXT[], -- 適用商家ID數組
    activity_tags TEXT[], -- 活動標籤
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expired', 'disabled')),
    created_by INTEGER REFERENCES admins(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 互動過濾器管理表
CREATE TABLE interaction_filters (
    id SERIAL PRIMARY KEY,
    filter_name VARCHAR(255) NOT NULL,
    filter_type VARCHAR(50) DEFAULT 'keyword' CHECK (filter_type IN ('keyword', 'topic', 'intent')),
    keywords TEXT[], -- 關鍵字數組
    whitelist_keywords TEXT[], -- 白名單關鍵字
    blacklist_keywords TEXT[], -- 黑名單關鍵字
    rejection_template TEXT, -- 拒絕回應模板
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 高文文人格管理表
CREATE TABLE personality_configs (
    id SERIAL PRIMARY KEY,
    config_name VARCHAR(255) NOT NULL,
    persona_name VARCHAR(100) DEFAULT '高文文',
    persona_age INTEGER DEFAULT 23,
    persona_location VARCHAR(100) DEFAULT '高雄',
    personality_traits TEXT[], -- 性格特徵數組
    formality_level INTEGER DEFAULT 3 CHECK (formality_level BETWEEN 1 AND 5), -- 正式程度 1-5
    friendliness_level INTEGER DEFAULT 4 CHECK (friendliness_level BETWEEN 1 AND 5), -- 親切程度 1-5  
    emoji_frequency INTEGER DEFAULT 3 CHECK (emoji_frequency BETWEEN 1 AND 5), -- 表情符號頻率 1-5
    greeting_templates TEXT[], -- 打招呼模板
    farewell_templates TEXT[], -- 告別模板
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API 密鑰管理表
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(255) NOT NULL,
    api_provider VARCHAR(100) NOT NULL, -- 'claude', 'openai', 'google' 等
    encrypted_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    daily_usage_limit INTEGER DEFAULT 1000,
    monthly_usage_limit INTEGER DEFAULT 30000,
    current_daily_usage INTEGER DEFAULT 0,
    current_monthly_usage INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_by INTEGER REFERENCES admins(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 內容警告管理表
CREATE TABLE content_warnings (
    id SERIAL PRIMARY KEY,
    warning_type VARCHAR(100) NOT NULL,
    keywords TEXT[] NOT NULL,
    severity_level INTEGER DEFAULT 1 CHECK (severity_level BETWEEN 1 AND 5),
    action_type VARCHAR(50) DEFAULT 'warn' CHECK (action_type IN ('warn', 'block', 'redirect')),
    warning_message TEXT,
    redirect_response TEXT,
    is_enabled BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES admins(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 每日對話跟踪表
CREATE TABLE daily_conversation_tracking (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_conversations INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    avg_response_time INTEGER DEFAULT 0,
    satisfaction_score DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);

-- =================================================
-- 6. 索引優化
-- =================================================

-- 對話相關索引
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user_ip ON conversations(user_ip);

-- 用戶資料索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_external_id ON user_profiles(external_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON user_profiles(display_name);

-- 聊天會話索引
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_line_user_id ON chat_sessions(line_user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at ON chat_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_active ON chat_sessions(last_active DESC);

-- 聊天消息索引
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON chat_messages(role);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- LINE 用戶索引
CREATE INDEX IF NOT EXISTS idx_line_users_line_uid ON line_users(line_uid);
CREATE INDEX IF NOT EXISTS idx_line_users_active ON line_users(is_active);
CREATE INDEX IF NOT EXISTS idx_line_users_last_interaction ON line_users(last_interaction_at DESC);

-- 管理員相關索引
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- 商家相關索引
CREATE INDEX IF NOT EXISTS idx_stores_category ON stores(category);
CREATE INDEX IF NOT EXISTS idx_stores_name ON stores(store_name);

-- 安全相關索引
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- =================================================
-- 7. 基礎數據插入
-- =================================================

-- 插入默認管理員賬戶（密碼: admin123）
INSERT INTO admins (username, email, password_hash, role) VALUES 
('admin', 'admin@wenshan.ai', '$2a$10$YourHashedPasswordHere', 'super_admin')
ON CONFLICT (username) DO NOTHING;

-- 插入測試用戶
INSERT INTO line_users (line_uid, line_display_name, line_avatar_url) VALUES 
('test_user_001', '測試用戶一號', 'https://example.com/avatar1.jpg'),
('test_user_002', '芭樂測試', 'https://example.com/avatar2.jpg')
ON CONFLICT (line_uid) DO NOTHING;

-- 插入示例對話數據
INSERT INTO conversations (session_id, user_ip, user_message, ai_response, response_time) VALUES 
('session_demo_001', '127.0.0.1', '你好，請問文山特區有什麼好吃的餐廳？', 
 '您好！文山特區有很多不錯的餐廳，比如有傳統台灣料理、日式料理、咖啡廳等。您比較喜歡哪種類型的餐廳呢？', 1200),
('session_demo_002', '192.168.1.100', '請問營業時間是什麼時候？', 
 '每家店的營業時間不太一樣哦！大部分餐廳是上午11點到晚上9點，不過建議您告訴我具體想去哪家店，我可以提供更準確的營業時間資訊。', 800)
ON CONFLICT DO NOTHING;

-- 插入基本 AI 配置
INSERT INTO ai_configs (config_name, model_name, temperature, max_tokens, system_prompt) VALUES 
('default', 'claude-3-sonnet', 0.7, 2000, '你是高文文，一位23歲的親切客服機器人，專門為文山特區商圈提供服務...')
ON CONFLICT (config_name) DO NOTHING;

-- 插入常用問題
INSERT INTO quick_questions (question, display_order) VALUES 
('文山特區有哪些推薦餐廳？', 1),
('停車資訊', 2),
('商家營業時間', 3),
('會員優惠資訊', 4),
('最新活動消息', 5)
ON CONFLICT DO NOTHING;

-- 插入示例商家資料
INSERT INTO stores (store_name, owner, category, address, phone, business_hours) VALUES 
('示例餐廳', '老闆', '餐飲', '高雄市文山區示例街123號', '07-1234-5678', '11:00-21:00'),
('示例咖啡廳', '店長', '咖啡', '高雄市文山區示例路456號', '07-2345-6789', '09:00-22:00')
ON CONFLICT DO NOTHING;

-- 插入基本FAQ
INSERT INTO faqs (question, answer, category, keywords) VALUES 
('文山特區在哪裡？', '文山特區位於高雄市，是一個充滿活力的商圈...', '基本資訊', ARRAY['位置', '地址', '在哪']),
('如何到達文山特區？', '您可以搭乘捷運或公車到達文山特區...', '交通資訊', ARRAY['交通', '怎麼去', '捷運'])
ON CONFLICT DO NOTHING;

-- =================================================
-- 完成資料庫結構建立
-- =================================================

-- 更新統計資訊
ANALYZE;

-- 完成提示
SELECT 'WenWen AI 資料庫結構建立完成！' AS status;
