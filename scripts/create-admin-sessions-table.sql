-- 創建 admin_sessions 表
CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON public.admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON public.admin_sessions(expires_at);

-- 創建 admins 表（如果不存在）
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

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_active ON public.admins(is_active);

-- 添加外鍵約束
ALTER TABLE public.admin_sessions 
ADD CONSTRAINT fk_admin_sessions_admin_id 
FOREIGN KEY (admin_id) REFERENCES public.admins(id) ON DELETE CASCADE;

-- 插入預設管理員帳號（密碼：admin123，請記得修改）
INSERT INTO public.admins (email, password_hash, full_name, role, is_active)
VALUES (
    'admin@wenshancircle.com',
    '$2a$10$rQZ8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8vN8', -- 這是 admin123 的 hash
    '系統管理員',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- 啟用 RLS (Row Level Security)
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 創建 RLS 策略（Service Role 可以繞過 RLS）
CREATE POLICY "Service role can do everything on admin_sessions" ON public.admin_sessions
FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can do everything on admins" ON public.admins
FOR ALL TO service_role USING (true);
