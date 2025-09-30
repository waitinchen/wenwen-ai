-- ========================================
-- WEN 1.4.0 數據庫部署前檢查腳本
-- ========================================

-- 檢查現有表格
DO $$
DECLARE
    existing_tables TEXT[];
    required_tables TEXT[] := ARRAY[
        'unknown_user_queries',
        'generated_response_scripts',
        'script_review_records',
        'training_knowledge_base',
        'script_usage_analytics',
        'review_workflow',
        'system_configurations'
    ];
    table_name TEXT;
    missing_tables TEXT[] := '{}';
BEGIN
    RAISE NOTICE '=== WEN 1.4.0 數據庫檢查開始 ===';

    -- 檢查每個必需的表格
    FOREACH table_name IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
            RAISE NOTICE '❌ 缺少表格: %', table_name;
        ELSE
            RAISE NOTICE '✅ 表格存在: %', table_name;
        END IF;
    END LOOP;

    -- 檢查現有聊天相關表格
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
        RAISE NOTICE '✅ 現有chat_messages表格完整';
    ELSE
        RAISE NOTICE '⚠️  建議檢查chat_messages表格';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stores') THEN
        RAISE NOTICE '✅ 現有stores表格完整';
    ELSE
        RAISE NOTICE '❌ 缺少stores表格 - 核心功能需要';
    END IF;

    -- 總結
    IF array_length(missing_tables, 1) IS NULL OR array_length(missing_tables, 1) = 0 THEN
        RAISE NOTICE '✅ 所有必需表格都已存在，可以進行部署';
    ELSE
        RAISE NOTICE '❌ 需要創建 % 個缺少的表格', array_length(missing_tables, 1);
        RAISE NOTICE '缺少的表格: %', array_to_string(missing_tables, ', ');
    END IF;

    RAISE NOTICE '=== 數據庫檢查完成 ===';
END $$;