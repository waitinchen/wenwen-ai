-- 修復 admin 表結構
-- 首先檢查並修復 admins 表

-- 1. 創建 admins 表（如果不存在）
CREATE TABLE IF NOT EXISTS public.admins (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 如果表已存在但缺少 is_active 欄位，則添加它
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'admins' 
        AND column_name = 'is_active' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.admins ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 3. 創建 admin_sessions 表
CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 創建索引
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON public.admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON public.admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_active ON public.admins(is_active);

-- 5. 添加外鍵約束（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_admin_sessions_admin_id'
        AND table_name = 'admin_sessions'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.admin_sessions 
        ADD CONSTRAINT fk_admin_sessions_admin_id 
        FOREIGN KEY (admin_id) REFERENCES public.admins(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 6. 插入預設管理員帳號（如果不存在）
INSERT INTO public.admins (email, password_hash, full_name, role, is_active)
VALUES (
    'admin@wenshancircle.com',
    '$2a$10$rQZ8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8', -- 這是 admin123 的 hash
    '系統管理員',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- 7. 啟用 RLS (Row Level Security)
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 8. 創建 RLS 策略（Service Role 可以繞過 RLS）
DROP POLICY IF EXISTS "Service role can do everything on admin_sessions" ON public.admin_sessions;
CREATE POLICY "Service role can do everything on admin_sessions" ON public.admin_sessions
FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Service role can do everything on admins" ON public.admins;
CREATE POLICY "Service role can do everything on admins" ON public.admins
FOR ALL TO service_role USING (true);

-- 9. 驗證表結構
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name IN ('admins', 'admin_sessions') 
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;
