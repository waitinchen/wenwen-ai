-- 檢查 stores 表的實際結構
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'stores' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
