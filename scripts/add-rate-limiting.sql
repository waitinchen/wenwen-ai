-- =====================================================
-- Rate Limit 功能實現
-- =====================================================

-- 1. 創建 Rate Limit 追蹤表
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- IP 或 Session ID
  identifier_type TEXT NOT NULL, -- 'ip' 或 'session'
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_request TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 創建複合索引
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON public.rate_limits (identifier, identifier_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON public.rate_limits (window_start);

-- 3. 創建 Rate Limit 檢查函數
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_identifier_type TEXT,
  p_max_requests INTEGER DEFAULT 5,
  p_window_seconds INTEGER DEFAULT 10
)
RETURNS JSONB AS $$
DECLARE
  current_window TIMESTAMP WITH TIME ZONE;
  window_start TIMESTAMP WITH TIME ZONE;
  request_count INTEGER;
  is_allowed BOOLEAN;
  reset_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- 計算當前時間窗口
  current_window := NOW();
  window_start := date_trunc('second', current_window - INTERVAL '1 second' * p_window_seconds);
  
  -- 查找或創建記錄
  INSERT INTO public.rate_limits (identifier, identifier_type, request_count, window_start, last_request)
  VALUES (p_identifier, p_identifier_type, 1, window_start, current_window)
  ON CONFLICT (identifier, identifier_type) 
  DO UPDATE SET
    request_count = CASE 
      WHEN rate_limits.window_start < window_start THEN 1
      ELSE rate_limits.request_count + 1
    END,
    window_start = CASE 
      WHEN rate_limits.window_start < window_start THEN window_start
      ELSE rate_limits.window_start
    END,
    last_request = current_window
  RETURNING request_count INTO request_count;
  
  -- 檢查是否超過限制
  is_allowed := request_count <= p_max_requests;
  
  -- 計算重置時間
  reset_time := window_start + INTERVAL '1 second' * p_window_seconds;
  
  RETURN jsonb_build_object(
    'allowed', is_allowed,
    'request_count', request_count,
    'max_requests', p_max_requests,
    'window_seconds', p_window_seconds,
    'reset_time', reset_time,
    'remaining_requests', GREATEST(0, p_max_requests - request_count)
  );
END;
$$ LANGUAGE plpgsql;

-- 4. 創建清理過期 Rate Limit 記錄的函數
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 hour';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 5. 創建 Rate Limit 統計視圖
CREATE OR REPLACE VIEW public.rate_limit_stats AS
SELECT 
  identifier_type,
  COUNT(*) as total_trackers,
  COUNT(CASE WHEN window_start > NOW() - INTERVAL '1 minute' THEN 1 END) as active_trackers,
  AVG(request_count) as avg_requests,
  MAX(request_count) as max_requests,
  MIN(created_at) as oldest_tracker,
  MAX(last_request) as latest_activity
FROM public.rate_limits
GROUP BY identifier_type
ORDER BY identifier_type;
