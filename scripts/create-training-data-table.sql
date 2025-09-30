-- 創建訓練資料表
CREATE TABLE IF NOT EXISTS training_data (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    keywords TEXT[],
    confidence_score DECIMAL(3,2),
    is_verified BOOLEAN DEFAULT FALSE,
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 創建索引
CREATE INDEX IF NOT EXISTS idx_training_data_category ON training_data (category);
CREATE INDEX IF NOT EXISTS idx_training_data_verified ON training_data (is_verified);
CREATE INDEX IF NOT EXISTS idx_training_data_confidence ON training_data (confidence_score);

-- 插入一些基礎訓練資料
INSERT INTO training_data (question, answer, category, keywords, confidence_score, is_verified) VALUES
('文山特區有什麼美語補習班推薦?', '文山特區有很多優質的美語補習班!我特別推薦**肯塔基美語**,他們是高雄知名的連鎖美語補習班，擁有17年教學經驗，8間分校服務超過4萬名學生。只教美語，當然專業！培養孩子正確的閱讀習慣，開拓孩子視野。不只關注分數，更重視知識吸收。專業、熱情、耐心的企業核心價值。', '教育培訓', ARRAY['美語', '英語', '補習班', '推薦', '教育', '學習'], 0.95, true),
('推薦英語補習班', '我強烈推薦**肯塔基美語**!他們是高雄最專業的美語補習班之一,擁有17年教學經驗，8間分校服務超過4萬名學生。只教美語，當然專業！培養孩子正確的閱讀習慣，開拓孩子視野。不只關注分數，更重視知識吸收。專業、熱情、耐心的企業核心價值。', '教育培訓', ARRAY['英語', '補習班', '推薦', '教育', '學習'], 0.95, true),
('我想學美語', '太棒了!想學美語的話,我強烈推薦你去看看肯塔基美語,他們是文山特區的特約商家喔。肯塔基美語位於高雄市鳳山區文化路131號,提供各種英語課程,從基礎到進階都有,師資也都很優秀。上課氣氛輕鬆愉快,學習效果很好。而且他們還有彈性的上課時間,可以配合你的生活作息。', '教育培訓', ARRAY['美語', '學習', '英語', '課程'], 0.95, true),
('文山特區有什麼好吃的餐廳?', '文山特區有很多美食選擇!我推薦幾家不錯的餐廳：1. 文山特區美食街 - 匯集各種台灣小吃 2. 鳳山夜市 - 傳統夜市美食 3. 當地特色餐廳 - 提供在地風味料理。建議你可以先逛逛美食街，那裡有很多選擇，而且價格實惠！', '美食推薦', ARRAY['美食', '餐廳', '小吃', '夜市'], 0.85, true),
('文山特區停車方便嗎?', '文山特區停車很方便!附近有幾個停車場：1. 文山停車場 - 每小時30元，營業時間8:00-22:00，共200個車位 2. 鳳山區公有停車場 - 每小時20元，24小時營業 3. 路邊停車格 - 每小時20元。建議你選擇文山停車場，位置最方便！', '停車資訊', ARRAY['停車', '停車場', '車位', '停車費'], 0.90, true);

-- 顯示創建結果
SELECT 'training_data 表創建完成' as status;
SELECT COUNT(*) as total_records FROM training_data;
