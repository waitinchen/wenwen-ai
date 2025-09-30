-- 修復肯塔基美語的 JSON 解析問題
-- 問題：features 欄位包含無效的 JSON

-- 更新肯塔基美語的 features 欄位為有效 JSON
UPDATE stores 
SET features = '{"description": "專業外師、小班制教學", "rating": 5, "open_status": "營業中"}'
WHERE store_name LIKE '%肯塔基美語%';

-- 檢查更新結果
SELECT store_name, features 
FROM stores 
WHERE store_name LIKE '%肯塔基美語%';
